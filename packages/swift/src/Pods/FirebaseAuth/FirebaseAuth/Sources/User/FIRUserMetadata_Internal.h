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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRUserMetadata.h"

NS_ASSUME_NONNULL_BEGIN

/** @extension FIRUserMetadata
    @brief An internal class used to expose internal methods of FIRUserMetadata.
 */
@interface FIRUserMetadata () <NSSecureCoding>

/** @fn initWithCreationDate:lastSignInDate:
    @brief Designated initializer.
    @param creationDate The creation date of the corresponding user.
    @param lastSignInDate The date of the last recorded sign-in of the corresponding user.
 */
- (instancetype)initWithCreationDate:(nullable NSDate *)creationDate
                      lastSignInDate:(nullable NSDate *)lastSignInDate NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
