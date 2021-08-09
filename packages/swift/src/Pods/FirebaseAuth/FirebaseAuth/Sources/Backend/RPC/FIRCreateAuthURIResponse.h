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

/** @class FIRCreateAuthURIResponse
    @brief Represents the parameters for the createAuthUri endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/createAuthUri
 */
@interface FIRCreateAuthURIResponse : NSObject <FIRAuthRPCResponse>

/** @property authUri
    @brief The URI used by the IDP to authenticate the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *authURI;

/** @property registered
    @brief Whether the user is registered if the identifier is an email.
 */
@property(nonatomic, assign, readonly) BOOL registered;

/** @property providerId
    @brief The provider ID of the auth URI.
 */
@property(nonatomic, strong, readonly, nullable) NSString *providerID;

/** @property forExistingProvider
    @brief True if the authUri is for user's existing provider.
 */
@property(nonatomic, assign, readonly) BOOL forExistingProvider;

/** @property allProviders
    @brief A list of provider IDs the passed @c identifier could use to sign in with.
 */
@property(nonatomic, copy, readonly, nullable) NSArray<NSString *> *allProviders;

/** @property signinMethods
    @brief A list of sign-in methods available for the passed @c identifier.
 */
@property(nonatomic, copy, readonly, nullable) NSArray<NSString *> *signinMethods;

@end

NS_ASSUME_NONNULL_END
