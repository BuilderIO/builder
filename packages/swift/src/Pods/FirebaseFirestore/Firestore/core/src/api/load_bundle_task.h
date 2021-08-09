/*
 * Copyright 2021 Google LLC
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
#ifndef FIRESTORE_CORE_SRC_API_LOAD_BUNDLE_TASK_H_
#define FIRESTORE_CORE_SRC_API_LOAD_BUNDLE_TASK_H_

#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/status.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace api {

/**
 * Represents the state of bundle loading tasks.
 *
 * Both `kSuccess` and `kError` are final states: task will abort
 * or complete and there will be no more updates after they are reported.
 */
enum class LoadBundleTaskState { kError, kInProgress, kSuccess };

/** Represents a progress update or a final state from loading bundles. */
class LoadBundleTaskProgress {
 public:
  LoadBundleTaskProgress() = default;
  LoadBundleTaskProgress(uint32_t documents_loaded,
                         uint32_t total_documents,
                         uint64_t bytes_loaded,
                         uint64_t total_bytes,
                         LoadBundleTaskState state)
      : documents_loaded_(documents_loaded),
        total_documents_(total_documents),
        bytes_loaded_(bytes_loaded),
        total_bytes_(total_bytes),
        state_(state) {
  }

  LoadBundleTaskProgress(uint32_t documents_loaded,
                         uint32_t total_documents,
                         uint64_t bytes_loaded,
                         uint64_t total_bytes,
                         LoadBundleTaskState state,
                         const util::Status& error_status)
      : documents_loaded_(documents_loaded),
        total_documents_(total_documents),
        bytes_loaded_(bytes_loaded),
        total_bytes_(total_bytes),
        state_(state),
        error_status_(error_status) {
  }

  /** Returns how many documents have been loaded. */
  uint32_t documents_loaded() const {
    return documents_loaded_;
  }

  /**
   * Returns the total number of documents in the bundle. Returns 0 if the
   * bundle failed to parse.
   */
  uint32_t total_documents() const {
    return total_documents_;
  }

  /** Returns how many bytes have been loaded. */
  uint64_t bytes_loaded() const {
    return bytes_loaded_;
  }

  /**
   * Returns the total number of bytes in the bundle. Returns 0 if the bundle
   * failed to parse.
   */
  uint64_t total_bytes() const {
    return total_bytes_;
  }

  /** Returns the current state of the task. */
  LoadBundleTaskState state() const {
    return state_;
  }

  void set_state(LoadBundleTaskState state) {
    state_ = state;
  }

  const util::Status& error_status() const {
    return error_status_;
  }

  void set_error_status(const util::Status& error_status) {
    error_status_.Update(error_status);
  }

 private:
  uint32_t documents_loaded_ = 0;
  uint32_t total_documents_ = 0;
  uint64_t bytes_loaded_ = 0;
  uint64_t total_bytes_ = 0;

  LoadBundleTaskState state_ = LoadBundleTaskState::kInProgress;
  util::Status error_status_;
};

inline bool operator==(const LoadBundleTaskProgress lhs,
                       const LoadBundleTaskProgress& rhs) {
  return lhs.state() == rhs.state() &&
         lhs.bytes_loaded() == rhs.bytes_loaded() &&
         lhs.documents_loaded() == rhs.documents_loaded() &&
         lhs.total_bytes() == rhs.total_bytes() &&
         lhs.total_documents() == rhs.total_documents() &&
         lhs.error_status() == rhs.error_status();
}

inline bool operator!=(const LoadBundleTaskProgress lhs,
                       const LoadBundleTaskProgress& rhs) {
  return !(lhs == rhs);
}

/**
 * Represents the task of loading a Firestore bundle. It provides progress of
 * bundle loading, as well as task completion and error events.
 */
class LoadBundleTask {
 public:
  /** A handle used to look up and remove observer from the task. */
  using LoadBundleHandle = int64_t;

  /** Observer type that is called by the task when there is an update. */
  using ProgressObserver = std::function<void(LoadBundleTaskProgress)>;

  explicit LoadBundleTask(std::shared_ptr<util::Executor> user_executor)
      : user_executor_(std::move(user_executor)) {
  }

  // This class cannot be copied or moved, because it holds a mutex.
  LoadBundleTask(const LoadBundleTask& other) = delete;
  LoadBundleTask& operator=(LoadBundleTask& other) = delete;

  ~LoadBundleTask();

  /**
   * Instructs the task to notify the specified observer when there is a
   * progress update.
   *
   * @return A handle that can be used to remove the callback from this task.
   */
  LoadBundleHandle Observe(ProgressObserver observer);

  /**
   * Instructs the task to notify the specified observer when there is a
   * progress update.
   *
   * For a given progress update, this observer is guaranteed to be called
   * after all other observers. Calling `SetLastObserver` a second time will
   * override the observer registered the first time.
   *
   * @return A handle that can be used to remove the callback from this task.
   */
  LoadBundleHandle SetLastObserver(ProgressObserver observer);

  /**
   * Removes the observer associated with the given handle, does nothing if the
   * callback cannot be found.
   */
  void RemoveObserver(const LoadBundleHandle& handle);

  /** Removes all observers. */
  void RemoveAllObservers();

  /**
   * Notifies observers with a `Success` progress.
   */
  void SetSuccess(LoadBundleTaskProgress success_progress);

  /**
   * Notifies observers with a error progress, by changing the last progress
   * this instance has been with an `Error` state.
   */
  void SetError(const util::Status& status);

  /** Notifies observers with a `InProgress` progress. */
  void UpdateProgress(LoadBundleTaskProgress progress);

 private:
  /** Holds the `LoadBundleHandle` to `ProgressObserver` mapping. */
  using HandleObservers =
      std::vector<std::pair<LoadBundleHandle, ProgressObserver>>;

  /** Notifies all observers with current `progress_snapshot_`. */
  void NotifyObservers();

  LoadBundleHandle next_handle_ = 1;

  /** The executor to run all observers when notified. */
  std::shared_ptr<util::Executor> user_executor_;

  /** Guard to all internal state mutation. */
  mutable std::mutex mutex_;

  /** A vector holds observers. */
  HandleObservers observers_;

  /** Observer guaranteed to be called the last. */
  absl::optional<std::pair<LoadBundleHandle, ProgressObserver>> last_observer_;

  /** The last progress update. */
  LoadBundleTaskProgress progress_snapshot_;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_LOAD_BUNDLE_TASK_H_
