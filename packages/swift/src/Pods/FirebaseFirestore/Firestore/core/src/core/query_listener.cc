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

#include "Firestore/core/src/core/query_listener.h"

#include <utility>
#include <vector>

#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace core {

using model::OnlineState;
using model::TargetId;
using util::Status;

std::shared_ptr<QueryListener> QueryListener::Create(
    Query query, ListenOptions options, ViewSnapshotSharedListener&& listener) {
  return std::make_shared<QueryListener>(std::move(query), std::move(options),
                                         std::move(listener));
}

std::shared_ptr<QueryListener> QueryListener::Create(
    Query query, ViewSnapshotSharedListener&& listener) {
  return Create(std::move(query), ListenOptions::DefaultOptions(),
                std::move(listener));
}

std::shared_ptr<QueryListener> QueryListener::Create(
    Query query,
    ListenOptions options,
    util::StatusOrCallback<ViewSnapshot>&& listener) {
  auto event_listener =
      EventListener<ViewSnapshot>::Create(std::move(listener));
  return Create(std::move(query), std::move(options),
                std::move(event_listener));
}

std::shared_ptr<QueryListener> QueryListener::Create(
    Query query, util::StatusOrCallback<ViewSnapshot>&& listener) {
  return Create(std::move(query), ListenOptions::DefaultOptions(),
                std::move(listener));
}

QueryListener::QueryListener(Query query,
                             ListenOptions options,
                             ViewSnapshotSharedListener&& listener)
    : query_(std::move(query)),
      options_(std::move(options)),
      listener_(std::move(listener)) {
}

bool QueryListener::OnViewSnapshot(ViewSnapshot snapshot) {
  HARD_ASSERT(
      !snapshot.document_changes().empty() || snapshot.sync_state_changed(),
      "We got a new snapshot with no changes?");
  bool raised_event = false;
  if (!options_.include_document_metadata_changes()) {
    // Remove the metadata-only changes.
    std::vector<DocumentViewChange> changes;
    for (const DocumentViewChange& change : snapshot.document_changes()) {
      if (change.type() != DocumentViewChange::Type::Metadata) {
        changes.push_back(change);
      }
    }

    snapshot = ViewSnapshot{snapshot.query(),
                            snapshot.documents(),
                            snapshot.old_documents(),
                            std::move(changes),
                            snapshot.mutated_keys(),
                            snapshot.from_cache(),
                            snapshot.sync_state_changed(),
                            /*excludes_metadata_changes=*/true};
  }

  if (!raised_initial_event_) {
    if (ShouldRaiseInitialEvent(snapshot, online_state_)) {
      RaiseInitialEvent(snapshot);
      raised_event = true;
    }
  } else if (ShouldRaiseEvent(snapshot)) {
    listener_->OnEvent(snapshot);
    raised_event = true;
  }

  snapshot_ = std::move(snapshot);
  return raised_event;
}

void QueryListener::OnError(Status error) {
  listener_->OnEvent(std::move(error));
}

/**
 * Returns whether a snaphsot was raised.
 */
bool QueryListener::OnOnlineStateChanged(OnlineState online_state) {
  online_state_ = online_state;
  bool raised_event = false;
  if (snapshot_.has_value() && !raised_initial_event_ &&
      ShouldRaiseInitialEvent(snapshot_.value(), online_state)) {
    RaiseInitialEvent(snapshot_.value());
    raised_event = true;
  }
  return raised_event;
}

bool QueryListener::ShouldRaiseInitialEvent(const ViewSnapshot& snapshot,
                                            OnlineState online_state) const {
  HARD_ASSERT(!raised_initial_event_,
              "Determining whether to raise initial event, but already had "
              "first event.");

  // Always raise the first event when we're synced
  if (!snapshot.from_cache()) {
    return true;
  }

  // NOTE: We consider OnlineState::Unknown as online (it should become Offline
  // or Online if we wait long enough).
  bool maybe_online = online_state != OnlineState::Offline;

  // Don't raise the event if we're online, aren't synced yet (checked
  // above) and are waiting for a sync.
  if (options_.wait_for_sync_when_online() && maybe_online) {
    HARD_ASSERT(snapshot.from_cache(),
                "Waiting for sync, but snapshot is not from cache.");
    return false;
  }

  // Raise data from cache if we have any documents or we are offline
  return !snapshot.documents().empty() || online_state == OnlineState::Offline;
}

bool QueryListener::ShouldRaiseEvent(const ViewSnapshot& snapshot) const {
  // We don't need to handle include_document_metadata_changes() here because
  // the Metadata only changes have already been stripped out if needed. At this
  // point the only changes we will see are the ones we should propagate.
  if (!snapshot.document_changes().empty()) {
    return true;
  }

  bool has_pending_writes_changed =
      snapshot_.has_value() &&
      snapshot_.value().has_pending_writes() != snapshot.has_pending_writes();
  if (snapshot.sync_state_changed() || has_pending_writes_changed) {
    return options_.include_query_metadata_changes();
  }

  // Generally we should have hit one of the cases above, but it's possible to
  // get here if there were only metadata document changes and they got stripped
  // out.
  return false;
}

void QueryListener::RaiseInitialEvent(const ViewSnapshot& snapshot) {
  HARD_ASSERT(!raised_initial_event_,
              "Trying to raise initial events for second time");

  ViewSnapshot modified_snapshot = ViewSnapshot::FromInitialDocuments(
      snapshot.query(), snapshot.documents(), snapshot.mutated_keys(),
      snapshot.from_cache(), snapshot.excludes_metadata_changes());
  raised_initial_event_ = true;
  listener_->OnEvent(std::move(modified_snapshot));
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
