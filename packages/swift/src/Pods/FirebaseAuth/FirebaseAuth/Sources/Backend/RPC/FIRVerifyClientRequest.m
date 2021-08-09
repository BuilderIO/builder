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

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyClientRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kVerifyClientEndpoint
    @brief The endpoint for the verifyClient request.
 */
static NSString *const kVerifyClientEndpoint = @"verifyClient";

/** @var kAppTokenKey
    @brief The key for the appToken request paramenter.
 */
static NSString *const kAPPTokenKey = @"appToken";

/** @var kIsSandboxKey
    @brief The key for the isSandbox request parameter
 */
static NSString *const kIsSandboxKey = @"isSandbox";

@implementation FIRVerifyClientRequest

- (nullable instancetype)initWithAppToken:(nullable NSString *)appToken
                                isSandbox:(BOOL)isSandbox
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kVerifyClientEndpoint requestConfiguration:requestConfiguration];
  if (self) {
    _appToken = appToken;
    _isSandbox = isSandbox;
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *__autoreleasing _Nullable *)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_appToken) {
    postBody[kAPPTokenKey] = _appToken;
  }
  if (_isSandbox) {
    postBody[kIsSandboxKey] = @YES;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
