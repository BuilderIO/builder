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

@interface FIRVerifyPhoneNumberResponse : NSObject <FIRAuthRPCResponse>

/** @property IDToken
    @brief Either an authorization code suitable for performing an STS token exchange, or the
        access token from Secure Token Service, depending on whether @c returnSecureToken is set
        on the request.
 */
@property(nonatomic, strong, readonly, nullable) NSString *IDToken;

/** @property refreshToken
    @brief The refresh token from Secure Token Service.
 */
@property(nonatomic, strong, readonly, nullable) NSString *refreshToken;

/** @property localID
    @brief The Firebase Auth user ID.
 */
@property(nonatomic, strong, readonly, nullable) NSString *localID;

/** @property phoneNumber
    @brief The verified phone number.
 */
@property(nonatomic, strong, readonly, nullable) NSString *phoneNumber;

/** @property temporaryProof
    @brief The temporary proof code returned by the backend.
 */
@property(nonatomic, strong, readonly, nullable) NSString *temporaryProof;

/** @property isNewUser
    @brief Flag indicating that the user signing in is a new user and not a returning user.
 */
@property(nonatomic, assign) BOOL isNewUser;

/** @property approximateExpirationDate
    @brief The approximate expiration date of the access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *approximateExpirationDate;

@end

NS_ASSUME_NONNULL_END
