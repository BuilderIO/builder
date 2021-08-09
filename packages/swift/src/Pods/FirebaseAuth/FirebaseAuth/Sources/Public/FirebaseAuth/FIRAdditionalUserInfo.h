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

@class FIRVerifyAssertionResponse;

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAdditionalUserInfo
    @brief Represents additional user data returned from an identity provider.
 */
NS_SWIFT_NAME(AdditionalUserInfo)
@interface FIRAdditionalUserInfo : NSObject

/** @fn init
    @brief This class should not be initialized manually. `FIRAdditionalUserInfo` can be retrieved
        from from an instance of `FIRAuthDataResult`.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @property providerID
    @brief The provider identifier.
 */
@property(nonatomic, readonly) NSString *providerID;

/** @property profile
    @brief Dictionary containing the additional IdP specific information.
 */
@property(nonatomic, readonly, nullable) NSDictionary<NSString *, NSObject *> *profile;

/** @property username
    @brief username The name of the user.
 */
@property(nonatomic, readonly, nullable) NSString *username;

/** @property newUser
    @brief Indicates whether or not the current user was signed in for the first time.
 */
@property(nonatomic, readonly, getter=isNewUser) BOOL newUser;

@end

NS_ASSUME_NONNULL_END
