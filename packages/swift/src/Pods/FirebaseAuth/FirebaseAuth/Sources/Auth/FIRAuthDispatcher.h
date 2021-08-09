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

/** @typedef FIRAuthDispatcherImplBlock
    @brief The type of block which can be set as the implementation for @c
        dispatchAfterDelay:queue:callback: .

    @param delay The delay in seconds after which the task will be scheduled to execute.
    @param queue The dispatch queue on which the task will be submitted.
    @param task The task (block) to be scheduled for future execution.
 */
typedef void (^FIRAuthDispatcherImplBlock)(NSTimeInterval delay,
                                           dispatch_queue_t queue,
                                           void (^task)(void));

/** @class FIRAuthDispatchAfter
    @brief A utility class used to facilitate scheduling tasks to be executed in the future.
 */
@interface FIRAuthDispatcher : NSObject

/** @property dispatchAfterImplementation
    @brief Allows custom implementation of dispatchAfterDelay:queue:callback:.
    @remarks Set to nil to restore default implementation.
 */
@property(nonatomic, nullable, copy) FIRAuthDispatcherImplBlock dispatchAfterImplementation;

/** @fn dispatchAfterDelay:queue:callback:
    @brief Schedules task in the future after a specified delay.

    @param delay The delay in seconds after which the task will be scheduled to execute.
    @param queue The dispatch queue on which the task will be submitted.
    @param task The task (block) to be scheduled for future execution.
 */
- (void)dispatchAfterDelay:(NSTimeInterval)delay
                     queue:(dispatch_queue_t)queue
                      task:(void (^)(void))task;

/** @fn sharedInstance
    @brief Gets the shared instance of this class.
    @returns The shared instance of this clss
 */
+ (instancetype)sharedInstance;

@end

NS_ASSUME_NONNULL_END
