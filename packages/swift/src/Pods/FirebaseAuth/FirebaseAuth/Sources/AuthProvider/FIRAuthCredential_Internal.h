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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthCredential.h"

@class FIRVerifyAssertionRequest;

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthCredential ()

/** @fn initWithProvider:
    @brief Designated initializer.
    @remarks This is the designated initializer for internal/friend subclasses.
    @param provider The provider name.
 */
- (nullable instancetype)initWithProvider:(NSString *)provider NS_DESIGNATED_INITIALIZER;

/** @fn prepareVerifyAssertionRequest:
    @brief Called immediately before a request to the verifyAssertion endpoint is made. Implementers
        should update the passed request instance with their credentials.
    @param request The request to be updated with credentials.
 */
- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request;

@end

NS_ASSUME_NONNULL_END
