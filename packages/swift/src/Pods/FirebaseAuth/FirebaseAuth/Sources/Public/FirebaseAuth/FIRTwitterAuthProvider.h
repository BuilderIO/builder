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

@class FIRAuthCredential;

NS_ASSUME_NONNULL_BEGIN

/**
    @brief A string constant identifying the Twitter identity provider.
 */
extern NSString *const FIRTwitterAuthProviderID NS_SWIFT_NAME(TwitterAuthProviderID);
/**
    @brief A string constant identifying the Twitter sign-in method.
 */
extern NSString *const _Nonnull FIRTwitterAuthSignInMethod NS_SWIFT_NAME(TwitterAuthSignInMethod);

/** @class FIRTwitterAuthProvider
    @brief Utility class for constructing Twitter credentials.
 */
NS_SWIFT_NAME(TwitterAuthProvider)
@interface FIRTwitterAuthProvider : NSObject

/** @fn credentialWithToken:secret:
    @brief Creates an `FIRAuthCredential` for a Twitter sign in.

    @param token The Twitter OAuth token.
    @param secret The Twitter OAuth secret.
    @return A FIRAuthCredential containing the Twitter credential.
 */
+ (FIRAuthCredential *)credentialWithToken:(NSString *)token secret:(NSString *)secret;

/** @fn init
    @brief This class is not meant to be initialized.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
