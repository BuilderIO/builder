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
#if !TARGET_OS_OSX && !TARGET_OS_WATCH

#import <Foundation/Foundation.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthUIDelegate.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthDefaultUIDelegate
    @brief Class responsible for providing a default FIRAuthUIDelegte.
    @remarks This class should be used in the case that a UIDelegate was expected and necessary to
        continue a given flow, but none was provided.
 */
@interface FIRAuthDefaultUIDelegate : NSObject <FIRAuthUIDelegate>

/** @fn defaultUIDelegate
    @brief Unavailable. Please use @c +defaultUIDelegate:
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn defaultUIDelegate
    @brief Returns a default FIRAuthUIDelegate object.
    @return The default FIRAuthUIDelegate object.
 */
+ (id<FIRAuthUIDelegate>)defaultUIDelegate;

@end

NS_ASSUME_NONNULL_END

#endif
