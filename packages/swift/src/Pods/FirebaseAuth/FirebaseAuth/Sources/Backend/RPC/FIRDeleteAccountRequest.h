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

/** @class FIRDeleteAccountRequest
    @brief Represents the parameters for the deleteAccount endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/deleteAccount
 */
@interface FIRDeleteAccountRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @fn initWithEndpoint:requestConfiguration:requestConfiguration.
    @brief Please use initWitLocalID:accessToken:requestConfiguration instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWitLocalID:accessToken:requestConfiguration.
    @brief Designated initializer.
    @param localID The local ID.
    @param accessToken The access token.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWitLocalID:(NSString *)localID
                            accessToken:(NSString *)accessToken
                   requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
