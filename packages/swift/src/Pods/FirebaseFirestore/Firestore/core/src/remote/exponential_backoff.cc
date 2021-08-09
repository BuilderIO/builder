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

#include "Firestore/core/src/remote/exponential_backoff.h"

#include <algorithm>
#include <memory>
#include <random>
#include <utility>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"

namespace firebase {
namespace firestore {
namespace remote {
namespace {

using firebase::firestore::util::AsyncQueue;
using firebase::firestore::util::TimerId;
using Milliseconds = util::AsyncQueue::Milliseconds;
namespace chr = std::chrono;

/**
 * Initial backoff time in milliseconds after an error. Set to 1s according to
 * https://cloud.google.com/apis/design/errors.
 */
constexpr Milliseconds kDefaultBackoffInitialDelay = Milliseconds(1000);

constexpr double kDefaultBackoffFactor = 1.5;

/** Maximum backoff time in milliseconds. */
constexpr Milliseconds kDefaultBackoffMaxDelay = Milliseconds(60 * 1000);

}  // namespace

ExponentialBackoff::ExponentialBackoff(const std::shared_ptr<AsyncQueue>& queue,
                                       TimerId timer_id,
                                       double backoff_factor,
                                       Milliseconds initial_delay,
                                       Milliseconds max_delay)
    : queue_{queue},
      timer_id_{timer_id},
      backoff_factor_{backoff_factor},
      initial_delay_{initial_delay},
      max_delay_{max_delay},
      last_attempt_time_{chr::steady_clock::now()} {
  HARD_ASSERT(queue, "Queue can't be null");

  HARD_ASSERT(backoff_factor >= 1.0, "Backoff factor must be at least 1");

  HARD_ASSERT(initial_delay.count() >= 0, "Delays must be non-negative");
  HARD_ASSERT(max_delay.count() >= 0, "Delays must be non-negative");
  HARD_ASSERT(initial_delay <= max_delay,
              "Initial delay can't be greater than max delay");
}

ExponentialBackoff::ExponentialBackoff(const std::shared_ptr<AsyncQueue>& queue,
                                       TimerId timer_id)
    : ExponentialBackoff(queue,
                         timer_id,
                         kDefaultBackoffFactor,
                         kDefaultBackoffInitialDelay,
                         kDefaultBackoffMaxDelay) {
}

void ExponentialBackoff::BackoffAndRun(AsyncQueue::Operation&& operation) {
  Cancel();

  // First schedule the block using the current base (which may be 0 and should
  // be honored as such).
  Milliseconds desired_delay_with_jitter = current_base_ + GetDelayWithJitter();

  Milliseconds delay_so_far = chr::duration_cast<Milliseconds>(
      chr::steady_clock::now() - last_attempt_time_);

  // Guard against the backoff delay already being past.
  auto remaining_delay =
      std::max(Milliseconds::zero(), desired_delay_with_jitter - delay_so_far);

  if (current_base_.count() > 0) {
    LOG_DEBUG(
        "Backing off for %s ms "
        "(base delay: %s ms, "
        "delay with jitter: %s ms, "
        "last attempt: %s ms ago)",
        remaining_delay.count(), current_base_.count(),
        desired_delay_with_jitter.count(), delay_so_far.count());
  }

  delayed_operation_ =
      queue_->EnqueueAfterDelay(remaining_delay, timer_id_, [this, operation] {
        last_attempt_time_ = chr::steady_clock::now();
        operation();
      });

  // Apply backoff factor to determine next delay, but ensure it is within
  // bounds.
  current_base_ = ClampDelay(
      chr::duration_cast<Milliseconds>(current_base_ * backoff_factor_));
}

Milliseconds ExponentialBackoff::GetDelayWithJitter() {
  std::uniform_real_distribution<double> distribution;
  double random_double = distribution(secure_random_);
  return chr::duration_cast<Milliseconds>((random_double - 0.5) *
                                          current_base_);
}

Milliseconds ExponentialBackoff::ClampDelay(Milliseconds delay) const {
  if (delay < initial_delay_) {
    return initial_delay_;
  }
  if (delay > max_delay_) {
    return max_delay_;
  }
  return delay;
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
