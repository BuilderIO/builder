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

#import "FIRActionCodeSettings.h"
#import "FIRAdditionalUserInfo.h"
#import "FIRAuth.h"
#import "FIRAuthCredential.h"
#import "FIRAuthDataResult.h"
#import "FIRAuthErrors.h"
#import "FIRAuthTokenResult.h"
#import "FIREmailAuthProvider.h"
#import "FIRFacebookAuthProvider.h"
#import "FIRFederatedAuthProvider.h"
#import "FIRGameCenterAuthProvider.h"
#import "FIRGitHubAuthProvider.h"
#import "FIRGoogleAuthProvider.h"
#import "FIRMultiFactor.h"
#import "FIRMultiFactorAssertion.h"
#import "FIRMultiFactorInfo.h"
#import "FIRMultiFactorResolver.h"
#import "FIRMultiFactorSession.h"
#import "FIROAuthCredential.h"
#import "FIROAuthProvider.h"
#import "FIRTwitterAuthProvider.h"
#import "FIRUser.h"
#import "FIRUserInfo.h"
#import "FIRUserMetadata.h"

#if TARGET_OS_IOS
#import "FIRAuthAPNSTokenType.h"
#import "FIRAuthSettings.h"
#import "FIRAuthUIDelegate.h"
#import "FIRPhoneAuthCredential.h"
#import "FIRPhoneAuthProvider.h"
#import "FIRPhoneMultiFactorAssertion.h"
#import "FIRPhoneMultiFactorGenerator.h"
#import "FIRPhoneMultiFactorInfo.h"
#endif
