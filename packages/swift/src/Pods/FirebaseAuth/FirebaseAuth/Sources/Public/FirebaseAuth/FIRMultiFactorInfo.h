/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
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

NS_ASSUME_NONNULL_BEGIN

/** @class FIRMultiFactorInfo
    @brief Safe public structure used to represent a second factor entity from a client perspective.
*/
NS_SWIFT_NAME(MultiFactorInfo)
@interface FIRMultiFactorInfo : NSObject

/**
   @brief The multi-factor enrollment ID.
*/
@property(nonatomic, readonly) NSString *UID;

/**
   @brief The user friendly name of the current second factor.
*/
@property(nonatomic, readonly, nullable) NSString *displayName;

/**
   @brief The second factor enrollment date.
*/
@property(nonatomic, readonly) NSDate *enrollmentDate;

/**
   @brief The identifier of the second factor.
*/
@property(nonatomic, readonly) NSString *factorID;

@end

NS_ASSUME_NONNULL_END

#endif
