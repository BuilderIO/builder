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

#import <Foundation/Foundation.h>

@class FIRAdditionalUserInfo;
@class FIRAuthCredential;
@class FIRUser;

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthDataResult
    @brief Helper object that contains the result of a successful sign-in, link and reauthenticate
        action. It contains references to a FIRUser instance and a FIRAdditionalUserInfo instance.
 */
NS_SWIFT_NAME(AuthDataResult)
@interface FIRAuthDataResult : NSObject

/** @fn init
    @brief This class should not be initialized manually. `FIRAuthDataResult` instance is
        returned as part of `FIRAuthDataResultCallback`.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @property user
    @brief The signed in user.
 */
@property(nonatomic, readonly) FIRUser *user;

/** @property additionalUserInfo
    @brief If available contains the additional IdP specific information about signed in user.
 */
@property(nonatomic, readonly, nullable) FIRAdditionalUserInfo *additionalUserInfo;

/** @property credential
    @brief This property will be non-nil after a successful headful-lite sign-in via
        signInWithProvider:UIDelegate:. May be used to obtain the accessToken and/or IDToken
        pertaining to a recently signed-in user.
 */
@property(nonatomic, readonly, nullable) FIRAuthCredential *credential;

@end

NS_ASSUME_NONNULL_END
