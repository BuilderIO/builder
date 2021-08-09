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

#import <Foundation/Foundation.h>

@class FIRAuthRequestConfiguration;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRFetchAccessTokenCallback
    @brief The callback used to return the value of attempting to fetch an access token.

    In the event the operation was successful @c token will be set and @c error will be @c nil.
    In the event of failure @c token will be @c nil and @c error will be set.
    @c tokenUpdated indicates whether either the access or the refresh token has been updated.

    The token returned should be considered ephemeral and not cached. It should be used immediately
    and discarded. All operations that need this token should call fetchAccessToken and do their
    work from the callback.
 */
typedef void (^FIRFetchAccessTokenCallback)(NSString *_Nullable token,
                                            NSError *_Nullable error,
                                            BOOL tokenUpdated);

/** @class FIRSecureTokenService
    @brief Provides services for token exchanges and refreshes.
 */
@interface FIRSecureTokenService : NSObject <NSSecureCoding>

/** @property requestConfiguration
    @brief The configuration for making requests to server.
 */
@property(nonatomic, strong) FIRAuthRequestConfiguration *requestConfiguration;

/** @property rawAccessToken
    @brief The cached access token.
    @remarks This method is specifically for providing the access token to internal clients during
        deserialization and sign-in events, and should not be used to retrieve the access token by
        anyone else.
 */
@property(nonatomic, copy, readonly) NSString *rawAccessToken;

/** @property refreshToken
    @brief The refresh token for the user, or @c nil if the user has yet completed sign-in flow.
    @remarks This property needs to be set manually after the instance is decoded from archive.
 */
@property(nonatomic, copy, readonly, nullable) NSString *refreshToken;

/** @property accessTokenExpirationDate
    @brief The expiration date of the cached access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *accessTokenExpirationDate;

/** @fn initWithRequestConfiguration:authorizationCode:
    @brief Creates a @c FIRSecureTokenService with an authroization code.
    @param requestConfiguration The configuration for making requests to server.
    @param authorizationCode An authorization code which needs to be exchanged for STS tokens.
 */
- (instancetype)initWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                           authorizationCode:(NSString *)authorizationCode;

/** @fn initWithRequestConfiguration:accessToken:accessTokenExpirationDate:refreshToken
    @brief Creates a @c FIRSecureTokenService with access and refresh tokens.
    @param requestConfiguration The configuration for making requests to server.
    @param accessToken The STS access token.
    @param accessTokenExpirationDate The approximate expiration date of the access token.
    @param refreshToken The STS refresh token.
 */
- (instancetype)initWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                                 accessToken:(nullable NSString *)accessToken
                   accessTokenExpirationDate:(nullable NSDate *)accessTokenExpirationDate
                                refreshToken:(NSString *)refreshToken;

/** @fn fetchAccessTokenForcingRefresh:callback:
    @brief Fetch a fresh ephemeral access token for the ID associated with this instance. The token
        received in the callback should be considered short lived and not cached.
    @param forceRefresh Forces the token to be refreshed.
    @param callback Callback block that will be called to return either the token or an error.
        Invoked asyncronously on the auth global work queue in the future.
 */
- (void)fetchAccessTokenForcingRefresh:(BOOL)forceRefresh
                              callback:(FIRFetchAccessTokenCallback)callback;

@end

NS_ASSUME_NONNULL_END
