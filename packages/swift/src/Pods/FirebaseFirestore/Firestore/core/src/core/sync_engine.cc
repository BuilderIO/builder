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

#include "Firestore/core/src/core/sync_engine.h"

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/bundle/bundle_element.h"
#include "Firestore/core/src/bundle/bundle_loader.h"
#include "Firestore/core/src/core/sync_engine_callback.h"
#include "Firestore/core/src/core/transaction.h"
#include "Firestore/core/src/core/transaction_runner.h"
#include "Firestore/core/src/local/local_documents_view.h"
#include "Firestore/core/src/local/local_store.h"
#include "Firestore/core/src/local/local_view_changes.h"
#include "Firestore/core/src/local/local_write_result.h"
#include "Firestore/core/src/local/query_result.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch_result.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/status.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace core {

namespace {

using auth::User;
using bundle::BundleElement;
using bundle::BundleLoader;
using bundle::InitialProgress;
using bundle::SuccessProgress;
using firestore::Error;
using local::LocalStore;
using local::LocalViewChanges;
using local::LocalWriteResult;
using local::QueryPurpose;
using local::QueryResult;
using local::TargetData;
using model::BatchId;
using model::DocumentKey;
using model::DocumentKeySet;
using model::DocumentMap;
using model::DocumentUpdateMap;
using model::kBatchIdUnknown;
using model::ListenSequenceNumber;
using model::MutableDocument;
using model::SnapshotVersion;
using model::TargetId;
using remote::RemoteEvent;
using remote::TargetChange;
using util::AsyncQueue;
using util::Status;
using util::StatusCallback;

// Limbo documents don't use persistence, and are eagerly GC'd. So, listens for
// them don't need real sequence numbers.
const ListenSequenceNumber kIrrelevantSequenceNumber = -1;

bool ErrorIsInteresting(const Status& error) {
  bool missing_index =
      (error.code() == Error::kErrorFailedPrecondition &&
       absl::StrContains(error.error_message(), "requires an index"));
  bool no_permission = (error.code() == Error::kErrorPermissionDenied);
  return missing_index || no_permission;
}

}  // namespace

SyncEngine::SyncEngine(LocalStore* local_store,
                       remote::RemoteStore* remote_store,
                       const auth::User& initial_user,
                       size_t max_concurrent_limbo_resolutions)
    : local_store_(local_store),
      remote_store_(remote_store),
      current_user_(initial_user),
      target_id_generator_(TargetIdGenerator::SyncEngineTargetIdGenerator()),
      max_concurrent_limbo_resolutions_(max_concurrent_limbo_resolutions) {
}

void SyncEngine::AssertCallbackExists(absl::string_view source) {
  HARD_ASSERT(sync_engine_callback_,
              "Tried to call '%s' before callback was registered.", source);
}

TargetId SyncEngine::Listen(Query query) {
  AssertCallbackExists("Listen");

  HARD_ASSERT(query_views_by_query_.find(query) == query_views_by_query_.end(),
              "We already listen to query: %s", query.ToString());

  TargetData target_data = local_store_->AllocateTarget(query.ToTarget());
  ViewSnapshot view_snapshot =
      InitializeViewAndComputeSnapshot(query, target_data.target_id());
  std::vector<ViewSnapshot> snapshots;
  // Not using the `std::initializer_list` constructor to avoid extra copies.
  snapshots.push_back(std::move(view_snapshot));
  sync_engine_callback_->OnViewSnapshots(std::move(snapshots));

  // TODO(wuandy): move `target_data` into `Listen`.
  remote_store_->Listen(target_data);
  return target_data.target_id();
}

ViewSnapshot SyncEngine::InitializeViewAndComputeSnapshot(const Query& query,
                                                          TargetId target_id) {
  QueryResult query_result =
      local_store_->ExecuteQuery(query, /* use_previous_results= */ true);

  // If there are already queries mapped to the target id, create a synthesized
  // target change to apply the sync state from those queries to the new query.
  auto current_sync_state = SyncState::None;
  absl::optional<TargetChange> synthesized_current_change;
  if (queries_by_target_.find(target_id) != queries_by_target_.end()) {
    const Query& mirror_query = queries_by_target_[target_id][0];
    current_sync_state =
        query_views_by_query_[mirror_query]->view().sync_state();
    synthesized_current_change = TargetChange::CreateSynthesizedTargetChange(
        current_sync_state == SyncState::Synced);
  }

  View view(query, query_result.remote_keys());
  ViewDocumentChanges view_doc_changes =
      view.ComputeDocumentChanges(query_result.documents());
  ViewChange view_change =
      view.ApplyChanges(view_doc_changes, synthesized_current_change);
  UpdateTrackedLimboDocuments(view_change.limbo_changes(), target_id);

  auto query_view =
      std::make_shared<QueryView>(query, target_id, std::move(view));
  query_views_by_query_[query] = query_view;

  queries_by_target_[target_id].push_back(query);

  HARD_ASSERT(
      view_change.snapshot().has_value(),
      "ApplyChanges to documents for new view should always return a snapshot");
  return view_change.snapshot().value();
}

void SyncEngine::StopListening(const Query& query) {
  AssertCallbackExists("StopListening");

  auto query_view = query_views_by_query_[query];
  HARD_ASSERT(query_view, "Trying to stop listening to a query not found");

  query_views_by_query_.erase(query);

  TargetId target_id = query_view->target_id();
  auto& queries = queries_by_target_[target_id];
  queries.erase(std::remove(queries.begin(), queries.end(), query),
                queries.end());

  if (queries.empty()) {
    local_store_->ReleaseTarget(target_id);
    remote_store_->StopListening(target_id);
    RemoveAndCleanupTarget(target_id, Status::OK());
  }
}

void SyncEngine::RemoveAndCleanupTarget(TargetId target_id, Status status) {
  for (const Query& query : queries_by_target_.at(target_id)) {
    query_views_by_query_.erase(query);
    if (!status.ok()) {
      sync_engine_callback_->OnError(query, status);
      if (ErrorIsInteresting(status)) {
        LOG_WARN("Listen for query at %s failed: %s",
                 query.path().CanonicalString(), status.error_message());
      }
    }
  }
  queries_by_target_.erase(target_id);

  DocumentKeySet limbo_keys = limbo_document_refs_.ReferencedKeys(target_id);
  limbo_document_refs_.RemoveReferences(target_id);
  for (const DocumentKey& key : limbo_keys) {
    if (!limbo_document_refs_.ContainsKey(key)) {
      // We removed the last reference for this key.
      RemoveLimboTarget(key);
    }
  }
}

void SyncEngine::WriteMutations(std::vector<model::Mutation>&& mutations,
                                StatusCallback callback) {
  AssertCallbackExists("WriteMutations");

  LocalWriteResult result = local_store_->WriteLocally(std::move(mutations));
  mutation_callbacks_[current_user_].insert(
      std::make_pair(result.batch_id(), std::move(callback)));

  EmitNewSnapshotsAndNotifyLocalStore(result.changes(), absl::nullopt);
  remote_store_->FillWritePipeline();
}

void SyncEngine::RegisterPendingWritesCallback(StatusCallback callback) {
  if (!remote_store_->CanUseNetwork()) {
    LOG_DEBUG(
        "The network is disabled. The task returned by "
        "'waitForPendingWrites()' will not "
        "complete until the network is enabled.");
  }

  int largest_pending_batch_id =
      local_store_->GetHighestUnacknowledgedBatchId();

  if (largest_pending_batch_id == kBatchIdUnknown) {
    // Trigger the callback right away if there is no pending writes at the
    // moment.
    callback(Status::OK());
    return;
  }

  pending_writes_callbacks_[largest_pending_batch_id].push_back(
      std::move(callback));
}

void SyncEngine::Transaction(int retries,
                             const std::shared_ptr<AsyncQueue>& worker_queue,
                             TransactionUpdateCallback update_callback,
                             TransactionResultCallback result_callback) {
  worker_queue->VerifyIsCurrentQueue();
  HARD_ASSERT(retries >= 0, "Got negative number of retries for transaction");

  // Allocate a shared_ptr so that the TransactionRunner can outlive this frame.
  auto runner = std::make_shared<TransactionRunner>(worker_queue, remote_store_,
                                                    std::move(update_callback),
                                                    std::move(result_callback));
  runner->Run();
}

void SyncEngine::HandleCredentialChange(const auth::User& user) {
  bool user_changed = (current_user_ != user);
  current_user_ = user;

  if (user_changed) {
    // Fails callbacks waiting for pending writes requested by previous user.
    FailOutstandingPendingWriteCallbacks(
        "'waitForPendingWrites' callback is cancelled due to a user change.");
    // Notify local store and emit any resulting events from swapping out the
    // mutation queue.
    DocumentMap changes = local_store_->HandleUserChange(user);
    EmitNewSnapshotsAndNotifyLocalStore(changes, absl::nullopt);
  }

  // Notify remote store so it can restart its streams.
  remote_store_->HandleCredentialChange();
}

void SyncEngine::ApplyRemoteEvent(const RemoteEvent& remote_event) {
  AssertCallbackExists("HandleRemoteEvent");

  // Update received document as appropriate for any limbo targets.
  for (const auto& entry : remote_event.target_changes()) {
    TargetId target_id = entry.first;
    const TargetChange& change = entry.second;
    auto it = active_limbo_resolutions_by_target_.find(target_id);
    if (it == active_limbo_resolutions_by_target_.end()) {
      continue;
    }

    LimboResolution& limbo_resolution = it->second;
    // Since this is a limbo resolution lookup, it's for a single document and
    // it could be added, modified, or removed, but not a combination.
    auto changed_documents_count = change.added_documents().size() +
                                   change.modified_documents().size() +
                                   change.removed_documents().size();
    HARD_ASSERT(
        changed_documents_count <= 1,
        "Limbo resolution for single document contains multiple changes.");

    if (!change.added_documents().empty()) {
      limbo_resolution.document_received = true;
    } else if (!change.modified_documents().empty()) {
      HARD_ASSERT(limbo_resolution.document_received,
                  "Received change for limbo target document without add.");
    } else if (!change.removed_documents().empty()) {
      HARD_ASSERT(limbo_resolution.document_received,
                  "Received remove for limbo target document without add.");
      limbo_resolution.document_received = false;
    } else {
      // This was probably just a CURRENT target change or similar.
    }
  }

  DocumentMap changes = local_store_->ApplyRemoteEvent(remote_event);
  EmitNewSnapshotsAndNotifyLocalStore(changes, remote_event);
}

void SyncEngine::HandleRejectedListen(TargetId target_id, Status error) {
  AssertCallbackExists("HandleRejectedListen");

  auto it = active_limbo_resolutions_by_target_.find(target_id);
  if (it != active_limbo_resolutions_by_target_.end()) {
    DocumentKey limbo_key = it->second.key;
    // Since this query failed, we won't want to manually unlisten to it.
    // So go ahead and remove it from bookkeeping.
    active_limbo_targets_by_key_.erase(limbo_key);
    active_limbo_resolutions_by_target_.erase(target_id);
    PumpEnqueuedLimboResolutions();

    // TODO(dimond): Retry on transient errors?

    // It's a limbo doc. Create a synthetic event saying it was deleted. This is
    // kind of a hack. Ideally, we would have a method in the local store to
    // purge a document. However, it would be tricky to keep all of the local
    // store's invariants with another method.
    MutableDocument doc =
        MutableDocument::NoDocument(limbo_key, SnapshotVersion::None());

    // Explicitly instantiate these to work around a bug in the default
    // constructor of the std::unordered_map that comes with GCC 4.8. Without
    // this GCC emits a spurious "chosen constructor is explicit in
    // copy-initialization" error.
    DocumentKeySet limbo_documents{limbo_key};
    RemoteEvent::TargetChangeMap target_changes;
    RemoteEvent::TargetSet target_mismatches;
    DocumentUpdateMap document_updates{{limbo_key, doc}};

    RemoteEvent event{SnapshotVersion::None(), std::move(target_changes),
                      std::move(target_mismatches), std::move(document_updates),
                      std::move(limbo_documents)};
    ApplyRemoteEvent(event);
  } else {
    local_store_->ReleaseTarget(target_id);
    RemoveAndCleanupTarget(target_id, error);
  }
}

void SyncEngine::HandleSuccessfulWrite(
    model::MutationBatchResult batch_result) {
  AssertCallbackExists("HandleSuccessfulWrite");

  // The local store may or may not be able to apply the write result and
  // raise events immediately (depending on whether the watcher is caught up),
  // so we raise user callbacks first so that they consistently happen before
  // listen events.
  NotifyUser(batch_result.batch().batch_id(), Status::OK());

  TriggerPendingWriteCallbacks(batch_result.batch().batch_id());

  DocumentMap changes = local_store_->AcknowledgeBatch(batch_result);
  EmitNewSnapshotsAndNotifyLocalStore(changes, absl::nullopt);
}

void SyncEngine::HandleRejectedWrite(
    firebase::firestore::model::BatchId batch_id, Status error) {
  AssertCallbackExists("HandleRejectedWrite");

  DocumentMap changes = local_store_->RejectBatch(batch_id);

  if (!changes.empty() && ErrorIsInteresting(error)) {
    const DocumentKey& min_key = changes.min()->first;
    LOG_WARN("Write at %s failed: %s", min_key.ToString(),
             error.error_message());
  }

  // The local store may or may not be able to apply the write result and
  // raise events immediately (depending on whether the watcher is caught up),
  // so we raise user callbacks first so that they consistently happen before
  // listen events.
  NotifyUser(batch_id, std::move(error));

  TriggerPendingWriteCallbacks(batch_id);

  EmitNewSnapshotsAndNotifyLocalStore(changes, absl::nullopt);
}

void SyncEngine::HandleOnlineStateChange(model::OnlineState online_state) {
  AssertCallbackExists("HandleOnlineStateChange");

  std::vector<ViewSnapshot> new_view_snapshot;
  for (const auto& entry : query_views_by_query_) {
    const auto& query_view = entry.second;
    ViewChange view_change =
        query_view->view().ApplyOnlineStateChange(online_state);
    HARD_ASSERT(view_change.limbo_changes().empty(),
                "OnlineState should not affect limbo documents.");
    if (view_change.snapshot().has_value()) {
      new_view_snapshot.push_back(*std::move(view_change).snapshot());
    }
  }

  sync_engine_callback_->OnViewSnapshots(std::move(new_view_snapshot));
  sync_engine_callback_->HandleOnlineStateChange(online_state);
}

DocumentKeySet SyncEngine::GetRemoteKeys(TargetId target_id) const {
  auto it = active_limbo_resolutions_by_target_.find(target_id);
  if (it != active_limbo_resolutions_by_target_.end() &&
      it->second.document_received) {
    return DocumentKeySet{it->second.key};
  } else {
    DocumentKeySet keys;
    if (queries_by_target_.count(target_id) == 0) {
      return keys;
    }

    for (const auto& query : queries_by_target_.at(target_id)) {
      keys = keys.union_with(
          query_views_by_query_.at(query)->view().synced_documents());
    }
    return keys;
  }
}

void SyncEngine::NotifyUser(BatchId batch_id, Status status) {
  auto it = mutation_callbacks_.find(current_user_);

  // NOTE: Mutations restored from persistence won't have callbacks, so
  // it's okay for this (or the callback below) to not exist.
  if (it == mutation_callbacks_.end()) {
    return;
  }

  std::unordered_map<BatchId, StatusCallback>& callbacks = it->second;
  auto callback_it = callbacks.find(batch_id);
  if (callback_it != callbacks.end()) {
    callback_it->second(std::move(status));
    callbacks.erase(callback_it);
  }
}

void SyncEngine::TriggerPendingWriteCallbacks(BatchId batch_id) {
  auto it = pending_writes_callbacks_.find(batch_id);
  if (it != pending_writes_callbacks_.end()) {
    for (const auto& callback : it->second) {
      callback(Status::OK());
    }

    pending_writes_callbacks_.erase(it);
  }
}

void SyncEngine::FailOutstandingPendingWriteCallbacks(
    const std::string& message) {
  for (const auto& entry : pending_writes_callbacks_) {
    for (const auto& callback : entry.second) {
      callback(Status(Error::kErrorCancelled, message));
    }
  }

  pending_writes_callbacks_.clear();
}

void SyncEngine::EmitNewSnapshotsAndNotifyLocalStore(
    const DocumentMap& changes,
    const absl::optional<RemoteEvent>& maybe_remote_event) {
  std::vector<ViewSnapshot> new_snapshots;
  std::vector<LocalViewChanges> document_changes_in_all_views;

  for (const auto& entry : query_views_by_query_) {
    const auto& query_view = entry.second;
    View& view = query_view->view();
    ViewDocumentChanges view_doc_changes = view.ComputeDocumentChanges(changes);
    if (view_doc_changes.needs_refill()) {
      // The query has a limit and some docs were removed/updated, so we need to
      // re-run the query against the local store to make sure we didn't lose
      // any good docs that had been past the limit.
      QueryResult query_result = local_store_->ExecuteQuery(
          query_view->query(), /* use_previous_results= */ false);
      view_doc_changes = view.ComputeDocumentChanges(query_result.documents(),
                                                     view_doc_changes);
    }

    absl::optional<TargetChange> target_changes;
    if (maybe_remote_event.has_value()) {
      const RemoteEvent& remote_event = maybe_remote_event.value();
      auto it = remote_event.target_changes().find(query_view->target_id());
      if (it != remote_event.target_changes().end()) {
        target_changes = it->second;
      }
    }
    ViewChange view_change =
        view.ApplyChanges(view_doc_changes, target_changes);

    UpdateTrackedLimboDocuments(view_change.limbo_changes(),
                                query_view->target_id());

    if (view_change.snapshot().has_value()) {
      new_snapshots.push_back(*view_change.snapshot());
      LocalViewChanges doc_changes = LocalViewChanges::FromViewSnapshot(
          *view_change.snapshot(), query_view->target_id());
      document_changes_in_all_views.push_back(std::move(doc_changes));
    }
  }

  sync_engine_callback_->OnViewSnapshots(std::move(new_snapshots));
  local_store_->NotifyLocalViewChanges(document_changes_in_all_views);
}

void SyncEngine::UpdateTrackedLimboDocuments(
    const std::vector<LimboDocumentChange>& limbo_changes, TargetId target_id) {
  for (const LimboDocumentChange& limbo_change : limbo_changes) {
    switch (limbo_change.type()) {
      case LimboDocumentChange::Type::Added:
        limbo_document_refs_.AddReference(limbo_change.key(), target_id);
        TrackLimboChange(limbo_change);
        break;

      case LimboDocumentChange::Type::Removed:
        LOG_DEBUG("Document no longer in limbo: %s",
                  limbo_change.key().ToString());
        limbo_document_refs_.RemoveReference(limbo_change.key(), target_id);
        if (!limbo_document_refs_.ContainsKey(limbo_change.key())) {
          // We removed the last reference for this key
          RemoveLimboTarget(limbo_change.key());
        }
        break;

      default:
        HARD_FAIL("Unknown limbo change type: %s", limbo_change.type());
    }
  }
}

void SyncEngine::TrackLimboChange(const LimboDocumentChange& limbo_change) {
  const DocumentKey& key = limbo_change.key();
  if (active_limbo_targets_by_key_.find(key) ==
          active_limbo_targets_by_key_.end() &&
      enqueued_limbo_resolutions_.push_back(key)) {
    LOG_DEBUG("New document in limbo: %s", key.ToString());
    PumpEnqueuedLimboResolutions();
  }
}

void SyncEngine::PumpEnqueuedLimboResolutions() {
  while (!enqueued_limbo_resolutions_.empty() &&
         active_limbo_targets_by_key_.size() <
             max_concurrent_limbo_resolutions_) {
    DocumentKey key = enqueued_limbo_resolutions_.front();
    enqueued_limbo_resolutions_.pop_front();
    TargetId limbo_target_id = target_id_generator_.NextId();
    active_limbo_resolutions_by_target_.emplace(limbo_target_id,
                                                LimboResolution{key});
    active_limbo_targets_by_key_.emplace(key, limbo_target_id);
    remote_store_->Listen(TargetData(Query(key.path()).ToTarget(),
                                     limbo_target_id, kIrrelevantSequenceNumber,
                                     QueryPurpose::LimboResolution));
  }
}

void SyncEngine::RemoveLimboTarget(const DocumentKey& key) {
  enqueued_limbo_resolutions_.remove(key);
  auto it = active_limbo_targets_by_key_.find(key);
  if (it == active_limbo_targets_by_key_.end()) {
    // This target already got removed, because the query failed.
    return;
  }

  TargetId limbo_target_id = it->second;
  remote_store_->StopListening(limbo_target_id);
  active_limbo_targets_by_key_.erase(key);
  active_limbo_resolutions_by_target_.erase(limbo_target_id);
  PumpEnqueuedLimboResolutions();
}

absl::optional<BundleLoader> SyncEngine::ReadIntoLoader(
    const bundle::BundleMetadata& metadata,
    bundle::BundleReader& reader,
    api::LoadBundleTask& result_task) {
  BundleLoader loader(local_store_, metadata);
  int64_t current_bytes_read = 0;
  // Breaks when either error happened, or when there is no more element to
  // read.
  while (true) {
    auto element = reader.GetNextElement();
    if (!reader.reader_status().ok()) {
      LOG_WARN("Failed to GetNextElement() from bundle with error %s",
               reader.reader_status().error_message());
      result_task.SetError(reader.reader_status());
      return absl::nullopt;
    }

    // No more elements from reader.
    if (element == nullptr) {
      break;
    }

    int64_t old_bytes_read = current_bytes_read;
    current_bytes_read = reader.bytes_read();
    auto maybe_progress = loader.AddElement(
        std::move(element), current_bytes_read - old_bytes_read);
    if (!maybe_progress.ok()) {
      LOG_WARN("Failed to AddElement() to bundle loader with error %s",
               maybe_progress.status().error_message());
      result_task.SetError(maybe_progress.status());
      return absl::nullopt;
    }

    if (maybe_progress.ValueOrDie().has_value()) {
      result_task.UpdateProgress(maybe_progress.ConsumeValueOrDie().value());
    }
  }

  return loader;
}

void SyncEngine::LoadBundle(std::shared_ptr<bundle::BundleReader> reader,
                            std::shared_ptr<api::LoadBundleTask> result_task) {
  auto bundle_metadata = reader->GetBundleMetadata();
  if (!reader->reader_status().ok()) {
    LOG_WARN("Failed to GetBundleMetadata() for bundle with error %s",
             reader->reader_status().error_message());
    result_task->SetError(reader->reader_status());
    return;
  }

  bool has_newer_bundle = local_store_->HasNewerBundle(bundle_metadata);
  if (has_newer_bundle) {
    result_task->SetSuccess(SuccessProgress(bundle_metadata));
    return;
  }

  result_task->UpdateProgress(InitialProgress(bundle_metadata));
  auto maybe_loader = ReadIntoLoader(bundle_metadata, *reader, *result_task);
  if (!maybe_loader.has_value()) {
    // `ReadIntoLoader` would call `result_task.SetError` should there be an
    // error, so we do not need set it here.
    return;
  }

  util::StatusOr<DocumentMap> changes = maybe_loader.value().ApplyChanges();
  if (!changes.ok()) {
    LOG_WARN("Failed to ApplyChanges() for bundle elements with error %s",
             changes.status().error_message());
    result_task->SetError(changes.status());
    return;
  }

  EmitNewSnapshotsAndNotifyLocalStore(changes.ConsumeValueOrDie(),
                                      absl::nullopt);

  result_task->SetSuccess(SuccessProgress(bundle_metadata));
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
