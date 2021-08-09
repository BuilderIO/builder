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

/** @class FIREmailPasswordAuthCredential
    @brief Internal implementation of FIRAuthCredential for Email/Password credentials.
 */
@interface FIREmailPasswordAuthCredential : FIRAuthCredential <NSSecureCoding>

/** @property email
    @brief The user's email address.
 */
@property(nonatomic, readonly) NSString *email;

/** @property password
    @brief The user's password.
 */
@property(nonatomic, readonly) NSString *password;

/** @property link
    @brief The email sign-in link.
 */
@property(nonatomic, readonly) NSString *link;

/** @fn initWithEmail:password:
    @brief Designated initializer.
    @param email The user's email address.
    @param password The user's password.
 */
- (nullable instancetype)initWithEmail:(NSString *)email
                              password:(NSString *)password NS_DESIGNATED_INITIALIZER;

/** @fn initWithEmail:link:
    @brief Designated initializer.
    @param email The user's email address.
    @param link The email sign-in link.
 */
- (nullable instancetype)initWithEmail:(NSString *)email
                                  link:(NSString *)link NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
