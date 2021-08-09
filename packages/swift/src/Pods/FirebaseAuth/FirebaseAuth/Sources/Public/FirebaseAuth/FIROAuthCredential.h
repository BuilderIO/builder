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

#import "FIRAuthCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIROAuthCredential
    @brief Internal implementation of FIRAuthCredential for generic credentials.
 */
NS_SWIFT_NAME(OAuthCredential)
@interface FIROAuthCredential : FIRAuthCredential <NSSecureCoding>

/** @property IDToken
    @brief The ID Token associated with this credential.
 */
@property(nonatomic, readonly, nullable) NSString *IDToken;

/** @property accessToken
    @brief The access token associated with this credential.
 */
@property(nonatomic, readonly, nullable) NSString *accessToken;

/** @property secret
    @brief The secret associated with this credential. This will be nil for OAuth 2.0 providers.
    @detail OAuthCredential already exposes a providerId getter. This will help the developer
        determine whether an access token/secret pair is needed.
 */
@property(nonatomic, readonly, nullable) NSString *secret;

/** @fn init
    @brief This class is not supposed to be instantiated directly.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
