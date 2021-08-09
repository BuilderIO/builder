/*
 * Copyright 2020 Google LLC
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

#include "Firestore/core/src/util/background_queue.h"

#include "Firestore/core/src/util/executor.h"

namespace firebase {
namespace firestore {
namespace util {

BackgroundQueue::BackgroundQueue(Executor* executor) : executor_(executor) {
}

void BackgroundQueue::Execute(std::function<void()>&& operation) {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    pending_tasks_ += 1;
  }

  executor_->Execute([this, operation]() {
    operation();

    std::lock_guard<std::mutex> lock(mutex_);
    pending_tasks_ -= 1;
    if (pending_tasks_ == 0) {
      done_.notify_all();
    }
  });
}

void BackgroundQueue::AwaitAll() {
  std::unique_lock<std::mutex> lock(mutex_);
  done_.wait(lock, [this] { return pending_tasks_ == 0; });
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
