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

#ifndef FIRESTORE_CORE_SRC_REMOTE_REMOTE_EVENT_H_
#define FIRESTORE_CORE_SRC_REMOTE_REMOTE_EVENT_H_

#include <set>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/remote/watch_change.h"

namespace firebase {
namespace firestore {

namespace local {
class TargetData;
}  // namespace local

namespace remote {

/**
 * Interface implemented by `RemoteStore` to expose target metadata to the
 * `WatchChangeAggregator`.
 */
class TargetMetadataProvider {
 public:
  virtual ~TargetMetadataProvider() = default;

  /**
   * Returns the set of remote document keys for the given target ID as of the
   * last raised snapshot.
   */
  virtual model::DocumentKeySet GetRemoteKeysForTarget(
      model::TargetId target_id) const = 0;

  /**
   * Returns the TargetData for an active target ID or `nullopt` if this query
   * has become inactive.
   */
  virtual absl::optional<local::TargetData> GetTargetDataForTarget(
      model::TargetId target_id) const = 0;
};

/**
 * A `TargetChange` specifies the set of changes for a specific target as part
 * of an `RemoteEvent`. These changes track which documents are added,
 * modified or removed, as well as the target's resume token and whether the
 * target is marked CURRENT.
 *
 * The actual changes *to* documents are not part of the `TargetChange` since
 * documents may be part of multiple targets.
 */
class TargetChange {
 public:
  static TargetChange CreateSynthesizedTargetChange(bool current) {
    return TargetChange(current);
  }

  TargetChange() = default;

  TargetChange(nanopb::ByteString resume_token,
               bool current,
               model::DocumentKeySet added_documents,
               model::DocumentKeySet modified_documents,
               model::DocumentKeySet removed_documents)
      : resume_token_{std::move(resume_token)},
        current_{current},
        added_documents_{std::move(added_documents)},
        modified_documents_{std::move(modified_documents)},
        removed_documents_{std::move(removed_documents)} {
  }

  /**
   * An opaque, server-assigned token that allows watching a target to be
   * resumed after disconnecting without retransmitting all the data that
   * matches the target. The resume token essentially identifies a point in time
   * from which the server should resume sending results.
   */
  const nanopb::ByteString& resume_token() const {
    return resume_token_;
  }

  /**
   * The "current" (synced) status of this target. Note that "current" has
   * special meaning in the RPC protocol that implies that a target is both
   * up-to-date and consistent with the rest of the watch stream.
   */
  bool current() const {
    return current_;
  }

  /**
   * The set of documents that were newly assigned to this target as part of
   * this remote event.
   */
  const model::DocumentKeySet& added_documents() const {
    return added_documents_;
  }

  /**
   * The set of documents that were already assigned to this target but received
   * an update during this remote event.
   */
  const model::DocumentKeySet& modified_documents() const {
    return modified_documents_;
  }

  /**
   * The set of documents that were removed from this target as part of this
   * remote event.
   */
  const model::DocumentKeySet& removed_documents() const {
    return removed_documents_;
  }

 private:
  explicit TargetChange(bool current) : current_{current} {
  }

  nanopb::ByteString resume_token_;
  bool current_ = false;
  model::DocumentKeySet added_documents_;
  model::DocumentKeySet modified_documents_;
  model::DocumentKeySet removed_documents_;
};

bool operator==(const TargetChange& lhs, const TargetChange& rhs);

/** Tracks the internal state of a Watch target. */
class TargetState {
 public:
  /**
   * Whether this target has been marked 'current'.
   *
   * 'current' has special meaning in the RPC protocol: It implies that the
   * Watch backend has sent us all changes up to the point at which the target
   * was added and that the target is consistent with the rest of the watch
   * stream.
   */
  bool current() const {
    return current_;
  }

  /** The last resume token sent to us for this target. */
  const nanopb::ByteString& resume_token() const {
    return resume_token_;
  }

  /** Whether this target has pending target adds or target removes. */
  bool IsPending() const {
    return outstanding_responses_ != 0;
  }

  /** Whether we have modified any state that should trigger a snapshot. */
  bool HasPendingChanges() const {
    return has_pending_changes_;
  }

  /**
   * Applies the resume token to the `TargetChange`, but only when it has a new
   * value. Empty resume tokens are discarded.
   */
  void UpdateResumeToken(nanopb::ByteString resume_token);

  /**
   * Creates a target change from the current set of changes.
   *
   * To reset the document changes after raising this snapshot, call
   * `ClearPendingChanges()`.
   */
  TargetChange ToTargetChange() const;

  /** Resets the document changes and sets `HasPendingChanges` to false. */
  void ClearPendingChanges();

  void AddDocumentChange(const model::DocumentKey& document_key,
                         core::DocumentViewChange::Type type);
  void RemoveDocumentChange(const model::DocumentKey& document_key);
  void RecordPendingTargetRequest();
  void RecordTargetResponse();
  void MarkCurrent();

 private:
  /**
   * The number of outstanding responses (adds or removes) that we are waiting
   * on. We only consider targets active that have no outstanding responses.
   */
  int outstanding_responses_ = 0;

  /**
   * Keeps track of the document changes since the last raised snapshot.
   *
   * These changes are continuously updated as we receive document updates and
   * always reflect the current set of changes against the last issued snapshot.
   */
  std::unordered_map<model::DocumentKey,
                     core::DocumentViewChange::Type,
                     model::DocumentKeyHash>
      document_changes_;

  nanopb::ByteString resume_token_;

  bool current_ = false;

  /**
   * Whether this target state should be included in the next snapshot. We
   * initialize to true so that newly-added targets are included in the next
   * RemoteEvent.
   */
  bool has_pending_changes_ = true;
};

/**
 * An event from the RemoteStore. It is split into `TargetChanges` (changes to
 * the state or the set of documents in our watched targets) and
 * `DocumentUpdates` (changes to the actual documents).
 */
class RemoteEvent {
 public:
  using TargetChangeMap = std::unordered_map<model::TargetId, TargetChange>;
  using TargetSet = std::unordered_set<model::TargetId>;

  RemoteEvent(model::SnapshotVersion snapshot_version,
              TargetChangeMap target_changes,
              TargetSet target_mismatches,
              model::DocumentUpdateMap document_updates,
              model::DocumentKeySet limbo_document_changes)
      : snapshot_version_{snapshot_version},
        target_changes_{std::move(target_changes)},
        target_mismatches_{std::move(target_mismatches)},
        document_updates_{std::move(document_updates)},
        limbo_document_changes_{std::move(limbo_document_changes)} {
  }

  /** The snapshot version this event brings us up to. */
  const model::SnapshotVersion& snapshot_version() const {
    return snapshot_version_;
  }

  /** A map from target to changes to the target. See `TargetChange`. */
  const TargetChangeMap& target_changes() const {
    return target_changes_;
  }

  /**
   * A set of targets that is known to be inconsistent. Listens for these
   * targets should be re-established without resume tokens.
   */
  const TargetSet& target_mismatches() const {
    return target_mismatches_;
  }

  /**
   * A set of which documents have changed or been deleted, along with the doc's
   * new values (if not deleted).
   */
  const model::DocumentUpdateMap& document_updates() const {
    return document_updates_;
  }

  /**
   * A set of which document updates are due only to limbo resolution targets.
   */
  const model::DocumentKeySet& limbo_document_changes() const {
    return limbo_document_changes_;
  }

 private:
  model::SnapshotVersion snapshot_version_;
  TargetChangeMap target_changes_;
  TargetSet target_mismatches_;
  model::DocumentUpdateMap document_updates_;
  model::DocumentKeySet limbo_document_changes_;
};

/**
 * A helper class to accumulate watch changes into a `RemoteEvent` and other
 * target information.
 */
class WatchChangeAggregator {
 public:
  explicit WatchChangeAggregator(
      TargetMetadataProvider* target_metadata_provider);

  /**
   * Processes and adds the `DocumentWatchChange` to the current set of changes.
   */
  void HandleDocumentChange(const DocumentWatchChange& document_change);

  /**
   * Processes and adds the `WatchTargetChange` to the current set of changes.
   */
  void HandleTargetChange(const WatchTargetChange& target_change);

  /**
   * Handles existence filters and synthesizes deletes for filter mismatches.
   * Targets that are invalidated by filter mismatches are added to
   * `pending_target_resets_`.
   */
  void HandleExistenceFilter(
      const ExistenceFilterWatchChange& existence_filter);

  /**
   * Converts the current state into a remote event with the snapshot version
   * taken from the initializer. Resets the accumulated changes before
   * returning.
   */
  RemoteEvent CreateRemoteEvent(const model::SnapshotVersion& snapshot_version);

  /** Removes the in-memory state for the provided target. */
  void RemoveTarget(model::TargetId target_id);

  /**
   * Increment the number of acks needed from watch before we can consider the
   * server to be 'in-sync' with the client's active targets.
   */
  void RecordPendingTargetRequest(model::TargetId target_id);

 private:
  /**
   * Returns all `TargetId`s that the watch change applies to: either the
   * `TargetId`s explicitly listed in the change or the `TargetId`s of all
   * currently active targets.
   */
  std::vector<model::TargetId> GetTargetIds(
      const WatchTargetChange& target_change) const;

  /**
   * Adds the provided document to the internal list of document updates and its
   * document key to the given target's mapping.
   */
  void AddDocumentToTarget(model::TargetId target_id,
                           const model::MutableDocument& document);

  /**
   * Removes the provided document from the target mapping. If the document no
   * longer matches the target, but the document's state is still known (e.g. we
   * know that the document was deleted or we received the change that caused
   * the filter mismatch), the new document can be provided to update the remote
   * document cache.
   */
  void RemoveDocumentFromTarget(
      model::TargetId target_id,
      const model::DocumentKey& key,
      const absl::optional<model::MutableDocument>& updated_document);

  /**
   * Returns the current count of documents in the target. This includes both
   * the number of documents that the LocalStore considers to be part of the
   * target as well as any accumulated changes.
   */
  int GetCurrentDocumentCountForTarget(model::TargetId target_id);

  // PORTING NOTE: this method exists only for consistency with other platforms;
  // in C++, it's pretty much unnecessary.
  TargetState& EnsureTargetState(model::TargetId target_id);

  /**
   * Returns true if the given `target_id` is active. Active targets are those
   * for which there are no pending requests to add a listen and are in the
   * current list of targets the client cares about.
   *
   * Clients can repeatedly listen and stop listening to targets, so this check
   * is useful in preventing race conditions for a target where events arrive
   * but the server hasn't yet acknowledged the intended change in state.
   */
  bool IsActiveTarget(model::TargetId target_id) const;

  /**
   * Returns the `TargetData` for an active target (i.e., a target that the user
   * is still interested in that has no outstanding target change requests).
   */
  absl::optional<local::TargetData> TargetDataForActiveTarget(
      model::TargetId target_id) const;

  /**
   * Resets the state of a Watch target to its initial state (e.g. sets
   * 'current' to false, clears the resume token and removes its target mapping
   * from all documents).
   */
  void ResetTarget(model::TargetId target_id);

  /** Returns whether the local store considers the document to be part of the
   * specified target. */
  bool TargetContainsDocument(model::TargetId target_id,
                              const model::DocumentKey& key);

  /** The internal state of all tracked targets. */
  std::unordered_map<model::TargetId, TargetState> target_states_;

  /** Keeps track of the documents to update since the last raised snapshot. */
  model::DocumentUpdateMap pending_document_updates_;

  /** A mapping of document keys to their set of target IDs. */
  std::unordered_map<model::DocumentKey,
                     std::set<model::TargetId>,
                     model::DocumentKeyHash>
      pending_document_target_mappings_;

  /**
   * A list of targets with existence filter mismatches. These targets are known
   * to be inconsistent and their listens needs to be re-established by
   * `RemoteStore`.
   */
  RemoteEvent::TargetSet pending_target_resets_;

  TargetMetadataProvider* target_metadata_provider_ = nullptr;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_REMOTE_EVENT_H_
