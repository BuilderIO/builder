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

#ifndef FIRESTORE_CORE_SRC_UTIL_TASK_H_
#define FIRESTORE_CORE_SRC_UTIL_TASK_H_

#include <atomic>
#include <condition_variable>  // NOLINT(build/c++11)
#include <memory>
#include <mutex>   // NOLINT(build/c++11)
#include <thread>  // NOLINT(build/c++11)

#include "Firestore/core/src/util/executor.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * A task for an Executor to execute, either synchronously or asynchronously,
 * either immediately or after some delay.
 *
 * Tasks are referenced counted, always live on the heap, must be allocated with
 * `Task::Create`, and `delete` themselves when their reference count goes to
 * zero. Use `Retain` and `Release` to manipulate the internal reference count.
 *
 * Nominally Tasks are owned by an Executor, but Tasks are intended to be able
 * to outlive their owner in some special cases:
 *
 *   * If the Executor implementation delegates to a system scheduling facility
 *     that does not support cancellation, the Executor can `Cancel` the task
 *     and release its ownership. When the system gets around to executing the
 *     Task, it will be a no-op.
 *   * If the Executor is being destroyed from a Task owned by the Executor, the
 *     Task naturally has to outlive the Executor.
 */
class Task {
 public:
  /**
   * Constructs a new Task for immediate execution.
   */
  static Task* Create(Executor* executor, Executor::Operation&& operation);

  /**
   * Constructs a new Task for delayed execution.
   */
  static Task* Create(Executor* executor,
                      Executor::TimePoint target_time,
                      Executor::Tag tag,
                      Executor::Id id,
                      Executor::Operation&& operation);

  // Tasks cannot be copied or moved.
  Task(const Task& other) = delete;
  Task& operator=(const Task& other) = delete;

  /**
   * Executes the operation if the Task has not already been executed or
   * cancelled. Regardless of whether or not the operation runs, releases the
   * task's ownership of itself.
   */
  void ExecuteAndRelease();

  /**
   * Increases the task's reference count.
   */
  void Retain();

  /**
   * Decreases the task's reference count, and when that reaches zero, `Release`
   * will delete the task.
   */
  void Release();

  /**
   * Waits until the task has completed execution or cancellation.
   */
  void Await();

  /**
   * Waits until the task has completed execution or cancellation, but only if
   * the task is currently running.
   *
   * @return true if the task is completed, false if it is still unscheduled.
   */
  bool AwaitIfRunning();

  /**
   * Cancels the task. Tasks that have not yet started running will be prevented
   * from running.
   *
   * If the task is currently executing while it is invoked, `Cancel` will await
   * the completion of the Task. This makes `Cancel` safe to call in the
   * destructor of an Executor: any currently executing tasks will effectively
   * extend the lifetime of the Executor.
   *
   * However, if the current task is triggering its own cancellation, `Cancel`
   * will *not* wait because this would cause a deadlock. This makes it possible
   * for a Task to destroy the Executor that owns it and is compatible with
   * expectations that Task might have: after destroying the Executor it
   * obviously cannot be referenced again.
   *
   * Task guarantees that by the time `Cancel` has returned, the task will make
   * no callbacks to the owning executor. This ensures that Tasks that survive
   * past the end of the executor's life do not use after free.
   *
   * Taken together, these properties make it such that the Executor can
   * `Cancel` all pending tasks in its destructor and the right thing will
   * happen:
   *
   *   * Tasks that haven't started yet won't run.
   *   * Tasks that are currently running will extend the lifetime of the
   *     Executor.
   *   * Tasks that are destroying the Executor won't deadlock.
   */
  void Cancel();

  /**
   * Returns true if the Task is suitable for immediate execution (that is, it
   * was created without a target time).
   */
  bool is_immediate() const {
    // tag_ is immutable; no locking required
    return tag_ == Executor::kNoTag;
  }

  /**
   * Returns the target time for execution of the Task. If the task is immediate
   * this will be a zero value in the past.
   */
  Executor::TimePoint target_time() const {
    // target_time_ is immutable; no locking required.
    return target_time_;
  }

  /**
   * Returns the tag supplied in the constructor or `Executor::kNoTag`.
   */
  Executor::Tag tag() const {
    // tag_ is immutable; no locking required.
    return tag_;
  }

  Executor::Id id() const {
    // id_ is immutable; no locking required.
    return id_;
  }

  /**
   * Orders tasks by target time, then by the order in which entries were
   * created.
   */
  bool operator<(const Task& rhs) const;

 private:
  enum class State {
    kInitial,    // Waiting to run (or be cancelled)
    kCancelled,  // Has not run and has been cancelled
    kRunning,    // Now running and can no longer be cancelled
    kDone,       // Has run and has finished running; cannot be cancelled
  };

  Task(Executor* executor,
       Executor::TimePoint target_time,
       Executor::Tag tag,
       Executor::Id id,
       Executor::Operation&& operation);

  // Tasks must always be allocated on the heap and they delete themselves when
  // their reference count goes to zero.
  //
  // Virtual for testing.
  virtual ~Task();

  // Subclasses allowed for testing.
  friend class TrackingTask;

  void AwaitLocked(std::unique_lock<std::mutex>& lock);

  std::mutex mutex_;
  std::condition_variable is_complete_;
  State state_ = State::kInitial;

  std::atomic<int> ref_count_;

  Executor* executor_ = nullptr;
  Executor::TimePoint target_time_;
  Executor::Tag tag_ = 0;
  Executor::Id id_ = 0;

  std::thread::id executing_thread_;

  // The operation to run, supplied by the caller. Make this the last member
  // just in case it refers to this task during its own destruction.
  Executor::Operation operation_;
};

/**
 * Converts a delay into an absolute `TimePoint` representing the current time
 * plus the delay.
 */
Executor::TimePoint MakeTargetTime(Executor::Milliseconds delay);

// Trace details of task execution. Unfortunately, this is all too useful when
// diagnosing crashes in tests. Callers must include util/log.h for themselves.
#if FIRESTORE_TRACE_TASKS
#define TASK_TRACE(...) LOG_WARN(__VA_ARGS__)
#else
#define TASK_TRACE(...)
#endif

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_TASK_H_
