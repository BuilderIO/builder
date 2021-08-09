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

#ifndef FIRESTORE_CORE_SRC_CORE_VIEW_H_
#define FIRESTORE_CORE_SRC_CORE_VIEW_H_

#include <utility>
#include <vector>

#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/remote/remote_event.h"

namespace firebase {
namespace firestore {
namespace core {

/** A change to a particular document wrt whether it is in "limbo". */
class LimboDocumentChange {
 public:
  enum class Type {
    Added,
    Removed,
  };

  static LimboDocumentChange Added(model::DocumentKey key) {
    return {Type::Added, std::move(key)};
  }

  static LimboDocumentChange Removed(model::DocumentKey key) {
    return {Type::Removed, std::move(key)};
  }

  LimboDocumentChange(Type type, model::DocumentKey key);

  Type type() const {
    return type_;
  }

  const model::DocumentKey& key() const {
    return key_;
  }

  friend bool operator==(const LimboDocumentChange& lhs,
                         const LimboDocumentChange& rhs);

 private:
  Type type_;
  model::DocumentKey key_;
};

/** The result of applying a set of doc changes to a view. */
class ViewDocumentChanges {
 public:
  ViewDocumentChanges(model::DocumentSet new_documents,
                      DocumentViewChangeSet changes,
                      model::DocumentKeySet mutated_keys,
                      bool needs_refill);

  /** The new set of docs that should be in the view. */
  const model::DocumentSet& document_set() const {
    return document_set_;
  }

  /** The diff of these docs with the previous set of docs. */
  const core::DocumentViewChangeSet& change_set() const {
    return change_set_;
  }

  const model::DocumentKeySet& mutated_keys() const {
    return mutated_keys_;
  }

  /**
   * Whether the set of documents passed in was not sufficient to calculate the
   * new state of the view and there needs to be another pass based on the local
   * cache.
   */
  bool needs_refill() const {
    return needs_refill_;
  }

 private:
  model::DocumentSet document_set_;
  core::DocumentViewChangeSet change_set_;
  model::DocumentKeySet mutated_keys_;
  bool needs_refill_ = false;
};

/** A set of changes to a view. */
class ViewChange {
 public:
  ViewChange(absl::optional<ViewSnapshot> snapshot,
             std::vector<LimboDocumentChange> limbo_changes)
      : snapshot_(std::move(snapshot)),
        limbo_changes_(std::move(limbo_changes)) {
  }

  const absl::optional<ViewSnapshot> snapshot() const& {
    return snapshot_;
  }

  absl::optional<ViewSnapshot>&& snapshot() && {
    return std::move(snapshot_);
  }

  const std::vector<LimboDocumentChange> limbo_changes() const {
    return limbo_changes_;
  }

 private:
  absl::optional<ViewSnapshot> snapshot_;
  std::vector<LimboDocumentChange> limbo_changes_;
};

/**
 * View is responsible for computing the final merged truth of what docs are in
 * a query. It gets notified of local and remote changes to docs, and applies
 * the query filters and limits to determine the most correct possible results.
 */
class View {
 public:
  View(Query query, model::DocumentKeySet remote_documents);

  /**
   * The set of remote documents that the server has told us belongs to the
   * target associated with this view.
   */
  const model::DocumentKeySet& synced_documents() const {
    return synced_documents_;
  }

  /**
   * Iterates over a set of doc changes, applies the query limit, and computes
   * what the new results should be, what the changes were, and whether we may
   * need to go back to the local cache for more results. Does not make any
   * changes to the view.
   *
   * @param doc_changes The doc changes to apply to this view.
   * @param previous_changes If this is being called with a refill, then start
   *     with this set of docs and changes instead of the current view.
   * @return a new set of docs, changes, and refill flag.
   */
  core::ViewDocumentChanges ComputeDocumentChanges(
      const model::DocumentMap& doc_changes,
      const absl::optional<core::ViewDocumentChanges>& previous_changes =
          absl::nullopt) const;

  /**
   * Updates the view with the given ViewDocumentChanges.
   *
   * @param doc_changes The set of changes to make to the view's docs.
   * @return A new ViewChange with the given docs, changes, and sync state.
   */
  ViewChange ApplyChanges(const core::ViewDocumentChanges& doc_changes);

  /**
   * Updates the view with the given ViewDocumentChanges and updates limbo docs
   * and sync state from the given (optional) target change.
   *
   * @param doc_changes The set of changes to make to the view's docs.
   * @param target_change A target change to apply for computing limbo docs and
   *     sync state.
   * @return A new ViewChange with the given docs, changes, and sync state.
   */
  ViewChange ApplyChanges(
      const core::ViewDocumentChanges& doc_changes,
      const absl::optional<remote::TargetChange>& target_change);

  /**
   * Applies an OnlineState change to the view, potentially generating an
   * ViewChange if the view's sync_state_ changes as a result.
   */
  core::ViewChange ApplyOnlineStateChange(model::OnlineState online_state);

  core::SyncState sync_state() const {
    return sync_state_;
  }

 private:
  util::ComparisonResult Compare(const model::Document& lhs,
                                 const model::Document& rhs) const;

  bool ShouldBeInLimbo(const model::DocumentKey& key) const;

  bool ShouldWaitForSyncedDocument(const model::Document& new_doc,
                                   const model::Document& old_doc) const;

  void ApplyTargetChange(
      const absl::optional<remote::TargetChange>& maybe_target_change);

  std::vector<LimboDocumentChange> UpdateLimboDocuments();

  Query query_;

  model::DocumentSet document_set_;

  /** Documents included in the remote target. */
  model::DocumentKeySet synced_documents_;

  /** Documents in the view but not in the remote target */
  model::DocumentKeySet limbo_documents_;

  /** Document Keys that have local changes. */
  model::DocumentKeySet mutated_keys_;

  SyncState sync_state_ = SyncState::None;

  /**
   * A flag whether the view is current with the backend. A view is considered
   * current after it has seen the current flag from the backend and did not
   * lose consistency within the watch stream (e.g. because of an existence
   * filter mismatch).
   */
  bool current_ = false;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_VIEW_H_
