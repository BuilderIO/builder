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

#import "FirebaseAuth/Sources/Auth/FIRAuthSerialTaskQueue.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthSerialTaskQueue {
  /** @var _dispatchQueue
      @brief The asyncronous dispatch queue into which tasks are enqueued and processed
          serially.
   */
  dispatch_queue_t _dispatchQueue;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _dispatchQueue = dispatch_queue_create("com.google.firebase.auth.serialTaskQueue", NULL);
    dispatch_set_target_queue(_dispatchQueue, FIRAuthGlobalWorkQueue());
  }
  return self;
}

- (void)enqueueTask:(FIRAuthSerialTask)task {
  // This dispatch queue will run tasks serially in FIFO order, as long as it's not suspended.
  dispatch_async(self->_dispatchQueue, ^{
    // But as soon as a task is started, stop other tasks from running until the task calls it's
    // completion handler, which allows the queue to resume processing of tasks. This allows the
    // task to perform other asyncronous actions on other dispatch queues and "get back to us" when
    // all of their sub-tasks are complete.
    dispatch_suspend(self->_dispatchQueue);
    task(^{
      dispatch_resume(self->_dispatchQueue);
    });
  });
}

@end

NS_ASSUME_NONNULL_END
