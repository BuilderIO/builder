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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LOCAL_STORE_H_
#define FIRESTORE_CORE_SRC_LOCAL_LOCAL_STORE_H_

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "Firestore/core/src/bundle/bundle_callback.h"
#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"
#include "Firestore/core/src/core/target_id_generator.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace auth {
class User;
}  // namespace auth

namespace core {
class Query;
}  // namespace core

namespace remote {
class RemoteEvent;
class TargetChange;
}  // namespace remote

namespace local {

class BundleCache;
class LocalDocumentsView;
class LocalViewChanges;
class LocalWriteResult;
class LruGarbageCollector;
class MutationQueue;
class Persistence;
class QueryEngine;
class QueryResult;
class RemoteDocumentCache;
class TargetCache;

struct LruResults;

/**
 * Local storage in the Firestore client. Coordinates persistence components
 * like the mutation queue and remote document cache to present a latency
 * compensated view of stored data.
 *
 * The LocalStore is responsible for accepting mutations from the SyncEngine.
 * Writes from the client are put into a queue as provisional Mutations until
 * they are processed by the RemoteStore and confirmed as having been written to
 * the server.
 *
 * The local store provides the local version of documents that have been
 * modified locally. It maintains the constraint:
 *
 *  LocalDocument = RemoteDocument + Active(LocalMutations)
 *
 * (Active mutations are those that are enqueued and have not been previously
 * acknowledged or rejected).
 *
 * The RemoteDocument ("ground truth") state is provided via the
 * ApplyChangeBatch method. It will be some version of a server-provided
 * document OR will be a server-provided document PLUS acknowledged mutations:
 *
 *  RemoteDocument' = RemoteDocument + Acknowledged(LocalMutations)
 *
 * Note that this "dirty" version of a RemoteDocument will not be identical to a
 * server base version, since it has LocalMutations added to it pending getting
 * an authoritative copy from the server.
 *
 * Since LocalMutations can be rejected by the server, we have to be able to
 * revert a LocalMutation that has already been applied to the LocalDocument
 * (typically done by replaying all remaining LocalMutations to the
 * RemoteDocument to re-apply).
 *
 * It also maintains the persistence of mapping queries to resume tokens and
 * target ids.
 *
 * The LocalStore must be able to efficiently execute queries against its local
 * cache of the documents, to provide the initial set of results before any
 * remote changes have been received.
 */
class LocalStore : public bundle::BundleCallback {
 public:
  LocalStore(Persistence* persistence,
             QueryEngine* query_engine,
             const auth::User& initial_user);

  ~LocalStore();

  /** Performs any initial startup actions required by the local store. */
  void Start();

  /**
   * Tells the LocalStore that the currently authenticated user has changed.
   *
   * In response the local store switches the mutation queue to the new user and
   * returns any resulting document changes.
   */
  model::DocumentMap HandleUserChange(const auth::User& user);

  /** Accepts locally generated Mutations and commits them to storage. */
  LocalWriteResult WriteLocally(std::vector<model::Mutation>&& mutations);

  /**
   * Returns the current value of a document with a given key, or an invalid
   * document if not found.
   */
  const model::Document ReadDocument(const model::DocumentKey& key);

  /**
   * Acknowledges the given batch.
   *
   * On the happy path when a batch is acknowledged, the local store will:
   *
   * + remove the batch from the mutation queue;
   * + apply the changes to the remote document cache;
   * + recalculate the latency compensated view implied by those changes (there
   * may be mutations in the queue that affect the documents but haven't been
   * acknowledged yet); and
   * + give the changed documents back the sync engine
   *
   * @return The resulting (modified) documents.
   */
  model::DocumentMap AcknowledgeBatch(
      const model::MutationBatchResult& batch_result);

  /**
   * Removes mutations from the MutationQueue for the specified batch.
   * LocalDocuments will be recalculated.
   *
   * @return The resulting (modified) documents.
   */
  model::DocumentMap RejectBatch(model::BatchId batch_id);

  /** Returns the last recorded stream token for the current user. */
  nanopb::ByteString GetLastStreamToken();

  /**
   * Sets the stream token for the current user without acknowledging any
   * mutation batch. This is usually only useful after a stream handshake or in
   * response to an error that requires clearing the stream token.
   */
  void SetLastStreamToken(const nanopb::ByteString& stream_token);

  /**
   * Returns the last consistent snapshot processed (used by the RemoteStore to
   * determine whether to buffer incoming snapshots from the backend).
   */
  const model::SnapshotVersion& GetLastRemoteSnapshotVersion() const;

  /**
   * Updates the "ground-state" (remote) documents. We assume that the remote
   * event reflects any write batches that have been acknowledged or rejected
   * (i.e. we do not re-apply local mutations to updates from this event).
   *
   * LocalDocuments are re-calculated if there are remaining mutations in the
   * queue.
   */
  model::DocumentMap ApplyRemoteEvent(const remote::RemoteEvent& remote_event);

  /**
   * Returns the keys of the documents that are associated with the given
   * target_id in the remote table.
   */
  model::DocumentKeySet GetRemoteDocumentKeys(model::TargetId target_id);

  /**
   * Assigns a target an internal ID so that its results can be pinned so they
   * don't get GC'd. A target must be allocated in the local store before the
   * store can be used to manage its view.
   *
   * Allocating an already allocated target will return the existing
   * `TargetData` for that target.
   */
  TargetData AllocateTarget(core::Target target);

  /**
   * Unpin all the documents associated with a target.
   *
   * Releasing a non-existing target is an error.
   */
  void ReleaseTarget(model::TargetId target_id);

  /**
   * Runs the specified query against the local store and returns the results,
   * potentially taking advantage of target data from previous executions (such
   * as the set of remote keys).
   *
   * @param use_previous_results Whether results from previous executions can be
   *     used to optimize this query execution.
   */
  QueryResult ExecuteQuery(const core::Query& query, bool use_previous_results);

  /**
   * Notify the local store of the changed views to locally pin / unpin
   * documents.
   */
  void NotifyLocalViewChanges(
      const std::vector<LocalViewChanges>& view_changes);

  /**
   * Gets the mutation batch after the passed in batch_id in the mutation queue
   * or `nullopt` if empty.
   *
   * @param batch_id The batch to search after, or `kBatchIdUnknown` for the
   * first mutation in the queue.
   * @return the next mutation or `nullopt` if there wasn't one.
   */
  absl::optional<model::MutationBatch> GetNextMutationBatch(
      model::BatchId batch_id);

  /**
   * Returns the largest (latest) batch id in mutation queue that is pending
   * server response. Returns `kBatchIdUnknown` if the queue is empty.
   */
  model::BatchId GetHighestUnacknowledgedBatchId();

  LruResults CollectGarbage(LruGarbageCollector* garbage_collector);

  /**
   * Returns whether the given bundle has already been loaded and its create
   * time is newer or equal to the currently loading bundle.
   */
  bool HasNewerBundle(const bundle::BundleMetadata& metadata);

  /** Saves the given `BundleMetadata` to local persistence. */
  void SaveBundle(const bundle::BundleMetadata& metadata) override;

  /**
   * Applies the documents from a bundle to the "ground-state" (remote)
   * documents.
   *
   * Local documents are re-calculated if there are remaining mutations in the
   * queue.
   */
  model::DocumentMap ApplyBundledDocuments(
      const model::MutableDocumentMap& documents,
      const std::string& bundle_id) override;

  /** Saves the given `NamedQuery` to local persistence. */
  void SaveNamedQuery(const bundle::NamedQuery& query,
                      const model::DocumentKeySet& keys) override;

  /**
   * Returns the NameQuery associated with query_name or `nullopt` if not found.
   */
  absl::optional<bundle::NamedQuery> GetNamedQuery(
      const std::string& query_name);

 private:
  friend class LocalStoreTest;  // for `GetTargetData()`

  void StartMutationQueue();
  void ApplyBatchResult(const model::MutationBatchResult& batch_result);

  /**
   * Returns true if the new_target_data should be persisted during an update of
   * an active target. TargetData should always be persisted when a target is
   * being released and should not call this function.
   *
   * While the target is active, TargetData updates can be omitted when nothing
   * about the target has changed except metadata like the resume token or
   * snapshot version. Occasionally it's worth the extra write to prevent these
   * values from getting too stale after a crash, but this doesn't have to be
   * too frequent.
   */
  bool ShouldPersistTargetData(const TargetData& new_target_data,
                               const TargetData& old_target_data,
                               const remote::TargetChange& change) const;

  /**
   * Returns the TargetData as seen by the LocalStore, including updates that
   * may have not yet been persisted to the TargetCache.
   */
  absl::optional<TargetData> GetTargetData(const core::Target& target);

  /**
   * Creates a new target using the given bundle name, which will be used to
   * hold the keys of all documents from the bundle in query-document mappings.
   * This ensures that the loaded documents do not get garbage collected right
   * away.
   */
  static core::Target NewUmbrellaTarget(const std::string& bundle_id);

  /**
   * Populates the remote document cache with documents from backend or a
   * bundle. Returns the document changes resulting from applying those
   * documents.
   *
   * Note: this function will use `document_versions` if it is defined. When it
   * is not defined, it resorts to `global_version`.
   *
   * @param documents Documents to be applied.
   * @param document_versions A DocumentKey-to-SnapshotVersion map if documents
   * have their own read time.
   * @param global_version A SnapshotVersion representing the read time if all
   * documents have the same read time.
   */
  model::MutableDocumentMap PopulateDocumentChanges(
      const model::DocumentUpdateMap& documents,
      const model::DocumentVersionMap& document_versions,
      const model::SnapshotVersion& global_version);

  /** Manages our in-memory or durable persistence. Owned by FirestoreClient. */
  Persistence* persistence_ = nullptr;

  /** Used to generate target IDs for queries tracked locally. */
  core::TargetIdGenerator target_id_generator_;

  /**
   * The set of all mutations that have been sent but not yet been applied to
   * the backend.
   */
  MutationQueue* mutation_queue_ = nullptr;

  /** The set of all cached remote documents. */
  RemoteDocumentCache* remote_document_cache_ = nullptr;

  /** Maps a query to the data about that query. */
  TargetCache* target_cache_ = nullptr;

  /** Holds information about the bundles loaded into the SDK. */
  BundleCache* bundle_cache_ = nullptr;

  /**
   * Performs queries over the localDocuments (and potentially maintains
   * indexes).
   */
  QueryEngine* query_engine_ = nullptr;

  /**
   * The "local" view of all documents (layering mutation queue on top of
   * remote_document_cache_).
   */
  std::unique_ptr<LocalDocumentsView> local_documents_;

  /** The set of document references maintained by any local views. */
  ReferenceSet local_view_references_;

  /** Maps target ids to data about their queries. */
  std::unordered_map<model::TargetId, TargetData> target_data_by_target_;

  /** Maps a target to its targetID. */
  std::unordered_map<core::Target, model::TargetId> target_id_by_target_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LOCAL_STORE_H_
