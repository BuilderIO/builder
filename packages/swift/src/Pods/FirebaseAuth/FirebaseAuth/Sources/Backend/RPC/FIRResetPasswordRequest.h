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

@interface FIRResetPasswordRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property oobCode
    @brief The oobCode sent in the request.
 */
@property(nonatomic, copy, readonly) NSString *oobCode;

/** @property updatedPassword
    @brief The new password sent in the request.
 */
@property(nonatomic, copy, readonly) NSString *updatedPassword;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithOobCode:newPassword:requestConfiguration: instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithOobCode:newPassword:requestConfiguration:
    @brief Designated initializer.
    @param oobCode The OOB Code.
    @param newPassword The new password.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithOobCode:(NSString *)oobCode
                             newPassword:(nullable NSString *)newPassword
                    requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

@end

NS_ASSUME_NONNULL_END
