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

#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

/** @var FIRMethodNotImplementedException
    @brief The name of the "Method Not Implemented" exception.
 */
static NSString *const FIRMethodNotImplementedException = @"FIRMethodNotImplementedException";

@implementation FIRAuthExceptionUtils

+ (void)raiseInvalidParameterExceptionWithReason:(nullable NSString *)reason {
  [NSException raise:NSInvalidArgumentException format:@"%@", reason];
}

+ (void)raiseMethodNotImplementedExceptionWithReason:(nullable NSString *)reason {
  NSException *exception = [NSException exceptionWithName:FIRMethodNotImplementedException
                                                   reason:reason
                                                 userInfo:nil];
  [exception raise];
}

@end

NS_ASSUME_NONNULL_END
