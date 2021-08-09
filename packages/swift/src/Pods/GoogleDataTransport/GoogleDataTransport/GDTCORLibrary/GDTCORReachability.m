/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORReachability.h"
#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORReachability_Private.h"

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"

#import <netinet/in.h>

/** Sets the _callbackFlag ivar whenever the network changes.
 *
 * @param reachability The reachability object calling back.
 * @param flags The new flag values.
 * @param info Any data that might be passed in by the callback.
 */
static void GDTCORReachabilityCallback(GDTCORNetworkReachabilityRef reachability,
                                       GDTCORNetworkReachabilityFlags flags,
                                       void *info);

@implementation GDTCORReachability {
  /** The reachability object. */
  GDTCORNetworkReachabilityRef _reachabilityRef;

  /** The queue on which callbacks and all work will occur. */
  dispatch_queue_t _reachabilityQueue;

  /** Flags specified by reachability callbacks. */
  GDTCORNetworkReachabilityFlags _callbackFlags;
}

+ (void)initialize {
  [self sharedInstance];
}

+ (instancetype)sharedInstance {
  static GDTCORReachability *sharedInstance;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[GDTCORReachability alloc] init];
  });
  return sharedInstance;
}

+ (GDTCORNetworkReachabilityFlags)currentFlags {
  __block GDTCORNetworkReachabilityFlags currentFlags;
#if !TARGET_OS_WATCH
  dispatch_sync([GDTCORReachability sharedInstance] -> _reachabilityQueue, ^{
    GDTCORReachability *reachability = [GDTCORReachability sharedInstance];
    currentFlags =
        reachability->_callbackFlags ? reachability->_callbackFlags : reachability->_flags;
    GDTCORLogDebug(@"Initial reachability flags determined: %d", currentFlags);
  });
#else
  currentFlags = kGDTCORNetworkReachabilityFlagsReachable;
#endif
  return currentFlags;
}

- (instancetype)init {
  self = [super init];
#if !TARGET_OS_WATCH
  if (self) {
    struct sockaddr_in zeroAddress;
    bzero(&zeroAddress, sizeof(zeroAddress));
    zeroAddress.sin_len = sizeof(zeroAddress);
    zeroAddress.sin_family = AF_INET;

    _reachabilityQueue =
        dispatch_queue_create("com.google.GDTCORReachability", DISPATCH_QUEUE_SERIAL);
    _reachabilityRef = SCNetworkReachabilityCreateWithAddress(
        kCFAllocatorDefault, (const struct sockaddr *)&zeroAddress);
    Boolean success = SCNetworkReachabilitySetDispatchQueue(_reachabilityRef, _reachabilityQueue);
    if (!success) {
      GDTCORLogWarning(GDTCORMCWReachabilityFailed, @"%@", @"The reachability queue wasn't set.");
    }
    success = SCNetworkReachabilitySetCallback(_reachabilityRef, GDTCORReachabilityCallback, NULL);
    if (!success) {
      GDTCORLogWarning(GDTCORMCWReachabilityFailed, @"%@",
                       @"The reachability callback wasn't set.");
    }

    // Get the initial set of flags.
    dispatch_async(_reachabilityQueue, ^{
      Boolean valid = SCNetworkReachabilityGetFlags(self->_reachabilityRef, &self->_flags);
      if (!valid) {
        GDTCORLogDebug(@"%@", @"Determining reachability failed.");
        self->_flags = 0;
      }
    });
  }
#endif
  return self;
}

- (void)setCallbackFlags:(GDTCORNetworkReachabilityFlags)flags {
  if (_callbackFlags != flags) {
    self->_callbackFlags = flags;
  }
}

@end

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-function"
static void GDTCORReachabilityCallback(GDTCORNetworkReachabilityRef reachability,
                                       GDTCORNetworkReachabilityFlags flags,
                                       void *info) {
#pragma clang diagnostic pop
  GDTCORLogDebug(@"Reachability changed, new flags: %d", flags);
  [[GDTCORReachability sharedInstance] setCallbackFlags:flags];
}
