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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRVerifyPasswordRequest
    @brief Represents the parameters for the verifyPassword endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/verifyPassword
 */
@interface FIRVerifyPasswordRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property email
    @brief The email of the user.
 */
@property(nonatomic, copy) NSString *email;

/** @property password
    @brief The password inputed by the user.
 */
@property(nonatomic, copy) NSString *password;

/** @property pendingIDToken
    @brief The GITKit token for the non-trusted IDP, which is to be confirmed by the user.
 */
@property(nonatomic, copy, nullable) NSString *pendingIDToken;

/** @property captchaChallenge
    @brief The captcha challenge.
 */
@property(nonatomic, copy, nullable) NSString *captchaChallenge;

/** @property captchaResponse
    @brief Response to the captcha.
 */
@property(nonatomic, copy, nullable) NSString *captchaResponse;

/** @property returnSecureToken
    @brief Whether the response should return access token and refresh token directly.
    @remarks The default value is @c YES .
 */
@property(nonatomic, assign) BOOL returnSecureToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithEmail:password:requestConfiguration:
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithEmail:password:requestConfiguration:
    @brief Designated initializer.
    @param email The email of the user.
    @param password The password inputed by the user.
    @param requestConfiguration The configu
 */
- (nullable instancetype)initWithEmail:(NSString *)email
                              password:(NSString *)password
                  requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
