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

#include "Firestore/core/src/util/executor_libdispatch.h"

#include <algorithm>
#include <atomic>
#include <vector>

#include "Firestore/core/src/util/defer.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/task.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {
namespace {

absl::string_view StringViewFromDispatchLabel(const char* const label) {
  // Make sure string_view's data is not null, because it's used for logging.
  return label ? absl::string_view{label} : absl::string_view{""};
}

// GetLabel functions are guaranteed to never return a "null" string_view
// (i.e. data() != nullptr).
absl::string_view GetQueueLabel(const dispatch_queue_t queue) {
  return StringViewFromDispatchLabel(dispatch_queue_get_label(queue));
}
absl::string_view GetCurrentQueueLabel() {
  // Note: dispatch_queue_get_label may return nullptr if the queue wasn't
  // initialized with a label.
  return StringViewFromDispatchLabel(
      dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL));
}

}  // namespace

// MARK: - ExecutorLibdispatch

ExecutorLibdispatch::ExecutorLibdispatch(const dispatch_queue_t dispatch_queue)
    : dispatch_queue_{dispatch_queue} {
}

ExecutorLibdispatch::~ExecutorLibdispatch() {
  Dispose();
}

void ExecutorLibdispatch::Dispose() {
  TASK_TRACE("Executor::~Executor %s", this);

  decltype(tasks_) local_tasks;
  {
    std::unique_lock<std::mutex> lock(mutex_);

    disposed_ = true;

    // Transfer ownership of tasks out of the executor members and into
    // `local_tasks`. This prevents any concurrent execution of calls to
    // `OnCompletion` or `Cancel` from finding tasks (and also from releasing
    // them).
    local_tasks.swap(tasks_);

    // All scheduled operations are also registered in `tasks_` so they can be
    // handled in a single loop below.
    schedule_.clear();
  }

  for (Task* task : local_tasks) {
    TASK_TRACE("Executor::~Executor %s cancelling %s", this, task);
    task->Cancel();

    // Release this method's ownership (obtained when `local_tasks` swapped with
    // `tasks_`).
    task->Release();
  }
}

bool ExecutorLibdispatch::IsCurrentExecutor() const {
  return GetCurrentQueueLabel() == GetQueueLabel(dispatch_queue());
}
std::string ExecutorLibdispatch::CurrentExecutorName() const {
  return GetCurrentQueueLabel().data();
}
std::string ExecutorLibdispatch::Name() const {
  return GetQueueLabel(dispatch_queue()).data();
}

void ExecutorLibdispatch::Execute(Operation&& operation) {
  auto* task = Task::Create(this, std::move(operation));
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (disposed_) {
      task->Release();
      return;
    }
    tasks_.insert(task);
  }

  task->Retain();  // For libdispatch's ownership
  dispatch_async_f(dispatch_queue_, task, InvokeAsync);
}

void ExecutorLibdispatch::ExecuteBlocking(Operation&& operation) {
  HARD_ASSERT(
      GetCurrentQueueLabel() != GetQueueLabel(dispatch_queue_),
      "Calling ExecuteBlocking on the current queue will lead to a deadlock.");

  auto* task = Task::Create(this, std::move(operation));
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (disposed_) {
      task->Release();
      return;
    }
    tasks_.insert(task);
  }

  task->Retain();  // For libdispatch's ownership
  dispatch_sync_f(dispatch_queue_, task, InvokeSync);
}

DelayedOperation ExecutorLibdispatch::Schedule(Milliseconds delay,
                                               Tag tag,
                                               Operation&& operation) {
  namespace chr = std::chrono;
  const dispatch_time_t delay_ns = dispatch_time(
      DISPATCH_TIME_NOW, chr::duration_cast<chr::nanoseconds>(delay).count());

  // Ownership is shared with libdispatch because it's impossible to actually
  // cancel work after it's been dispatched and libdispatch is guaranteed to
  // outlive the executor, so it's possible for tasks to be executed by
  // libdispatch after the executor is destroyed. While the Executor has a
  // pointer to the Task it also has ownership.
  Task* task = nullptr;
  TimePoint target_time = MakeTargetTime(delay);
  Id id = 0;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (disposed_) {
      return {};
    }

    id = NextIdLocked();
    task = Task::Create(this, target_time, tag, id, std::move(operation));

    tasks_.insert(task);
    schedule_[id] = task;
  }

  task->Retain();  // For libdispatch's ownership
  dispatch_after_f(delay_ns, dispatch_queue_, task, InvokeAsync);

  return DelayedOperation(this, id);
}

void ExecutorLibdispatch::OnCompletion(Task* task) {
  bool should_release = false;
  {
    TASK_TRACE("Executor::OnCompletion %s task %s", this, task);
    std::lock_guard<std::mutex> lock(mutex_);
    // No need to check `disposed_`: in that case `tasks_` would have been
    // cleared.

    auto found = tasks_.find(task);
    if (found != tasks_.end()) {
      should_release = true;
      tasks_.erase(found);

      // Only try to remove scheduled tasks here because non-scheduled tasks
      // all have id 0, which overlaps with the first scheduled task.
      if (!task->is_immediate()) {
        schedule_.erase(task->id());
      }
    }
  }

  // Avoid calling potentially locking methods on the task while holding the
  // executor's lock.
  if (should_release) {
    task->Release();
  }
}

void ExecutorLibdispatch::Cancel(Id operation_id) {
  Task* found_task = nullptr;
  {
    TASK_TRACE("Executor::Cancel %s task %s", this, task);
    std::lock_guard<std::mutex> lock(mutex_);

    // The `Task` referenced by the given `operation_id` might have been
    // destroyed by the time cancellation function runs, in which case it's
    // guaranteed to have been removed from the `schedule_`. If the
    // `operation_id` refers to a task that has been removed, the call to
    // `Cancel` will be a no-op.
    const auto found = schedule_.find(operation_id);

    // It's possible for the operation to be missing if libdispatch gets to run
    // it after it was force-run, for example.
    if (found != schedule_.end()) {
      found_task = found->second;

      // Removing the Task from `tasks_` prevents `OnCompletion` from releasing
      // the task. This effectively transfers ownership to this method--no
      // additional retain is required.
      tasks_.erase(found_task);
      schedule_.erase(found);
    }
  }

  // Avoid calling potentially locking methods on the task while holding the
  // executor's lock.
  if (found_task) {
    found_task->Cancel();

    // Release this method's ownership.
    found_task->Release();
  }
}

void ExecutorLibdispatch::InvokeAsync(void* raw_task) {
  auto* task = static_cast<Task*>(raw_task);
  task->ExecuteAndRelease();
}

void ExecutorLibdispatch::InvokeSync(void* raw_task) {
  // Note: keep this implementation separate from `InvokeAsync` to make it
  // clearer in stack traces exactly what's going on.
  auto* task = static_cast<Task*>(raw_task);
  task->ExecuteAndRelease();
}

// Test-only methods

bool ExecutorLibdispatch::IsTagScheduled(Tag tag) const {
  std::vector<Task*> matches;

  {
    std::unique_lock<std::mutex> lock(mutex_);

    // There's a race inherent in making `IsTagScheduled` checks after a task
    // has executed. The problem is that the task has to lock the Executor to
    // report its completion, but `IsTagScheduled` needs that lock too. Absent
    // any intervention, if `IsTagScheduled` won the race it could indicate
    // that tasks that appear completed are still scheduled.
    //
    // Work around this by waiting for tasks that are currently executing to
    // complete. That is, only tasks that are in the schedule and in the
    // `kInitial` state are considered scheduled.
    //
    // Unfortunately, this has to be done with the Executor unlocked so that
    // the task can report its completion without deadlocking. The executor
    // can't be unlocked while iterating the `schedule_` though, so collect up
    // potential matches in a separate collection.
    for (const ScheduleEntry& entry : schedule_) {
      Task* task = entry.second;
      if (task->tag() == tag) {
        matches.push_back(task);

        // Retain local references to prevent the task from deleting itself
        // before it can be examined outside the executor mutex.
        task->Retain();
      }
    }
  }

  // Avoid calling potentially locking methods on the task while holding the
  // executor's lock.
  bool tag_scheduled = false;
  for (Task* task : matches) {
    // Do not break out of the loop early: every task must be released. Once
    // we find a tag that's still scheduled we no longer need to wait for tasks.
    if (!tag_scheduled) {
      bool task_completed = task->AwaitIfRunning();
      tag_scheduled = !task_completed;
    }

    // Release this method's ownership.
    task->Release();
  }

  return tag_scheduled;
}

bool ExecutorLibdispatch::IsIdScheduled(Id id) const {
  Task* found_task = nullptr;
  {
    std::lock_guard<std::mutex> lock(mutex_);

    auto iter = schedule_.find(id);
    if (iter != schedule_.end()) {
      found_task = iter->second;

      // Retain local references to prevent the task from deleting itself before
      // it can be examined outside the executor mutex.
      found_task->Retain();
    }
  }

  // Avoid calling potentially locking methods on the task while holding the
  // executor's lock.
  bool id_scheduled = false;
  if (found_task) {
    bool task_completed = found_task->AwaitIfRunning();
    id_scheduled = !task_completed;

    // Release this method's ownership
    found_task->Release();
  }

  return id_scheduled;
}

Task* ExecutorLibdispatch::PopFromSchedule() {
  std::lock_guard<std::mutex> lock(mutex_);

  if (schedule_.empty()) {
    return nullptr;
  }

  const auto nearest =
      std::min_element(schedule_.begin(), schedule_.end(),
                       [](const ScheduleEntry& lhs, const ScheduleEntry& rhs) {
                         return *lhs.second < *rhs.second;
                       });

  Task* task = nearest->second;

  // Removing the task from `tasks_` will prevent `OnCompletion` from finding
  // it (or releasing it). This means the executor's ownership is transferred to
  // the caller--no additional `Retain` is required here.
  tasks_.erase(task);
  schedule_.erase(nearest);
  return task;
}

ExecutorLibdispatch::Id ExecutorLibdispatch::NextIdLocked() {
  // The wrap around after ~4 billion operations is explicitly ignored. Even if
  // an instance of `ExecutorLibdispatch` runs long enough to get `current_id_`
  // to overflow, it's extremely unlikely that any object still holds a
  // reference that is old enough to cause a conflict.
  return current_id_++;
}

// MARK: - Executor

std::unique_ptr<Executor> Executor::CreateSerial(const char* label) {
  dispatch_queue_t queue = dispatch_queue_create(label, DISPATCH_QUEUE_SERIAL);
  return absl::make_unique<ExecutorLibdispatch>(queue);
}

std::unique_ptr<Executor> Executor::CreateConcurrent(const char* label,
                                                     int threads) {
  HARD_ASSERT(threads > 1);

  // Concurrent queues auto-create enough threads to avoid deadlock so there's
  // no need to honor the threads argument.
  dispatch_queue_t queue =
      dispatch_queue_create(label, DISPATCH_QUEUE_CONCURRENT);
  return absl::make_unique<ExecutorLibdispatch>(queue);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
