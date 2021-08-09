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

/** @class FIRCreateAuthURIRequest
    @brief Represents the parameters for the createAuthUri endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/createAuthUri
 */
@interface FIRCreateAuthURIRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property identifier
    @brief The email or federated ID of the user.
 */
@property(nonatomic, copy) NSString *identifier;

/** @property continueURI
    @brief The URI to which the IDP redirects the user after the federated login flow.
 */
@property(nonatomic, copy) NSString *continueURI;

/** @property openIDRealm
    @brief Optional realm for OpenID protocol. The sub string "scheme://domain:port" of the param
        "continueUri" is used if this is not set.
 */
@property(nonatomic, copy, nullable) NSString *openIDRealm;

/** @property providerID
    @brief The IdP ID. For white listed IdPs it's a short domain name e.g. google.com, aol.com,
        live.net and yahoo.com. For other OpenID IdPs it's the OP identifier.
 */
@property(nonatomic, copy, nullable) NSString *providerID;

/** @property clientID
    @brief The relying party OAuth client ID.
 */
@property(nonatomic, copy, nullable) NSString *clientID;

/** @property context
    @brief The opaque value used by the client to maintain context info between the authentication
        request and the IDP callback.
 */
@property(nonatomic, copy, nullable) NSString *context;

/** @property appID
    @brief The iOS client application's bundle identifier.
 */
@property(nonatomic, copy, nullable) NSString *appID;

/** @fn initWithEndpoint:requestConfiguration:requestConfiguration.
    @brief Please use initWithIdentifier:continueURI:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithIdentifier:continueURI:requestConfiguration:
    @brief Designated initializer.
    @param identifier The email or federated ID of the user.
    @param continueURI The URI to which the IDP redirects the user after the federated login flow.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithIdentifier:(NSString *)identifier
                                continueURI:(NSString *)continueURI
                       requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
