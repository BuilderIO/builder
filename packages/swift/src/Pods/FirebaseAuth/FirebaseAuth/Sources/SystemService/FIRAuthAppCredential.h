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

/** @class FIRAuthAppCredential
    @brief A class represents a credential that proves the identity of the app.
 */
@interface FIRAuthAppCredential : NSObject <NSSecureCoding>

/** @property receipt
    @brief The server acknowledgement of receiving client's claim of identity.
 */
@property(nonatomic, strong, readonly) NSString *receipt;

/** @property secret
    @brief The secret that the client received from server via a trusted channel, if ever.
 */
@property(nonatomic, strong, readonly, nullable) NSString *secret;

/** @fn initWithReceipt:secret:
    @brief Initializes the instance.
    @param receipt The server acknowledgement of receiving client's claim of identity.
    @param secret The secret that the client received from server via a trusted channel, if ever.
    @return The initialized instance.
 */
- (instancetype)initWithReceipt:(NSString *)receipt
                         secret:(nullable NSString *)secret NS_DESIGNATED_INITIALIZER;

/** @fn init
    @brief Call @c initWithReceipt:secret: to get an instance of this class.
 */
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
