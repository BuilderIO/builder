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

/** @class FIRSecureTokenResponse
    @brief Represents the response from the token endpoint.
 */
@interface FIRSecureTokenResponse : NSObject <FIRAuthRPCResponse>

/** @property approximateExpirationDate
    @brief The approximate expiration date of the access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *approximateExpirationDate;

/** @property refreshToken
    @brief The refresh token. (Possibly an updated one for refresh requests.)
 */
@property(nonatomic, copy, readonly, nullable) NSString *refreshToken;

/** @property accessToken
    @brief The new access token.
 */
@property(nonatomic, copy, readonly, nullable) NSString *accessToken;

/** @property IDToken
    @brief The new ID Token.
 */
@property(nonatomic, copy, readonly, nullable) NSString *IDToken;

@end

NS_ASSUME_NONNULL_END
