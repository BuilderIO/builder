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

/** @class FIRVerifyAssertionRequest
    @brief Represents the parameters for the verifyAssertion endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/verifyAssertion
 */
@interface FIRVerifyAssertionRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property requestURI
    @brief The URI to which the IDP redirects the user back. It may contain federated login result
        params added by the IDP.
 */
@property(nonatomic, copy, nullable) NSString *requestURI;

/** @property pendingToken
    @brief The Firebase ID Token for the IDP pending to be confirmed by the user.
 */
@property(nonatomic, copy, nullable) NSString *pendingToken;

/** @property accessToken
    @brief The STS Access Token for the authenticated user, only needed for linking the user.
 */
@property(nonatomic, copy, nullable) NSString *accessToken;

/** @property returnSecureToken
    @brief Whether the response should return access token and refresh token directly.
    @remarks The default value is @c YES .
 */
@property(nonatomic, assign) BOOL returnSecureToken;

#pragma mark - Components of "postBody"

/** @property providerID
    @brief The ID of the IDP whose credentials are being presented to the endpoint.
 */
@property(nonatomic, copy, readonly) NSString *providerID;

/** @property providerAccessToken
    @brief An access token from the IDP.
 */
@property(nonatomic, copy, nullable) NSString *providerAccessToken;

/** @property providerIDToken
    @brief An ID Token from the IDP.
 */
@property(nonatomic, copy, nullable) NSString *providerIDToken;

/** @property providerRawNonce
    @brief An raw nonce from the IDP.
 */
@property(nonatomic, copy, nullable) NSString *providerRawNonce;

/** @property returnIDPCredential
    @brief Whether the response should return the IDP credential directly.
 */
@property(nonatomic, assign) BOOL returnIDPCredential;

/** @property providerOAuthTokenSecret
    @brief A session ID used to map this request to a headful-lite flow.
 */
@property(nonatomic, copy, nullable) NSString *sessionID;

/** @property providerOAuthTokenSecret
    @brief An OAuth client secret from the IDP.
 */
@property(nonatomic, copy, nullable) NSString *providerOAuthTokenSecret;

/** @property inputEmail
    @brief The originally entered email in the UI.
 */
@property(nonatomic, copy, nullable) NSString *inputEmail;

/** @property autoCreate
    @brief A flag that indicates whether or not the user should be automatically created.
 */
@property(nonatomic, assign) BOOL autoCreate;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithProviderID:requestConfifuration instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithProviderID:requestConfifuration
    @brief Designated initializer.
    @param providerID The auth provider's ID.
    @param requestConfiguration An object containing configurations to be added to the request.

 */
- (nullable instancetype)initWithProviderID:(NSString *)providerID
                       requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
