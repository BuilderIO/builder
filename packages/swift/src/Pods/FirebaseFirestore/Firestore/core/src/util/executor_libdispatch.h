/*
 * Copyright 2018 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_UTIL_EXECUTOR_LIBDISPATCH_H_
#define FIRESTORE_CORE_SRC_UTIL_EXECUTOR_LIBDISPATCH_H_

#include <dispatch/dispatch.h>

#include <chrono>              // NOLINT(build/c++11)
#include <condition_variable>  // NOLINT(build/c++11)
#include <functional>
#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>

#include "Firestore/core/src/util/executor.h"
#include "absl/strings/string_view.h"

#if !defined(__OBJC__)
// `dispatch_queue_t` gets defined to different types when compiled in C++ or
// Objective-C mode. Source files including this header should all be compiled
// in the same mode to avoid linker errors.
#error "This header only supports Objective-C++ (see comment for more info)."
#endif  // !defined(__OBJC__)

namespace firebase {
namespace firestore {
namespace util {

// A serial queue built on top of libdispatch. The operations are run on
// a dedicated serial dispatch queue.
class ExecutorLibdispatch : public Executor {
 public:
  explicit ExecutorLibdispatch(dispatch_queue_t dispatch_queue);
  ~ExecutorLibdispatch() override;

  void Dispose() override;

  bool IsCurrentExecutor() const override;
  std::string CurrentExecutorName() const override;
  std::string Name() const override;

  void Execute(Operation&& operation) override;
  void ExecuteBlocking(Operation&& operation) override;
  DelayedOperation Schedule(Milliseconds delay,
                            Tag tag,
                            Operation&& operation) override;

  bool IsTagScheduled(Tag tag) const override;
  bool IsIdScheduled(Id id) const override;
  Task* PopFromSchedule() override;

  dispatch_queue_t dispatch_queue() const {
    return dispatch_queue_;
  }

 private:
  using ScheduleMap = std::unordered_map<Id, Task*>;
  using ScheduleEntry = ScheduleMap::value_type;

  void OnCompletion(Task* task) override;
  void Cancel(Id operation_id) override;

  static void InvokeAsync(void* raw_task);
  static void InvokeSync(void* raw_task);

  Id NextIdLocked();

  // A mutex controlling the executor's internal state. Avoid holding this
  // while making calls into tasks, which could trigger callbacks into this
  // executor, causing a deadlock.
  mutable std::mutex mutex_;

  dispatch_queue_t dispatch_queue_;

  // A map of `Schedule`d tasks by their Id, allowing `Cancel` to be able to
  // find tasks quickly.
  ScheduleMap schedule_;

  // The set of all tasks managed by this executor, including those from
  // `Execute`, `ExecuteBlocking`, and `Schedule`.
  //
  // libdispatch doesn't provide a way to cancel a scheduled operation, so once
  // a `Task` is created, it will always stay in the schedule until the time is
  // past. `Task`s internally track their own state and the executor may cancel
  // them instead. This means that by the time libdispatch attempts to execute a
  // a particular operation, the `Task` may already have been executed or
  // canceled (imagine getting to a meeting and finding out it's been
  // cancelled).
  //
  // `Task`s are jointly owned by libdispatch and the executor.
  //
  // Invariant: if the `tasks_` set contains a pointer to a `Task`, it is a
  // valid object. This is achieved because when libdispatch executes a task,
  // the task will remove itself from the executor (via a call to
  // `OnCompletion`) before deleting itself. The reverse is not true: a
  // cancelled task is removed from the executor, but won't be destroyed until
  // its original due time is past.
  std::unordered_set<Task*> tasks_;

  Id current_id_ = 0;

  // Whether or not the executor has been disposed. Only operations that add
  // new work need to observe this. Other operations that operate on `tasks_` or
  // `schedule_` implicitly do so because those structures are cleared during
  // `Dispose`.
  bool disposed_ = false;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_EXECUTOR_LIBDISPATCH_H_
