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

@class FIRAuthAPNSToken;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRAuthAPNSTokenCallback
    @brief The type of block to receive an APNs token.
    @param token The APNs token if one is available.
    @param error The error happened if any.
    @remarks Both `token` and `error` being `nil` means the request timed-out.
 */
typedef void (^FIRAuthAPNSTokenCallback)(FIRAuthAPNSToken *_Nullable token,
                                         NSError *_Nullable error);

/** @class FIRAuthAPNSTokenManager
    @brief A class to manage APNs token in memory.
 */
@interface FIRAuthAPNSTokenManager : NSObject

/** @property token
    @brief The APNs token, if one is available.
    @remarks Setting a token with FIRAuthAPNSTokenTypeUnknown will automatically converts it to
        a token with the automatically detected type.
 */
@property(nonatomic, strong, nullable) FIRAuthAPNSToken *token;

/** @property timeout
    @brief The timeout for registering for remote notification.
    @remarks Only tests should access this property.
 */
@property(nonatomic, assign) NSTimeInterval timeout;

/** @fn init
    @brief Call @c initWithApplication: to initialize an instance of this class.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithApplication:
    @brief Initializes the instance.
    @param application The @c UIApplication to request the token from.
    @return The initialized instance.
 */
- (instancetype)initWithApplication:(UIApplication *)application NS_DESIGNATED_INITIALIZER;

/** @fn getTokenWithCallback:
    @brief Attempts to get the APNs token.
    @param callback The block to be called either immediately or in future, either when a token
        becomes available, or when timeout occurs, whichever happens earlier.
 */
- (void)getTokenWithCallback:(FIRAuthAPNSTokenCallback)callback;

/** @fn cancelWithError:
    @brief Cancels any pending `getTokenWithCallback:` request.
    @param error The error to return.
 */
- (void)cancelWithError:(NSError *)error;

@end

NS_ASSUME_NONNULL_END

#endif
