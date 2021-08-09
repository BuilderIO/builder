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

#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Unenroll/FIRWithdrawMFARequest.h"

NS_ASSUME_NONNULL_BEGIN

static NSString *const kWithdrawMFAEndPoint = @"accounts/mfaEnrollment:withdraw";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRWithdrawMFARequest

- (nullable instancetype)initWithIDToken:(NSString *)IDToken
                         MFAEnrollmentID:(NSString *)MFAEnrollmentID
                    requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kWithdrawMFAEndPoint
            requestConfiguration:requestConfiguration
             useIdentityPlatform:YES
                      useStaging:NO];
  if (self) {
    _IDToken = IDToken;
    _MFAEnrollmentID = MFAEnrollmentID;
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *__autoreleasing _Nullable *)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_IDToken) {
    postBody[@"idToken"] = _IDToken;
  }
  if (_MFAEnrollmentID) {
    postBody[@"mfaEnrollmentId"] = _MFAEnrollmentID;
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
