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

#ifndef FIRESTORE_CORE_SRC_CORE_EVENT_MANAGER_H_
#define FIRESTORE_CORE_SRC_CORE_EVENT_MANAGER_H_

#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/sync_engine_callback.h"
#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/util/empty.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace core {

class QueryEventSource;
class QueryListener;

/**
 * EventManager is responsible for mapping queries to query event listeners.
 * It handles "fan-out". (Identical queries will re-use the same watch on the
 * backend.)
 */
class EventManager : public SyncEngineCallback {
 public:
  explicit EventManager(QueryEventSource* query_event_source_);

  /**
   * Adds a query listener that will be called with new snapshots for the query.
   * The EventManager is responsible for multiplexing many listeners to a single
   * listen in the SyncEngine and will perform a listen if it's the first
   * QueryListener added for a query.
   *
   * Returns the TargetId of the listen call in the SyncEngine.
   */
  model::TargetId AddQueryListener(
      std::shared_ptr<core::QueryListener> listener);

  /**
   * Removes a previously added listener. It's a no-op if the listener is not
   * found.
   */
  void RemoveQueryListener(std::shared_ptr<core::QueryListener> listener);

  void AddSnapshotsInSyncListener(
      const std::shared_ptr<EventListener<util::Empty>>& listener);
  void RemoveSnapshotsInSyncListener(
      const std::shared_ptr<EventListener<util::Empty>>& listener);

  // Implements `QueryEventCallback`.
  void HandleOnlineStateChange(model::OnlineState online_state) override;
  void OnViewSnapshots(std::vector<core::ViewSnapshot>&& snapshots) override;
  void OnError(const core::Query& query, const util::Status& error) override;

 private:
  /**
   * Call all global snapshot listeners that have been set.
   */
  void RaiseSnapshotsInSyncEvent();

  /**
   * Holds the listeners and the last received ViewSnapshot for a query being
   * tracked by EventManager.
   */
  struct QueryListenersInfo {
    model::TargetId target_id;
    std::vector<std::shared_ptr<QueryListener>> listeners;

    bool Erase(const std::shared_ptr<QueryListener>& listener);

    const absl::optional<ViewSnapshot>& view_snapshot() const {
      return snapshot_;
    }

    void set_view_snapshot(const absl::optional<ViewSnapshot>& snapshot) {
      snapshot_ = snapshot;
    }

   private:
    // Other members are public in this struct, ensure that any reads are
    // copies by requiring reads to go through a const getter.
    absl::optional<ViewSnapshot> snapshot_;
  };

  QueryEventSource* query_event_source_ = nullptr;
  model::OnlineState online_state_ = model::OnlineState::Unknown;
  std::unordered_map<core::Query, QueryListenersInfo> queries_;
  std::unordered_set<std::shared_ptr<EventListener<util::Empty>>>
      snapshots_in_sync_listeners_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_EVENT_MANAGER_H_
