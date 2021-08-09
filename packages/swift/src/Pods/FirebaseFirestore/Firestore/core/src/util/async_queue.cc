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

#include "Firestore/core/src/util/async_queue.h"

#include <utility>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/task.h"
#include "absl/algorithm/container.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {

std::shared_ptr<AsyncQueue> AsyncQueue::Create(
    std::unique_ptr<Executor> executor) {
  // Use new because make_shared cannot access a private constructor.
  auto queue = new AsyncQueue(std::move(executor));
  return std::shared_ptr<AsyncQueue>(queue);
}

AsyncQueue::AsyncQueue(std::unique_ptr<Executor> executor)
    : executor_{std::move(executor)} {
  is_operation_in_progress_ = false;
}

AsyncQueue::~AsyncQueue() {
  Dispose();
}

void AsyncQueue::EnterRestrictedMode() {
  std::lock_guard<std::mutex> lock(mutex_);
  if (mode_ == Mode::kDisposed) return;

  mode_ = Mode::kRestricted;
}

void AsyncQueue::Dispose() {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    mode_ = Mode::kDisposed;
  }

  executor_->Dispose();
}

void AsyncQueue::VerifyIsCurrentExecutor() const {
  HARD_ASSERT(
      executor_->IsCurrentExecutor(),
      "Expected to be called by the executor associated with this queue "
      "(expected executor: '%s', actual executor: '%s')",
      executor_->Name(), executor_->CurrentExecutorName());
}

void AsyncQueue::VerifyIsCurrentQueue() const {
  VerifyIsCurrentExecutor();
  HARD_ASSERT(is_operation_in_progress_,
              "VerifyIsCurrentQueue called when no operation is executing "
              "(expected executor: '%s', actual executor: '%s')",
              executor_->Name(), executor_->CurrentExecutorName());
}

void AsyncQueue::ExecuteBlocking(const Operation& operation) {
  // This is not guarded by `is_shutting_down_` because it is the execution
  // of the operation, not scheduling. Checking `is_shutting_down_` here
  // would mean *all* operations will not run after shutdown, which is not
  // intended.
  VerifyIsCurrentExecutor();
  HARD_ASSERT(!is_operation_in_progress_,
              "ExecuteBlocking may not be called "
              "before the previous operation finishes executing");

  is_operation_in_progress_ = true;
  operation();
  is_operation_in_progress_ = false;
}

bool AsyncQueue::Enqueue(const Operation& operation) {
  VerifySequentialOrder();
  return EnqueueRelaxed(operation);
}

bool AsyncQueue::EnqueueEvenWhileRestricted(const Operation& operation) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (mode_ == Mode::kDisposed) return false;

  executor_->Execute(Wrap(operation));
  return true;
}

bool AsyncQueue::is_running() const {
  std::lock_guard<std::mutex> lock(mutex_);
  return mode_ == Mode::kRunning;
}

bool AsyncQueue::EnqueueRelaxed(const Operation& operation) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (mode_ != Mode::kRunning) return false;

  executor_->Execute(Wrap(operation));
  return true;
}

DelayedOperation AsyncQueue::EnqueueAfterDelay(Milliseconds delay,
                                               const TimerId timer_id,
                                               const Operation& operation) {
  std::lock_guard<std::mutex> lock(mutex_);
  VerifyIsCurrentExecutor();

  if (mode_ != Mode::kRunning) {
    return DelayedOperation();
  }

  // Skip delays for timer_ids that have been overridden
  if (absl::c_linear_search(timer_ids_to_skip_, timer_id)) {
    delay = Milliseconds(0);
  }

  auto tag = static_cast<Executor::Tag>(timer_id);
  return executor_->Schedule(delay, tag, Wrap(operation));
}

AsyncQueue::Operation AsyncQueue::Wrap(const Operation& operation) {
  // Decorator pattern: wrap `operation` into a call to `ExecuteBlocking` to
  // ensure that it doesn't spawn any nested operations.

  // The Executor guarantees that this operation will either execute before
  // `Dispose` completes or not at all.
  return [this, operation] { this->ExecuteBlocking(operation); };
}

void AsyncQueue::VerifySequentialOrder() const {
  // This is the inverse of `VerifyIsCurrentQueue`.
  HARD_ASSERT(!is_operation_in_progress_ || !executor_->IsCurrentExecutor(),
              "Enqueue methods cannot be called when we are already running on "
              "target executor "
              "(this queue's executor: '%s', current executor: '%s')",
              executor_->Name(), executor_->CurrentExecutorName());
}

// Test-only functions

void AsyncQueue::EnqueueBlocking(const Operation& operation) {
  VerifySequentialOrder();
  executor_->ExecuteBlocking(Wrap(operation));
}

bool AsyncQueue::IsScheduled(const TimerId timer_id) const {
  return executor_->IsTagScheduled(static_cast<int>(timer_id));
}

void AsyncQueue::RunScheduledOperationsUntil(const TimerId last_timer_id) {
  HARD_ASSERT(!executor_->IsCurrentExecutor(),
              "RunScheduledOperationsUntil must not be called on the queue");

  executor_->ExecuteBlocking([this, last_timer_id] {
    HARD_ASSERT(
        last_timer_id == TimerId::All || IsScheduled(last_timer_id),
        "Attempted to run scheduled operations until missing timer id: %s",
        last_timer_id);

    for (auto* next = executor_->PopFromSchedule(); next != nullptr;
         next = executor_->PopFromSchedule()) {
      // `ExecuteAndRelease` can delete the `Task` so read the tag first.
      bool found_tag = next->tag() == static_cast<int>(last_timer_id);

      next->ExecuteAndRelease();
      if (found_tag) {
        break;
      }
    }
  });
}

void AsyncQueue::SkipDelaysForTimerId(TimerId timer_id) {
  std::lock_guard<std::mutex> lock(mutex_);

  timer_ids_to_skip_.push_back(timer_id);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
