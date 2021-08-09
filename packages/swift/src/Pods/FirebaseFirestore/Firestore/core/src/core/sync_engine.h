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

#ifndef FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_H_
#define FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_H_

#include <cstddef>
#include <deque>
#include <map>
#include <memory>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#include "Firestore/core/src/api/load_bundle_task.h"
#include "Firestore/core/src/bundle/bundle_loader.h"
#include "Firestore/core/src/bundle/bundle_reader.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/target_id_generator.h"
#include "Firestore/core/src/core/view.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/remote/remote_store.h"
#include "Firestore/core/src/util/random_access_queue.h"
#include "Firestore/core/src/util/status.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {

namespace local {
class LocalStore;
class TargetData;
}  // namespace local

namespace core {

class SyncEngineCallback;
class ViewSnapshot;

/**
 * Interface implemented by `SyncEngine` to receive requests from
 * `EventManager`.
 // PORTING NOTE: This is extracted as an interface to allow gmock to mock
 // sync engine.
 */
class QueryEventSource {
 public:
  virtual ~QueryEventSource() = default;

  virtual void SetCallback(SyncEngineCallback* callback) = 0;

  /**
   * Initiates a new listen. The LocalStore will be queried for initial data
   * and the listen will be sent to the `RemoteStore` to get remote data. The
   * registered SyncEngineCallback will be notified of resulting view
   * snapshots and/or listen errors.
   *
   * @return the target ID assigned to the query.
   */
  virtual model::TargetId Listen(Query query) = 0;

  /** Stops listening to a query previously listened to via `Listen`. */
  virtual void StopListening(const Query& query) = 0;
};

/**
 * SyncEngine is the central controller in the client SDK architecture. It is
 * the glue code between the EventManager, LocalStore, and RemoteStore. Some of
 * SyncEngine's responsibilities include:
 * 1. Coordinating client requests and remote events between the EventManager
 * and the local and remote data stores.
 * 2. Managing a View object for each query, providing the unified view between
 * the local and remote data stores.
 * 3. Notifying the RemoteStore when the LocalStore has new mutations in its
 * queue that need sending to the backend.
 *
 * The SyncEngine’s methods should only ever be called by methods running on our
 * own worker queue.
 */
class SyncEngine : public remote::RemoteStoreCallback, public QueryEventSource {
 public:
  SyncEngine(local::LocalStore* local_store,
             remote::RemoteStore* remote_store,
             const auth::User& initial_user,
             size_t max_concurrent_limbo_resolutions);

  // Implements `QueryEventSource`.
  void SetCallback(SyncEngineCallback* callback) override {
    sync_engine_callback_ = callback;
  }
  model::TargetId Listen(Query query) override;
  void StopListening(const Query& query) override;

  /**
   * Initiates the write of local mutation batch which involves adding the
   * writes to the mutation queue, notifying the remote store about new
   * mutations, and raising events for any changes this write caused. The
   * provided callback will be called once the write has been acked or
   * rejected by the backend (or failed locally for any other reason).
   */
  void WriteMutations(std::vector<model::Mutation>&& mutations,
                      util::StatusCallback callback);

  /**
   * Registers a user callback that is called when all pending mutations at the
   * moment of calling are acknowledged .
   */
  void RegisterPendingWritesCallback(util::StatusCallback callback);

  /**
   * Runs the given transaction block up to retries times and then calls
   * completion.
   *
   * @param retries The number of times to try before giving up.
   * @param worker_queue The queue to dispatch sync engine calls to.
   * @param update_callback The callback to call to execute the user's
   * transaction.
   * @param result_callback The callback to call when the transaction is
   * finished or failed.
   */
  void Transaction(int retries,
                   const std::shared_ptr<util::AsyncQueue>& worker_queue,
                   core::TransactionUpdateCallback update_callback,
                   core::TransactionResultCallback result_callback);

  void HandleCredentialChange(const auth::User& user);

  // Implements `RemoteStoreCallback`
  void ApplyRemoteEvent(const remote::RemoteEvent& remote_event) override;
  void HandleRejectedListen(model::TargetId target_id,
                            util::Status error) override;
  void HandleSuccessfulWrite(model::MutationBatchResult batch_result) override;
  void HandleRejectedWrite(model::BatchId batch_id,
                           util::Status error) override;
  void HandleOnlineStateChange(model::OnlineState online_state) override;
  model::DocumentKeySet GetRemoteKeys(model::TargetId target_id) const override;

  void LoadBundle(std::shared_ptr<bundle::BundleReader> reader,
                  std::shared_ptr<api::LoadBundleTask> result_task);

  // For tests only
  std::map<model::DocumentKey, model::TargetId>
  GetActiveLimboDocumentResolutions() const {
    // Return defensive copy
    return active_limbo_targets_by_key_;
  }

  // For tests only
  std::vector<model::DocumentKey> GetEnqueuedLimboDocumentResolutions() const {
    return enqueued_limbo_resolutions_.elements();
  }

 private:
  /**
   * QueryView contains all of the info that SyncEngine needs to track for a
   * particular query and view.
   */
  class QueryView {
   public:
    QueryView(Query query, model::TargetId target_id, View view)
        : query_(std::move(query)),
          target_id_(target_id),
          view_(std::move(view)) {
    }

    const Query& query() const {
      return query_;
    }

    /**
     * The target ID created by the client that is used in the watch stream to
     * identify this query.
     */
    model::TargetId target_id() const {
      return target_id_;
    }

    /**
     * The view is responsible for computing the final merged truth of what docs
     * are in the query. It gets notified of local and remote changes, and
     * applies the query filters and limits to determine the most correct
     * possible results.
     */
    View& view() {
      return view_;
    }

   private:
    Query query_;
    model::TargetId target_id_;
    View view_;
  };

  /** Tracks a limbo resolution. */
  class LimboResolution {
   public:
    LimboResolution() = default;

    explicit LimboResolution(const model::DocumentKey& key) : key{key} {
    }

    model::DocumentKey key;

    /**
     * Set to true once we've received a document. This is used in
     * RemoteKeysForTarget and ultimately used by `WatchChangeAggregator` to
     * decide whether it needs to manufacture a delete event for the target once
     * the target is CURRENT.
     */
    bool document_received = false;
  };

  void AssertCallbackExists(absl::string_view source);

  ViewSnapshot InitializeViewAndComputeSnapshot(const Query& query,
                                                model::TargetId target_id);

  void RemoveAndCleanupTarget(model::TargetId target_id, util::Status status);

  void RemoveLimboTarget(const model::DocumentKey& key);

  void EmitNewSnapshotsAndNotifyLocalStore(
      const model::DocumentMap& changes,
      const absl::optional<remote::RemoteEvent>& maybe_remote_event);

  /** Updates the limbo document state for the given target_id. */
  void UpdateTrackedLimboDocuments(
      const std::vector<LimboDocumentChange>& limbo_changes,
      model::TargetId target_id);

  void TrackLimboChange(const LimboDocumentChange& limbo_change);

  /**
   * Starts listens for documents in limbo that are enqueued for resolution,
   * subject to a maximum number of concurrent resolutions.
   *
   * The maximum number of concurrent limbo resolutions is defined in
   * max_concurrent_limbo_resolutions_.
   *
   * Without bounding the number of concurrent resolutions, the server can fail
   * with "resource exhausted" errors which can lead to pathological client
   * behavior as seen in https://github.com/firebase/firebase-js-sdk/issues/2683
   */
  void PumpEnqueuedLimboResolutions();

  void NotifyUser(model::BatchId batch_id, util::Status status);

  /**
   * Triggers callbacks waiting for this batch id to get acknowledged by
   * server, if there are any.
   */
  void TriggerPendingWriteCallbacks(model::BatchId batch_id);
  void FailOutstandingPendingWriteCallbacks(const std::string& message);

  absl::optional<bundle::BundleLoader> ReadIntoLoader(
      const bundle::BundleMetadata& metadata,
      bundle::BundleReader& reader,
      api::LoadBundleTask& result_task);

  /** The local store, used to persist mutations and cached documents. */
  local::LocalStore* local_store_ = nullptr;

  /** The remote store for sending writes, watches, etc. to the backend. */
  remote::RemoteStore* remote_store_ = nullptr;

  auth::User current_user_;
  SyncEngineCallback* sync_engine_callback_ = nullptr;

  /**
   * Used for creating the TargetId for the listens used to resolve limbo
   * documents.
   */
  TargetIdGenerator target_id_generator_;

  /** Stores user completion blocks, indexed by User and BatchId. */
  std::unordered_map<auth::User,
                     std::unordered_map<model::BatchId, util::StatusCallback>,
                     auth::HashUser>
      mutation_callbacks_;

  /** Stores user callbacks waiting for pending writes to be acknowledged. */
  std::unordered_map<model::BatchId, std::vector<util::StatusCallback>>
      pending_writes_callbacks_;

  // Shared pointers are used to avoid creating and storing two copies of the
  // same `QueryView` and for consistency with other platforms.
  /** QueryViews for all active queries, indexed by query. */
  std::unordered_map<Query, std::shared_ptr<QueryView>> query_views_by_query_;

  /** Queries mapped to Targets, indexed by target ID. */
  std::unordered_map<model::TargetId, std::vector<Query>> queries_by_target_;

  const size_t max_concurrent_limbo_resolutions_;

  /**
   * The keys of documents that are in limbo for which we haven't yet started a
   * limbo resolution query.
   */
  util::RandomAccessQueue<model::DocumentKey, model::DocumentKeyHash>
      enqueued_limbo_resolutions_;

  /**
   * Keeps track of the target ID for each document that is in limbo with an
   * active target.
   */
  std::map<model::DocumentKey, model::TargetId> active_limbo_targets_by_key_;

  /**
   * Keeps track of the information about an active limbo resolution for each
   * active target ID that was started for the purpose of limbo resolution.
   */
  std::map<model::TargetId, LimboResolution>
      active_limbo_resolutions_by_target_;

  /** Used to track any documents that are currently in limbo. */
  local::ReferenceSet limbo_document_refs_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_SYNC_ENGINE_H_
