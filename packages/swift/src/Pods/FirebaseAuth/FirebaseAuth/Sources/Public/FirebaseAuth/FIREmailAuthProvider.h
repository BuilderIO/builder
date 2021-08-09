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
    @brief A string constant identifying the email & password identity provider.
 */
extern NSString *const FIREmailAuthProviderID NS_SWIFT_NAME(EmailAuthProviderID);

/**
    @brief A string constant identifying the email-link sign-in method.
 */
extern NSString *const FIREmailLinkAuthSignInMethod NS_SWIFT_NAME(EmailLinkAuthSignInMethod);

/**
    @brief A string constant identifying the email & password sign-in method.
 */
// clang-format off
// clang-format12 merges the next two lines.
extern NSString *const FIREmailPasswordAuthSignInMethod
    NS_SWIFT_NAME(EmailPasswordAuthSignInMethod);
// clang-format on

/** @class FIREmailAuthProvider
    @brief A concrete implementation of `FIRAuthProvider` for Email & Password Sign In.
 */
NS_SWIFT_NAME(EmailAuthProvider)
@interface FIREmailAuthProvider : NSObject

/** @fn credentialWithEmail:password:
    @brief Creates an `FIRAuthCredential` for an email & password sign in.

    @param email The user's email address.
    @param password The user's password.
    @return A FIRAuthCredential containing the email & password credential.
 */
+ (FIRAuthCredential *)credentialWithEmail:(NSString *)email password:(NSString *)password;

/** @fn credentialWithEmail:Link:
    @brief Creates an `FIRAuthCredential` for an email & link sign in.

    @param email The user's email address.
    @param link The email sign-in link.
    @return A FIRAuthCredential containing the email & link credential.
 */
+ (FIRAuthCredential *)credentialWithEmail:(NSString *)email link:(NSString *)link;

/** @fn init
    @brief This class is not meant to be initialized.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
