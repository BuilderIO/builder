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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRSetAccountInfoResponseProviderUserInfo
    @brief Represents the provider user info part of the response from the setAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/setAccountInfo
 */
@interface FIRSetAccountInfoResponseProviderUserInfo : NSObject

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

/** @class FIRSetAccountInfoResponse
    @brief Represents the response from the setAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/setAccountInfo
 */
@interface FIRSetAccountInfoResponse : NSObject <FIRAuthRPCResponse>

/** @property email
    @brief The email or the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property displayName
    @brief The display name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *displayName;

/** @property providerUserInfo
    @brief The user's profiles at the associated identity providers.
 */
@property(nonatomic, strong, readonly, nullable)
    NSArray<FIRSetAccountInfoResponseProviderUserInfo *> *providerUserInfo;

/** @property IDToken
    @brief Either an authorization code suitable for performing an STS token exchange, or the
        access token from Secure Token Service, depending on whether @c returnSecureToken is set
        on the request.
 */
@property(nonatomic, strong, readonly, nullable) NSString *IDToken;

/** @property approximateExpirationDate
    @brief The approximate expiration date of the access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *approximateExpirationDate;

/** @property refreshToken
    @brief The refresh token from Secure Token Service.
 */
@property(nonatomic, strong, readonly, nullable) NSString *refreshToken;

@end

NS_ASSUME_NONNULL_END
