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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRVerifyAssertionResponse
    @brief Represents the response from the emailLinkSignin endpoint.
 */
@interface FIREmailLinkSignInResponse : NSObject <FIRAuthRPCResponse>

/** @property IDToken
    @brief The ID token in the email link sign-in response.
 */
@property(nonatomic, copy, readonly) NSString *IDToken;

/** @property email
    @brief The email returned by the IdP.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property refreshToken
    @brief The refreshToken returned by the server.
 */
@property(nonatomic, strong, readonly, nullable) NSString *refreshToken;

/** @property approximateExpirationDate
    @brief The approximate expiration date of the access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *approximateExpirationDate;

/** @property isNewUser
    @brief Flag indicating that the user signing in is a new user and not a returning user.
 */
@property(nonatomic, assign) BOOL isNewUser;

@end

NS_ASSUME_NONNULL_END
