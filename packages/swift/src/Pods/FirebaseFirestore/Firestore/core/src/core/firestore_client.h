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

#ifndef FIRESTORE_CORE_SRC_CORE_FIRESTORE_CLIENT_H_
#define FIRESTORE_CORE_SRC_CORE_FIRESTORE_CLIENT_H_

#include <memory>
#include <string>
#include <vector>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/api/load_bundle_task.h"
#include "Firestore/core/src/bundle/bundle_serializer.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/byte_stream.h"
#include "Firestore/core/src/util/delayed_constructor.h"
#include "Firestore/core/src/util/empty.h"
#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/nullability.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {

namespace auth {
class CredentialsProvider;
class User;
}  // namespace auth

namespace local {
class LocalStore;
class LruDelegate;
class Persistence;
class QueryEngine;
}  // namespace local

namespace model {
class Mutation;
}  // namespace model

namespace remote {
class ConnectivityMonitor;
class FirebaseMetadataProvider;
class RemoteStore;
}  // namespace remote

namespace core {

/**
 * FirestoreClient is a top-level class that constructs and owns all of the
 * pieces of the client SDK architecture.
 */
class FirestoreClient : public std::enable_shared_from_this<FirestoreClient> {
 public:
  /**
   * Creates a fully initialized `FirestoreClient`.
   *
   * PORTING NOTE: We use factory function instead of public constructor
   * because `FirestoreClient` is supposed to be managed by shared_ptr, and
   * it is invalid to call `shared_from_this()` from constructors.
   * The factory function enforces that `FirestoreClient` has to be managed
   * by a shared pointer.
   */
  static std::shared_ptr<FirestoreClient> Create(
      const DatabaseInfo& database_info,
      const api::Settings& settings,
      std::shared_ptr<auth::CredentialsProvider> credentials_provider,
      std::shared_ptr<util::Executor> user_executor,
      std::shared_ptr<util::AsyncQueue> worker_queue,
      std::unique_ptr<remote::FirebaseMetadataProvider>
          firebase_metadata_provider);

  ~FirestoreClient();

  /**
   * Synchronously destroys this client, cancels all writes / listeners, and
   * releases all resources.
   */
  void Dispose();

  /**
   * Terminates this client, cancels all writes / listeners, and releases all
   * resources.
   */
  void TerminateAsync(util::StatusCallback callback);

  /**
   * Passes a callback that is triggered when all the pending writes at the
   * time when this method is called received server acknowledgement.
   * An acknowledgement can be either acceptance or rejections.
   */
  void WaitForPendingWrites(util::StatusCallback callback);

  /** Disables the network connection. Pending operations will not complete. */
  void DisableNetwork(util::StatusCallback callback);

  /** Enables the network connection and requeues all pending operations. */
  void EnableNetwork(util::StatusCallback callback);

  /** Starts listening to a query. */
  std::shared_ptr<QueryListener> ListenToQuery(
      Query query,
      ListenOptions options,
      ViewSnapshotSharedListener&& listener);

  /** Stops listening to a query previously listened to. */
  void RemoveListener(const std::shared_ptr<core::QueryListener>& listener);

  /**
   * Retrieves a document from the cache via the indicated callback. If the doc
   * doesn't exist, an error will be sent to the callback.
   */
  void GetDocumentFromLocalCache(const api::DocumentReference& doc,
                                 api::DocumentSnapshotListener&& callback);

  /**
   * Retrieves a (possibly empty) set of documents from the cache via the
   * indicated callback.
   */
  void GetDocumentsFromLocalCache(const api::Query& query,
                                  api::QuerySnapshotListener&& callback);

  /**
   * Write mutations. callback will be notified when it's written to the
   * backend.
   */
  void WriteMutations(std::vector<model::Mutation>&& mutations,
                      util::StatusCallback callback);

  /**
   * Tries to execute the transaction in update_callback up to retries times.
   */
  void Transaction(int retries,
                   TransactionUpdateCallback update_callback,
                   TransactionResultCallback result_callback);

  /**
   * Adds a listener to be called when a snapshots-in-sync event fires.
   */
  void AddSnapshotsInSyncListener(
      const std::shared_ptr<EventListener<util::Empty>>& listener);

  /**
   * Removes a specific listener for snapshots-in-sync events.
   */
  void RemoveSnapshotsInSyncListener(
      const std::shared_ptr<EventListener<util::Empty>>& listener);

  /** The database ID of the DatabaseInfo this client was initialized with. */
  const model::DatabaseId& database_id() const {
    return database_info_.database_id();
  }

  /**
   * Dispatch queue for user callbacks / events. This will often be the "Main
   * Dispatch Queue" of the app but the developer can configure it to a
   * different queue if they so choose.
   */
  const std::shared_ptr<util::Executor>& user_executor() const {
    return user_executor_;
  }

  void LoadBundle(std::unique_ptr<util::ByteStream> bundle_data,
                  std::shared_ptr<api::LoadBundleTask> result_task);

  void GetNamedQuery(const std::string& name, api::QueryCallback callback);

  /** For usage in this class and testing only. */
  const std::shared_ptr<util::AsyncQueue>& worker_queue() const {
    return worker_queue_;
  }
  bool is_terminated() const;

 private:
  FirestoreClient(
      const DatabaseInfo& database_info,
      std::shared_ptr<auth::CredentialsProvider> credentials_provider,
      std::shared_ptr<util::Executor> user_executor,
      std::shared_ptr<util::AsyncQueue> worker_queue,
      std::unique_ptr<remote::FirebaseMetadataProvider>
          firebase_metadata_provider);

  void Initialize(const auth::User& user, const api::Settings& settings);

  void VerifyNotTerminated();

  void TerminateInternal();

  void ScheduleLruGarbageCollection();

  DatabaseInfo database_info_;
  std::shared_ptr<auth::CredentialsProvider> credentials_provider_;
  /**
   * Async queue responsible for all of our internal processing. When we get
   * incoming work from the user (via public API) or the network (incoming gRPC
   * messages), we should always dispatch onto this queue. This ensures our
   * internal data structures are never accessed from multiple threads
   * simultaneously.
   */
  std::shared_ptr<util::AsyncQueue> worker_queue_;
  std::shared_ptr<util::Executor> user_executor_;

  std::unique_ptr<remote::FirebaseMetadataProvider> firebase_metadata_provider_;

  std::unique_ptr<local::Persistence> persistence_;
  std::unique_ptr<local::LocalStore> local_store_;
  std::unique_ptr<local::QueryEngine> query_engine_;
  std::unique_ptr<remote::ConnectivityMonitor> connectivity_monitor_;
  std::unique_ptr<remote::RemoteStore> remote_store_;
  std::unique_ptr<SyncEngine> sync_engine_;
  std::unique_ptr<EventManager> event_manager_;

  std::chrono::milliseconds initial_gc_delay_ = std::chrono::minutes(1);
  std::chrono::milliseconds regular_gc_delay_ = std::chrono::minutes(5);
  bool gc_has_run_ = false;
  bool credentials_initialized_ = false;
  local::LruDelegate* _Nullable lru_delegate_;
  util::DelayedOperation lru_callback_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_FIRESTORE_CLIENT_H_
