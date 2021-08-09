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

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import <Foundation/Foundation.h>

#import "FIRAuthCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRPhoneAuthCredential
    @brief Implementation of FIRAuthCredential for Phone Auth credentials.
 */
NS_SWIFT_NAME(PhoneAuthCredential)
@interface FIRPhoneAuthCredential : FIRAuthCredential <NSSecureCoding>

/** @fn init
    @brief This class is not supposed to be instantiated directly.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END

#endif
