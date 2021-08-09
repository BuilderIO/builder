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

#include "Firestore/core/src/remote/connectivity_monitor.h"

#include "Firestore/core/src/util/hard_assert.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace remote {

void ConnectivityMonitor::SetInitialStatus(NetworkStatus new_status) {
  HARD_ASSERT(!status_.has_value(),
              "SetInitialStatus should only be called once");
  status_ = new_status;
}

void ConnectivityMonitor::MaybeInvokeCallbacks(NetworkStatus new_status) {
  if (new_status == status_) {
    return;
  }

  InvokeCallbacks(new_status);
}

void ConnectivityMonitor::InvokeCallbacks(NetworkStatus new_status) {
  status_ = new_status;
  for (auto& callback : callbacks_) {
    callback(status_.value());
  }
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
