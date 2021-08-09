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

#include "Firestore/core/src/util/schedule.h"

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/task.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {

Schedule::~Schedule() {
  Clear();
}

void Schedule::Clear() {
  std::unique_lock<std::mutex> lock{mutex_};

  for (Task* task : scheduled_) {
    task->Release();
  }

  scheduled_.clear();
}

void Schedule::Push(Task* task) {
  InsertPreservingOrder(task);
}

Task* Schedule::PopIfDue() {
  std::lock_guard<std::mutex> lock{mutex_};

  if (HasDueLocked()) {
    return ExtractLocked(scheduled_.begin());
  }
  return nullptr;
}

Task* Schedule::PopBlocking() {
  std::unique_lock<std::mutex> lock{mutex_};

  while (true) {
    cv_.wait(lock, [this] { return !scheduled_.empty(); });

    // To minimize busy waiting, sleep until either the nearest entry in the
    // future either changes, or else becomes due.

    // Workaround for Visual Studio 2015: cast to a time point with resolution
    // that's at least as fine-grained as the clock on which `wait_until` is
    // parametrized.
    const auto until = std::chrono::time_point_cast<Clock::duration>(
        scheduled_.front()->target_time());
    cv_.wait_until(lock, until, [this, until] {
      return scheduled_.empty() || scheduled_.front()->target_time() != until;
    });

    // There are 3 possibilities why `wait_until` has returned:
    // - `wait_until` has timed out, in which case the current time is at
    //   least `until`, so there must be an overdue entry;
    // - a new entry has been added which comes before `until`. It must be
    //   either overdue (in which case `HasDueLocked` will break the cycle),
    //   or else `until` must be reevaluated (on the next iteration of the
    //   loop);
    // - `until` entry has been removed (including the case where the queue
    //   has become empty). This means `until` has to be reevaluated, similar
    //   to #2.

    if (HasDueLocked()) {
      return ExtractLocked(scheduled_.begin());
    }
  }
}

bool Schedule::empty() const {
  std::lock_guard<std::mutex> lock{mutex_};
  return scheduled_.empty();
}

size_t Schedule::size() const {
  std::lock_guard<std::mutex> lock{mutex_};
  return scheduled_.size();
}

void Schedule::InsertPreservingOrder(Task* new_entry) {
  std::lock_guard<std::mutex> lock{mutex_};

  const auto insertion_point =
      std::upper_bound(scheduled_.begin(), scheduled_.end(), new_entry,
                       [](Task* lhs, Task* rhs) {
                         return lhs->target_time() < rhs->target_time();
                       });
  scheduled_.insert(insertion_point, new_entry);

  cv_.notify_one();
}

// This function expects the mutex to be already locked.
bool Schedule::HasDueLocked() const {
  namespace chr = std::chrono;
  const auto now = chr::time_point_cast<Duration>(Clock::now());
  return !scheduled_.empty() && now >= scheduled_.front()->target_time();
}

// This function expects the mutex to be already locked.
Task* Schedule::ExtractLocked(const Iterator where) {
  HARD_ASSERT(!scheduled_.empty(),
              "Trying to pop an entry from an empty queue.");

  Task* result = *where;
  scheduled_.erase(where);
  cv_.notify_one();

  return result;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
