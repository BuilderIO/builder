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

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthExceptionUtils
    @brief Utility class used to raise standardized Auth related exceptions.
*/
@interface FIRAuthExceptionUtils : NSObject

/** @fn raiseInvalidParameterExceptionWithReason:
    @brief raises the "invalid parameter" exception
    @param reason string will contain a description of the error.
 */
+ (void)raiseInvalidParameterExceptionWithReason:(nullable NSString *)reason;

/** @fn raiseMethodNotImplementedExceptionWithReason:
    @brief raises the "method not implemented" exception
    @param reason string will contain a description of the error.
    @see FIRMethodNotImplementedException
 */
+ (void)raiseMethodNotImplementedExceptionWithReason:(nullable NSString *)reason;

@end

NS_ASSUME_NONNULL_END
