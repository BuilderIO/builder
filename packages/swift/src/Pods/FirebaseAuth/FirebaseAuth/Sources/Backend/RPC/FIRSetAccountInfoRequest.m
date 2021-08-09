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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSetAccountInfoRequest.h"

#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRGetAccountInfoResponse.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

NS_ASSUME_NONNULL_BEGIN

NSString *const FIRSetAccountInfoUserAttributeEmail = @"EMAIL";

NSString *const FIRSetAccountInfoUserAttributeDisplayName = @"DISPLAY_NAME";

NSString *const FIRSetAccountInfoUserAttributeProvider = @"PROVIDER";

NSString *const FIRSetAccountInfoUserAttributePhotoURL = @"PHOTO_URL";

NSString *const FIRSetAccountInfoUserAttributePassword = @"PASSWORD";

/** @var kCreateAuthURIEndpoint
    @brief The "setAccountInfo" endpoint.
 */
static NSString *const kSetAccountInfoEndpoint = @"setAccountInfo";

/** @var kIDTokenKey
    @brief The key for the "idToken" value in the request. This is actually the STS Access Token,
        despite it's confusing (backwards compatiable) parameter name.
 */
static NSString *const kIDTokenKey = @"idToken";

/** @var kDisplayNameKey
    @brief The key for the "displayName" value in the request.
 */
static NSString *const kDisplayNameKey = @"displayName";

/** @var kLocalIDKey
    @brief The key for the "localID" value in the request.
 */
static NSString *const kLocalIDKey = @"localId";

/** @var kEmailKey
    @brief The key for the "email" value in the request.
 */
static NSString *const kEmailKey = @"email";

/** @var kPasswordKey
    @brief The key for the "password" value in the request.
 */
static NSString *const kPasswordKey = @"password";

/** @var kPhotoURLKey
    @brief The key for the "photoURL" value in the request.
 */
static NSString *const kPhotoURLKey = @"photoUrl";

/** @var kProvidersKey
    @brief The key for the "providers" value in the request.
 */
static NSString *const kProvidersKey = @"provider";

/** @var kOOBCodeKey
    @brief The key for the "OOBCode" value in the request.
 */
static NSString *const kOOBCodeKey = @"oobCode";

/** @var kEmailVerifiedKey
    @brief The key for the "emailVerified" value in the request.
 */
static NSString *const kEmailVerifiedKey = @"emailVerified";

/** @var kUpgradeToFederatedLoginKey
    @brief The key for the "upgradeToFederatedLogin" value in the request.
 */
static NSString *const kUpgradeToFederatedLoginKey = @"upgradeToFederatedLogin";

/** @var kCaptchaChallengeKey
    @brief The key for the "captchaChallenge" value in the request.
 */
static NSString *const kCaptchaChallengeKey = @"captchaChallenge";

/** @var kCaptchaResponseKey
    @brief The key for the "captchaResponse" value in the request.
 */
static NSString *const kCaptchaResponseKey = @"captchaResponse";

/** @var kDeleteAttributesKey
    @brief The key for the "deleteAttribute" value in the request.
 */
static NSString *const kDeleteAttributesKey = @"deleteAttribute";

/** @var kDeleteProvidersKey
    @brief The key for the "deleteProvider" value in the request.
 */
static NSString *const kDeleteProvidersKey = @"deleteProvider";

/** @var kReturnSecureTokenKey
    @brief The key for the "returnSecureToken" value in the request.
 */
static NSString *const kReturnSecureTokenKey = @"returnSecureToken";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRSetAccountInfoRequest

- (nullable instancetype)initWithRequestConfiguration:
    (FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kSetAccountInfoEndpoint requestConfiguration:requestConfiguration];
  if (self) {
    _returnSecureToken = YES;
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_accessToken) {
    postBody[kIDTokenKey] = _accessToken;
  }
  if (_displayName) {
    postBody[kDisplayNameKey] = _displayName;
  }
  if (_localID) {
    postBody[kLocalIDKey] = _localID;
  }
  if (_email) {
    postBody[kEmailKey] = _email;
  }
  if (_password) {
    postBody[kPasswordKey] = _password;
  }
  if (_photoURL) {
    postBody[kPhotoURLKey] = _photoURL.absoluteString;
  }
  if (_providers) {
    postBody[kProvidersKey] = _providers;
  }
  if (_OOBCode) {
    postBody[kOOBCodeKey] = _OOBCode;
  }
  if (_emailVerified) {
    postBody[kEmailVerifiedKey] = @YES;
  }
  if (_upgradeToFederatedLogin) {
    postBody[kUpgradeToFederatedLoginKey] = @YES;
  }
  if (_captchaChallenge) {
    postBody[kCaptchaChallengeKey] = _captchaChallenge;
  }
  if (_captchaResponse) {
    postBody[kCaptchaResponseKey] = _captchaResponse;
  }
  if (_deleteAttributes) {
    postBody[kDeleteAttributesKey] = _deleteAttributes;
  }
  if (_deleteProviders) {
    postBody[kDeleteProvidersKey] = _deleteProviders;
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
