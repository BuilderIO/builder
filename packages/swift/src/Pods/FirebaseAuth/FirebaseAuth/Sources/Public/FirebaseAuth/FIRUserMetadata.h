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

/** @class FIRUserMetadata
    @brief A data class representing the metadata corresponding to a Firebase user.
 */
NS_SWIFT_NAME(UserMetadata)
@interface FIRUserMetadata : NSObject

/** @property lastSignInDate
    @brief Stores the last sign in date for the corresponding Firebase user.
 */
@property(copy, nonatomic, readonly, nullable) NSDate *lastSignInDate;

/** @property creationDate
    @brief Stores the creation date for the corresponding Firebase user.
 */
@property(copy, nonatomic, readonly, nullable) NSDate *creationDate;

/** @fn init
    @brief This class should not be initialized manually, an instance of this class can be obtained
        from a Firebase user object.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
