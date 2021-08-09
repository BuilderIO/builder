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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSendVerificationCodeRequest.h"

#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kSendVerificationCodeEndPoint
    @brief The "sendVerificationCodeEnd" endpoint.
 */
static NSString *const kSendVerificationCodeEndPoint = @"sendVerificationCode";

/** @var kPhoneNumberKey
    @brief The key for the Phone Number parameter in the request.
 */
static NSString *const kPhoneNumberKey = @"phoneNumber";

/** @var kReceiptKey
    @brief The key for the receipt parameter in the request.
 */
static NSString *const kReceiptKey = @"iosReceipt";

/** @var kSecretKey
    @brief The key for the Secret parameter in the request.
 */
static NSString *const kSecretKey = @"iosSecret";

/** @var kreCAPTCHATokenKey
    @brief The key for the reCAPTCHAToken parameter in the request.
 */
static NSString *const kreCAPTCHATokenKey = @"recaptchaToken";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRSendVerificationCodeRequest {
}

- (nullable instancetype)initWithPhoneNumber:(NSString *)phoneNumber
                               appCredential:(nullable FIRAuthAppCredential *)appCredential
                              reCAPTCHAToken:(nullable NSString *)reCAPTCHAToken
                        requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kSendVerificationCodeEndPoint
            requestConfiguration:requestConfiguration];
  if (self) {
    _phoneNumber = [phoneNumber copy];
    _appCredential = appCredential;
    _reCAPTCHAToken = [reCAPTCHAToken copy];
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_phoneNumber) {
    postBody[kPhoneNumberKey] = _phoneNumber;
  }
  if (_appCredential.receipt) {
    postBody[kReceiptKey] = _appCredential.receipt;
  }
  if (_appCredential.secret) {
    postBody[kSecretKey] = _appCredential.secret;
  }
  if (_reCAPTCHAToken) {
    postBody[kreCAPTCHATokenKey] = _reCAPTCHAToken;
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
