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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRUserInfo.h"

@class FIRGetAccountInfoResponseProviderUserInfo;

NS_ASSUME_NONNULL_BEGIN

@interface FIRUserInfoImpl : NSObject <FIRUserInfo, NSSecureCoding>

/** @fn userInfoWithGetAccountInfoResponseProviderUserInfo:
    @brief A convenience factory method for constructing a @c FIRUserInfo instance from data
        returned by the getAccountInfo endpoint.
    @param providerUserInfo Data returned by the getAccountInfo endpoint.
    @return A new instance of @c FIRUserInfo using data from the getAccountInfo endpoint.
 */
+ (nullable instancetype)userInfoWithGetAccountInfoResponseProviderUserInfo:
    (FIRGetAccountInfoResponseProviderUserInfo *)providerUserInfo;

/** @fn init
    @brief This class should not be initialized manually.
    @see FIRUser.providerData
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithProviderID:userID:displayName:photoURL:email:
    @brief Designated initializer.
    @param providerID The provider identifier.
    @param userID The unique user ID for the user (the value of the @c uid field in the token.)
    @param displayName The name of the user.
    @param photoURL The URL of the user's profile photo.
    @param email The user's email address.
    @param phoneNumber The user's phone number.
 */
- (nullable instancetype)initWithProviderID:(NSString *)providerID
                                     userID:(NSString *)userID
                                displayName:(nullable NSString *)displayName
                                   photoURL:(nullable NSURL *)photoURL
                                      email:(nullable NSString *)email
                                phoneNumber:(nullable NSString *)phoneNumber
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
