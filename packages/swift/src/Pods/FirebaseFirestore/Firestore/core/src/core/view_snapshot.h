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

#ifndef FIRESTORE_CORE_SRC_CORE_VIEW_SNAPSHOT_H_
#define FIRESTORE_CORE_SRC_CORE_VIEW_SNAPSHOT_H_

#include <functional>
#include <iosfwd>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/core/event_listener.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/immutable/sorted_map.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/util/statusor.h"

namespace firebase {
namespace firestore {
namespace core {

/** A change to a single document's state within a view. */
class DocumentViewChange {
 public:
  /**
   * The types of changes that can happen to a document with respect to a view.
   * NOTE: We sort document changes by their type, so the ordering of this enum
   * is significant.
   */
  enum class Type { Removed = 0, Added, Modified, Metadata };

  DocumentViewChange() = default;

  DocumentViewChange(model::Document document, Type type);

  const model::Document& document() const;
  DocumentViewChange::Type type() const {
    return type_;
  }

  std::string ToString() const;
  size_t Hash() const;

 private:
  model::Document document_;
  Type type_{};
};

bool operator==(const DocumentViewChange& lhs, const DocumentViewChange& rhs);

/**
 * The possible states a document can be in w.r.t syncing from local storage to
 * the backend.
 */
enum class SyncState { None = 0, Local, Synced };

/**
 * A set of changes to docs in a query, merging duplicate events for the same
 * doc.
 */
class DocumentViewChangeSet {
 public:
  /** Takes a new change and applies it to the set. */
  void AddChange(DocumentViewChange&& change);

  /** Returns the set of all changes tracked in this set. */
  std::vector<DocumentViewChange> GetChanges() const;

  std::string ToString() const;

 private:
  /** The set of all changes tracked so far, with redundant changes merged. */
  immutable::SortedMap<model::DocumentKey, DocumentViewChange> change_map_;
};

/**
 * A view snapshot is an immutable capture of the results of a query and the
 * changes to them.
 */
class ViewSnapshot {
 public:
  ViewSnapshot(Query query,
               model::DocumentSet documents,
               model::DocumentSet old_documents,
               std::vector<DocumentViewChange> document_changes,
               model::DocumentKeySet mutated_keys,
               bool from_cache,
               bool sync_state_changed,
               bool excludes_metadata_changes);

  /**
   * Returns a view snapshot as if all documents in the snapshot were
   * added.
   */
  static ViewSnapshot FromInitialDocuments(Query query,
                                           model::DocumentSet documents,
                                           model::DocumentKeySet mutated_keys,
                                           bool from_cache,
                                           bool excludes_metadata_changes);

  /** The query this view is tracking the results for. */
  const Query& query() const;

  /** The documents currently known to be results of the query. */
  const model::DocumentSet& documents() const {
    return documents_;
  }

  /** The documents of the last snapshot. */
  const model::DocumentSet& old_documents() const {
    return old_documents_;
  }

  /** The set of changes that have been applied to the documents. */
  const std::vector<DocumentViewChange>& document_changes() const {
    return document_changes_;
  }

  /** Whether any document in the snapshot was served from the local cache. */
  bool from_cache() const {
    return from_cache_;
  }

  /** Whether any document in the snapshot has pending local writes. */
  bool has_pending_writes() const {
    return !mutated_keys_.empty();
  }

  /** Whether the sync state changed as part of this snapshot. */
  bool sync_state_changed() const {
    return sync_state_changed_;
  }

  /** Whether this snapshot has been filtered to not include metadata changes */
  bool excludes_metadata_changes() const {
    return excludes_metadata_changes_;
  }

  /** The document in this snapshot that have unconfirmed writes. */
  model::DocumentKeySet mutated_keys() const {
    return mutated_keys_;
  }

  std::string ToString() const;
  friend std::ostream& operator<<(std::ostream& out, const ViewSnapshot& value);
  size_t Hash() const;

 private:
  Query query_;

  model::DocumentSet documents_;
  model::DocumentSet old_documents_;
  std::vector<DocumentViewChange> document_changes_;
  model::DocumentKeySet mutated_keys_;

  bool from_cache_ = false;
  bool sync_state_changed_ = false;
  bool excludes_metadata_changes_ = false;
};

using ViewSnapshotListener = std::unique_ptr<EventListener<ViewSnapshot>>;
using ViewSnapshotSharedListener = std::shared_ptr<EventListener<ViewSnapshot>>;

bool operator==(const ViewSnapshot& lhs, const ViewSnapshot& rhs);

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_VIEW_SNAPSHOT_H_
