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

#ifndef FIRESTORE_CORE_SRC_API_QUERY_SNAPSHOT_H_
#define FIRESTORE_CORE_SRC_API_QUERY_SNAPSHOT_H_

#include <functional>
#include <memory>
#include <utility>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/api/snapshot_metadata.h"
#include "Firestore/core/src/core/event_listener.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/view_snapshot.h"

namespace firebase {
namespace firestore {
namespace api {

/**
 * A `QuerySnapshot` contains zero or more `DocumentSnapshot` objects.
 */
class QuerySnapshot {
 public:
  QuerySnapshot(std::shared_ptr<Firestore> firestore,
                core::Query query,
                core::ViewSnapshot&& snapshot,
                SnapshotMetadata metadata);

  size_t Hash() const;

  /**
   * Indicates whether this `QuerySnapshot` is empty (contains no documents).
   */
  bool empty() const {
    return snapshot_.documents().empty();
  }

  /** The count of documents in this `QuerySnapshot`. */
  size_t size() const {
    return snapshot_.documents().size();
  }

  const std::shared_ptr<Firestore>& firestore() const {
    return firestore_;
  }

  Query query() const;

  const core::Query& internal_query() const;

  /**
   * Metadata about this snapshot, concerning its source and if it has local
   * modifications.
   */
  const SnapshotMetadata& metadata() const {
    return metadata_;
  }

  /** Iterates over the `DocumentSnapshots` that make up this query snapshot. */
  void ForEachDocument(
      const std::function<void(DocumentSnapshot)>& callback) const;

  /**
   * Iterates over the `DocumentChanges` representing the changes between
   * the prior snapshot and this one.
   */
  void ForEachChange(bool include_metadata_changes,
                     const std::function<void(DocumentChange)>& callback) const;

  friend bool operator==(const QuerySnapshot& lhs, const QuerySnapshot& rhs);

 private:
  std::shared_ptr<Firestore> firestore_;
  core::Query internal_query_;
  core::ViewSnapshot snapshot_;
  SnapshotMetadata metadata_;
};

using QuerySnapshotListener =
    std::unique_ptr<core::EventListener<QuerySnapshot>>;

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_QUERY_SNAPSHOT_H_
