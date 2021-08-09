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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @enum FIRSecureTokenRequestGrantType
    @brief Represents the possible grant types for a token request.
 */
typedef NS_ENUM(NSUInteger, FIRSecureTokenRequestGrantType) {
  /** @var FIRSecureTokenRequestGrantTypeAuthorizationCode
      @brief Indicates an authorization code request.
      @remarks Exchanges a Gitkit "ID Token" for an STS Access Token and Refresh Token.
   */
  FIRSecureTokenRequestGrantTypeAuthorizationCode,

  /** @var FIRSecureTokenRequestGrantTypeRefreshToken
      @brief Indicates an refresh token request.
      @remarks Uses an existing Refresh Token to create a new Access Token.
   */
  FIRSecureTokenRequestGrantTypeRefreshToken,
};

/** @class FIRSecureTokenRequest
    @brief Represents the parameters for the token endpoint.
 */
@interface FIRSecureTokenRequest : NSObject <FIRAuthRPCRequest>

/** @property grantType
    @brief The type of grant requested.
    @see FIRSecureTokenRequestGrantType
 */
@property(nonatomic, assign, readonly) FIRSecureTokenRequestGrantType grantType;

/** @property scope
    @brief The scopes requested (a comma-delimited list of scope strings.)
 */
@property(nonatomic, copy, readonly, nullable) NSString *scope;

/** @property refreshToken
    @brief The client's refresh token.
 */
@property(nonatomic, copy, readonly, nullable) NSString *refreshToken;

/** @property code
    @brief The client's authorization code (legacy Gitkit "ID Token").
 */
@property(nonatomic, copy, readonly, nullable) NSString *code;

/** @property APIKey
    @brief The client's API Key.
 */
@property(nonatomic, copy, readonly) NSString *APIKey;

/** @fn authCodeRequestWithCode:
    @brief Creates an authorization code request with the given code (legacy Gitkit "ID Token").
    @param code The authorization code (legacy Gitkit "ID Token").
    @param requestConfiguration An object containing configurations to be added to the request.
    @return An authorization request.
 */
+ (FIRSecureTokenRequest *)authCodeRequestWithCode:(NSString *)code
                              requestConfiguration:
                                  (FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn refreshRequestWithCode:
    @brief Creates a refresh request with the given refresh token.
    @param refreshToken The refresh token.
    @param requestConfiguration An object containing configurations to be added to the request.
    @return A refresh request.
 */
+ (FIRSecureTokenRequest *)refreshRequestWithRefreshToken:(NSString *)refreshToken
                                     requestConfiguration:
                                         (FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn init
    @brief Please use initWithGrantType:scope:refreshToken:code:
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithGrantType:scope:refreshToken:code:APIKey:
    @brief Designated initializer.
    @param grantType The type of request.
    @param scope The scopes requested.
    @param refreshToken The client's refresh token (for refresh requests.)
    @param code The client's authorization code (Gitkit ID Token) (for authorization code requests.)
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithGrantType:(FIRSecureTokenRequestGrantType)grantType
                                     scope:(nullable NSString *)scope
                              refreshToken:(nullable NSString *)refreshToken
                                      code:(nullable NSString *)code
                      requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
