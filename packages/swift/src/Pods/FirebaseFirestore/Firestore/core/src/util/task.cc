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

#include "Firestore/core/src/util/task.h"

#include <chrono>  // NOLINT(build/c++11)
#include <cstdint>
#include <utility>

#include "Firestore/core/src/util/defer.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"

namespace firebase {
namespace firestore {
namespace util {

Task* Task::Create(Executor* executor, Executor::Operation&& operation) {
  return new Task(executor, Executor::TimePoint(), Executor::kNoTag, 0u,
                  std::move(operation));
}

Task* Task::Create(Executor* executor,
                   Executor::TimePoint target_time,
                   Executor::Tag tag,
                   Executor::Id id,
                   Executor::Operation&& operation) {
  return new Task(executor, target_time, tag, id, std::move(operation));
}

Task::Task(Executor* executor,
           Executor::TimePoint target_time,
           Executor::Tag tag,
           Executor::Id id,
           Executor::Operation&& operation)
    : executor_(executor),
      target_time_(target_time),
      tag_(tag),
      id_(id),
      operation_(std::move(operation)) {
  // Initialization is not atomic; assignment is.
  ref_count_ = 1;

  TASK_TRACE("Task::Task %s (%s)", this,
             (tag_ == Executor::kNoTag ? "immediate" : "scheduled"));
}

Task::~Task() {
  TASK_TRACE("Task::~Task %s", this);
}

void Task::Retain() {
  TASK_TRACE("Task::Retain %s (ref_count=%s)", this,
             ref_count_.load(std::memory_order_relaxed));
  ref_count_.fetch_add(1, std::memory_order_relaxed);
}

void Task::Release() {
  // TODO(wilhuff): assert the old ref count is >= 1
  // This isn't safe in the current implementation because HARD_ASSERT can throw
  // and `Release` is likely to be called in a destructor.
  int old_count = ref_count_.fetch_sub(1, std::memory_order_acq_rel);
  if (old_count == 1) {
    TASK_TRACE("Task::Release %s (deleting)", this);
    delete this;
  } else {
    HARD_ASSERT(
        old_count > 1,
        "Test::Release called on an already deleted task %s (old_count=%s)",
        this, old_count);
    TASK_TRACE("Task::Release %s (ref_count=%s)", this, old_count);
  }
}

void Task::ExecuteAndRelease() {
  {
    std::unique_lock<std::mutex> lock(mutex_);
    TASK_TRACE("Task::Execute %s", this);

    if (state_ == State::kInitial) {
      state_ = State::kRunning;
      executing_thread_ = std::this_thread::get_id();

      {
        // Invoke the operation without holding mutex_ to avoid deadlocks where
        // the current task can trigger its own cancellation.
        lock.unlock();
        Defer relock([&] { lock.lock(); });
        operation_();

        // Clear the operation while not holding the lock to avoid the
        // possibility that the destructor of something in the closure might
        // try to reference this task.
        operation_ = {};

        TASK_TRACE("Task::Execute %s (completing)", this);
      }

      state_ = State::kDone;

      // The callback to the executor must be performed after the operation
      // completes, otherwise the executor's destructor cannot reliably block
      // until all currently running tasks have completed.
      //
      // Also, the callback should only be performed if the executor has not
      // canceled the task. If `operation_` destroys the executor, notifying
      // the executor after `operation_` returns would result in a use after
      // free.
      //
      // Whether or not the task has been canceled has to be evaluated within
      // the lock to avoid a data race with `Cancel`.
      if (executor_) {
        executor_->OnCompletion(this);
      }
    }

    is_complete_.notify_all();
  }

  Release();
}

void Task::Await() {
  std::unique_lock<std::mutex> lock(mutex_);
  AwaitLocked(lock);
}

bool Task::AwaitIfRunning() {
  std::unique_lock<std::mutex> lock(mutex_);
  if (state_ == State::kInitial) {
    return false;
  }

  if (state_ == State::kRunning) {
    auto this_thread = std::this_thread::get_id();
    // The return value indicates whether or not the task has completed, but
    // if the task itself attempts to await its completion it would deadlock.
    // Instead define a task running on the current thread as no longer being
    // scheduled.
    if (this_thread != executing_thread_) {
      AwaitLocked(lock);
    }
  }
  return true;
}

void Task::AwaitLocked(std::unique_lock<std::mutex>& lock) {
  TASK_TRACE("Task::Await %s", this);
  is_complete_.wait(lock, [this] {
    return state_ == State::kCancelled || state_ == State::kDone;
  });
}

void Task::Cancel() {
  std::unique_lock<std::mutex> lock(mutex_);
  TASK_TRACE("Task::Cancel %s", this);

  if (state_ == State::kInitial) {
    // Do not clear the `operation_` here because that might indirectly trigger
    // an interaction with this task through its destructor.
    state_ = State::kCancelled;
    executor_ = nullptr;

    // Clear the operation while not holding the lock to avoid the
    // possibility that the destructor of something in the closure might
    // try to reference this task.
    lock.unlock();
    operation_ = {};

    is_complete_.notify_all();

  } else if (state_ == State::kRunning) {
    // Cancelled tasks cannot notify the executor because the Executor's
    // destructor may be running as a task. Once that task completes, a
    // notification would be a use-after-free.
    executor_ = nullptr;

    // Avoid deadlocking if the current Task is triggering its own cancellation.
    auto this_thread = std::this_thread::get_id();
    if (this_thread != executing_thread_) {
      AwaitLocked(lock);
    }

  } else {
    // no-op; already kCancelled or kDone.
  }
}

bool Task::operator<(const Task& rhs) const {
  // target_time_ and id_ are immutable after assignment; no lock required.
  if (target_time_ < rhs.target_time_) {
    return true;
  }
  if (target_time_ > rhs.target_time_) {
    return false;
  }

  return id_ < rhs.id_;
}

Executor::TimePoint MakeTargetTime(Executor::Milliseconds delay) {
  return std::chrono::time_point_cast<Executor::Milliseconds>(
             Executor::Clock::now()) +
         delay;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
