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

#ifndef FIRESTORE_CORE_SRC_CORE_QUERY_LISTENER_H_
#define FIRESTORE_CORE_SRC_CORE_QUERY_LISTENER_H_

#include <memory>
#include <utility>

#include "Firestore/core/src/core/listen_options.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace core {

/**
 * QueryListener takes a series of internal view snapshots and determines when
 * to raise user-facing events.
 */
class QueryListener {
 public:
  static std::shared_ptr<QueryListener> Create(
      Query query,
      ListenOptions options,
      ViewSnapshotSharedListener&& listener);

  static std::shared_ptr<QueryListener> Create(
      Query query, ViewSnapshotSharedListener&& listener);

  static std::shared_ptr<QueryListener> Create(
      Query query,
      ListenOptions options,
      util::StatusOrCallback<ViewSnapshot>&& listener);

  static std::shared_ptr<QueryListener> Create(
      Query query, util::StatusOrCallback<ViewSnapshot>&& listener);

  QueryListener(Query query,
                ListenOptions options,
                ViewSnapshotSharedListener&& listener);

  virtual ~QueryListener() = default;

  const Query& query() const {
    return query_;
  }

  /** The last received view snapshot. */
  const absl::optional<ViewSnapshot>& snapshot() const {
    return snapshot_;
  }

  /**
   * Applies the new ViewSnapshot to this listener, raising a user-facing event
   * if applicable (depending on what changed, whether the user has opted into
   * metadata-only changes, etc.). Returns true if a user-facing event was
   * indeed raised.
   */
  virtual bool OnViewSnapshot(ViewSnapshot snapshot);

  virtual void OnError(util::Status error);

  /** Returns whether a snapshot was raised. */
  virtual bool OnOnlineStateChanged(model::OnlineState online_state);

 private:
  bool ShouldRaiseInitialEvent(const ViewSnapshot& snapshot,
                               model::OnlineState online_state) const;
  bool ShouldRaiseEvent(const ViewSnapshot& snapshot) const;
  void RaiseInitialEvent(const ViewSnapshot& snapshot);

  Query query_;
  ListenOptions options_;

  /**
   * The EventListener that will process ViewSnapshots associated with this
   * query listener.
   */
  ViewSnapshotSharedListener listener_;

  /**
   * Initial snapshots (e.g. from cache) may not be propagated to the
   * ViewSnapshotHandler. This flag is set to true once we've actually raised an
   * event.
   */
  bool raised_initial_event_ = false;

  /** The last online state this query listener got. */
  model::OnlineState online_state_ = model::OnlineState::Unknown;

  absl::optional<ViewSnapshot> snapshot_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_QUERY_LISTENER_H_
