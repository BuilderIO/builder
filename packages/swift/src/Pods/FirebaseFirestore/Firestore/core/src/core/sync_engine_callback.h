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

#ifndef FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_CALLBACK_H_
#define FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_CALLBACK_H_

#include <vector>

#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {
namespace core {

/**
 * Interface implemented by `EventManager` to handle notifications from
 * `SyncEngine`.
 */
class SyncEngineCallback {
 public:
  virtual ~SyncEngineCallback() = default;

  /** Handles a change in online state. */
  virtual void HandleOnlineStateChange(model::OnlineState online_state) = 0;
  /** Handles new view snapshots. */
  virtual void OnViewSnapshots(std::vector<core::ViewSnapshot>&& snapshots) = 0;
  /** Handles the failure of a query. */
  virtual void OnError(const core::Query& query, const util::Status& error) = 0;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_CALLBACK_H_
