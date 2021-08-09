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

#ifndef FIRESTORE_CORE_SRC_REMOTE_REMOTE_STORE_H_
#define FIRESTORE_CORE_SRC_REMOTE_REMOTE_STORE_H_

#include <memory>
#include <unordered_map>
#include <vector>

#include "Firestore/core/src/core/transaction.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/remote/datastore.h"
#include "Firestore/core/src/remote/online_state_tracker.h"
#include "Firestore/core/src/remote/remote_event.h"
#include "Firestore/core/src/remote/watch_change.h"
#include "Firestore/core/src/remote/watch_stream.h"
#include "Firestore/core/src/remote/write_stream.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {

namespace local {
class LocalStore;
}  // namespace local

namespace remote {

class ConnectivityMonitor;

/**
 * A callback interface for events from remote store.
 */
class RemoteStoreCallback {
 public:
  virtual ~RemoteStoreCallback() = default;

  /**
   * Applies a remote event to the sync engine, notifying any views of the
   * changes, and releasing any pending mutation batches that would become
   * visible because of the snapshot version the remote event contains.
   */
  virtual void ApplyRemoteEvent(const RemoteEvent& remote_event) = 0;

  /**
   * Handles rejection of listen for the given target id. This can be triggered
   * by the backend for any active target.
   *
   * @param target_id The target ID corresponding to a listen initiated via
   * RemoteStore::Listen()
   * @param error A description of the condition that has forced the rejection.
   * Nearly always this will be an indication that the user is no longer
   * authorized to see the data matching the target.
   */
  virtual void HandleRejectedListen(model::TargetId target_id,
                                    util::Status error) = 0;

  /**
   * Applies the result of a successful write of a mutation batch to the sync
   * engine, emitting snapshots in any views that the mutation applies to, and
   * removing the batch from the mutation queue.
   */
  virtual void HandleSuccessfulWrite(
      model::MutationBatchResult batch_result) = 0;

  /**
   * Rejects the batch, removing the batch from the mutation queue, recomputing
   * the local view of any documents affected by the batch and then, emitting
   * snapshots with the reverted value.
   */
  virtual void HandleRejectedWrite(model::BatchId batch_id,
                                   util::Status error) = 0;

  /**
   * Applies an OnlineState change to the sync engine and notifies any views of
   * the change.
   */
  virtual void HandleOnlineStateChange(model::OnlineState online_state) = 0;

  /**
   * Returns the set of remote document keys for the given target ID. This list
   * includes the documents that were assigned to the target when we received
   * the last snapshot.
   */
  virtual model::DocumentKeySet GetRemoteKeys(
      model::TargetId target_id) const = 0;
};

class RemoteStore : public TargetMetadataProvider,
                    public WatchStreamCallback,
                    public WriteStreamCallback {
 public:
  RemoteStore(local::LocalStore* local_store,
              std::shared_ptr<Datastore> datastore,
              const std::shared_ptr<util::AsyncQueue>& worker_queue,
              ConnectivityMonitor* connectivity_monitor,
              std::function<void(model::OnlineState)> online_state_handler);

  void set_sync_engine(RemoteStoreCallback* sync_engine) {
    sync_engine_ = sync_engine;
  }

  /**
   * Starts up the remote store, creating streams, restoring state from
   * `LocalStore`, etc.
   */
  void Start();

  /**
   * Shuts down the remote store, tearing down connections and otherwise
   * cleaning up.
   */
  void Shutdown();

  /**
   * Temporarily disables the network. The network can be re-enabled using
   * 'EnableNetwork'.
   */
  void DisableNetwork();

  /**
   * Re-enables the network. Only to be called as the counterpart to
   * 'DisableNetwork'.
   */
  void EnableNetwork();

  bool CanUseNetwork() const;

  /**
   * Tells the `RemoteStore` that the currently authenticated user has changed.
   *
   * In response the remote store tears down streams and clears up any tracked
   * operations that should not persist across users. Restarts the streams if
   * appropriate.
   */
  void HandleCredentialChange();

  /**
   * Listens to the target identified by the given `TargetData`.
   *
   * It is a no-op if the target of the given target data is already being
   * listened to.
   */
  void Listen(const local::TargetData& target_data);

  /**
   * Stops listening to the target with the given target ID.
   *
   * It is an error if the given target id is not being listened to.
   */
  void StopListening(model::TargetId target_id);

  /**
   * Attempts to fill our write pipeline with writes from the `LocalStore`.
   *
   * Called internally to bootstrap or refill the write pipeline and by
   * `SyncEngine` whenever there are new mutations to process.
   *
   * Starts the write stream if necessary.
   */
  void FillWritePipeline();

  /**
   * Queues additional writes to be sent to the write stream, sending them
   * immediately if the write stream is established.
   */
  void AddToWritePipeline(const model::MutationBatch& batch);

  /** Returns a new transaction backed by this remote store. */
  // TODO(c++14): return a plain value when it becomes possible to move
  // `Transaction` into lambdas.
  std::shared_ptr<core::Transaction> CreateTransaction();

  model::DocumentKeySet GetRemoteKeysForTarget(
      model::TargetId target_id) const override;
  absl::optional<local::TargetData> GetTargetDataForTarget(
      model::TargetId target_id) const override;

  void OnWatchStreamOpen() override;
  void OnWatchStreamChange(
      const WatchChange& change,
      const model::SnapshotVersion& snapshot_version) override;
  void OnWatchStreamClose(const util::Status& status) override;

  void OnWriteStreamOpen() override;
  void OnWriteStreamHandshakeComplete() override;
  void OnWriteStreamClose(const util::Status& status) override;
  void OnWriteStreamMutationResult(
      model::SnapshotVersion commit_version,
      std::vector<model::MutationResult> mutation_results) override;

 private:
  void RestartNetwork();
  void DisableNetworkInternal();

  void SendWatchRequest(const local::TargetData& target_data);
  void SendUnwatchRequest(model::TargetId target_id);

  /**
   * Takes a batch of changes from the `Datastore`, repackages them as a
   * `RemoteEvent`, and passes that on to the `SyncEngine`.
   */
  void RaiseWatchSnapshot(const model::SnapshotVersion& snapshot_version);

  /** Process a target error and passes the error along to `SyncEngine`. */
  void ProcessTargetError(const WatchTargetChange& change);

  /**
   * Returns true if we can add to the write pipeline (i.e. it is not full and
   * the network is enabled).
   */
  bool CanAddToWritePipeline() const;

  void StartWriteStream();

  /**
   * Returns true if the network is enabled, the write stream has not yet been
   * started and there are pending writes.
   */
  bool ShouldStartWriteStream() const;

  void HandleHandshakeError(const util::Status& status);
  void HandleWriteError(const util::Status& status);

  void StartWatchStream();

  /**
   * Returns true if the network is enabled, the watch stream has not yet been
   * started and there are active watch targets.
   */
  bool ShouldStartWatchStream() const;

  void CleanUpWatchStreamState();

  RemoteStoreCallback* sync_engine_ = nullptr;

  /**
   * The local store, used to fill the write pipeline with outbound mutations
   * and resolve existence filter mismatches.
   */
  local::LocalStore* local_store_ = nullptr;

  /** The client-side proxy for interacting with the backend. */
  std::shared_ptr<Datastore> datastore_;

  /**
   * A mapping of watched targets that the client cares about tracking and the
   * user has explicitly called a 'listen' for this target.
   *
   * These targets may or may not have been sent to or acknowledged by the
   * server. On re-establishing the listen stream, these targets should be sent
   * to the server. The targets removed with unlistens are removed eagerly
   * without waiting for confirmation from the listen stream.
   */
  std::unordered_map<model::TargetId, local::TargetData> listen_targets_;

  OnlineStateTracker online_state_tracker_;

  ConnectivityMonitor* connectivity_monitor_ = nullptr;

  /**
   * Set to true by `EnableNetwork` and false by `DisableNetwork` and indicates
   * the user-preferred network state.
   */
  bool is_network_enabled_ = false;

  std::shared_ptr<WatchStream> watch_stream_;
  std::shared_ptr<WriteStream> write_stream_;
  std::unique_ptr<WatchChangeAggregator> watch_change_aggregator_;

  /**
   * A list of up to `kMaxPendingWrites` writes that we have fetched from the
   * `LocalStore` via `FillWritePipeline` and have or will send to the write
   * stream.
   *
   * Whenever `write_pipeline_` is not empty, the `RemoteStore` will attempt to
   * start or restart the write stream. When the stream is established, the
   * writes in the pipeline will be sent in order.
   *
   * Writes remain in `write_pipeline_` until they are acknowledged by the
   * backend and thus will automatically be re-sent if the stream is interrupted
   * / restarted before they're acknowledged.
   *
   * Write responses from the backend are linked to their originating request
   * purely based on order, and so we can just remove writes from the front of
   * the `write_pipeline_` as we receive responses.
   */
  std::vector<model::MutationBatch> write_pipeline_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_REMOTE_STORE_H_
