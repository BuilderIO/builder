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

#pragma mark - Provider ID constants

// Declared 'extern' in FIRGoogleAuthProvider.h
NSString *const FIRGoogleAuthProviderID = @"google.com";

// Declared 'extern' in FIRFacebookAuthProvider.h
NSString *const FIRFacebookAuthProviderID = @"facebook.com";

// Declared 'extern' in FIREmailAuthProvider.h
NSString *const FIREmailAuthProviderID = @"password";

// Declared 'extern' in FIRTwitterAuthProvider.h
NSString *const FIRTwitterAuthProviderID = @"twitter.com";

// Declared 'extern' in FIRGitHubAuthProvider.h
NSString *const FIRGitHubAuthProviderID = @"github.com";

// Declared 'extern' in FIRPhoneAuthProvider.h
NSString *const FIRPhoneAuthProviderID = @"phone";

// Declared 'extern' in FIRGameCenterAuthProvider.h
NSString *const FIRGameCenterAuthProviderID = @"gc.apple.com";

#pragma mark - sign-in methods constants

// Declared 'extern' in FIRGoogleAuthProvider.h
NSString *const FIRGoogleAuthSignInMethod = @"google.com";

// Declared 'extern' in FIREmailAuthProvider.h
NSString *const FIREmailPasswordAuthSignInMethod = @"password";

// Declared 'extern' in FIREmailAuthProvider.h
NSString *const FIREmailLinkAuthSignInMethod = @"emailLink";

// Declared 'extern' in FIRTwitterAuthProvider.h
NSString *const FIRTwitterAuthSignInMethod = @"twitter.com";

// Declared 'extern' in FIRFacebookAuthProvider.h
NSString *const FIRFacebookAuthSignInMethod = @"facebook.com";

// Declared 'extern' in FIRGitHubAuthProvider.h
NSString *const FIRGitHubAuthSignInMethod = @"github.com";

// Declared 'extern' in FIRPhoneAuthProvider.h
NSString *const FIRPhoneAuthSignInMethod = @"phone";

// Declared 'extern' in FIRGameCenterAuthProvider.h
NSString *const FIRGameCenterAuthSignInMethod = @"gc.apple.com";
