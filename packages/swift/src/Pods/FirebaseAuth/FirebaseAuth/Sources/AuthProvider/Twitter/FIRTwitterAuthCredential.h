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

#import "FirebaseAuth/Sources/AuthProvider/FIRAuthCredential_Internal.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRTwitterAuthCredential
    @brief Internal implementation of FIRAuthCredential for Twitter credentials.
 */
@interface FIRTwitterAuthCredential : FIRAuthCredential <NSSecureCoding>

/** @property token
    @brief The Twitter OAuth token.
 */
@property(nonatomic, readonly) NSString *token;

/** @property secret
    @brief The Twitter OAuth secret.
 */
@property(nonatomic, readonly) NSString *secret;

/** @fn initWithToken:secret:
    @brief Designated initializer.
    @param token The Twitter OAuth token.
    @param secret The Twitter OAuth secret.
 */
- (nullable instancetype)initWithToken:(NSString *)token
                                secret:(NSString *)secret NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
