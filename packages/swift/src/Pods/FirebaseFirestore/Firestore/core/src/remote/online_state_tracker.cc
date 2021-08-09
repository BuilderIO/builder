/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/remote/online_state_tracker.h"

#include <chrono>  // NOLINT(build/c++11)

#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace remote {
namespace {

namespace chr = std::chrono;

using model::OnlineState;
using util::AsyncQueue;
using util::Status;
using util::StringFormat;
using util::TimerId;

// To deal with transient failures, we allow multiple stream attempts before
// giving up and transitioning from OnlineState Unknown to Offline.
// TODO(mikelehen): This used to be set to 2 as a mitigation for b/66228394.
// @jdimond thinks that bug is sufficiently fixed so that we can set this back
// to 1. If that works okay, we could potentially remove this logic entirely.
const int kMaxWatchStreamFailures = 1;

// To deal with stream attempts that don't succeed or fail in a timely manner,
// we have a timeout for OnlineState to reach Online or Offline. If the timeout
// is reached, we transition to Offline rather than waiting indefinitely.
const AsyncQueue::Milliseconds kOnlineStateTimeout = chr::seconds(10);

}  // namespace

void OnlineStateTracker::HandleWatchStreamStart() {
  if (watch_stream_failures_ != 0) {
    return;
  }

  SetAndBroadcast(OnlineState::Unknown);

  HARD_ASSERT(!online_state_timer_,
              "online_state_timer_ shouldn't be started yet");
  online_state_timer_ = worker_queue_->EnqueueAfterDelay(
      kOnlineStateTimeout, TimerId::OnlineStateTimeout, [this] {
        online_state_timer_ = {};

        HARD_ASSERT(state_ == OnlineState::Unknown,
                    "Timer should be canceled if we transitioned to a "
                    "different state.");
        LogClientOfflineWarningIfNecessary(StringFormat(
            "Backend didn't respond within %s seconds.",
            chr::duration_cast<chr::seconds>(kOnlineStateTimeout).count()));
        SetAndBroadcast(OnlineState::Offline);

        // NOTE: `HandleWatchStreamFailure` will continue to increment
        // `watch_stream_failures_` even though we are already marked `Offline`
        // but this is non-harmful.
      });
}

void OnlineStateTracker::HandleWatchStreamFailure(const Status& error) {
  if (state_ == OnlineState::Online) {
    SetAndBroadcast(OnlineState::Unknown);

    // To get to `OnlineState`::Online, `UpdateState` must have been called
    // which would have reset our heuristics.
    HARD_ASSERT(watch_stream_failures_ == 0,
                "watch_stream_failures_ must be 0");
    HARD_ASSERT(!online_state_timer_,
                "online_state_timer_ must not be set yet");
  } else {
    ++watch_stream_failures_;

    if (watch_stream_failures_ >= kMaxWatchStreamFailures) {
      ClearOnlineStateTimer();

      LogClientOfflineWarningIfNecessary(
          StringFormat("Connection failed %s times. Most recent error: %s",
                       kMaxWatchStreamFailures, error.error_message()));

      SetAndBroadcast(OnlineState::Offline);
    }
  }
}

void OnlineStateTracker::UpdateState(OnlineState new_state) {
  ClearOnlineStateTimer();
  watch_stream_failures_ = 0;

  if (new_state == OnlineState::Online) {
    // We've connected to watch at least once. Don't warn the developer about
    // being offline going forward.
    should_warn_client_is_offline_ = false;
  }

  SetAndBroadcast(new_state);
}

void OnlineStateTracker::SetAndBroadcast(OnlineState new_state) {
  if (new_state != state_) {
    state_ = new_state;
    online_state_handler_(new_state);
  }
}

void OnlineStateTracker::LogClientOfflineWarningIfNecessary(
    const std::string& reason) {
  std::string message = StringFormat(
      "Could not reach Cloud Firestore backend. %s\n This "
      "typically indicates that your device does not have a "
      "healthy Internet connection at the moment. The client will "
      "operate in offline mode until it is able to successfully "
      "connect to the backend.",
      reason);

  if (should_warn_client_is_offline_) {
    LOG_WARN("%s", message);
    should_warn_client_is_offline_ = false;
  } else {
    LOG_DEBUG("%s", message);
  }
}

void OnlineStateTracker::ClearOnlineStateTimer() {
  online_state_timer_.Cancel();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
