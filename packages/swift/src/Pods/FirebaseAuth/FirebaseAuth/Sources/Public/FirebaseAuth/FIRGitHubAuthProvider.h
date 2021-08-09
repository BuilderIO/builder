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
    @brief A string constant identifying the GitHub identity provider.
 */
extern NSString *const FIRGitHubAuthProviderID NS_SWIFT_NAME(GitHubAuthProviderID);

/**
    @brief A string constant identifying the GitHub sign-in method.
 */
extern NSString *const _Nonnull FIRGitHubAuthSignInMethod NS_SWIFT_NAME(GitHubAuthSignInMethod);

/** @class FIRGitHubAuthProvider
    @brief Utility class for constructing GitHub credentials.
 */
NS_SWIFT_NAME(GitHubAuthProvider)
@interface FIRGitHubAuthProvider : NSObject

/** @fn credentialWithToken:
    @brief Creates an `FIRAuthCredential` for a GitHub sign in.

    @param token The GitHub OAuth access token.
    @return A FIRAuthCredential containing the GitHub credential.
 */
+ (FIRAuthCredential *)credentialWithToken:(NSString *)token;

/** @fn init
    @brief This class is not meant to be initialized.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
