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

#import "FirebaseAuth/Sources/Backend/FIRAuthRequestConfiguration.h"

@class FIRAuthRequestConfiguration;

NS_ASSUME_NONNULL_BEGIN

/** @class FIRIdentityToolkitRequest
    @brief Represents a request to an identity toolkit endpoint.
 */
@interface FIRIdentityToolkitRequest : NSObject

/** @property endpoint
    @brief Gets the RPC's endpoint.
 */
@property(nonatomic, copy, readonly) NSString *endpoint;

/** @property APIKey
    @brief Gets the client's API key used for the request.
 */
@property(nonatomic, copy, readonly) NSString *APIKey;

/** @property tenantID
    @brief The tenant ID of the request. nil if none is available.
 */
@property(nonatomic, copy, readonly, nullable) NSString *tenantID;

/** @fn init
    @brief Please use initWithEndpoint:APIKey:
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithEndpoint:APIKey:
    @brief Designated initializer.
    @param endpoint The endpoint name.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                      useIdentityPlatform:(BOOL)useIdentityPlatform
                               useStaging:(BOOL)useStaging;

/** @fn requestURL
    @brief Gets the request's full URL.
 */
- (NSURL *)requestURL;

/** @fn requestConfiguration
    @brief Gets the request's configuration.
 */
- (FIRAuthRequestConfiguration *)requestConfiguration;

@end

NS_ASSUME_NONNULL_END
