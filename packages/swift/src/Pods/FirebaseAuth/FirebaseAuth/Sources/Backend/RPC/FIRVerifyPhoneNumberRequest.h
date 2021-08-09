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

#import "FirebaseAuth/Sources/Auth/FIRAuthOperationType.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRVerifyPhoneNumberRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property verificationID
    @brief The verification ID obtained from the response of @c sendVerificationCode.
*/
@property(nonatomic, readonly, nullable) NSString *verificationID;

/** @property verificationCode
    @brief The verification code provided by the user.
*/
@property(nonatomic, readonly, nullable) NSString *verificationCode;

/** @property accessToken
    @brief The STS Access Token for the authenticated user.
 */
@property(nonatomic, copy, nullable) NSString *accessToken;

/** @var temporaryProof
    @brief The temporary proof code, previously returned from the backend.
 */
@property(nonatomic, readonly, nonnull) NSString *temporaryProof;

/** @var phoneNumber
    @brief The phone number to be verified in the request.
 */
@property(nonatomic, readonly, nonnull) NSString *phoneNumber;

/** @var operation
    @brief The type of operation triggering this verify phone number request.
 */
@property(nonatomic, assign, readonly) FIRAuthOperationType operation;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithVerificationID:verificationCode:requestConfiguration
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithTemporaryProof:phoneNumberAPIKey
    @brief Designated initializer.
    @param temporaryProof The temporary proof sent by the backed.
    @param phoneNumber The phone number associated with the credential to be signed in.
    @param operation Indicates what operation triggered the verify phone number request.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithTemporaryProof:(NSString *)temporaryProof
                                    phoneNumber:(NSString *)phoneNumber
                                      operation:(FIRAuthOperationType)operation
                           requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

/** @fn initWithVerificationID:verificationCode:requestConfiguration
    @brief Designated initializer.
    @param verificationID The verification ID obtained from the response of @c sendVerificationCode.
    @param verificationCode The verification code provided by the user.
    @param operation Indicates what operation triggered the verify phone number request.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithVerificationID:(NSString *)verificationID
                               verificationCode:(NSString *)verificationCode
                                      operation:(FIRAuthOperationType)operation
                           requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
