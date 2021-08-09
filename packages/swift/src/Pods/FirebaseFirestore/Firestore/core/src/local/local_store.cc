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

#include "Firestore/core/src/local/local_store.h"

#include <string>
#include <utility>

#include "Firestore/core/src/local/bundle_cache.h"
#include "Firestore/core/src/local/local_documents_view.h"
#include "Firestore/core/src/local/local_view_changes.h"
#include "Firestore/core/src/local/local_write_result.h"
#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/persistence.h"
#include "Firestore/core/src/local/query_engine.h"
#include "Firestore/core/src/local/query_result.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/target_cache.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/mutation_batch_result.h"
#include "Firestore/core/src/model/patch_mutation.h"
#include "Firestore/core/src/remote/remote_event.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/to_string.h"

namespace firebase {
namespace firestore {
namespace local {
namespace {

using auth::User;
using core::Query;
using core::Target;
using core::TargetIdGenerator;
using model::BatchId;
using model::Document;
using model::DocumentKey;
using model::DocumentKeySet;
using model::DocumentMap;
using model::DocumentUpdateMap;
using model::DocumentVersionMap;
using model::ListenSequenceNumber;
using model::MutableDocument;
using model::MutableDocumentMap;
using model::Mutation;
using model::MutationBatch;
using model::MutationBatchResult;
using model::ObjectValue;
using model::PatchMutation;
using model::Precondition;
using model::ResourcePath;
using model::SnapshotVersion;
using model::TargetId;
using nanopb::ByteString;
using remote::TargetChange;

/**
 * The maximum time to leave a resume token buffered without writing it out.
 * This value is arbitrary: it's long enough to avoid several writes (possibly
 * indefinitely if updates come more frequently than this) but short enough that
 * restarting after crashing will still have a pretty recent resume token.
 */
const int64_t kResumeTokenMaxAgeSeconds = 5 * 60;  // 5 minutes

}  // namespace

LocalStore::LocalStore(Persistence* persistence,
                       QueryEngine* query_engine,
                       const User& initial_user)
    : persistence_(persistence),
      mutation_queue_(persistence->GetMutationQueueForUser(initial_user)),
      remote_document_cache_(persistence->remote_document_cache()),
      target_cache_(persistence->target_cache()),
      bundle_cache_(persistence->bundle_cache()),
      query_engine_(query_engine),
      local_documents_(
          absl::make_unique<LocalDocumentsView>(remote_document_cache_,
                                                mutation_queue_,
                                                persistence->index_manager())) {
  persistence->reference_delegate()->AddInMemoryPins(&local_view_references_);
  target_id_generator_ = TargetIdGenerator::TargetCacheTargetIdGenerator(0);
  query_engine_->SetLocalDocumentsView(local_documents_.get());
}

LocalStore::~LocalStore() = default;

void LocalStore::Start() {
  StartMutationQueue();
  TargetId target_id = target_cache_->highest_target_id();
  target_id_generator_ =
      TargetIdGenerator::TargetCacheTargetIdGenerator(target_id);
}

void LocalStore::StartMutationQueue() {
  persistence_->Run("Start MutationQueue", [&] { mutation_queue_->Start(); });
}

DocumentMap LocalStore::HandleUserChange(const User& user) {
  // Swap out the mutation queue, grabbing the pending mutation batches before
  // and after.
  std::vector<MutationBatch> old_batches = persistence_->Run(
      "OldBatches", [&] { return mutation_queue_->AllMutationBatches(); });

  // The old one has a reference to the mutation queue, so null it out first.
  local_documents_.reset();
  mutation_queue_ = persistence_->GetMutationQueueForUser(user);

  StartMutationQueue();

  return persistence_->Run("NewBatches", [&] {
    std::vector<MutationBatch> new_batches =
        mutation_queue_->AllMutationBatches();

    // Recreate our LocalDocumentsView using the new MutationQueue.
    local_documents_ = absl::make_unique<LocalDocumentsView>(
        remote_document_cache_, mutation_queue_, persistence_->index_manager());
    query_engine_->SetLocalDocumentsView(local_documents_.get());

    // Union the old/new changed keys.
    DocumentKeySet changed_keys;
    for (const std::vector<MutationBatch>* batches :
         {&old_batches, &new_batches}) {
      for (const MutationBatch& batch : *batches) {
        for (const Mutation& mutation : batch.mutations()) {
          changed_keys = changed_keys.insert(mutation.key());
        }
      }
    }

    // Return the set of all (potentially) changed documents as the result of
    // the user change.
    return local_documents_->GetDocuments(changed_keys);
  });
}

LocalWriteResult LocalStore::WriteLocally(std::vector<Mutation>&& mutations) {
  Timestamp local_write_time = Timestamp::Now();
  DocumentKeySet keys;
  for (const Mutation& mutation : mutations) {
    keys = keys.insert(mutation.key());
  }

  return persistence_->Run("Locally write mutations", [&] {
    // Load and apply all existing mutations. This lets us compute the current
    // base state for all non-idempotent transforms before applying any
    // additional user-provided writes.
    DocumentMap existing_documents = local_documents_->GetDocuments(keys);

    // For non-idempotent mutations (such as `FieldValue.increment()`), we
    // record the base state in a separate patch mutation. This is later used to
    // guarantee consistent values and prevents flicker even if the backend
    // sends us an update that already includes our transform.
    std::vector<Mutation> base_mutations;
    for (const Mutation& mutation : mutations) {
      absl::optional<Document> base_document =
          existing_documents.get(mutation.key());

      absl::optional<ObjectValue> base_value =
          mutation.ExtractTransformBaseValue(*base_document);
      if (base_value) {
        // NOTE: The base state should only be applied if there's some existing
        // document to override, so use a Precondition of exists=true
        model::FieldMask mask = base_value->ToFieldMask();
        base_mutations.push_back(PatchMutation(mutation.key(),
                                               std::move(*base_value), mask,
                                               Precondition::Exists(true)));
      }
    }

    MutationBatch batch = mutation_queue_->AddMutationBatch(
        local_write_time, std::move(base_mutations), std::move(mutations));
    batch.ApplyToLocalDocumentSet(existing_documents);
    return LocalWriteResult{batch.batch_id(), std::move(existing_documents)};
  });
}

DocumentMap LocalStore::AcknowledgeBatch(
    const MutationBatchResult& batch_result) {
  return persistence_->Run("Acknowledge batch", [&] {
    const MutationBatch& batch = batch_result.batch();
    mutation_queue_->AcknowledgeBatch(batch, batch_result.stream_token());
    ApplyBatchResult(batch_result);
    mutation_queue_->PerformConsistencyCheck();

    return local_documents_->GetDocuments(batch.keys());
  });
}

void LocalStore::ApplyBatchResult(const MutationBatchResult& batch_result) {
  const MutationBatch& batch = batch_result.batch();
  DocumentKeySet doc_keys = batch.keys();
  const DocumentVersionMap& versions = batch_result.doc_versions();

  for (const DocumentKey& doc_key : doc_keys) {
    MutableDocument doc = remote_document_cache_->Get(doc_key);

    auto ack_version_iter = versions.find(doc_key);
    HARD_ASSERT(ack_version_iter != versions.end(),
                "doc_versions should contain every doc in the write.");
    const SnapshotVersion& ack_version = ack_version_iter->second;

    if (doc.version() < ack_version) {
      batch.ApplyToRemoteDocument(doc, batch_result);
      if (doc.is_valid_document()) {
        remote_document_cache_->Add(doc, batch_result.commit_version());
      }
    }
  }

  mutation_queue_->RemoveMutationBatch(batch);
}

DocumentMap LocalStore::RejectBatch(BatchId batch_id) {
  return persistence_->Run("Reject batch", [&] {
    absl::optional<MutationBatch> to_reject =
        mutation_queue_->LookupMutationBatch(batch_id);
    HARD_ASSERT(to_reject.has_value(), "Attempt to reject nonexistent batch!");

    mutation_queue_->RemoveMutationBatch(*to_reject);
    mutation_queue_->PerformConsistencyCheck();

    return local_documents_->GetDocuments(to_reject->keys());
  });
}

ByteString LocalStore::GetLastStreamToken() {
  return mutation_queue_->GetLastStreamToken();
}

void LocalStore::SetLastStreamToken(const ByteString& stream_token) {
  persistence_->Run("Set stream token",
                    [&] { mutation_queue_->SetLastStreamToken(stream_token); });
}

const SnapshotVersion& LocalStore::GetLastRemoteSnapshotVersion() const {
  return target_cache_->GetLastRemoteSnapshotVersion();
}

model::DocumentMap LocalStore::ApplyRemoteEvent(
    const remote::RemoteEvent& remote_event) {
  const SnapshotVersion& last_remote_version =
      target_cache_->GetLastRemoteSnapshotVersion();

  return persistence_->Run("Apply remote event", [&] {
    // TODO(gsoltis): move the sequence number into the reference delegate.
    ListenSequenceNumber sequence_number =
        persistence_->current_sequence_number();

    for (const auto& entry : remote_event.target_changes()) {
      TargetId target_id = entry.first;
      const TargetChange& change = entry.second;

      auto found = target_data_by_target_.find(target_id);
      if (found == target_data_by_target_.end()) {
        // We don't update the remote keys if the query is not active. This
        // ensures that we persist the updated target data along with the
        // updated assignment.
        continue;
      }

      TargetData old_target_data = found->second;

      target_cache_->RemoveMatchingKeys(change.removed_documents(), target_id);
      target_cache_->AddMatchingKeys(change.added_documents(), target_id);

      // Update the resume token if the change includes one. Don't clear any
      // preexisting value. Bump the sequence number as well, so that documents
      // being removed now are ordered later than documents that were previously
      // removed from this target.
      const ByteString& resume_token = change.resume_token();
      // Update the resume token if the change includes one.
      if (!resume_token.empty()) {
        TargetData new_target_data =
            old_target_data
                .WithResumeToken(resume_token, remote_event.snapshot_version())
                .WithSequenceNumber(sequence_number);
        target_data_by_target_[target_id] = new_target_data;

        // Update the target data if there are target changes (or if sufficient
        // time has passed since the last update).
        if (ShouldPersistTargetData(new_target_data, old_target_data, change)) {
          target_cache_->UpdateTarget(new_target_data);
        }
      }
    }

    const DocumentKeySet& limbo_documents =
        remote_event.limbo_document_changes();
    for (const auto& kv : remote_event.document_updates()) {
      // If this was a limbo resolution, make sure we mark when it was accessed.
      if (limbo_documents.contains(kv.first)) {
        persistence_->reference_delegate()->UpdateLimboDocument(kv.first);
      }
    }

    auto changed_docs = PopulateDocumentChanges(
        remote_event.document_updates(), DocumentVersionMap(),
        remote_event.snapshot_version());

    // HACK: The only reason we allow omitting snapshot version is so we can
    // synthesize remote events when we get permission denied errors while
    // trying to resolve the state of a locally cached document that is in
    // limbo.
    const SnapshotVersion& remote_version = remote_event.snapshot_version();
    if (remote_version != SnapshotVersion::None()) {
      HARD_ASSERT(remote_version >= last_remote_version,
                  "Watch stream reverted to previous snapshot?? (%s < %s)",
                  remote_version.ToString(), last_remote_version.ToString());
      target_cache_->SetLastRemoteSnapshotVersion(remote_version);
    }

    return local_documents_->GetLocalViewOfDocuments(changed_docs);
  });
}

bool LocalStore::ShouldPersistTargetData(const TargetData& new_target_data,
                                         const TargetData& old_target_data,
                                         const TargetChange& change) const {
  // Avoid clearing any existing value
  HARD_ASSERT(!new_target_data.resume_token().empty(),
              "Attempted to persist target data with empty resume token");

  // Always persist target data if we don't already have a resume token.
  if (old_target_data.resume_token().empty()) return true;

  // Don't allow resume token changes to be buffered indefinitely. This allows
  // us to be reasonably up-to-date after a crash and avoids needing to loop
  // over all active queries on shutdown. Especially in the browser we may not
  // get time to do anything interesting while the current tab is closing.
  int64_t new_seconds =
      new_target_data.snapshot_version().timestamp().seconds();
  int64_t old_seconds =
      old_target_data.snapshot_version().timestamp().seconds();
  int64_t time_delta = new_seconds - old_seconds;
  if (time_delta >= kResumeTokenMaxAgeSeconds) return true;

  // Otherwise if the only thing that has changed about a target is its resume
  // token then it's not worth persisting. Note that the RemoteStore keeps an
  // in-memory view of the currently active targets which includes the current
  // resume token, so stream failure or user changes will still use an
  // up-to-date resume token regardless of what we do here.
  size_t changes = change.added_documents().size() +
                   change.modified_documents().size() +
                   change.removed_documents().size();
  return changes > 0;
}

absl::optional<TargetData> LocalStore::GetTargetData(
    const core::Target& target) {
  auto target_id = target_id_by_target_.find(target);
  if (target_id != target_id_by_target_.end()) {
    return target_data_by_target_[target_id->second];
  }
  return target_cache_->GetTarget(target);
}

void LocalStore::NotifyLocalViewChanges(
    const std::vector<local::LocalViewChanges>& view_changes) {
  persistence_->Run("NotifyLocalViewChanges", [&] {
    for (const LocalViewChanges& view_change : view_changes) {
      int target_id = view_change.target_id();

      for (const DocumentKey& key : view_change.removed_keys()) {
        persistence_->reference_delegate()->RemoveReference(key);
      }
      local_view_references_.AddReferences(view_change.added_keys(), target_id);
      local_view_references_.RemoveReferences(view_change.removed_keys(),
                                              target_id);

      if (!view_change.is_from_cache()) {
        const auto& entry = target_data_by_target_.find(target_id);
        HARD_ASSERT(
            entry != target_data_by_target_.end(),
            "Can't set limbo-free snapshot version for unknown target: %s",
            target_id);
        const TargetData& target_data = entry->second;

        // Advance the last limbo free snapshot version
        SnapshotVersion last_limbo_free_snapshot_version =
            target_data.snapshot_version();
        TargetData updated_target_data =
            target_data.WithLastLimboFreeSnapshotVersion(
                last_limbo_free_snapshot_version);
        target_data_by_target_[target_id] = updated_target_data;
      }
    }
  });
}

absl::optional<MutationBatch> LocalStore::GetNextMutationBatch(
    BatchId batch_id) {
  return persistence_->Run("NextMutationBatchAfterBatchID", [&] {
    return mutation_queue_->NextMutationBatchAfterBatchId(batch_id);
  });
}

const Document LocalStore::ReadDocument(const DocumentKey& key) {
  return persistence_->Run("ReadDocument",
                           [&] { return local_documents_->GetDocument(key); });
}

BatchId LocalStore::GetHighestUnacknowledgedBatchId() {
  return persistence_->Run("GetHighestUnacknowledgedBatchId", [&] {
    return mutation_queue_->GetHighestUnacknowledgedBatchId();
  });
}

TargetData LocalStore::AllocateTarget(Target target) {
  TargetData target_data = persistence_->Run("Allocate target", [&] {
    absl::optional<TargetData> cached = target_cache_->GetTarget(target);
    // TODO(mcg): freshen last accessed date if cached exists?
    if (!cached) {
      cached = TargetData(std::move(target), target_id_generator_.NextId(),
                          persistence_->current_sequence_number(),
                          QueryPurpose::Listen);
      target_cache_->AddTarget(*cached);
    }
    return *cached;
  });

  // Sanity check to ensure that even when resuming a query it's not currently
  // active.
  TargetId target_id = target_data.target_id();
  if (target_data_by_target_.find(target_id) == target_data_by_target_.end()) {
    target_data_by_target_[target_id] = target_data;
    target_id_by_target_[target_data.target()] = target_id;
  }

  return target_data;
}

void LocalStore::ReleaseTarget(TargetId target_id) {
  persistence_->Run("Release target", [&] {
    auto found = target_data_by_target_.find(target_id);
    HARD_ASSERT(found != target_data_by_target_.end(),
                "Tried to release a non-existent target: %s", target_id);

    TargetData target_data = found->second;

    // References for documents sent via Watch are automatically removed when we
    // delete a query's target data from the reference delegate. Since this does
    // not remove references for locally mutated documents, we have to remove
    // the target associations for these documents manually.
    DocumentKeySet removed =
        local_view_references_.RemoveReferences(target_data.target_id());
    for (const DocumentKey& key : removed) {
      persistence_->reference_delegate()->RemoveReference(key);
    }

    // Note: This also updates the target cache.
    persistence_->reference_delegate()->RemoveTarget(target_data);
    target_data_by_target_.erase(target_id);
    target_id_by_target_.erase(target_data.target());
  });
}

QueryResult LocalStore::ExecuteQuery(const Query& query,
                                     bool use_previous_results) {
  return persistence_->Run("ExecuteQuery", [&] {
    absl::optional<TargetData> target_data = GetTargetData(query.ToTarget());
    SnapshotVersion last_limbo_free_snapshot_version;
    DocumentKeySet remote_keys;

    if (target_data) {
      last_limbo_free_snapshot_version =
          target_data->last_limbo_free_snapshot_version();
      remote_keys = target_cache_->GetMatchingKeys(target_data->target_id());
    }

    model::DocumentMap documents = query_engine_->GetDocumentsMatchingQuery(
        query,
        use_previous_results ? last_limbo_free_snapshot_version
                             : SnapshotVersion::None(),
        use_previous_results ? remote_keys : DocumentKeySet{});
    return QueryResult(std::move(documents), std::move(remote_keys));
  });
}

DocumentKeySet LocalStore::GetRemoteDocumentKeys(TargetId target_id) {
  return persistence_->Run("RemoteDocumentKeysForTarget", [&] {
    return target_cache_->GetMatchingKeys(target_id);
  });
}

LruResults LocalStore::CollectGarbage(LruGarbageCollector* garbage_collector) {
  return persistence_->Run("Collect garbage", [&] {
    return garbage_collector->Collect(target_data_by_target_);
  });
}

bool LocalStore::HasNewerBundle(const bundle::BundleMetadata& metadata) {
  return persistence_->Run("Has newer bundle", [&] {
    absl::optional<bundle::BundleMetadata> cached_metadata =
        bundle_cache_->GetBundleMetadata(metadata.bundle_id());
    return cached_metadata.has_value() &&
           cached_metadata->create_time() >= metadata.create_time();
  });
}

void LocalStore::SaveBundle(const bundle::BundleMetadata& metadata) {
  return persistence_->Run(
      "Save bundle", [&] { bundle_cache_->SaveBundleMetadata(metadata); });
}

DocumentMap LocalStore::ApplyBundledDocuments(
    const MutableDocumentMap& bundled_documents, const std::string& bundle_id) {
  // Allocates a target to hold all document keys from the bundle, such that
  // they will not get garbage collected right away.
  TargetData umbrella_target = AllocateTarget(NewUmbrellaTarget(bundle_id));
  return persistence_->Run("Apply bundle documents", [&] {
    DocumentKeySet keys;
    DocumentUpdateMap document_updates;
    DocumentVersionMap versions;

    for (const auto& kv : bundled_documents) {
      const DocumentKey& key = kv.first;
      const auto& doc = kv.second;
      if (doc.is_found_document()) {
        keys = keys.insert(key);
      }
      document_updates.emplace(key, doc);
      versions.emplace(key, doc.version());
    }

    target_cache_->RemoveMatchingKeysForTarget(umbrella_target.target_id());
    target_cache_->AddMatchingKeys(keys, umbrella_target.target_id());

    auto changed_docs = PopulateDocumentChanges(document_updates, versions,
                                                SnapshotVersion::None());
    return local_documents_->GetLocalViewOfDocuments(changed_docs);
  });
}

void LocalStore::SaveNamedQuery(const bundle::NamedQuery& query,
                                const model::DocumentKeySet& keys) {
  // Allocate a target for the named query such that it can be resumed from
  // associated read time if users use it to listen. NOTE: this also means if no
  // corresponding target exists, the new target will remain active and will not
  // get collected, unless users happen to unlisten the query.
  TargetData existing = AllocateTarget(query.bundled_query().target());
  int target_id = existing.target_id();

  return persistence_->Run("Save named query", [&] {
    // Only update the matching documents if it is newer than what the SDK
    // already has.
    if (query.read_time() > existing.snapshot_version()) {
      // Update existing target data because the query from the bundle is newer.
      TargetData new_target_data =
          existing.WithResumeToken(nanopb::ByteString(), query.read_time());

      target_cache_->UpdateTarget(new_target_data);
      target_data_by_target_.emplace(target_id, std::move(new_target_data));
      target_cache_->RemoveMatchingKeysForTarget(target_id);
      target_cache_->AddMatchingKeys(keys, target_id);
    }

    bundle_cache_->SaveNamedQuery(query);
  });
}

absl::optional<bundle::NamedQuery> LocalStore::GetNamedQuery(
    const std::string& query) {
  return persistence_->Run("Get named query",
                           [&] { return bundle_cache_->GetNamedQuery(query); });
}

Target LocalStore::NewUmbrellaTarget(const std::string& bundle_id) {
  // It is OK that the path used for the query is not valid, because this will
  // not be read and queried.
  return Query(ResourcePath::FromString("__bundle__/docs/" + bundle_id))
      .ToTarget();
}

MutableDocumentMap LocalStore::PopulateDocumentChanges(
    const DocumentUpdateMap& documents,
    const DocumentVersionMap& document_versions,
    const SnapshotVersion& global_version) {
  MutableDocumentMap changed_docs;

  DocumentKeySet updated_keys;
  for (const auto& kv : documents) {
    updated_keys = updated_keys.insert(kv.first);
  }
  // Each loop iteration only affects its "own" doc, so it's safe to get all
  // the remote documents in advance in a single call.
  MutableDocumentMap existing_docs =
      remote_document_cache_->GetAll(updated_keys);

  for (const auto& kv : documents) {
    const DocumentKey& key = kv.first;
    const MutableDocument& doc = kv.second;
    MutableDocument existing_doc = *existing_docs.get(key);
    auto search_version = document_versions.find(key);
    const SnapshotVersion& read_time = search_version != document_versions.end()
                                           ? search_version->second
                                           : global_version;

    // Note: The order of the steps below is important, since we want to
    // ensure that rejected limbo resolutions (which fabricate NoDocuments
    // with SnapshotVersion::None) never add documents to cache.
    if (doc.is_no_document() && doc.version() == SnapshotVersion::None()) {
      // NoDocuments with SnapshotVersion::None are used in manufactured
      // events. We remove these documents from cache since we lost access.
      remote_document_cache_->Remove(key);
      changed_docs = changed_docs.insert(key, doc);
    } else if (!existing_doc.is_valid_document() ||
               doc.version() > existing_doc.version() ||
               (doc.version() == existing_doc.version() &&
                existing_doc.has_pending_writes())) {
      HARD_ASSERT(read_time != SnapshotVersion::None(),
                  "Cannot add a document when the remote version is zero");
      remote_document_cache_->Add(doc, read_time);
      changed_docs = changed_docs.insert(key, doc);
    } else {
      LOG_DEBUG(
          "LocalStore Ignoring outdated update for %s. "
          "Current version: %s  Remote version: %s",
          key.ToString(), existing_doc.version().ToString(),
          doc.version().ToString());
    }
  }
  return changed_docs;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
