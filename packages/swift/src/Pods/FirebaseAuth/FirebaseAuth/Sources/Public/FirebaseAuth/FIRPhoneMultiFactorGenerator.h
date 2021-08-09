/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import <Foundation/Foundation.h>

#import "FIRPhoneAuthCredential.h"
#import "FIRPhoneMultiFactorAssertion.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRPhoneMultiFactorGenerator
    @brief The data structure used to help initialize an assertion for a second factor entity to the
        Firebase Auth/CICP server. Depending on the type of second factor, this will help generate
        the assertion.
*/
NS_SWIFT_NAME(PhoneMultiFactorGenerator)
@interface FIRPhoneMultiFactorGenerator : NSObject

/** @fn assertionWithCredential:
    @brief Initializes the MFA assertion to confirm ownership of the phone second factor. Note that
        this API is used for both enrolling and signing in with a phone second factor.
    @param phoneAuthCredential The phone auth credential used for multi factor flows.
*/
+ (FIRPhoneMultiFactorAssertion *)assertionWithCredential:
    (FIRPhoneAuthCredential *)phoneAuthCredential;

@end

NS_ASSUME_NONNULL_END

#endif
