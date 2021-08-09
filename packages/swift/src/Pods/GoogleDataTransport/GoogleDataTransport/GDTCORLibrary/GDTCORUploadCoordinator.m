/*
 * Copyright 2018 Google
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

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORUploadCoordinator.h"

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORAssert.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORReachability.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORRegistrar_Private.h"

@implementation GDTCORUploadCoordinator

+ (instancetype)sharedInstance {
  static GDTCORUploadCoordinator *sharedUploader;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedUploader = [[GDTCORUploadCoordinator alloc] init];
    [sharedUploader startTimer];
  });
  return sharedUploader;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _coordinationQueue =
        dispatch_queue_create("com.google.GDTCORUploadCoordinator", DISPATCH_QUEUE_SERIAL);
    _registrar = [GDTCORRegistrar sharedInstance];
    _timerInterval = 30 * NSEC_PER_SEC;
    _timerLeeway = 5 * NSEC_PER_SEC;
  }
  return self;
}

- (void)forceUploadForTarget:(GDTCORTarget)target {
  dispatch_async(_coordinationQueue, ^{
    GDTCORLogDebug(@"Forcing an upload of target %ld", (long)target);
    GDTCORUploadConditions conditions = [self uploadConditions];
    conditions |= GDTCORUploadConditionHighPriority;
    [self uploadTargets:@[ @(target) ] conditions:conditions];
  });
}

#pragma mark - Private helper methods

/** Starts a timer that checks whether or not events can be uploaded at regular intervals. It will
 * check the next-upload clocks of all targets to determine if an upload attempt can be made.
 */
- (void)startTimer {
  dispatch_async(_coordinationQueue, ^{
    if (self->_timer) {
      // The timer has been already started.
      return;
    }

    // Delay the timer slightly so it doesn't run while +load calls are still running.
    dispatch_time_t deadline = dispatch_time(DISPATCH_TIME_NOW, 1 * NSEC_PER_SEC / 2);

    self->_timer =
        dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, self->_coordinationQueue);
    dispatch_source_set_timer(self->_timer, deadline, self->_timerInterval, self->_timerLeeway);

    dispatch_source_set_event_handler(self->_timer, ^{
      if (![[GDTCORApplication sharedApplication] isRunningInBackground]) {
        GDTCORUploadConditions conditions = [self uploadConditions];
        GDTCORLogDebug(@"%@", @"Upload timer fired");
        [self uploadTargets:[self.registrar.targetToUploader allKeys] conditions:conditions];
      }
    });
    GDTCORLogDebug(@"%@", @"Upload timer started");
    dispatch_resume(self->_timer);
  });
}

/** Stops the currently running timer. */
- (void)stopTimer {
  if (_timer) {
    dispatch_source_cancel(_timer);
    _timer = nil;
  }
}

/** Triggers the uploader implementations for the given targets to upload.
 *
 * @param targets An array of targets to trigger.
 * @param conditions The set of upload conditions.
 */
- (void)uploadTargets:(NSArray<NSNumber *> *)targets conditions:(GDTCORUploadConditions)conditions {
  dispatch_async(_coordinationQueue, ^{
    // TODO: The reachability signal may be not reliable enough to prevent an upload attempt.
    // See https://developer.apple.com/videos/play/wwdc2019/712/ (49:40) for more details.
    if ((conditions & GDTCORUploadConditionNoNetwork) == GDTCORUploadConditionNoNetwork) {
      return;
    }
    for (NSNumber *target in targets) {
      id<GDTCORUploader> uploader = self->_registrar.targetToUploader[target];
      [uploader uploadTarget:target.intValue withConditions:conditions];
    }
  });
}

- (void)signalToStoragesToCheckExpirations {
  // The same storage may be associated with several targets. Make sure to check for expirations
  // only once per storage.
  NSSet<id<GDTCORStorageProtocol>> *storages =
      [NSSet setWithArray:[_registrar.targetToStorage allValues]];
  for (id<GDTCORStorageProtocol> storage in storages) {
    [storage checkForExpirations];
  }
}

/** Returns the registered storage for the given NSNumber wrapped GDTCORTarget.
 *
 * @param target The NSNumber wrapping of a GDTCORTarget to find the storage instance of.
 * @return The storage instance for the given target.
 */
- (nullable id<GDTCORStorageProtocol>)storageForTarget:(NSNumber *)target {
  id<GDTCORStorageProtocol> storage = [GDTCORRegistrar sharedInstance].targetToStorage[target];
  GDTCORAssert(storage, @"A storage must be registered for target %@", target);
  return storage;
}

/** Returns the current upload conditions after making determinations about the network connection.
 *
 * @return The current upload conditions.
 */
- (GDTCORUploadConditions)uploadConditions {
  GDTCORNetworkReachabilityFlags currentFlags = [GDTCORReachability currentFlags];
  BOOL networkConnected = GDTCORReachabilityFlagsReachable(currentFlags);
  if (!networkConnected) {
    return GDTCORUploadConditionNoNetwork;
  }
  BOOL isWWAN = GDTCORReachabilityFlagsContainWWAN(currentFlags);
  if (isWWAN) {
    return GDTCORUploadConditionMobileData;
  } else {
    return GDTCORUploadConditionWifiData;
  }
}

#pragma mark - GDTCORLifecycleProtocol

- (void)appWillForeground:(GDTCORApplication *)app {
  // -startTimer is thread-safe.
  [self startTimer];
  [self signalToStoragesToCheckExpirations];
}

- (void)appWillBackground:(GDTCORApplication *)app {
  dispatch_async(_coordinationQueue, ^{
    [self stopTimer];
  });
}

- (void)appWillTerminate:(GDTCORApplication *)application {
  dispatch_sync(_coordinationQueue, ^{
    [self stopTimer];
  });
}

@end
