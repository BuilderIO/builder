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

/** @class FIREmailLinkSignInRequest
    @brief Represents the parameters for the emailLinkSignin endpoint.
 */
@interface FIREmailLinkSignInRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

#pragma mark - Components of "postBody"

/** @property email
    @brief The email identifier used to complete the email link sign-in.
 */
@property(nonatomic, copy, readonly) NSString *email;

/** @property oobCode
    @brief The OOB code used to complete the email link sign-in flow.
 */
@property(nonatomic, copy, readonly) NSString *oobCode;

/** @property IDToken
    @brief The ID Token code potentially used to complete the email link sign-in flow.
 */
@property(nonatomic, copy) NSString *IDToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithProviderID:requestConfifuration instead.
 */
- (instancetype)initWithEndpoint:(NSString *)endpoint
            requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration NS_UNAVAILABLE;

/** @fn initWithProviderID:requestConfifuration
    @brief Designated initializer.
    @param email The email identifier used to complete hte email link sign-in flow.
    @param oobCode The OOB code used to complete the email link sign-in flow.
    @param requestConfiguration An object containing configurations to be added to the request.

 */
- (instancetype)initWithEmail:(NSString *)email
                      oobCode:(NSString *)oobCode
         requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
