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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/Proto/FIRAuthProtoMFAEnrollment.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRGetAccountInfoResponseProviderUserInfo
    @brief Represents the provider user info part of the response from the getAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/getAccountInfo
 */
@interface FIRGetAccountInfoResponseProviderUserInfo : NSObject

/** @property providerID
    @brief The ID of the identity provider.
 */
@property(nonatomic, strong, readonly, nullable) NSString *providerID;

/** @property displayName
    @brief The user's display name at the identity provider.
 */
@property(nonatomic, strong, readonly, nullable) NSString *displayName;

/** @property photoURL
    @brief The user's photo URL at the identity provider.
 */
@property(nonatomic, strong, readonly, nullable) NSURL *photoURL;

/** @property federatedID
    @brief The user's identifier at the identity provider.
 */
@property(nonatomic, strong, readonly, nullable) NSString *federatedID;

/** @property email
    @brief The user's email at the identity provider.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property phoneNumber
    @brief A phone number associated with the user.
 */
@property(nonatomic, readonly, nullable) NSString *phoneNumber;

/** @fn init
    @brief Please use initWithDictionary:
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithAPIKey:
    @brief Designated initializer.
    @param dictionary The provider user info data from endpoint.
 */
- (instancetype)initWithDictionary:(NSDictionary *)dictionary NS_DESIGNATED_INITIALIZER;

@end

/** @class FIRGetAccountInfoResponseUser
    @brief Represents the firebase user info part of the response from the getAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/getAccountInfo
 */
@interface FIRGetAccountInfoResponseUser : NSObject

/** @property localID
    @brief The ID of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *localID;

/** @property email
    @brief The email or the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property emailVerified
    @brief Whether the email has been verified.
 */
@property(nonatomic, assign, readonly) BOOL emailVerified;

/** @property displayName
    @brief The display name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *displayName;

/** @property photoURL
    @brief The user's photo URL.
 */
@property(nonatomic, strong, readonly, nullable) NSURL *photoURL;

/** @property creationDate
    @brief The user's creation date.
 */
@property(nonatomic, strong, readonly, nullable) NSDate *creationDate;

/** @property lastSignInDate
    @brief The user's last login date.
 */
@property(nonatomic, strong, readonly, nullable) NSDate *lastLoginDate;

/** @property providerUserInfo
    @brief The user's profiles at the associated identity providers.
 */
@property(nonatomic, strong, readonly, nullable)
    NSArray<FIRGetAccountInfoResponseProviderUserInfo *> *providerUserInfo;

/** @property passwordHash
    @brief Information about user's password.
    @remarks This is not necessarily the hash of user's actual password.
 */
@property(nonatomic, strong, readonly, nullable) NSString *passwordHash;

/** @property phoneNumber
    @brief A phone number associated with the user.
 */
@property(nonatomic, readonly, nullable) NSString *phoneNumber;

@property(nonatomic, strong, readonly, nullable)
    NSArray<FIRAuthProtoMFAEnrollment *> *MFAEnrollments;

/** @fn init
    @brief Please use initWithDictionary:
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithAPIKey:
    @brief Designated initializer.
    @param dictionary The provider user info data from endpoint.
 */
- (instancetype)initWithDictionary:(NSDictionary *)dictionary NS_DESIGNATED_INITIALIZER;

@end

/** @class FIRGetAccountInfoResponse
    @brief Represents the response from the setAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/getAccountInfo
 */
@interface FIRGetAccountInfoResponse : NSObject <FIRAuthRPCResponse>

/** @property providerUserInfo
    @brief The requested users' profiles.
 */
@property(nonatomic, strong, readonly, nullable) NSArray<FIRGetAccountInfoResponseUser *> *users;

@end

NS_ASSUME_NONNULL_END
