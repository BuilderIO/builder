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

#include "Firestore/core/src/api/load_bundle_task.h"

#include <mutex>  // NOLINT(build/c++11)
#include <utility>

#include "Firestore/core/src/util/autoid.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace api {

LoadBundleTask::~LoadBundleTask() {
  // NOTE: this is needed because users might call to modify some fields from
  // user callback thread. With this lock guard, we could be destroying the
  // instance while those calls are still in flight.
  std::lock_guard<std::mutex> lock(mutex_);
}

LoadBundleTask::LoadBundleHandle LoadBundleTask::Observe(
    ProgressObserver observer) {
  std::lock_guard<std::mutex> lock(mutex_);

  auto handle = next_handle_++;
  observers_.push_back({handle, std::move(observer)});

  return handle;
}

LoadBundleTask::LoadBundleHandle LoadBundleTask::SetLastObserver(
    ProgressObserver observer) {
  std::lock_guard<std::mutex> lock(mutex_);

  auto handle = next_handle_++;
  last_observer_ = {handle, std::move(observer)};

  return handle;
}

void LoadBundleTask::RemoveObserver(const LoadBundleHandle& handle) {
  std::lock_guard<std::mutex> lock(mutex_);

  auto found = absl::c_find_if(
      observers_, [&](const HandleObservers::value_type& observer) {
        return observer.first == handle;
      });
  if (found != observers_.end()) {
    observers_.erase(found);
  }

  if (last_observer_.has_value() && last_observer_.value().first == handle) {
    last_observer_ = absl::nullopt;
  }
}

void LoadBundleTask::RemoveAllObservers() {
  std::lock_guard<std::mutex> lock(mutex_);

  observers_.clear();
  last_observer_ = absl::nullopt;
}

void LoadBundleTask::SetSuccess(LoadBundleTaskProgress success_progress) {
  HARD_ASSERT(success_progress.state() == LoadBundleTaskState::kSuccess,
              "Calling SetSuccess() with a state that is not 'Success'");
  std::lock_guard<std::mutex> lock(mutex_);

  progress_snapshot_ = success_progress;
  NotifyObservers();
}

void LoadBundleTask::SetError(const util::Status& status) {
  std::lock_guard<std::mutex> lock(mutex_);

  progress_snapshot_.set_state(LoadBundleTaskState::kError);
  progress_snapshot_.set_error_status(status);

  NotifyObservers();
}

void LoadBundleTask::UpdateProgress(LoadBundleTaskProgress progress) {
  std::lock_guard<std::mutex> lock(mutex_);

  progress_snapshot_ = progress;
  NotifyObservers();
}

void LoadBundleTask::NotifyObservers() {
  for (const auto& entry : observers_) {
    const auto& observer = entry.second;
    const auto& progress = progress_snapshot_;
    user_executor_->Execute([observer, progress] { observer(progress); });
  }

  if (last_observer_.has_value()) {
    const auto& observer = last_observer_.value().second;
    const auto& progress = progress_snapshot_;
    user_executor_->Execute([observer, progress] { observer(progress); });
  }
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
