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

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPhoneNumberRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kVerifyPhoneNumberEndPoint
    @brief The "verifyPhoneNumber" endpoint.
 */
static NSString *const kVerifyPhoneNumberEndPoint = @"verifyPhoneNumber";

/** @var kVerificationIDKey
    @brief The key for the verification ID parameter in the request.
 */
static NSString *const kVerificationIDKey = @"sessionInfo";

/** @var kVerificationCodeKey
    @brief The key for the verification code parameter in the request.
 */
static NSString *const kVerificationCodeKey = @"code";

/** @var kIDTokenKey
    @brief The key for the "ID Token" value in the request.
 */
static NSString *const kIDTokenKey = @"idToken";

/** @var kTemporaryProofKey
    @brief The key for the temporary proof value in the request.
 */
static NSString *const kTemporaryProofKey = @"temporaryProof";

/** @var kPhoneNumberKey
    @brief The key for the phone number value in the request.
 */
static NSString *const kPhoneNumberKey = @"phoneNumber";

/** @var kOperationKey
    @brief The key for the operation value in the request.
 */
static NSString *const kOperationKey = @"operation";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRVerifyPhoneNumberRequest

- (nullable instancetype)initWithTemporaryProof:(NSString *)temporaryProof
                                    phoneNumber:(NSString *)phoneNumber
                                      operation:(FIRAuthOperationType)operation
                           requestConfiguration:
                               (FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kVerifyPhoneNumberEndPoint
            requestConfiguration:requestConfiguration];
  if (self) {
    _temporaryProof = [temporaryProof copy];
    _phoneNumber = [phoneNumber copy];
    _operation = operation;
  }
  return self;
}

- (nullable instancetype)initWithVerificationID:(NSString *)verificationID
                               verificationCode:(NSString *)verificationCode
                                      operation:(FIRAuthOperationType)operation
                           requestConfiguration:
                               (FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kVerifyPhoneNumberEndPoint
            requestConfiguration:requestConfiguration];
  if (self) {
    _verificationID = verificationID;
    _verificationCode = verificationCode;
    _operation = operation;
  }
  return self;
}

/** @fn FIRAuthOperationString
    @brief Returns a string object corresponding to the provided FIRAuthOperationType value.
    @param operationType The value of the FIRAuthOperationType enum which will be translated to its
        corresponding string value.
    @return The string value corresponding to the FIRAuthOperationType argument.
 */
NSString *const FIRAuthOperationString(FIRAuthOperationType operationType) {
  switch (operationType) {
    case FIRAuthOperationTypeUnspecified:
      return @"VERIFY_OP_UNSPECIFIED";
    case FIRAuthOperationTypeSignUpOrSignIn:
      return @"SIGN_UP_OR_IN";
    case FIRAuthOperationTypeReauth:
      return @"REAUTH";
    case FIRAuthOperationTypeLink:
      return @"LINK";
    case FIRAuthOperationTypeUpdate:
      return @"UPDATE";
  }
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *__autoreleasing _Nullable *)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_verificationID) {
    postBody[kVerificationIDKey] = _verificationID;
  }
  if (_verificationCode) {
    postBody[kVerificationCodeKey] = _verificationCode;
  }
  if (_accessToken) {
    postBody[kIDTokenKey] = _accessToken;
  }
  if (_temporaryProof) {
    postBody[kTemporaryProofKey] = _temporaryProof;
  }
  if (_phoneNumber) {
    postBody[kPhoneNumberKey] = _phoneNumber;
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  NSString *operation = FIRAuthOperationString(_operation);
  postBody[kOperationKey] = operation;
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
