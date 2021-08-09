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

#include "Firestore/core/src/remote/remote_store.h"

#include <string>
#include <utility>

#include "Firestore/core/src/core/transaction.h"
#include "Firestore/core/src/local/local_store.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/mutation_batch_result.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/to_string.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace remote {

using core::Transaction;
using local::LocalStore;
using local::QueryPurpose;
using local::TargetData;
using model::BatchId;
using model::DocumentKeySet;
using model::kBatchIdUnknown;
using model::MutationBatch;
using model::MutationBatchResult;
using model::MutationResult;
using model::OnlineState;
using model::SnapshotVersion;
using model::TargetId;
using nanopb::ByteString;
using util::AsyncQueue;
using util::Status;

/**
 * The maximum number of pending writes to allow.
 * TODO(b/35853402): Negotiate this value with the backend.
 */
constexpr int kMaxPendingWrites = 10;

RemoteStore::RemoteStore(
    LocalStore* local_store,
    std::shared_ptr<Datastore> datastore,
    const std::shared_ptr<util::AsyncQueue>& worker_queue,
    ConnectivityMonitor* connectivity_monitor,
    std::function<void(model::OnlineState)> online_state_handler)
    : local_store_{local_store},
      datastore_{std::move(datastore)},
      online_state_tracker_{worker_queue, std::move(online_state_handler)},
      connectivity_monitor_{NOT_NULL(connectivity_monitor)} {
  datastore_->Start();

  // Create streams (but note they're not started yet)
  watch_stream_ = datastore_->CreateWatchStream(this);
  write_stream_ = datastore_->CreateWriteStream(this);
}

void RemoteStore::Start() {
  // For now, all setup is handled by `EnableNetwork`. We might expand on this
  // in the future.
  EnableNetwork();

  connectivity_monitor_->AddCallback(
      [this](ConnectivityMonitor::NetworkStatus network_status) {
        if (network_status == ConnectivityMonitor::NetworkStatus::Unavailable) {
          LOG_DEBUG(
              "RemoteStore %s ignoring connectivity callback for unavailable "
              "network",
              this);
          return;
        }

        if (CanUseNetwork()) {
          LOG_DEBUG("RemoteStore %s restarting streams as connectivity changed",
                    this);
          RestartNetwork();
        }
      });
}

void RemoteStore::EnableNetwork() {
  is_network_enabled_ = true;

  if (CanUseNetwork()) {
    // Load any saved stream token from persistent storage
    write_stream_->set_last_stream_token(local_store_->GetLastStreamToken());

    if (ShouldStartWatchStream()) {
      StartWatchStream();
    } else {
      online_state_tracker_.UpdateState(OnlineState::Unknown);
    }

    // This will start the write stream if necessary.
    FillWritePipeline();
  }
}

void RemoteStore::DisableNetwork() {
  is_network_enabled_ = false;
  DisableNetworkInternal();

  // Set the OnlineState to Offline so get()s return from cache, etc.
  online_state_tracker_.UpdateState(OnlineState::Offline);
}

void RemoteStore::DisableNetworkInternal() {
  watch_stream_->Stop();
  write_stream_->Stop();

  if (!write_pipeline_.empty()) {
    LOG_DEBUG("Stopping write stream with %s pending writes",
              write_pipeline_.size());
    write_pipeline_.clear();
  }

  CleanUpWatchStreamState();
}

void RemoteStore::Shutdown() {
  LOG_DEBUG("RemoteStore %s shutting down", this);
  is_network_enabled_ = false;
  DisableNetworkInternal();

  // Set the `OnlineState` to `Unknown` (rather than `Offline`) to avoid
  // potentially triggering spurious listener events with cached data, etc.
  online_state_tracker_.UpdateState(OnlineState::Unknown);

  datastore_->Shutdown();
}

// Watch Stream

void RemoteStore::Listen(const TargetData& target_data) {
  TargetId target_key = target_data.target_id();
  if (listen_targets_.find(target_key) != listen_targets_.end()) {
    return;
  }

  // Mark this as something the client is currently listening for.
  listen_targets_[target_key] = target_data;

  if (ShouldStartWatchStream()) {
    // The listen will be sent in `OnWatchStreamOpen`
    StartWatchStream();
  } else if (watch_stream_->IsOpen()) {
    SendWatchRequest(target_data);
  }
}

void RemoteStore::StopListening(TargetId target_id) {
  size_t num_erased = listen_targets_.erase(target_id);
  HARD_ASSERT(num_erased == 1,
              "StopListening: target not currently watched: %s", target_id);

  // The watch stream might not be started if we're in a disconnected state
  if (watch_stream_->IsOpen()) {
    SendUnwatchRequest(target_id);
  }
  if (listen_targets_.empty()) {
    if (watch_stream_->IsOpen()) {
      watch_stream_->MarkIdle();
    } else if (CanUseNetwork()) {
      // Revert to `OnlineState::Unknown` if the watch stream is not open and we
      // have no listeners, since without any listens to send we cannot confirm
      // if the stream is healthy and upgrade to `OnlineState::Online`.
      online_state_tracker_.UpdateState(OnlineState::Unknown);
    }
  }
}

void RemoteStore::SendWatchRequest(const TargetData& target_data) {
  // We need to increment the the expected number of pending responses we're due
  // from watch so we wait for the ack to process any messages from this target.
  watch_change_aggregator_->RecordPendingTargetRequest(target_data.target_id());
  watch_stream_->WatchQuery(target_data);
}

void RemoteStore::SendUnwatchRequest(TargetId target_id) {
  // We need to increment the expected number of pending responses we're due
  // from watch so we wait for the removal on the server before we process any
  // messages from this target.
  watch_change_aggregator_->RecordPendingTargetRequest(target_id);
  watch_stream_->UnwatchTargetId(target_id);
}

bool RemoteStore::ShouldStartWatchStream() const {
  return CanUseNetwork() && !watch_stream_->IsStarted() &&
         !listen_targets_.empty();
}

void RemoteStore::StartWatchStream() {
  HARD_ASSERT(ShouldStartWatchStream(),
              "StartWatchStream called when ShouldStartWatchStream is false.");
  watch_change_aggregator_ = absl::make_unique<WatchChangeAggregator>(this);
  watch_stream_->Start();

  online_state_tracker_.HandleWatchStreamStart();
}

void RemoteStore::CleanUpWatchStreamState() {
  watch_change_aggregator_.reset();
}

void RemoteStore::OnWatchStreamOpen() {
  // Restore any existing watches.
  for (const auto& kv : listen_targets_) {
    SendWatchRequest(kv.second);
  }
}

void RemoteStore::OnWatchStreamClose(const Status& status) {
  if (status.ok()) {
    // Graceful stop (due to Stop() or idle timeout). Make sure that's
    // desirable.
    HARD_ASSERT(!ShouldStartWatchStream(),
                "Watch stream was stopped gracefully while still needed.");
  }

  CleanUpWatchStreamState();

  // If we still need the watch stream, retry the connection.
  if (ShouldStartWatchStream()) {
    online_state_tracker_.HandleWatchStreamFailure(status);

    StartWatchStream();
  } else {
    // We don't need to restart the watch stream because there are no active
    // targets. The online state is set to unknown because there is no active
    // attempt at establishing a connection.
    online_state_tracker_.UpdateState(OnlineState::Unknown);
  }
}

void RemoteStore::OnWatchStreamChange(const WatchChange& change,
                                      const SnapshotVersion& snapshot_version) {
  // Mark the connection as Online because we got a message from the server.
  online_state_tracker_.UpdateState(OnlineState::Online);

  if (change.type() == WatchChange::Type::TargetChange) {
    const WatchTargetChange& watch_target_change =
        static_cast<const WatchTargetChange&>(change);
    if (watch_target_change.state() == WatchTargetChangeState::Removed &&
        !watch_target_change.cause().ok()) {
      // There was an error on a target, don't wait for a consistent snapshot to
      // raise events
      return ProcessTargetError(watch_target_change);
    } else {
      watch_change_aggregator_->HandleTargetChange(watch_target_change);
    }
  } else if (change.type() == WatchChange::Type::Document) {
    watch_change_aggregator_->HandleDocumentChange(
        static_cast<const DocumentWatchChange&>(change));
  } else {
    HARD_ASSERT(
        change.type() == WatchChange::Type::ExistenceFilter,
        "Expected WatchChange to be an instance of ExistenceFilterWatchChange");
    watch_change_aggregator_->HandleExistenceFilter(
        static_cast<const ExistenceFilterWatchChange&>(change));
  }

  if (snapshot_version != SnapshotVersion::None() &&
      snapshot_version >= local_store_->GetLastRemoteSnapshotVersion()) {
    // We have received a target change with a global snapshot if the snapshot
    // version is not equal to `SnapshotVersion::None()`.
    RaiseWatchSnapshot(snapshot_version);
  }
}

void RemoteStore::RaiseWatchSnapshot(const SnapshotVersion& snapshot_version) {
  HARD_ASSERT(snapshot_version != SnapshotVersion::None(),
              "Can't raise event for unknown SnapshotVersion");

  RemoteEvent remote_event =
      watch_change_aggregator_->CreateRemoteEvent(snapshot_version);

  // Update in-memory resume tokens. `LocalStore` will update the persistent
  // view of these when applying the completed `RemoteEvent`.
  for (const auto& entry : remote_event.target_changes()) {
    const TargetChange& target_change = entry.second;
    const ByteString& resume_token = target_change.resume_token();

    if (!resume_token.empty()) {
      TargetId target_id = entry.first;
      auto found = listen_targets_.find(target_id);
      absl::optional<TargetData> target_data;
      if (found != listen_targets_.end()) {
        target_data = found->second;
      }

      // A watched target might have been removed already.
      if (target_data) {
        listen_targets_[target_id] =
            target_data->WithResumeToken(resume_token, snapshot_version);
      }
    }
  }

  // Re-establish listens for the targets that have been invalidated by
  // existence filter mismatches.
  for (TargetId target_id : remote_event.target_mismatches()) {
    auto found = listen_targets_.find(target_id);
    if (found == listen_targets_.end()) {
      // A watched target might have been removed already.
      continue;
    }
    TargetData target_data = found->second;

    // Clear the resume token for the query, since we're in a known mismatch
    // state.
    target_data =
        TargetData(target_data.target(), target_id,
                   target_data.sequence_number(), target_data.purpose());
    listen_targets_[target_id] = target_data;

    // Cause a hard reset by unwatching and rewatching immediately, but
    // deliberately don't send a resume token so that we get a full update.
    SendUnwatchRequest(target_id);

    // Mark the query we send as being on behalf of an existence filter
    // mismatch, but don't actually retain that in listen_targets_. This ensures
    // that we flag the first re-listen this way without impacting future
    // listens of this target (that might happen e.g. on reconnect).
    TargetData request_target_data(target_data.target(), target_id,
                                   target_data.sequence_number(),
                                   QueryPurpose::ExistenceFilterMismatch);
    SendWatchRequest(request_target_data);
  }

  // Finally handle remote event
  sync_engine_->ApplyRemoteEvent(remote_event);
}

void RemoteStore::ProcessTargetError(const WatchTargetChange& change) {
  HARD_ASSERT(!change.cause().ok(), "Handling target error without a cause");

  // Ignore targets that have been removed already.
  for (TargetId target_id : change.target_ids()) {
    auto found = listen_targets_.find(target_id);
    if (found != listen_targets_.end()) {
      listen_targets_.erase(found);
      watch_change_aggregator_->RemoveTarget(target_id);
      sync_engine_->HandleRejectedListen(target_id, change.cause());
    }
  }
}

// Write Stream

void RemoteStore::FillWritePipeline() {
  BatchId last_batch_id_retrieved = write_pipeline_.empty()
                                        ? kBatchIdUnknown
                                        : write_pipeline_.back().batch_id();
  while (CanAddToWritePipeline()) {
    absl::optional<MutationBatch> batch =
        local_store_->GetNextMutationBatch(last_batch_id_retrieved);
    if (!batch) {
      if (write_pipeline_.empty()) {
        write_stream_->MarkIdle();
      }
      break;
    }
    AddToWritePipeline(*batch);
    last_batch_id_retrieved = batch->batch_id();
  }

  if (ShouldStartWriteStream()) {
    StartWriteStream();
  }
}

bool RemoteStore::CanAddToWritePipeline() const {
  return CanUseNetwork() && write_pipeline_.size() < kMaxPendingWrites;
}

void RemoteStore::AddToWritePipeline(const MutationBatch& batch) {
  HARD_ASSERT(CanAddToWritePipeline(),
              "AddToWritePipeline called when pipeline is full");

  write_pipeline_.push_back(batch);

  if (write_stream_->IsOpen() && write_stream_->handshake_complete()) {
    write_stream_->WriteMutations(batch.mutations());
  }
}

bool RemoteStore::ShouldStartWriteStream() const {
  return CanUseNetwork() && !write_stream_->IsStarted() &&
         !write_pipeline_.empty();
}

void RemoteStore::StartWriteStream() {
  HARD_ASSERT(ShouldStartWriteStream(),
              "StartWriteStream called when ShouldStartWriteStream is false.");
  write_stream_->Start();
}

void RemoteStore::OnWriteStreamOpen() {
  write_stream_->WriteHandshake();
}

void RemoteStore::OnWriteStreamHandshakeComplete() {
  // Record the stream token.
  local_store_->SetLastStreamToken(write_stream_->last_stream_token());

  // Send the write pipeline now that the stream is established.
  for (const MutationBatch& write : write_pipeline_) {
    write_stream_->WriteMutations(write.mutations());
  }
}

void RemoteStore::OnWriteStreamMutationResult(
    SnapshotVersion commit_version,
    std::vector<MutationResult> mutation_results) {
  // This is a response to a write containing mutations and should be correlated
  // to the first write in our write pipeline.
  HARD_ASSERT(!write_pipeline_.empty(), "Got result for empty write pipeline");

  MutationBatch batch = write_pipeline_.front();
  write_pipeline_.erase(write_pipeline_.begin());

  MutationBatchResult batch_result(std::move(batch), commit_version,
                                   std::move(mutation_results),
                                   write_stream_->last_stream_token());
  sync_engine_->HandleSuccessfulWrite(std::move(batch_result));

  // It's possible that with the completion of this mutation another slot has
  // freed up.
  FillWritePipeline();
}

void RemoteStore::OnWriteStreamClose(const Status& status) {
  if (status.ok()) {
    // Graceful stop (due to Stop() or idle timeout). Make sure that's
    // desirable.
    HARD_ASSERT(!ShouldStartWriteStream(),
                "Write stream was stopped gracefully while still needed.");
  }

  // If the write stream closed due to an error, invoke the error callbacks if
  // there are pending writes.
  if (!status.ok() && !write_pipeline_.empty()) {
    // TODO(varconst): handle UNAUTHENTICATED status, see
    // go/firestore-client-errors
    if (write_stream_->handshake_complete()) {
      // This error affects the actual writes.
      HandleWriteError(status);
    } else {
      // If there was an error before the handshake finished, it's possible that
      // the server is unable to process the stream token we're sending.
      // (Perhaps it's too old?)
      HandleHandshakeError(status);
    }
  }

  // The write stream might have been started by refilling the write pipeline
  // for failed writes
  if (ShouldStartWriteStream()) {
    StartWriteStream();
  }
}

void RemoteStore::HandleHandshakeError(const Status& status) {
  HARD_ASSERT(!status.ok(), "Handling write error with status OK.");

  // Reset the token if it's a permanent error, signaling the write stream is
  // no longer valid. Note that the handshake does not count as a write: see
  // comments on `Datastore::IsPermanentWriteError` for details.
  if (Datastore::IsPermanentError(status)) {
    std::string token = util::ToString(write_stream_->last_stream_token());
    LOG_DEBUG(
        "RemoteStore %s error before completed handshake; resetting "
        "stream token %s: "
        "error code: '%s', details: '%s'",
        this, token, status.code(), status.error_message());
    write_stream_->set_last_stream_token({});
    local_store_->SetLastStreamToken({});
  } else {
    // Some other error, don't reset stream token. Our stream logic will just
    // retry with exponential backoff.
  }
}

void RemoteStore::HandleWriteError(const Status& status) {
  HARD_ASSERT(!status.ok(), "Handling write error with status OK.");

  // Only handle permanent errors here. If it's transient, just let the retry
  // logic kick in.
  if (!Datastore::IsPermanentWriteError(status)) {
    return;
  }

  // If this was a permanent error, the request itself was the problem so it's
  // not going to succeed if we resend it.
  MutationBatch batch = write_pipeline_.front();
  write_pipeline_.erase(write_pipeline_.begin());

  // In this case it's also unlikely that the server itself is melting
  // down--this was just a bad request so inhibit backoff on the next restart.
  write_stream_->InhibitBackoff();

  sync_engine_->HandleRejectedWrite(batch.batch_id(), status);

  // It's possible that with the completion of this mutation another slot has
  // freed up.
  FillWritePipeline();
}

bool RemoteStore::CanUseNetwork() const {
  // PORTING NOTE: This method exists mostly because web also has to take into
  // account primary vs. secondary state.
  return is_network_enabled_;
}

std::shared_ptr<Transaction> RemoteStore::CreateTransaction() {
  return std::make_shared<Transaction>(datastore_.get());
}

DocumentKeySet RemoteStore::GetRemoteKeysForTarget(TargetId target_id) const {
  return sync_engine_->GetRemoteKeys(target_id);
}

absl::optional<TargetData> RemoteStore::GetTargetDataForTarget(
    TargetId target_id) const {
  auto found = listen_targets_.find(target_id);
  return found != listen_targets_.end() ? found->second
                                        : absl::optional<TargetData>{};
}

void RemoteStore::RestartNetwork() {
  is_network_enabled_ = false;
  DisableNetworkInternal();
  online_state_tracker_.UpdateState(OnlineState::Unknown);
  write_stream_->InhibitBackoff();
  watch_stream_->InhibitBackoff();
  EnableNetwork();
}

void RemoteStore::HandleCredentialChange() {
  if (CanUseNetwork()) {
    // Tear down and re-create our network streams. This will ensure we get a
    // fresh auth token for the new user and re-fill the write pipeline with new
    // mutations from the `LocalStore` (since mutations are per-user).
    LOG_DEBUG("RemoteStore %s restarting streams for new credential", this);
    RestartNetwork();
  }
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
