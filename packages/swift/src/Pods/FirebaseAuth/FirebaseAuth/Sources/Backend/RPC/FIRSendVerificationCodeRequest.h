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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

@class FIRAuthAppCredential;

NS_ASSUME_NONNULL_BEGIN

@interface FIRSendVerificationCodeRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property phoneNumber
    @brief The phone number to which the verification code should be sent.
 */
@property(nonatomic, strong, readonly) NSString *phoneNumber;

/** @property appCredential
    @brief The credential to prove the identity of the app in order to send the verification code.
 */
@property(nonatomic, strong, readonly, nullable) FIRAuthAppCredential *appCredential;

/** @property reCAPTCHAToken
    @brief The reCAPTCHA token to prove the identity of the app in order to send the verification
        code.
 */
@property(nonatomic, strong, readonly, nullable) NSString *reCAPTCHAToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithPhoneNumber:appCredentials:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithPhoneNumber:appCredentials:requestConfiguration:
    @brief Designated initializer.
    @param phoneNumber The phone number to which the verification code is to be sent.
    @param appCredential The credential that proves the identity of the app.
    @param reCAPTCHAToken The reCAPTCHA token that proves the identity of the app.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithPhoneNumber:(NSString *)phoneNumber
                               appCredential:(nullable FIRAuthAppCredential *)appCredential
                              reCAPTCHAToken:(nullable NSString *)reCAPTCHAToken
                        requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
