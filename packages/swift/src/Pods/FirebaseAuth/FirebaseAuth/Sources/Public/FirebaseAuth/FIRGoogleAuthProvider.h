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
    @brief A string constant identifying the Google identity provider.
 */
extern NSString *const FIRGoogleAuthProviderID NS_SWIFT_NAME(GoogleAuthProviderID);

/**
    @brief A string constant identifying the Google sign-in method.
 */
extern NSString *const _Nonnull FIRGoogleAuthSignInMethod NS_SWIFT_NAME(GoogleAuthSignInMethod);

/** @class FIRGoogleAuthProvider
    @brief Utility class for constructing Google Sign In credentials.
 */
NS_SWIFT_NAME(GoogleAuthProvider)
@interface FIRGoogleAuthProvider : NSObject

/** @fn credentialWithIDToken:accessToken:
    @brief Creates an `FIRAuthCredential` for a Google sign in.

    @param IDToken The ID Token from Google.
    @param accessToken The Access Token from Google.
    @return A FIRAuthCredential containing the Google credentials.
 */
+ (FIRAuthCredential *)credentialWithIDToken:(NSString *)IDToken
                                 accessToken:(NSString *)accessToken;

/** @fn init
    @brief This class should not be initialized.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
