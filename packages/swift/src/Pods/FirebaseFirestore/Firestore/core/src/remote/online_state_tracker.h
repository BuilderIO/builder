/*
 * Copyright 2019 Google
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

#ifndef FIRESTORE_CORE_SRC_REMOTE_ONLINE_STATE_TRACKER_H_
#define FIRESTORE_CORE_SRC_REMOTE_ONLINE_STATE_TRACKER_H_

#include <functional>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {
namespace remote {

/**
 * A component used by the `RemoteStore` to track the `OnlineState` (that is,
 * whether or not the client as a whole should be considered to be online or
 * offline), implementing the appropriate heuristics.
 *
 * In particular, when the client is trying to connect to the backend, we allow
 * up to `kMaxWatchStreamFailures` within `kOnlineStateTimeout` for a connection
 * to succeed. If we have too many failures or the timeout elapses, then we set
 * the `OnlineState` to `Offline`, and the client will behave as if it is
 * offline (`GetDocument()` calls will return cached data, etc.).
 */
class OnlineStateTracker {
 public:
  OnlineStateTracker() = default;

  OnlineStateTracker(
      const std::shared_ptr<util::AsyncQueue>& worker_queue,
      std::function<void(model::OnlineState)> online_state_handler)
      : worker_queue_{worker_queue},
        online_state_handler_{online_state_handler} {
  }

  /**
   * Called by `RemoteStore` when a watch stream is started (including on
   * each backoff attempt).
   *
   * If this is the first attempt, it sets the `OnlineState` to `Unknown` and
   * starts the `online_state_timer_`.
   */
  void HandleWatchStreamStart();

  /**
   * Called by `RemoteStore` when a watch stream fails.
   *
   * Updates our `OnlineState` as appropriate. The first failure moves us to
   * `OnlineState::Unknown`. We then may allow multiple failures (based on
   * `kMaxWatchStreamFailures`) before we actually transition to
   * `OnlineState::Offline`.
   */
  void HandleWatchStreamFailure(const util::Status& error);

  /**
   * Explicitly sets the `OnlineState` to the specified state.
   *
   * Note that this resets the timers / failure counters, etc. used by our
   * `Offline` heuristics, so it must not be used in place of
   * `HandleWatchStreamStart` and `HandleWatchStreamFailure`.
   */
  void UpdateState(model::OnlineState new_state);

 private:
  void SetAndBroadcast(model::OnlineState new_state);
  void LogClientOfflineWarningIfNecessary(const std::string& reason);
  void ClearOnlineStateTimer();

  /** The current `OnlineState`. */
  model::OnlineState state_ = model::OnlineState::Unknown;

  /**
   * A count of consecutive failures to open the stream. If it reaches the
   * maximum defined by `kMaxWatchStreamFailures`, we'll revert to
   * `OnlineState::Offline`.
   */
  int watch_stream_failures_ = 0;

  /**
   * A timer that elapses after `kOnlineStateTimeout`, at which point we
   * transition from `OnlineState` `Unknown` to `Offline` without waiting for
   * the stream to actually fail (`kMaxWatchStreamFailures` times).
   */
  util::DelayedOperation online_state_timer_;

  /**
   * Whether the client should log a warning message if it fails to connect to
   * the backend (initially true, cleared after a successful stream, or if we've
   * logged the message already).
   */
  bool should_warn_client_is_offline_ = true;

  /**
   * The worker queue to use for running timers (and to call
   * `online_state_handler_`).
   */
  std::shared_ptr<util::AsyncQueue> worker_queue_;

  /** A callback to be notified on `OnlineState` changes. */
  std::function<void(model::OnlineState)> online_state_handler_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_ONLINE_STATE_TRACKER_H_
