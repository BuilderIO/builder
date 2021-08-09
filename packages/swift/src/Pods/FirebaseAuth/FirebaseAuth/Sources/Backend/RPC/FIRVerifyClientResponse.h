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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRVerifyClientResponse : NSObject <FIRAuthRPCResponse>

/** @property receipt
    @brief Receipt that the APNS token was successfully validated with APNS.
 */
@property(nonatomic, copy, readonly, nullable) NSString *receipt;

/** @property suggestedTimeOut
    @brief The date after which delivery of the silent push notification is considered to have
        failed.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *suggestedTimeOutDate;

@end

NS_ASSUME_NONNULL_END
