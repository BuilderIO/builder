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

#ifndef FIRESTORE_CORE_SRC_UTIL_SCHEDULE_H_
#define FIRESTORE_CORE_SRC_UTIL_SCHEDULE_H_

#include <algorithm>
#include <condition_variable>  // NOLINT(build/c++11)
#include <deque>
#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "Firestore/core/src/util/executor.h"

namespace firebase {
namespace firestore {
namespace util {

class Task;

// A thread-safe class similar to a priority queue where the entries are
// prioritized by the time for which they're scheduled. Entries scheduled for
// the exact same time are prioritized in FIFO order.
//
// The main function of `Schedule` is `PopBlocking`, which sleeps until an entry
// becomes available. It correctly handles entries being asynchronously added or
// removed from the schedule.
//
// The details of time management are completely concealed within the class.
// Once an entry is scheduled, there is no way to reschedule or even retrieve
// the time.
class Schedule {
  // Internal invariants:
  // - entries are always in sorted order, leftmost entry is always the most
  //   due;
  // - each operation modifying the queue notifies the condition variable `cv_`.
 public:
  using Duration = Executor::Milliseconds;
  using Clock = Executor::Clock;
  // Entries are scheduled using absolute time.
  using TimePoint = Executor::TimePoint;

  ~Schedule();

  void Clear();

  // Schedules a task for it's specified target time.
  void Push(Task* task);

  // If the queue contains at least one entry for which the scheduled time is
  // due now (according to the system clock), removes the entry which is the
  // most overdue from the queue and returns it. If no entry is due, returns
  // `nullptr`.
  Task* PopIfDue();

  // Blocks until at least one entry is available for which the scheduled time
  // is due now (according to the system clock), removes the entry which is the
  // most overdue from the queue and returns it. The function will attempt to
  // minimize both the waiting time and busy waiting.
  Task* PopBlocking();

  bool empty() const;

  size_t size() const;

  // Removes the first entry satisfying predicate from the queue and returns it.
  // If no such entry exists, returns `nullptr`. The predicate is applied to
  // entries in order according to their scheduled time.
  //
  // Note that this function doesn't take into account whether the removed entry
  // is past its due time.
  template <typename Pred>
  Task* RemoveIf(const Pred pred) {
    std::lock_guard<std::mutex> lock{mutex_};

    for (auto iter = scheduled_.begin(), end = scheduled_.end(); iter != end;
         ++iter) {
      Task* task = *iter;
      if (pred(*task)) {
        return ExtractLocked(iter);
      }
    }
    return nullptr;
  }

  // Checks whether the queue contains an entry satisfying the given predicate.
  template <typename Pred>
  bool Contains(const Pred pred) const {
    std::lock_guard<std::mutex> lock{mutex_};
    return std::any_of(scheduled_.begin(), scheduled_.end(),
                       [&pred](Task* t) { return pred(*t); });
  }

 private:
  // All removals are on the front, but most insertions are expected to be on
  // the back.
  using Container = std::deque<Task*>;
  using Iterator = typename Container::iterator;

  void InsertPreservingOrder(Task* new_entry);

  // This function expects the mutex to be already locked.
  bool HasDueLocked() const;

  // This function expects the mutex to be already locked.
  Task* ExtractLocked(const Iterator where);

  mutable std::mutex mutex_;
  std::condition_variable cv_;
  Container scheduled_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_SCHEDULE_H_
