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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAdditionalUserInfo.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAdditionalUserInfo () <NSSecureCoding>

/** @fn userInfoWithVerifyAssertionResponse:
    @brief A convenience factory method for constructing a @c FIRAdditionalUserInfo instance from
        data returned by the verifyAssertion endpoint.
    @param verifyAssertionResponse Data returned by the verifyAssertion endpoint.
    @return A new instance of @c FIRAdditionalUserInfo using data from the verifyAssertion endpoint.
 */
+ (nullable instancetype)userInfoWithVerifyAssertionResponse:
    (FIRVerifyAssertionResponse *)verifyAssertionResponse;

/** @fn initWithProviderID:profile:username:
    @brief Designated initializer.
    @param providerID The provider identifier.
    @param profile Dictionary containing the additional IdP specific information.
    @param username The name of the user.
    @param isNewUser Indicates whether or not the current user was signed in for the first time.
 */
- (nullable instancetype)initWithProviderID:(nullable NSString *)providerID
                                    profile:(nullable NSDictionary<NSString *, NSObject *> *)profile
                                   username:(nullable NSString *)username
                                  isNewUser:(BOOL)isNewUser NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
