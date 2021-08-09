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

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPasswordRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kVerifyPasswordEndpoint
    @brief The "verifyPassword" endpoint.
 */
static NSString *const kVerifyPasswordEndpoint = @"verifyPassword";

/** @var kEmailKey
    @brief The key for the "email" value in the request.
 */
static NSString *const kEmailKey = @"email";

/** @var kPasswordKey
    @brief The key for the "password" value in the request.
 */
static NSString *const kPasswordKey = @"password";

/** @var kPendingIDTokenKey
    @brief The key for the "pendingIdToken" value in the request.
 */
static NSString *const kPendingIDTokenKey = @"pendingIdToken";

/** @var kCaptchaChallengeKey
    @brief The key for the "captchaChallenge" value in the request.
 */
static NSString *const kCaptchaChallengeKey = @"captchaChallenge";

/** @var kCaptchaResponseKey
    @brief The key for the "captchaResponse" value in the request.
 */
static NSString *const kCaptchaResponseKey = @"captchaResponse";

/** @var kReturnSecureTokenKey
    @brief The key for the "returnSecureToken" value in the request.
 */
static NSString *const kReturnSecureTokenKey = @"returnSecureToken";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRVerifyPasswordRequest

- (nullable instancetype)initWithEmail:(NSString *)email
                              password:(NSString *)password
                  requestConfiguration:(nonnull FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kVerifyPasswordEndpoint requestConfiguration:requestConfiguration];
  if (self) {
    _email = [email copy];
    _password = [password copy];
    _returnSecureToken = YES;
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_email) {
    postBody[kEmailKey] = _email;
  }
  if (_password) {
    postBody[kPasswordKey] = _password;
  }
  if (_pendingIDToken) {
    postBody[kPendingIDTokenKey] = _pendingIDToken;
  }
  if (_captchaChallenge) {
    postBody[kCaptchaChallengeKey] = _captchaChallenge;
  }
  if (_captchaResponse) {
    postBody[kCaptchaResponseKey] = _captchaResponse;
  }
  if (_returnSecureToken) {
    postBody[kReturnSecureTokenKey] = @YES;
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
