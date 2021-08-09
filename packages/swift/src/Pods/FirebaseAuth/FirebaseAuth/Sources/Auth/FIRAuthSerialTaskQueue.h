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

/** @typedef FIRAuthSerialTaskCompletionBlock
    @brief The type of method a @c FIRAuthSerialTask must call when it is complete.
 */
typedef void (^FIRAuthSerialTaskCompletionBlock)(void);

/** @typedef FIRAuthSerialTask
    @brief Represents a unit of work submitted to a task queue.
    @param complete The task MUST call the complete method when done.
 */
typedef void (^FIRAuthSerialTask)(FIRAuthSerialTaskCompletionBlock complete);

/** @class FIRAuthSerialTaskQueue
    @brief An easy to use serial task queue which supports a callback-based completion notification
        system for easy asyncronous call chaining.
 */
@interface FIRAuthSerialTaskQueue : NSObject

/** @fn enqueueTask:
    @brief Enqueues a task for serial execution in the queue.
    @remarks The task MUST call the complete method when done. This method is thread-safe.
        The task block won't be executed concurrently with any other blocks in other task queues or
        the global work queue as returned by @c FIRAuthGlobalWorkQueue , but an uncompleted task
        (e.g. task block finished executation before complete method is called at a later time)
        does not affect other task queues or the global work queue.
 */
- (void)enqueueTask:(FIRAuthSerialTask)task;

@end

NS_ASSUME_NONNULL_END
