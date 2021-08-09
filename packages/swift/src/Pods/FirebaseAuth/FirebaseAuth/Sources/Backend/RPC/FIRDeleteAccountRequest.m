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

#import "FirebaseAuth/Sources/Backend/RPC/FIRDeleteAccountRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kCreateAuthURIEndpoint
    @brief The "deleteAccount" endpoint.
 */
static NSString *const kDeleteAccountEndpoint = @"deleteAccount";

/** @var kIDTokenKey
    @brief The key for the "idToken" value in the request. This is actually the STS Access Token,
        despite it's confusing (backwards compatiable) parameter name.
 */
static NSString *const kIDTokenKey = @"idToken";

/** @var kLocalIDKey
    @brief The key for the "localID" value in the request.
 */
static NSString *const kLocalIDKey = @"localId";

@implementation FIRDeleteAccountRequest {
  /** @var _accessToken
      @brief The STS Access Token of the authenticated user.
   */
  NSString *_accessToken;

  /** @var _localID
      @brief The localID of the user.
   */
  NSString *_localID;
}

- (nullable instancetype)initWitLocalID:(NSString *)localID
                            accessToken:(NSString *)accessToken
                   requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kDeleteAccountEndpoint requestConfiguration:requestConfiguration];
  if (self) {
    _localID = [localID copy];
    _accessToken = [accessToken copy];
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  postBody[kIDTokenKey] = _accessToken;
  postBody[kLocalIDKey] = _localID;
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
