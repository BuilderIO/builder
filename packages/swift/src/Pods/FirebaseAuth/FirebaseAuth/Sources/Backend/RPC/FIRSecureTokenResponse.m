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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSecureTokenResponse.h"

#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kExpiresInKey
    @brief The key for the number of seconds till the access token expires.
 */
static NSString *const kExpiresInKey = @"expires_in";

/** @var kRefreshTokenKey
    @brief The key for the refresh token.
 */
static NSString *const kRefreshTokenKey = @"refresh_token";

/** @var kAccessTokenKey
    @brief The key for the access token.
 */
static NSString *const kAccessTokenKey = @"access_token";

/** @var kIDTokenKey
    @brief The key for the "id_token" value in the response.
 */
static NSString *const kIDTokenKey = @"id_token";

@implementation FIRSecureTokenResponse

- (nullable NSString *)expectedKind {
  return nil;
}

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  _refreshToken = dictionary[kRefreshTokenKey];
  _accessToken = dictionary[kAccessTokenKey];
  _IDToken = dictionary[kIDTokenKey];
  if (!_accessToken.length) {
    if (error) {
      *error = [FIRAuthErrorUtils unexpectedResponseWithDeserializedResponse:dictionary];
    }
    return NO;
  }
  id expiresIn = dictionary[kExpiresInKey];
  if (![expiresIn isKindOfClass:[NSString class]]) {
    if (error) {
      *error = [FIRAuthErrorUtils unexpectedResponseWithDeserializedResponse:dictionary];
    }
    return NO;
  }

  _approximateExpirationDate = [NSDate dateWithTimeIntervalSinceNow:[expiresIn doubleValue]];
  return YES;
}

@end

NS_ASSUME_NONNULL_END
