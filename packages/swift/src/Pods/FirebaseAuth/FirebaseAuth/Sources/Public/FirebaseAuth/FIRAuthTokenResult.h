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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthTokenResult
    @brief A data class containing the ID token JWT string and other properties associated with the
    token including the decoded payload claims.
 */
NS_SWIFT_NAME(AuthTokenResult)
@interface FIRAuthTokenResult : NSObject

/** @property token
    @brief Stores the JWT string of the ID token.
 */
@property(nonatomic, readonly) NSString *token;

/** @property expirationDate
    @brief Stores the ID token's expiration date.
 */
@property(nonatomic, readonly) NSDate *expirationDate;

/** @property authDate
    @brief Stores the ID token's authentication date.
    @remarks This is the date the user was signed in and NOT the date the token was refreshed.
 */
@property(nonatomic, readonly) NSDate *authDate;

/** @property issuedAtDate
    @brief Stores the date that the ID token was issued.
    @remarks This is the date last refreshed and NOT the last authentication date.
 */
@property(nonatomic, readonly) NSDate *issuedAtDate;

/** @property signInProvider
    @brief Stores sign-in provider through which the token was obtained.
    @remarks This does not necessarily map to provider IDs.
 */
@property(nonatomic, readonly) NSString *signInProvider;

/** @property signInSecondFactor
    @brief Stores sign-in second factor through which the token was obtained.
 */
@property(nonatomic, readonly) NSString *signInSecondFactor;

/** @property claims
    @brief Stores the entire payload of claims found on the ID token. This includes the standard
        reserved claims as well as custom claims set by the developer via the Admin SDK.
 */
@property(nonatomic, readonly) NSDictionary<NSString *, id> *claims;

@end

NS_ASSUME_NONNULL_END
