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

#ifndef FIRESTORE_CORE_SRC_UTIL_BACKGROUND_QUEUE_H_
#define FIRESTORE_CORE_SRC_UTIL_BACKGROUND_QUEUE_H_

#include <condition_variable>  // NOLINT(build/c++11)
#include <functional>
#include <mutex>  // NOLINT(build/c++11)

namespace firebase {
namespace firestore {
namespace util {

class Executor;

/**
 * A simple queue that executes tasks in parallel on an Executor and supports
 * blocking on their completion.
 *
 * This class is thread-safe.
 */
class BackgroundQueue {
 public:
  explicit BackgroundQueue(Executor* executor);

  /** Enqueue a task on the Executor. */
  void Execute(std::function<void()>&& operation);

  /** Wait for all currently scheduled tasks to complete. */
  void AwaitAll();

 private:
  Executor* executor_ = nullptr;
  int pending_tasks_ = 0;
  std::mutex mutex_;
  std::condition_variable done_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_BACKGROUND_QUEUE_H_
