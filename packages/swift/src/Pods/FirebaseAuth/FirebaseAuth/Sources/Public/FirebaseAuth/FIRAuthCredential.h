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

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthCredential
    @brief Represents a credential.
 */
NS_SWIFT_NAME(AuthCredential)
@interface FIRAuthCredential : NSObject

/** @property provider
    @brief Gets the name of the identity provider for the credential.
 */
@property(nonatomic, copy, readonly) NSString *provider;

/** @fn init
    @brief This is an abstract base class. Concrete instances should be created via factory
        methods available in the various authentication provider libraries (like the Facebook
        provider or the Google provider libraries.)
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
