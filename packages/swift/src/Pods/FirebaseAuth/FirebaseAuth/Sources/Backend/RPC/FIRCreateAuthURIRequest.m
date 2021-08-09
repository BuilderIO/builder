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

#import "FirebaseAuth/Sources/Backend/RPC/FIRCreateAuthURIRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kCreateAuthURIEndpoint
    @brief The "createAuthUri" endpoint.
 */
static NSString *const kCreateAuthURIEndpoint = @"createAuthUri";

/** @var kProviderIDKey
    @brief The key for the "providerId" value in the request.
 */
static NSString *const kProviderIDKey = @"providerId";

/** @var kIdentifierKey
    @brief The key for the "identifier" value in the request.
 */
static NSString *const kIdentifierKey = @"identifier";

/** @var kContinueURIKey
    @brief The key for the "continueUri" value in the request.
 */
static NSString *const kContinueURIKey = @"continueUri";

/** @var kOpenIDRealmKey
    @brief The key for the "openidRealm" value in the request.
 */
static NSString *const kOpenIDRealmKey = @"openidRealm";

/** @var kClientIDKey
    @brief The key for the "clientId" value in the request.
 */
static NSString *const kClientIDKey = @"clientId";

/** @var kContextKey
    @brief The key for the "context" value in the request.
 */
static NSString *const kContextKey = @"context";

/** @var kAppIDKey
    @brief The key for the "appId" value in the request.
 */
static NSString *const kAppIDKey = @"appId";

/** @var kTenantIDKey
    @brief The key for the tenant id value in the request.
 */
static NSString *const kTenantIDKey = @"tenantId";

@implementation FIRCreateAuthURIRequest

- (nullable instancetype)initWithIdentifier:(NSString *)identifier
                                continueURI:(NSString *)continueURI
                       requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kCreateAuthURIEndpoint requestConfiguration:requestConfiguration];
  if (self) {
    _identifier = [identifier copy];
    _continueURI = [continueURI copy];
  }
  return self;
}

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error {
  NSMutableDictionary *postBody =
      [@{kIdentifierKey : _identifier, kContinueURIKey : _continueURI} mutableCopy];
  if (_providerID) {
    postBody[kProviderIDKey] = _providerID;
  }
  if (_openIDRealm) {
    postBody[kOpenIDRealmKey] = _openIDRealm;
  }
  if (_clientID) {
    postBody[kClientIDKey] = _clientID;
  }
  if (_context) {
    postBody[kContextKey] = _context;
  }
  if (_appID) {
    postBody[kAppIDKey] = _appID;
  }
  if (self.tenantID) {
    postBody[kTenantIDKey] = self.tenantID;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
