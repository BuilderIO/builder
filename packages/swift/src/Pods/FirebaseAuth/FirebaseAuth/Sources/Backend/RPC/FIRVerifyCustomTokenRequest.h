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
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRVerifyCustomTokenRequest
    @brief Represents the parameters for the verifyCustomToken endpoint.
 */
@interface FIRVerifyCustomTokenRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property token
    @brief The self-signed token from the client's BYOAuth server.
 */
@property(nonatomic, copy, readonly) NSString *token;

/** @property returnSecureToken
    @brief Whether the response should return access token and refresh token directly.
    @remarks The default value is @c YES .
 */
@property(nonatomic, assign) BOOL returnSecureToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithToken:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithToken:requestConfiguration:
    @brief Designated initializer.
    @param token The self-signed token from the client's BYOAuth server.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithToken:(NSString *)token
                  requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
