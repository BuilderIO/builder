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

#include "Firestore/core/src/core/firestore_client.h"

#include <functional>
#include <future>  // NOLINT(build/c++11)
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/api/document_reference.h"
#include "Firestore/core/src/api/document_snapshot.h"
#include "Firestore/core/src/api/query_core.h"
#include "Firestore/core/src/api/query_snapshot.h"
#include "Firestore/core/src/api/settings.h"
#include "Firestore/core/src/auth/credentials_provider.h"
#include "Firestore/core/src/bundle/bundle_reader.h"
#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/core/event_manager.h"
#include "Firestore/core/src/core/query_listener.h"
#include "Firestore/core/src/core/sync_engine.h"
#include "Firestore/core/src/core/view.h"
#include "Firestore/core/src/local/leveldb_opener.h"
#include "Firestore/core/src/local/leveldb_persistence.h"
#include "Firestore/core/src/local/local_documents_view.h"
#include "Firestore/core/src/local/local_serializer.h"
#include "Firestore/core/src/local/local_store.h"
#include "Firestore/core/src/local/memory_persistence.h"
#include "Firestore/core/src/local/query_engine.h"
#include "Firestore/core/src/local/query_result.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/remote/connectivity_monitor.h"
#include "Firestore/core/src/remote/datastore.h"
#include "Firestore/core/src/remote/firebase_metadata_provider.h"
#include "Firestore/core/src/remote/remote_store.h"
#include "Firestore/core/src/remote/serializer.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/delayed_constructor.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_apple.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace core {

using api::DocumentReference;
using api::DocumentSnapshot;
using api::DocumentSnapshotListener;
using api::QuerySnapshot;
using api::QuerySnapshotListener;
using api::Settings;
using api::SnapshotMetadata;
using auth::CredentialsProvider;
using auth::User;
using firestore::Error;
using local::LevelDbOpener;
using local::LocalStore;
using local::LruParams;
using local::MemoryPersistence;
using local::QueryEngine;
using local::QueryResult;
using model::Document;
using model::DocumentKeySet;
using model::DocumentMap;
using model::Mutation;
using model::OnlineState;
using remote::ConnectivityMonitor;
using remote::Datastore;
using remote::FirebaseMetadataProvider;
using remote::RemoteStore;
using remote::Serializer;
using util::AsyncQueue;
using util::Empty;
using util::Executor;
using util::Status;
using util::StatusCallback;
using util::StatusOr;
using util::StatusOrCallback;
using util::ThrowIllegalState;
using util::TimerId;

static const size_t kMaxConcurrentLimboResolutions = 100;

std::shared_ptr<FirestoreClient> FirestoreClient::Create(
    const DatabaseInfo& database_info,
    const api::Settings& settings,
    std::shared_ptr<CredentialsProvider> credentials_provider,
    std::shared_ptr<Executor> user_executor,
    std::shared_ptr<AsyncQueue> worker_queue,
    std::unique_ptr<FirebaseMetadataProvider> firebase_metadata_provider) {
  // Have to use `new` because `make_shared` cannot access private constructor.
  std::shared_ptr<FirestoreClient> shared_client(new FirestoreClient(
      database_info, std::move(credentials_provider), std::move(user_executor),
      std::move(worker_queue), std::move(firebase_metadata_provider)));

  std::weak_ptr<FirestoreClient> weak_client(shared_client);
  auto credential_change_listener = [weak_client, settings](User user) mutable {
    auto shared_client = weak_client.lock();
    if (!shared_client) return;

    if (!shared_client->credentials_initialized_) {
      shared_client->credentials_initialized_ = true;

      // When we register the credentials listener for the first time,
      // it is invoked synchronously on the calling thread. This ensures that
      // the first item enqueued on the worker queue is
      // `FirestoreClient::Initialize()`.
      shared_client->worker_queue_->Enqueue([shared_client, user, settings] {
        shared_client->Initialize(user, settings);
      });
    } else {
      shared_client->worker_queue_->Enqueue([shared_client, user] {
        shared_client->worker_queue_->VerifyIsCurrentQueue();

        LOG_DEBUG("Credential Changed. Current user: %s", user.uid());
        shared_client->sync_engine_->HandleCredentialChange(user);
      });
    }
  };

  shared_client->credentials_provider_->SetCredentialChangeListener(
      credential_change_listener);

  HARD_ASSERT(
      shared_client->credentials_initialized_,
      "CredentialChangeListener not invoked during client initialization");

  return shared_client;
}

FirestoreClient::FirestoreClient(
    const DatabaseInfo& database_info,
    std::shared_ptr<CredentialsProvider> credentials_provider,
    std::shared_ptr<Executor> user_executor,
    std::shared_ptr<AsyncQueue> worker_queue,
    std::unique_ptr<FirebaseMetadataProvider> firebase_metadata_provider)
    : database_info_(database_info),
      credentials_provider_(std::move(credentials_provider)),
      worker_queue_(std::move(worker_queue)),
      user_executor_(std::move(user_executor)),
      firebase_metadata_provider_(std::move(firebase_metadata_provider)) {
}

void FirestoreClient::Initialize(const User& user, const Settings& settings) {
  // Do all of our initialization on our own dispatch queue.
  worker_queue_->VerifyIsCurrentQueue();
  LOG_DEBUG("Initializing. Current user: %s", user.uid());

  // Note: The initialization work must all be synchronous (we can't dispatch
  // more work) since external write/listen operations could get queued to run
  // before that subsequent work completes.
  if (settings.persistence_enabled()) {
    LevelDbOpener opener(database_info_);

    auto created =
        opener.Create(LruParams::WithCacheSize(settings.cache_size_bytes()));
    // If leveldb fails to start then just throw up our hands: the error is
    // unrecoverable. There's nothing an end-user can do and nearly all
    // failures indicate the developer is doing something grossly wrong so we
    // should stop them cold in their tracks with a failure they can't ignore.
    HARD_ASSERT(created.ok(), "Failed to open DB: %s",
                created.status().ToString());

    auto ldb = std::move(created).ValueOrDie();
    lru_delegate_ = ldb->reference_delegate();

    persistence_ = std::move(ldb);
    if (settings.gc_enabled()) {
      ScheduleLruGarbageCollection();
    }
  } else {
    persistence_ = MemoryPersistence::WithEagerGarbageCollector();
  }

  query_engine_ = absl::make_unique<QueryEngine>();
  local_store_ = absl::make_unique<LocalStore>(persistence_.get(),
                                               query_engine_.get(), user);
  connectivity_monitor_ = ConnectivityMonitor::Create(worker_queue_);
  auto datastore = std::make_shared<Datastore>(
      database_info_, worker_queue_, credentials_provider_,
      connectivity_monitor_.get(), firebase_metadata_provider_.get());

  remote_store_ = absl::make_unique<RemoteStore>(
      local_store_.get(), std::move(datastore), worker_queue_,
      connectivity_monitor_.get(), [this](OnlineState online_state) {
        sync_engine_->HandleOnlineStateChange(online_state);
      });

  sync_engine_ =
      absl::make_unique<SyncEngine>(local_store_.get(), remote_store_.get(),
                                    user, kMaxConcurrentLimboResolutions);

  event_manager_ = absl::make_unique<EventManager>(sync_engine_.get());

  // Setup wiring for remote store.
  remote_store_->set_sync_engine(sync_engine_.get());

  // NOTE: RemoteStore depends on LocalStore (for persisting stream tokens,
  // refilling mutation queue, etc.) so must be started after LocalStore.
  local_store_->Start();
  remote_store_->Start();
}

FirestoreClient::~FirestoreClient() {
  Dispose();
}

void FirestoreClient::Dispose() {
  // Prevent new API invocations from enqueueing further work.
  worker_queue_->EnterRestrictedMode();

  // Clean up internal resources. It's possible that this can race with a call
  // to `Firestore::ClearPersistence` or `Firestore::Terminate`, but that's OK
  // because that operation does not rely on any state in this FirestoreClient.
  std::promise<void> signal_disposing;
  bool enqueued = worker_queue_->EnqueueEvenWhileRestricted([&, this] {
    // Once this task has started running, AsyncQueue::Dispose will block on its
    // completion. Signal as early as possible to lock out even restricted tasks
    // as early as possible.
    signal_disposing.set_value();

    TerminateInternal();
  });

  // If we successfully enqueued the TerminateInternal task then wait for it to
  // start.
  //
  // If the task was not enqueued, we lost the race with some other concurrent
  // invocation of Dispose. In that case, `signal_disposing` will never be
  // completed.
  if (enqueued) {
    signal_disposing.get_future().wait();
  }

  worker_queue_->Dispose();
  user_executor_->Dispose();
}

void FirestoreClient::TerminateAsync(StatusCallback callback) {
  worker_queue_->EnterRestrictedMode();
  worker_queue_->EnqueueEvenWhileRestricted([this, callback] {
    TerminateInternal();

    if (callback) {
      user_executor_->Execute([=] { callback(Status::OK()); });
    }
  });
}

void FirestoreClient::TerminateInternal() {
  if (!remote_store_) return;

  credentials_provider_->SetCredentialChangeListener(nullptr);
  credentials_provider_.reset();

  // If we've scheduled LRU garbage collection, cancel it.
  lru_callback_.Cancel();

  remote_store_->Shutdown();
  persistence_->Shutdown();

  local_store_.reset();
  query_engine_.reset();
  event_manager_.reset();

  // Clear the remote store to indicate terminate is complete.
  remote_store_.reset();
}

/**
 * Schedules a callback to try running LRU garbage collection. Reschedules
 * itself after the GC has run.
 */
void FirestoreClient::ScheduleLruGarbageCollection() {
  std::chrono::milliseconds delay =
      gc_has_run_ ? regular_gc_delay_ : initial_gc_delay_;

  lru_callback_ = worker_queue_->EnqueueAfterDelay(
      delay, TimerId::GarbageCollectionDelay, [this] {
        local_store_->CollectGarbage(lru_delegate_->garbage_collector());
        gc_has_run_ = true;
        ScheduleLruGarbageCollection();
      });
}

void FirestoreClient::DisableNetwork(StatusCallback callback) {
  VerifyNotTerminated();

  worker_queue_->Enqueue([this, callback] {
    remote_store_->DisableNetwork();
    if (callback) {
      user_executor_->Execute([=] { callback(Status::OK()); });
    }
  });
}

void FirestoreClient::EnableNetwork(StatusCallback callback) {
  VerifyNotTerminated();

  worker_queue_->Enqueue([this, callback] {
    remote_store_->EnableNetwork();
    if (callback) {
      user_executor_->Execute([=] { callback(Status::OK()); });
    }
  });
}

void FirestoreClient::WaitForPendingWrites(StatusCallback callback) {
  VerifyNotTerminated();

  // Dispatch the result back onto the user dispatch queue.
  auto async_callback = [this, callback](util::Status status) {
    if (callback) {
      user_executor_->Execute([=] { callback(std::move(status)); });
    }
  };

  worker_queue_->Enqueue([this, async_callback] {
    sync_engine_->RegisterPendingWritesCallback(std::move(async_callback));
  });
}

void FirestoreClient::VerifyNotTerminated() {
  if (is_terminated()) {
    ThrowIllegalState("The client has already been terminated.");
  }
}

bool FirestoreClient::is_terminated() const {
  // When the user calls `Terminate`, it puts the `AsyncQueue` into restricted
  // mode.
  //
  // Note that `remote_store_ == nullptr` is not a good test for this because
  // `remote_store_` is reset asynchronously.
  return !worker_queue_->is_running();
}

std::shared_ptr<QueryListener> FirestoreClient::ListenToQuery(
    Query query, ListenOptions options, ViewSnapshotSharedListener&& listener) {
  VerifyNotTerminated();

  auto query_listener = QueryListener::Create(
      std::move(query), std::move(options), std::move(listener));

  worker_queue_->Enqueue([this, query_listener] {
    event_manager_->AddQueryListener(std::move(query_listener));
  });

  return query_listener;
}

void FirestoreClient::RemoveListener(
    const std::shared_ptr<QueryListener>& listener) {
  // Checks for termination but does not throw error, allowing it to be an no-op
  // if client is already terminated.
  if (is_terminated()) {
    return;
  }
  worker_queue_->Enqueue(
      [this, listener] { event_manager_->RemoveQueryListener(listener); });
}

void FirestoreClient::GetDocumentFromLocalCache(
    const DocumentReference& doc, DocumentSnapshotListener&& callback) {
  VerifyNotTerminated();

  // TODO(c++14): move `callback` into lambda.
  auto shared_callback = absl::ShareUniquePtr(std::move(callback));
  worker_queue_->Enqueue([this, doc, shared_callback] {
    Document document = local_store_->ReadDocument(doc.key());
    StatusOr<DocumentSnapshot> maybe_snapshot;

    if (document->is_found_document()) {
      maybe_snapshot = DocumentSnapshot::FromDocument(
          doc.firestore(), document,
          SnapshotMetadata{document->has_local_mutations(),
                           /*from_cache=*/true});
    } else if (document->is_no_document()) {
      maybe_snapshot = DocumentSnapshot::FromNoDocument(
          doc.firestore(), doc.key(),
          SnapshotMetadata{/*pending_writes=*/false,
                           /*from_cache=*/true});
    } else {
      maybe_snapshot =
          Status{Error::kErrorUnavailable,
                 "Failed to get document from cache. (However, this document "
                 "may exist on the server. Run again without setting source to "
                 "FirestoreSourceCache to attempt to retrieve the document "};
    }

    if (shared_callback) {
      user_executor_->Execute(
          [=] { shared_callback->OnEvent(std::move(maybe_snapshot)); });
    }
  });
}

void FirestoreClient::GetDocumentsFromLocalCache(
    const api::Query& query, QuerySnapshotListener&& callback) {
  VerifyNotTerminated();

  // TODO(c++14): move `callback` into lambda.
  auto shared_callback = absl::ShareUniquePtr(std::move(callback));
  worker_queue_->Enqueue([this, query, shared_callback] {
    QueryResult query_result = local_store_->ExecuteQuery(
        query.query(), /* use_previous_results= */ true);

    View view(query.query(), query_result.remote_keys());
    ViewDocumentChanges view_doc_changes =
        view.ComputeDocumentChanges(query_result.documents());
    ViewChange view_change = view.ApplyChanges(view_doc_changes);
    HARD_ASSERT(
        view_change.limbo_changes().empty(),
        "View returned limbo documents during local-only query execution.");

    HARD_ASSERT(view_change.snapshot().has_value(), "Expected a snapshot");

    ViewSnapshot snapshot = std::move(view_change.snapshot()).value();
    SnapshotMetadata metadata(snapshot.has_pending_writes(),
                              snapshot.from_cache());

    QuerySnapshot result(query.firestore(), query.query(), std::move(snapshot),
                         std::move(metadata));

    if (shared_callback) {
      user_executor_->Execute(
          [=] { shared_callback->OnEvent(std::move(result)); });
    }
  });
}

void FirestoreClient::WriteMutations(std::vector<Mutation>&& mutations,
                                     StatusCallback callback) {
  VerifyNotTerminated();

  // TODO(c++14): move `mutations` into lambda (C++14).
  worker_queue_->Enqueue([this, mutations, callback]() mutable {
    if (mutations.empty()) {
      if (callback) {
        user_executor_->Execute([=] { callback(Status::OK()); });
      }
    } else {
      sync_engine_->WriteMutations(
          std::move(mutations), [this, callback](Status error) {
            // Dispatch the result back onto the user dispatch queue.
            if (callback) {
              user_executor_->Execute([=] { callback(std::move(error)); });
            }
          });
    }
  });
}

void FirestoreClient::Transaction(int retries,
                                  TransactionUpdateCallback update_callback,
                                  TransactionResultCallback result_callback) {
  VerifyNotTerminated();

  // Dispatch the result back onto the user dispatch queue.
  auto async_callback = [this, result_callback](Status status) {
    if (result_callback) {
      user_executor_->Execute([=] { result_callback(std::move(status)); });
    }
  };

  worker_queue_->Enqueue([this, retries, update_callback, async_callback] {
    sync_engine_->Transaction(retries, worker_queue_,
                              std::move(update_callback),
                              std::move(async_callback));
  });
}

void FirestoreClient::AddSnapshotsInSyncListener(
    const std::shared_ptr<EventListener<Empty>>& user_listener) {
  worker_queue_->Enqueue([this, user_listener] {
    event_manager_->AddSnapshotsInSyncListener(std::move(user_listener));
  });
}

void FirestoreClient::RemoveSnapshotsInSyncListener(
    const std::shared_ptr<EventListener<Empty>>& user_listener) {
  worker_queue_->Enqueue([this, user_listener] {
    event_manager_->RemoveSnapshotsInSyncListener(user_listener);
  });
}

void FirestoreClient::LoadBundle(
    std::unique_ptr<util::ByteStream> bundle_data,
    std::shared_ptr<api::LoadBundleTask> result_task) {
  VerifyNotTerminated();

  bundle::BundleSerializer bundle_serializer(
      remote::Serializer(database_info_.database_id()));
  auto reader = std::make_shared<bundle::BundleReader>(
      std::move(bundle_serializer), std::move(bundle_data));
  worker_queue_->Enqueue([this, reader, result_task] {
    sync_engine_->LoadBundle(std::move(reader), std::move(result_task));
  });
}

void FirestoreClient::GetNamedQuery(const std::string& name,
                                    api::QueryCallback callback) {
  VerifyNotTerminated();

  // Dispatch the result back onto the user dispatch queue.
  auto async_callback =
      [this, callback](const absl::optional<bundle::NamedQuery>& named_query) {
        if (callback) {
          if (named_query.has_value()) {
            const Target& target = named_query.value().bundled_query().target();
            Query query(target.path(), target.collection_group(),
                        target.filters(), target.order_bys(), target.limit(),
                        named_query.value().bundled_query().limit_type(),
                        target.start_at(), target.end_at());
            user_executor_->Execute([query, callback] {
              callback(std::move(query), /*found=*/true);
            });
          } else {
            user_executor_->Execute(
                [callback] { callback(Query(), /*found=*/false); });
          }
        }
      };

  worker_queue_->Enqueue([this, name, async_callback] {
    async_callback(local_store_->GetNamedQuery(name));
  });
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
