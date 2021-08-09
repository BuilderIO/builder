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

@interface FIRSignUpNewUserRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property email
    @brief The email of the user.
 */
@property(nonatomic, copy, nullable) NSString *email;

/** @property password
    @brief The password inputed by the user.
 */
@property(nonatomic, copy, nullable) NSString *password;

/** @property displayName
    @brief The password inputed by the user.
 */
@property(nonatomic, copy, nullable) NSString *displayName;

/** @property returnSecureToken
    @brief Whether the response should return access token and refresh token directly.
    @remarks The default value is @c YES .
 */
@property(nonatomic, assign) BOOL returnSecureToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithAPIKey:email:password:displayName:requestConfiguration instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithEndpoint:requestConfiguration:
    @brief initializer for anonymous sign-in.
 */
- (nullable instancetype)initWithRequestConfiguration:
    (FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn initWithAPIKey:email:password:displayName:requestConfiguration
    @brief Designated initializer.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithEmail:(nullable NSString *)email
                              password:(nullable NSString *)password
                           displayName:(nullable NSString *)displayName
                  requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
