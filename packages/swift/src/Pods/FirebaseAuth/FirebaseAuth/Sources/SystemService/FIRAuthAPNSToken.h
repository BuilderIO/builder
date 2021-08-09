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
#if !TARGET_OS_OSX

#import <Foundation/Foundation.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthAPNSTokenType.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthAPNSToken
    @brief A data structure for an APNs token.
 */
@interface FIRAuthAPNSToken : NSObject

/** @property data
    @brief The APNs token data.
 */
@property(nonatomic, strong, readonly) NSData *data;

/** @property string
    @brief The uppercase hexadecimal string form of the APNs token data.
 */
@property(nonatomic, strong, readonly) NSString *string;

/** @property type
    @brief The APNs token type.
 */
@property(nonatomic, assign, readonly) FIRAuthAPNSTokenType type;

/** @fn initWithData:type:
    @brief Initializes the instance.
    @param data The APNs token data.
    @param type The APNs token type.
    @return The initialized instance.
 */
- (instancetype)initWithData:(NSData *)data
                        type:(FIRAuthAPNSTokenType)type NS_DESIGNATED_INITIALIZER;

/** @fn init
    @brief Call @c initWithData:type: to get an instance of this class.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END

#endif
