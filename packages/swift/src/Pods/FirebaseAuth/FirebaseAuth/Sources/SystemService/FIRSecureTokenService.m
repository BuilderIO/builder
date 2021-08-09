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

#import "FirebaseAuth/Sources/SystemService/FIRSecureTokenService.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuth.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthSerialTaskQueue.h"
#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthBackend.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthRequestConfiguration.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSecureTokenRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSecureTokenResponse.h"

#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kAPIKeyCodingKey
    @brief The key used to encode the APIKey for NSSecureCoding.
 */
static NSString *const kAPIKeyCodingKey = @"APIKey";

/** @var kRefreshTokenKey
    @brief The key used to encode the refresh token for NSSecureCoding.
 */
static NSString *const kRefreshTokenKey = @"refreshToken";

/** @var kAccessTokenKey
    @brief The key used to encode the access token for NSSecureCoding.
 */
static NSString *const kAccessTokenKey = @"accessToken";

/** @var kAccessTokenExpirationDateKey
    @brief The key used to encode the access token expiration date for NSSecureCoding.
 */
static NSString *const kAccessTokenExpirationDateKey = @"accessTokenExpirationDate";

/** @var kFiveMinutes
    @brief Five minutes (in seconds.)
 */
static const NSTimeInterval kFiveMinutes = 5 * 60;

@interface FIRSecureTokenService ()
- (instancetype)init NS_DESIGNATED_INITIALIZER;
@end

@implementation FIRSecureTokenService {
  /** @var _taskQueue
      @brief Used to serialize all requests for access tokens.
   */
  FIRAuthSerialTaskQueue *_taskQueue;

  /** @var _authorizationCode
      @brief An authorization code which needs to be exchanged for Secure Token Service tokens.
   */
  NSString *_Nullable _authorizationCode;

  /** @var _accessToken
      @brief The currently cached access token. Or |nil| if no token is currently cached.
   */
  NSString *_Nullable _accessToken;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _taskQueue = [[FIRAuthSerialTaskQueue alloc] init];
  }
  return self;
}

- (instancetype)initWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                           authorizationCode:(NSString *)authorizationCode {
  self = [self init];
  if (self) {
    _requestConfiguration = requestConfiguration;
    _authorizationCode = [authorizationCode copy];
  }
  return self;
}

- (instancetype)initWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                                 accessToken:(nullable NSString *)accessToken
                   accessTokenExpirationDate:(nullable NSDate *)accessTokenExpirationDate
                                refreshToken:(NSString *)refreshToken {
  self = [self init];
  if (self) {
    _requestConfiguration = requestConfiguration;
    _accessToken = [accessToken copy];
    _accessTokenExpirationDate = [accessTokenExpirationDate copy];
    _refreshToken = [refreshToken copy];
  }
  return self;
}

- (void)fetchAccessTokenForcingRefresh:(BOOL)forceRefresh
                              callback:(FIRFetchAccessTokenCallback)callback {
  [_taskQueue enqueueTask:^(FIRAuthSerialTaskCompletionBlock complete) {
    if (!forceRefresh && [self hasValidAccessToken]) {
      complete();
      callback(self->_accessToken, nil, NO);
    } else {
      FIRLogDebug(kFIRLoggerAuth, @"I-AUT000017", @"Fetching new token from backend.");
      [self requestAccessToken:^(NSString *_Nullable token, NSError *_Nullable error,
                                 BOOL tokenUpdated) {
        complete();
        callback(token, error, tokenUpdated);
      }];
    }
  }];
}

- (NSString *)rawAccessToken {
  return _accessToken;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *refreshToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:kRefreshTokenKey];
  NSString *accessToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:kAccessTokenKey];
  NSDate *accessTokenExpirationDate = [aDecoder decodeObjectOfClass:[NSDate class]
                                                             forKey:kAccessTokenExpirationDateKey];
  if (!refreshToken) {
    return nil;
  }
  self = [self init];
  if (self) {
    _refreshToken = refreshToken;
    _accessToken = accessToken;
    _accessTokenExpirationDate = accessTokenExpirationDate;
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  // The API key is encoded even it is not used in decoding to be compatible with previous versions
  // of the library.
  [aCoder encodeObject:_requestConfiguration.APIKey forKey:kAPIKeyCodingKey];
  // Authorization code is not encoded because it is not long-lived.
  [aCoder encodeObject:_refreshToken forKey:kRefreshTokenKey];
  [aCoder encodeObject:_accessToken forKey:kAccessTokenKey];
  [aCoder encodeObject:_accessTokenExpirationDate forKey:kAccessTokenExpirationDateKey];
}

#pragma mark - Private methods

/** @fn requestAccessToken:
    @brief Makes a request to STS for an access token.
    @details This handles both the case that the token has not been granted yet and that it just
        needs to be refreshed. The caller is responsible for making sure that this is occurring in
        a @c _taskQueue task.
    @param callback Called when the fetch is complete. Invoked asynchronously on the main thread in
        the future.
    @remarks Because this method is guaranteed to only be called from tasks enqueued in
        @c _taskQueue, we do not need any @synchronized guards around access to _accessToken/etc.
        since only one of those tasks is ever running at a time, and those tasks are the only
        access to and mutation of these instance variables.
 */
- (void)requestAccessToken:(FIRFetchAccessTokenCallback)callback {
  FIRSecureTokenRequest *request;
  if (_refreshToken.length) {
    request = [FIRSecureTokenRequest refreshRequestWithRefreshToken:_refreshToken
                                               requestConfiguration:_requestConfiguration];
  } else {
    request = [FIRSecureTokenRequest authCodeRequestWithCode:_authorizationCode
                                        requestConfiguration:_requestConfiguration];
  }
  [FIRAuthBackend
    secureToken:request
       callback:^(FIRSecureTokenResponse *_Nullable response, NSError *_Nullable error) {
         BOOL tokenUpdated = NO;
         NSString *newAccessToken = response.accessToken;
         if (newAccessToken.length && ![newAccessToken isEqualToString:self->_accessToken]) {
           self->_accessToken = [newAccessToken copy];
           self->_accessTokenExpirationDate = response.approximateExpirationDate;
           tokenUpdated = YES;
           FIRLogDebug(kFIRLoggerAuth, @"I-AUT000017",
                       @"Updated access token. Estimated expiration date: %@, current date: %@",
                       self->_accessTokenExpirationDate, [NSDate date]);
         }
         NSString *newRefreshToken = response.refreshToken;
         if (newRefreshToken.length && ![newRefreshToken isEqualToString:self->_refreshToken]) {
           self->_refreshToken = [newRefreshToken copy];
           tokenUpdated = YES;
         }
         callback(newAccessToken, error, tokenUpdated);
       }];
}

- (BOOL)hasValidAccessToken {
  BOOL hasValidAccessToken =
      _accessToken && [_accessTokenExpirationDate timeIntervalSinceNow] > kFiveMinutes;
  if (hasValidAccessToken) {
    FIRLogDebug(kFIRLoggerAuth, @"I-AUT000017",
                @"Has valid access token. Estimated expiration date: %@, current date: %@",
                _accessTokenExpirationDate, [NSDate date]);
  } else {
    FIRLogDebug(
        kFIRLoggerAuth, @"I-AUT000017",
        @"Does not have valid access token. Estimated expiration date: %@, current date: %@",
        _accessTokenExpirationDate, [NSDate date]);
  }
  return hasValidAccessToken;
}

@end

NS_ASSUME_NONNULL_END
