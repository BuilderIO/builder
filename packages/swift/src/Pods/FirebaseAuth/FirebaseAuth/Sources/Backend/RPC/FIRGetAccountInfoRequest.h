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

/** @class FIRGetAccountInfoRequest
    @brief Represents the parameters for the getAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/getAccountInfo
 */
@interface FIRGetAccountInfoRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property accessToken
    @brief The STS Access Token for the authenticated user.
 */
@property(nonatomic, copy) NSString *accessToken;

/** @fn initWithEndpoint:requestConfiguration:requestConfiguration
    @brief Please use initWithAccessToken:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithAccessToken:requestConfiguration
    @brief Designated initializer.
    @param accessToken The Access Token of the authenticated user.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithAccessToken:(NSString *)accessToken
                        requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
