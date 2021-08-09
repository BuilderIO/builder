/*
 * Copyright 2019 Google
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

#import "FirebaseAuth/Sources/Backend/RPC/Proto/Phone/FIRAuthProtoStartMFAPhoneRequestInfo.h"

NS_ASSUME_NONNULL_BEGIN

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

@implementation FIRAuthProtoStartMFAPhoneRequestInfo

- (nullable instancetype)initWithPhoneNumber:(NSString *)phoneNumber
                               appCredential:(nullable FIRAuthAppCredential *)appCredential
                              reCAPTCHAToken:(nullable NSString *)reCAPTCHAToken {
  self = [super init];
  if (self) {
    _phoneNumber = [phoneNumber copy];
    _appCredential = appCredential;
    _reCAPTCHAToken = [reCAPTCHAToken copy];
  }
  return self;
}

- (NSDictionary *)dictionary {
  NSMutableDictionary *dict = [NSMutableDictionary dictionary];
  if (_phoneNumber) {
    dict[kPhoneNumberKey] = _phoneNumber;
  }
  if (_appCredential.receipt) {
    dict[kReceiptKey] = _appCredential.receipt;
  }
  if (_appCredential.secret) {
    dict[kSecretKey] = _appCredential.secret;
  }
  if (_reCAPTCHAToken) {
    dict[kreCAPTCHATokenKey] = _reCAPTCHAToken;
  }
  return [dict copy];
}

@end

NS_ASSUME_NONNULL_END
