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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@class FIRAuthAppCredentialManager;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRAuthNotificationForwardingCallback
    @brief The type of block to receive whether or not remote notifications are being forwarded.
    @param isNotificationBeingForwarded Whether or not remote notifications are being forwarded.
 */
typedef void (^FIRAuthNotificationForwardingCallback)(BOOL isNotificationBeingForwarded);

/** @class FIRAuthNotificationManager
 */
@interface FIRAuthNotificationManager : NSObject

/** @property timeout
    @brief The timeout for checking for notification forwarding.
    @remarks Only tests should access this property.
 */
@property(nonatomic, assign) NSTimeInterval timeout;

/** @fn initWithApplication:appCredentialManager:
    @brief Initializes the instance.
    @param application The application.
    @param appCredentialManager The object to handle app credentials delivered via notification.
    @return The initialized instance.
 */
- (instancetype)initWithApplication:(UIApplication *)application
               appCredentialManager:(FIRAuthAppCredentialManager *)appCredentialManager
    NS_DESIGNATED_INITIALIZER;

/** @fn init
    @brief please use initWithAppCredentialManager: instead.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn checkNotificationForwardingWithCallback:
    @brief Checks whether or not remote notifications are being forwarded to this class.
    @param callback The block to be called either immediately or in future once a result
        is available.
 */
- (void)checkNotificationForwardingWithCallback:(FIRAuthNotificationForwardingCallback)callback;

/** @fn canHandleNotification:
    @brief Attempts to handle the remote notification.
    @param notification The notification in question.
    @return Whether or the notification has been handled.
 */
- (BOOL)canHandleNotification:(NSDictionary *)notification;

@end

NS_ASSUME_NONNULL_END

#endif
