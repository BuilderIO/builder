/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRStartMFASignInRequest.h"

static NSString *const kStartMFASignInEndPoint = @"accounts/mfaSignIn:start";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRStartMFASignInRequest

- (nullable instancetype)
    initWithMFAPendingCredential:(NSString *)MFAPendingCredential
                 MFAEnrollmentID:(NSString *)MFAEnrollmentID
                      signInInfo:(FIRAuthProtoStartMFAPhoneRequestInfo *)signInInfo
            requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kStartMFASignInEndPoint
            requestConfiguration:requestConfiguration
             useIdentityPlatform:YES
                      useStaging:NO];
  if (self) {
    _MFAPendingCredential = MFAPendingCredential;
    _MFAEnrollmentID = MFAEnrollmentID;
    _signInInfo = signInInfo;
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *__autoreleasing _Nullable *)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_MFAPendingCredential) {
    postBody[@"mfaPendingCredential"] = _MFAPendingCredential;
  }
  if (_MFAEnrollmentID) {
    postBody[@"mfaEnrollmentId"] = _MFAEnrollmentID;
  }
  if (_signInInfo) {
    if ([_signInInfo isKindOfClass:[FIRAuthProtoStartMFAPhoneRequestInfo class]]) {
      postBody[@"phoneSignInInfo"] = [_signInInfo dictionary];
    }
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  return [postBody copy];
}

@end
