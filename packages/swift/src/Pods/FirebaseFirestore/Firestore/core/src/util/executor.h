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

#ifndef FIRESTORE_CORE_SRC_UTIL_EXECUTOR_H_
#define FIRESTORE_CORE_SRC_UTIL_EXECUTOR_H_

#include <chrono>  // NOLINT(build/c++11)
#include <functional>
#include <memory>
#include <string>

namespace firebase {
namespace firestore {
namespace util {

class DelayedOperation;
class Task;

// An interface to a platform-specific executor of asynchronous operations
// (called tasks on other platforms).
//
// Operations may be scheduled for immediate or delayed execution. Operations
// delayed until the exact same time are scheduled in FIFO order.
//
// The operations are executed sequentially; only a single operation is executed
// at any given time.
//
// Delayed operations may be cancelled if they have not already been run.
class Executor {
 public:
  // An opaque name for a kind of operation. All operations of the same type
  // should share a tag.
  using Tag = int;
  static constexpr Tag kNoTag = -1;

  // An opaque, monotonically increasing identifier for each operation that does
  // not depend on its address. Whereas the `Tag` identifies the kind of
  // operation, the `Id` identifies the specific instance.
  using Id = uint32_t;
  using Operation = std::function<void()>;

  using Milliseconds = std::chrono::milliseconds;
  using Clock = std::chrono::steady_clock;
  using TimePoint = std::chrono::time_point<Clock, Milliseconds>;

  // Creates a new serial Executor of the platform-appropriate type, and gives
  // it the given label, if the implementation supports it.
  //
  // Note that this method has multiple definitions, depending on the platform.
  static std::unique_ptr<Executor> CreateSerial(const char* label);

  // Creates a new concurrent Executor of the platform-appropriate type, with
  // at least the given number of threads, and gives it the given label, if the
  // implementation supports it.
  //
  // Note that this method has multiple definitions, depending on the platform.
  static std::unique_ptr<Executor> CreateConcurrent(const char* label,
                                                    int threads);

  virtual ~Executor() = default;

  // Explicitly destroy this Executor, canceling pending tasks, and waiting for
  // any tasks that are currently running.
  //
  // Dispose exists as a separate step to facilitate a leaf-first destruction
  // order. Normally the root-most object in a hierarchy runs its destructor and
  // then the objects that make it up are destroyed. If tasks referring to the
  // root were running while the Executor's destructor is running, there would
  // be no way for it to prevent those tasks from referring to a partially
  // destroyed root. By calling `Dispose` in its destructor, the root-most
  // object prevents any tasks from running that could observe a partially
  // destroyed object graph.
  //
  // Requirements for implementors:
  //   * Dispose implementations must be idempotent.
  //   * Dispose implementations must exclude concurrent execution of other
  //     methods.
  //   * Once Dispose has started, other Executor methods that accept new work
  //     must silently reject that work.
  //   * Destructors should call Dispose.
  virtual void Dispose() = 0;

  // Schedules the `operation` to be asynchronously executed as soon as
  // possible, in FIFO order.
  virtual void Execute(Operation&& operation) = 0;
  // Like `Execute`, but blocks until the `operation` finishes, consequently
  // draining immediate operations from the executor.
  virtual void ExecuteBlocking(Operation&& operation) = 0;

  // Scheduled the given `operation` to be executed after `delay` milliseconds
  // from now, and returns a handle that allows to cancel the operation
  // (provided it hasn't been run already).
  //
  // Operations scheduled for future execution have an opaque tag. The value of
  // the tag is ignored by the executor but can be used to find operations with
  // a given tag after they are scheduled.
  //
  // `delay` must be non-negative; use `Execute` to schedule operations for
  // immediate execution.
  virtual DelayedOperation Schedule(Milliseconds delay,
                                    Tag tag,
                                    Operation&& operation) = 0;

  // Checks for the caller whether it is being invoked by this executor.
  virtual bool IsCurrentExecutor() const = 0;
  // Returns some sort of an identifier for the current execution context. The
  // only guarantee is that it will return different values depending on whether
  // this function is invoked by this executor or not.
  virtual std::string CurrentExecutorName() const = 0;
  // Like `CurrentExecutorName`, but returns an identifier for this executor,
  // whether the caller code currently runs on this executor or not.
  virtual std::string Name() const = 0;

  // Checks whether an operation tagged with the given `tag` is currently
  // scheduled for future execution.
  virtual bool IsTagScheduled(Tag tag) const = 0;
  virtual bool IsIdScheduled(Id id) const = 0;

  // Removes the nearest due scheduled operation from the schedule and returns
  // it to the caller.
  //
  // Only operations scheduled for delayed execution can be removed with this
  // method; immediate operations don't count. If no such operations are
  // currently scheduled, `nullptr` is returned.
  //
  // The caller is responsible for either executing or cancelling (and
  // releasing) the returned Task.
  virtual Task* PopFromSchedule() = 0;

 private:
  // Mark a task completed, removing it from any internal schedule or tracking.
  // Called by Task once it has completed execution.
  virtual void OnCompletion(Task* task) = 0;
  friend class Task;

  // If the operation hasn't yet been run, it will be removed from the queue.
  // Otherwise, this function is a no-op.
  //
  // Called by `DelayedOperation` when its user calls `Cancel`. Implementations
  // of `Cancel` should also `Dispose` the underlying `Task` to actually prevent
  // execution.
  virtual void Cancel(Id operation_id) = 0;
  friend class DelayedOperation;
};

// A handle to an operation scheduled for future execution. The handle may
// outlive the operation, but it *cannot* outlive the executor that created it.
class DelayedOperation {
 public:
  // Creates an empty `DelayedOperation` not associated with any actual
  // operation. Calling `Cancel` on it is a no-op.
  DelayedOperation() = default;

  // Returns whether this `DelayedOperation` is associated with an actual
  // operation.
  explicit operator bool() const {
    return executor_ && executor_->IsIdScheduled(id_);
  }

  // If the operation has not been run yet, cancels the operation. Otherwise,
  // this function is a no-op.
  void Cancel() {
    if (executor_) {
      executor_->Cancel(id_);
    }
  }

  // Internal use only.
  explicit DelayedOperation(Executor* executor, Executor::Id id)
      : executor_(executor), id_(id) {
  }

 private:
  Executor* executor_ = nullptr;
  Executor::Id id_ = 0;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_EXECUTOR_H_
