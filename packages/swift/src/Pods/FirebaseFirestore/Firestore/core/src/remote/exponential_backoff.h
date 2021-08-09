/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_REMOTE_EXPONENTIAL_BACKOFF_H_
#define FIRESTORE_CORE_SRC_REMOTE_EXPONENTIAL_BACKOFF_H_

#include <chrono>  // NOLINT(build/c++11)
#include <memory>

#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/secure_random.h"

namespace firebase {
namespace firestore {
namespace remote {

/**
 *
 * A helper for running delayed operations following an exponential backoff
 * curve between attempts.
 *
 * The first attempt will be done immediately. After that, each retry will
 * have a delay that is made up of a "base" delay which follows the
 * exponential backoff curve, and a +/- <=50% "jitter" that is calculated and
 * added to the base delay. This prevents clients from accidentally
 * synchronizing their delays causing spikes of load to the backend.
 *
 */
class ExponentialBackoff {
 public:
  /**
   * @param queue The queue to run operations on.
   * @param timer_id The id to use when scheduling backoff operations on the
   *     queue.
   * @param backoff_factor The multiplier to use to determine the extended base
   *     delay after each attempt.
   * @param initial_delay The initial delay (used as the base delay on the first
   *     retry attempt, that is, the second attempt). Note that jitter will
   *     still be applied, so the actual delay could be as little as
   *     `0.5*initial_delay`.
   * @param max_delay The maximum base delay after which no further backoff is
   *     performed. Note that jitter will still be applied, so the actual delay
   *     could be as much as `1.5*max_delay`.
   */
  ExponentialBackoff(const std::shared_ptr<util::AsyncQueue>& queue,
                     util::TimerId timer_id,
                     double backoff_factor,
                     util::AsyncQueue::Milliseconds initial_delay,
                     util::AsyncQueue::Milliseconds max_delay);

  /**
   * Instantiates the exponential backoff with the default values.
   */
  ExponentialBackoff(const std::shared_ptr<util::AsyncQueue>& queue,
                     util::TimerId timer_id);

  /**
   * Resets the backoff delay.
   *
   * The very next `BackoffAndRun` will have no delay. If it is called again
   * (i.e. due to an error), `initial_delay` (plus jitter) will be used, and
   * subsequent ones will increase according to the `backoff_factor`.
   */
  void Reset() {
    current_base_ = Milliseconds{0};
  }

  /**
   * Resets the backoff to the maximum delay (e.g. for use after
   * a RESOURCE_EXHAUSTED error).
   */
  void ResetToMax() {
    current_base_ = max_delay_;
  }

  /**
   * Waits for `current_base` seconds (which may be zero), increases the delay
   * and runs the specified operation. If there was a pending operation waiting
   * to be run already, it will be canceled.
   */
  void BackoffAndRun(util::AsyncQueue::Operation&& operation);

  /** Cancels any pending backoff operation scheduled via `BackoffAndRun`. */
  void Cancel() {
    delayed_operation_.Cancel();
  }

 private:
  using Milliseconds = util::AsyncQueue::Milliseconds;
  // Returns a random value in the range [-current_base_/2, current_base_/2].
  Milliseconds GetDelayWithJitter();
  Milliseconds ClampDelay(Milliseconds delay) const;

  std::shared_ptr<util::AsyncQueue> queue_;
  const util::TimerId timer_id_;
  util::DelayedOperation delayed_operation_;

  const double backoff_factor_;
  Milliseconds current_base_{0};
  const Milliseconds initial_delay_;
  const Milliseconds max_delay_;
  util::SecureRandom secure_random_;
  std::chrono::steady_clock::time_point last_attempt_time_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_EXPONENTIAL_BACKOFF_H_
