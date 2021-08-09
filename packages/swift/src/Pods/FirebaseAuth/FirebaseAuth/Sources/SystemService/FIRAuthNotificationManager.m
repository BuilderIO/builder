/*
 * Copyright 2017 Google
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

#import <TargetConditionals.h>
#if !TARGET_OS_OSX && !TARGET_OS_WATCH

#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"
#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredentialManager.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthNotificationManager.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kNotificationKey
    @brief The key to locate payload data in the remote notification.
 */
static NSString *const kNotificationDataKey = @"com.google.firebase.auth";

/** @var kNotificationReceiptKey
    @brief The key for the receipt in the remote notification payload data.
 */
static NSString *const kNotificationReceiptKey = @"receipt";

/** @var kNotificationSecretKey
    @brief The key for the secret in the remote notification payload data.
 */
static NSString *const kNotificationSecretKey = @"secret";

/** @var kNotificationProberKey
    @brief The key for marking the prober in the remote notification payload data.
 */
static NSString *const kNotificationProberKey = @"warning";

/** @var kProbingTimeout
    @brief Timeout for probing whether the app delegate forwards the remote notification to us.
 */
static const NSTimeInterval kProbingTimeout = 1;

@implementation FIRAuthNotificationManager {
  /** @var _application
      @brief The application.
   */
  UIApplication *_application;

  /** @var _appCredentialManager
      @brief The object to handle app credentials delivered via notification.
   */
  FIRAuthAppCredentialManager *_appCredentialManager;

  /** @var _hasCheckedNotificationForwarding
      @brief Whether notification forwarding has been checked or not.
   */
  BOOL _hasCheckedNotificationForwarding;

  /** @var _isNotificationBeingForwarded
      @brief Whether or not notification is being forwarded
   */
  BOOL _isNotificationBeingForwarded;

  /** @var _pendingCallbacks
      @brief All pending callbacks while a check is being performed.
   */
  NSMutableArray<FIRAuthNotificationForwardingCallback> *_pendingCallbacks;
}

- (instancetype)initWithApplication:(UIApplication *)application
               appCredentialManager:(FIRAuthAppCredentialManager *)appCredentialManager {
  self = [super init];
  if (self) {
    _application = application;
    _appCredentialManager = appCredentialManager;
    _timeout = kProbingTimeout;
  }
  return self;
}

- (void)checkNotificationForwardingWithCallback:(FIRAuthNotificationForwardingCallback)callback {
  if (_pendingCallbacks) {
    [_pendingCallbacks addObject:callback];
    return;
  }
  if (_hasCheckedNotificationForwarding) {
    callback(_isNotificationBeingForwarded);
    return;
  }
  _hasCheckedNotificationForwarding = YES;
  _pendingCallbacks =
      [[NSMutableArray<FIRAuthNotificationForwardingCallback> alloc] initWithObjects:callback, nil];
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary *proberNotification = @{
      kNotificationDataKey : @{
        kNotificationProberKey : @"This fake notification should be forwarded to Firebase Auth."
      }
    };
    if ([self->_application.delegate
            respondsToSelector:@selector(application:
                                   didReceiveRemoteNotification:fetchCompletionHandler:)]) {
      [self->_application.delegate application:self->_application
                  didReceiveRemoteNotification:proberNotification
                        fetchCompletionHandler:^(UIBackgroundFetchResult result){
                        }];
#if !TARGET_OS_TV
    } else if ([self->_application.delegate
                   respondsToSelector:@selector(application:didReceiveRemoteNotification:)]) {
// iOS 10 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
      [self->_application.delegate application:self->_application
                  didReceiveRemoteNotification:proberNotification];
#pragma clang diagnostic pop
#endif
    } else {
      FIRLogWarning(kFIRLoggerAuth, @"I-AUT000015",
                    @"The UIApplicationDelegate must handle remote notification for phone number "
                    @"authentication to work.");
    }
  });
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(_timeout * NSEC_PER_SEC)),
                 FIRAuthGlobalWorkQueue(), ^{
                   [self callBack];
                 });
}

- (BOOL)canHandleNotification:(NSDictionary *)notification {
  NSDictionary *data = notification[kNotificationDataKey];
  if ([data isKindOfClass:[NSString class]]) {
    // Deserialize in case the data is a JSON string.
    NSData *JSONData = [((NSString *)data) dataUsingEncoding:NSUTF8StringEncoding];
    data = [NSJSONSerialization JSONObjectWithData:JSONData options:0 error:NULL];
  }
  if (![data isKindOfClass:[NSDictionary class]]) {
    return NO;
  }
  if (data[kNotificationProberKey]) {
    if (!_pendingCallbacks) {
      // The prober notification probably comes from another instance, so pass it along.
      return NO;
    }
    _isNotificationBeingForwarded = YES;
    [self callBack];
    return YES;
  }
  NSString *receipt = data[kNotificationReceiptKey];
  if (![receipt isKindOfClass:[NSString class]]) {
    return NO;
  }
  NSString *secret = data[kNotificationSecretKey];
  if (![receipt isKindOfClass:[NSString class]]) {
    return NO;
  }
  return [_appCredentialManager canFinishVerificationWithReceipt:receipt secret:secret];
}

#pragma mark - Internal methods

/** @fn callBack
    @brief Calls back all pending callbacks with the result of notification forwarding check.
 */
- (void)callBack {
  if (!_pendingCallbacks) {
    return;
  }
  NSArray<FIRAuthNotificationForwardingCallback> *allCallbacks = _pendingCallbacks;
  _pendingCallbacks = nil;
  for (FIRAuthNotificationForwardingCallback callback in allCallbacks) {
    callback(_isNotificationBeingForwarded);
  }
};

@end
NS_ASSUME_NONNULL_END

#endif
