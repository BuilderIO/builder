/*
 * Copyright 2018 Google
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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRGameCenterAuthCredential
    @brief Internal implementation of FIRAuthCredential for Game Center credentials.
 */
@interface FIRGameCenterAuthCredential : FIRAuthCredential <NSSecureCoding>

/** @property playerID
    @brief The ID of the Game Center local player.
 */
@property(nonatomic, readonly) NSString *playerID;

/** @property publicKeyURL
    @brief The URL for the public encryption key.
 */
@property(nonatomic, readonly) NSURL *publicKeyURL;

/** @property signature
    @brief The verification signature data generated.
 */
@property(nonatomic, readonly) NSData *signature;

/** @property salt
    @brief A random string used to compute the hash and keep it randomized.
 */
@property(nonatomic, readonly) NSData *salt;

/** @property timestamp
    @brief The date and time that the signature was created.
 */
@property(nonatomic, readonly) uint64_t timestamp;

/** @property displayName
    @brief The display name of the local Game Center player.
 */
@property(nonatomic, readonly) NSString *displayName;

/** @fn initWithPlayerID:publicKeyURL:signature:salt:timestamp:displayName:
    @brief Designated initializer.
    @param publicKeyURL The URL for the public encryption key.
    @param signature The verification signature generated.
    @param salt A random string used to compute the hash and keep it randomized.
    @param timestamp The date and time that the signature was created.
    @param displayName The display name of the Game Center player.
 */
- (nullable instancetype)initWithPlayerID:(NSString *)playerID
                             publicKeyURL:(NSURL *)publicKeyURL
                                signature:(NSData *)signature
                                     salt:(NSData *)salt
                                timestamp:(uint64_t)timestamp
                              displayName:(NSString *)displayName NS_DESIGNATED_INITIALIZER;

/** @fn initWithProvider:
    @brief Initializer with a provider name.
    @param provider The provider name.
 */
- (nullable instancetype)initWithProvider:(NSString *)provider NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
