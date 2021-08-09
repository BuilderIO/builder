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

#include "Firestore/core/src/core/view.h"

#include <utility>

#include "Firestore/core/src/core/target.h"
#include "Firestore/core/src/model/document_set.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::DocumentKey;
using model::DocumentKeySet;
using model::DocumentMap;
using model::DocumentSet;
using model::OnlineState;
using remote::TargetChange;
using util::ComparisonResult;

// MARK: - LimboDocumentChange

LimboDocumentChange::LimboDocumentChange(
    firebase::firestore::core::LimboDocumentChange::Type type,
    firebase::firestore::model::DocumentKey key)
    : type_(type), key_(std::move(key)) {
}

bool operator==(const LimboDocumentChange& lhs,
                const LimboDocumentChange& rhs) {
  return lhs.type() == rhs.type() && lhs.key() == rhs.key();
}

// MARK: - ViewDocumentChanges

ViewDocumentChanges::ViewDocumentChanges(model::DocumentSet new_documents,
                                         DocumentViewChangeSet changes,
                                         model::DocumentKeySet mutated_keys,
                                         bool needs_refill)
    : document_set_(std::move(new_documents)),
      change_set_(std::move(changes)),
      mutated_keys_(std::move(mutated_keys)),
      needs_refill_(needs_refill) {
}

// MARK: - View

namespace {

int GetDocumentViewChangeTypePosition(DocumentViewChange::Type change_type) {
  switch (change_type) {
    case DocumentViewChange::Type::Removed:
      return 0;
    case DocumentViewChange::Type::Added:
      return 1;
    case DocumentViewChange::Type::Modified:
      return 2;
    case DocumentViewChange::Type::Metadata:
      // A metadata change is converted to a modified change at the public API
      // layer. Since we sort by document key and then change type, metadata and
      // modified changes must be sorted equivalently.
      return 2;
  }
  HARD_FAIL("Unknown DocumentViewChange::Type %s", change_type);
}

}  // namespace

View::View(Query query, DocumentKeySet remote_documents)
    : query_(std::move(query)),
      document_set_(query_.Comparator()),
      synced_documents_(std::move(remote_documents)) {
}

ComparisonResult View::Compare(const Document& lhs, const Document& rhs) const {
  return document_set_.comparator().Compare(lhs, rhs);
}

ViewDocumentChanges View::ComputeDocumentChanges(
    const DocumentMap& doc_changes,
    const absl::optional<ViewDocumentChanges>& previous_changes) const {
  DocumentViewChangeSet change_set;
  if (previous_changes) {
    change_set = previous_changes->change_set();
  }
  DocumentSet old_document_set =
      previous_changes ? previous_changes->document_set() : document_set_;

  DocumentKeySet new_mutated_keys =
      previous_changes ? previous_changes->mutated_keys() : mutated_keys_;
  DocumentKeySet old_mutated_keys = mutated_keys_;
  DocumentSet new_document_set = old_document_set;
  bool needs_refill = false;

  // Track the last doc in a (full) limit. This is necessary, because some
  // update (a delete, or an update moving a doc past the old limit) might mean
  // there is some other document in the local cache that either should come (1)
  // between the old last limit doc and the new last document, in the case of
  // updates, or (2) after the new last document, in the case of deletes. So we
  // keep this doc at the old limit to compare the updates to.
  //
  // Note that this should never get used in a refill (when previous_changes is
  // set), because there will only be adds -- no deletes or updates.
  absl::optional<Document> last_doc_in_limit;
  if (query_.has_limit_to_first() &&
      old_document_set.size() == static_cast<size_t>(query_.limit())) {
    last_doc_in_limit = old_document_set.GetLastDocument();
  }
  absl::optional<Document> first_doc_in_limit;
  if (query_.has_limit_to_last() &&
      old_document_set.size() == static_cast<size_t>(query_.limit())) {
    first_doc_in_limit = old_document_set.GetFirstDocument();
  }

  for (const auto& kv : doc_changes) {
    const DocumentKey& key = kv.first;

    absl::optional<Document> old_doc = old_document_set.GetDocument(key);
    absl::optional<Document> new_doc = query_.Matches(kv.second)
                                           ? absl::optional<Document>{kv.second}
                                           : absl::nullopt;

    bool old_doc_had_pending_mutations =
        old_doc && old_mutated_keys.contains(key);

    // We only consider committed mutations for documents that were mutated
    // during the lifetime of the view.
    bool new_doc_has_pending_mutations =
        new_doc && ((*new_doc)->has_local_mutations() ||
                    (old_mutated_keys.contains(key) &&
                     (*new_doc)->has_committed_mutations()));

    bool change_applied = false;
    // Calculate change
    if (old_doc && new_doc) {
      bool docs_equal = (*old_doc)->value() == (*new_doc)->value();
      if (!docs_equal) {
        if (!ShouldWaitForSyncedDocument(*new_doc, *old_doc)) {
          change_set.AddChange(
              DocumentViewChange{*new_doc, DocumentViewChange::Type::Modified});
          change_applied = true;

          bool outside_limit =
              last_doc_in_limit &&
              util::Descending(Compare(*new_doc, *last_doc_in_limit));
          bool outside_limit_to_last =
              first_doc_in_limit &&
              util::Ascending(Compare(*new_doc, *first_doc_in_limit));
          if (outside_limit || outside_limit_to_last) {
            // This doc moved from inside the limit to after the limit. That
            // means there may be some doc in the local cache that's actually
            // less than this one.
            needs_refill = true;
          }
        }
      } else if (old_doc_had_pending_mutations !=
                 new_doc_has_pending_mutations) {
        change_set.AddChange(
            DocumentViewChange{*new_doc, DocumentViewChange::Type::Metadata});
        change_applied = true;
      }

    } else if (!old_doc && new_doc) {
      change_set.AddChange(
          DocumentViewChange{*new_doc, DocumentViewChange::Type::Added});
      change_applied = true;
    } else if (old_doc && !new_doc) {
      change_set.AddChange(
          DocumentViewChange{*old_doc, DocumentViewChange::Type::Removed});
      change_applied = true;

      if (last_doc_in_limit || first_doc_in_limit) {
        // A doc was removed from a full limit query. We'll need to re-query
        // from the local cache to see if we know about some other doc that
        // should be in the results.
        needs_refill = true;
      }
    }

    if (change_applied) {
      if (new_doc) {
        new_document_set = new_document_set.insert(new_doc);
        if ((*new_doc)->has_local_mutations()) {
          new_mutated_keys = new_mutated_keys.insert(key);
        } else {
          new_mutated_keys = new_mutated_keys.erase(key);
        }
      } else {
        new_document_set = new_document_set.erase(key);
        new_mutated_keys = new_mutated_keys.erase(key);
      }
    }
  }

  // Drop documents out to meet limitToFirst/limitToLast requirement.
  if (query_.limit_type() != LimitType::None) {
    auto limit = static_cast<size_t>(query_.limit());
    if (limit < new_document_set.size()) {
      for (size_t i = new_document_set.size() - limit; i > 0; --i) {
        absl::optional<Document> found =
            query_.has_limit_to_first() ? new_document_set.GetLastDocument()
                                        : new_document_set.GetFirstDocument();
        const Document& old_doc = *found;
        new_document_set = new_document_set.erase(old_doc->key());
        new_mutated_keys = new_mutated_keys.erase(old_doc->key());
        change_set.AddChange(
            DocumentViewChange{old_doc, DocumentViewChange::Type::Removed});
      }
    }
  }

  HARD_ASSERT(!needs_refill || !previous_changes,
              "View was refilled using docs that themselves needed refilling.");

  return ViewDocumentChanges(std::move(new_document_set), std::move(change_set),
                             new_mutated_keys, needs_refill);
}

bool View::ShouldWaitForSyncedDocument(const Document& new_doc,
                                       const Document& old_doc) const {
  // We suppress the initial change event for documents that were modified as
  // part of a write acknowledgment (e.g. when the value of a server transform
  // is applied) as Watch will send us the same document again. By suppressing
  // the event, we only raise two user visible events (one with
  // `has_pending_writes` and the final state of the document) instead of three
  // (one with `has_pending_writes`, the modified document with
  // `has_pending_writes` and the final state of the document).
  return (old_doc->has_local_mutations() &&
          new_doc->has_committed_mutations() &&
          !new_doc->has_local_mutations());
}

ViewChange View::ApplyChanges(const ViewDocumentChanges& doc_changes) {
  return ApplyChanges(doc_changes, {});
}

ViewChange View::ApplyChanges(
    const ViewDocumentChanges& doc_changes,
    const absl::optional<TargetChange>& target_change) {
  HARD_ASSERT(!doc_changes.needs_refill(),
              "Cannot apply changes that need a refill");

  DocumentSet old_documents = document_set_;
  document_set_ = doc_changes.document_set();
  mutated_keys_ = doc_changes.mutated_keys();

  // Sort changes based on type and query comparator.
  std::vector<DocumentViewChange> changes =
      doc_changes.change_set().GetChanges();
  std::sort(
      changes.begin(), changes.end(),
      [this](const DocumentViewChange& lhs, const DocumentViewChange& rhs) {
        int pos1 = GetDocumentViewChangeTypePosition(lhs.type());
        int pos2 = GetDocumentViewChangeTypePosition(rhs.type());
        if (pos1 != pos2) {
          return pos1 < pos2;
        }
        return util::Ascending(Compare(lhs.document(), rhs.document()));
      });

  ApplyTargetChange(target_change);
  std::vector<LimboDocumentChange> limbo_changes = UpdateLimboDocuments();
  bool synced = limbo_documents_.empty() && current_;
  SyncState new_sync_state = synced ? SyncState::Synced : SyncState::Local;
  bool sync_state_changed = new_sync_state != sync_state_;
  sync_state_ = new_sync_state;

  if (changes.empty() && !sync_state_changed) {
    // No changes.
    return ViewChange(absl::nullopt, std::move(limbo_changes));
  } else {
    ViewSnapshot snapshot{query_,
                          doc_changes.document_set(),
                          old_documents,
                          std::move(changes),
                          doc_changes.mutated_keys(),
                          /*from_cache=*/new_sync_state == SyncState::Local,
                          sync_state_changed,
                          /*excludes_metadata_changes=*/false};

    return ViewChange(std::move(snapshot), std::move(limbo_changes));
  }
}

ViewChange View::ApplyOnlineStateChange(OnlineState online_state) {
  if (current_ && online_state == OnlineState::Offline) {
    // If we're offline, set `current_` to false and then call ApplyChanges to
    // refresh our sync state and generate a ViewChange as appropriate. We are
    // guaranteed to get a new `TargetChange` that sets `current_` back to true
    // once the client is back online.
    current_ = false;
    return ApplyChanges(
        ViewDocumentChanges(document_set_, DocumentViewChangeSet{},
                            mutated_keys_, /* needs_refill= */ false));
  } else {
    // No effect, just return a no-op ViewChange.
    return ViewChange(absl::nullopt, {});
  }
}

// MARK: Private Methods

/** Returns whether the doc for the given key should be in limbo. */
bool View::ShouldBeInLimbo(const DocumentKey& key) const {
  // If the remote end says it's part of this query, it's not in limbo.
  if (synced_documents_.contains(key)) {
    return false;
  }
  // The local store doesn't think it's a result, so it shouldn't be in limbo.
  if (!document_set_.ContainsKey(key)) {
    return false;
  }
  // If there are local changes to the doc, they might explain why the server
  // doesn't know that it's part of the query. So don't put it in limbo.
  // TODO(klimt): Ideally, we would only consider changes that might actually
  // affect this specific query.
  if ((*document_set_.GetDocument(key))->has_local_mutations()) {
    return false;
  }
  // Everything else is in limbo.
  return true;
}

/**
 * Updates synced_documents_ and current based on the given change.
 */
void View::ApplyTargetChange(
    const absl::optional<TargetChange>& maybe_target_change) {
  if (maybe_target_change.has_value()) {
    const TargetChange& target_change = maybe_target_change.value();

    for (const DocumentKey& key : target_change.added_documents()) {
      synced_documents_ = synced_documents_.insert(key);
    }
    for (const DocumentKey& key : target_change.modified_documents()) {
      HARD_ASSERT(synced_documents_.find(key) != synced_documents_.end(),
                  "Modified document %s not found in view.", key.ToString());
    }
    for (const DocumentKey& key : target_change.removed_documents()) {
      synced_documents_ = synced_documents_.erase(key);
    }

    current_ = target_change.current();
  }
}

/** Updates limbo_documents_ and returns any changes as LimboDocumentChanges. */
std::vector<LimboDocumentChange> View::UpdateLimboDocuments() {
  // We can only determine limbo documents when we're in-sync with the server.
  if (!current_) {
    return {};
  }

  // TODO(klimt): Do this incrementally so that it's not quadratic when updating
  // many documents.
  DocumentKeySet old_limbo_documents = std::move(limbo_documents_);
  limbo_documents_ = DocumentKeySet{};
  for (const Document& doc : document_set_) {
    if (ShouldBeInLimbo(doc->key())) {
      limbo_documents_ = limbo_documents_.insert(doc->key());
    }
  }

  // Diff the new limbo docs with the old limbo docs.
  std::vector<LimboDocumentChange> changes;
  changes.reserve(old_limbo_documents.size() + limbo_documents_.size());

  for (const DocumentKey& key : old_limbo_documents) {
    if (!limbo_documents_.contains(key)) {
      changes.push_back(LimboDocumentChange::Removed(key));
    }
  }
  for (const DocumentKey& key : limbo_documents_) {
    if (!old_limbo_documents.contains(key)) {
      changes.push_back(LimboDocumentChange::Added(key));
    }
  }
  return changes;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
