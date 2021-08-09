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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRVerifyClientRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property appToken
    @brief The APNS device token.
 */
@property(nonatomic, readonly, nullable) NSString *appToken;

/** @property isSandbox
    @brief The flag that denotes if the appToken  pertains to Sandbox or Production.
 */
@property(nonatomic, assign, readonly) BOOL isSandbox;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithToken:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithAppToken:isSandbox:requestConfiguration:
    @brief Designated initializer.
    @param appToken The APNS device token.
    @param isSandbox The flag indicating whether or not the app token provided is for Sandbox or
        Production.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithAppToken:(nullable NSString *)appToken
                                isSandbox:(BOOL)isSandbox
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
