/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_REMOTE_DATASTORE_H_
#define FIRESTORE_CORE_SRC_REMOTE_DATASTORE_H_

#include <functional>
#include <memory>
#include <string>
#include <vector>

#include "Firestore/core/src/auth/credentials_provider.h"
#include "Firestore/core/src/auth/token.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/remote/grpc_call.h"
#include "Firestore/core/src/remote/grpc_connection.h"
#include "Firestore/core/src/remote/remote_objc_bridge.h"
#include "Firestore/core/src/remote/watch_stream.h"
#include "Firestore/core/src/remote/write_stream.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"
#include "grpcpp/completion_queue.h"
#include "grpcpp/support/status.h"

namespace firebase {
namespace firestore {

namespace model {
class Document;
};  // namespace model

namespace remote {

class ConnectivityMonitor;
class FirebaseMetadataProvider;

/**
 * `Datastore` represents a proxy for the remote server, hiding details of the
 * RPC layer. It:
 *
 *   - Manages connections to the server
 *   - Authenticates to the server
 *   - Manages threading and keeps higher-level code running on the worker queue
 *   - Serializes internal model objects to and from protocol buffers
 *
 * `Datastore` is generally not responsible for understanding the higher-level
 * protocol involved in actually making changes or reading data, and aside from
 * the connections it manages is otherwise stateless.
 *
 * This class is only intended to be inherited from by test mocks.
 */
class Datastore : public std::enable_shared_from_this<Datastore> {
 public:
  using LookupCallback =
      std::function<void(const util::StatusOr<std::vector<model::Document>>&)>;
  using CommitCallback = std::function<void(const util::Status&)>;

  Datastore(const core::DatabaseInfo& database_info,
            const std::shared_ptr<util::AsyncQueue>& worker_queue,
            std::shared_ptr<auth::CredentialsProvider> credentials,
            ConnectivityMonitor* connectivity_monitor,
            FirebaseMetadataProvider* firebase_metadata_provider);

  virtual ~Datastore() = default;

  /** Starts polling the gRPC completion queue. */
  void Start();
  /** Cancels any pending gRPC calls and drains the gRPC completion queue. */
  void Shutdown();

  /**
   * Creates a new `WatchStream` that is still unstarted but uses a common
   * shared channel.
   */
  virtual std::shared_ptr<WatchStream> CreateWatchStream(
      WatchStreamCallback* callback);
  /**
   * Creates a new `WriteStream` that is still unstarted but uses a common
   * shared channel.
   */
  virtual std::shared_ptr<WriteStream> CreateWriteStream(
      WriteStreamCallback* callback);

  void CommitMutations(const std::vector<model::Mutation>& mutations,
                       CommitCallback&& callback);
  void LookupDocuments(const std::vector<model::DocumentKey>& keys,
                       LookupCallback&& callback);

  /** Returns true if the given error is a gRPC ABORTED error. */
  static bool IsAbortedError(const util::Status& error);

  /**
   * Determines whether an error code represents a permanent error when received
   * in response to a non-write operation.
   *
   * See `IsPermanentWriteError` for classifying write errors.
   */
  static bool IsPermanentError(const util::Status& error);

  /**
   * Determines whether an error code represents a permanent error when received
   * in response to a write operation.
   *
   * Write operations must be handled specially because as of b/119437764,
   * ABORTED errors on the write stream should be retried too (even though
   * ABORTED errors are not generally retryable).
   *
   * Note that during the initial handshake on the write stream an ABORTED error
   * signals that we should discard our stream token (i.e. it is permanent).
   * This means a handshake error should be classified with `IsPermanentError`,
   * above.
   */
  static bool IsPermanentWriteError(const util::Status& error);

  static std::string GetAllowlistedHeadersAsString(
      const GrpcCall::Metadata& headers);

  Datastore(const Datastore& other) = delete;
  Datastore(Datastore&& other) = delete;
  Datastore& operator=(const Datastore& other) = delete;
  Datastore& operator=(Datastore&& other) = delete;

 protected:
  /** Test-only method */
  grpc::CompletionQueue* grpc_queue() {
    return &grpc_queue_;
  }
  /** Test-only method */
  GrpcCall* LastCall() {
    return !active_calls_.empty() ? active_calls_.back().get() : nullptr;
  }

  /** Test-only getter for mocking */
  GrpcConnection* grpc_connection() {
    return &grpc_connection_;
  }

 private:
  void PollGrpcQueue();

  void CommitMutationsWithCredentials(
      const auth::Token& token,
      const std::vector<model::Mutation>& mutations,
      CommitCallback&& callback);

  void LookupDocumentsWithCredentials(
      const auth::Token& token,
      const std::vector<model::DocumentKey>& keys,
      LookupCallback&& callback);
  void OnLookupDocumentsResponse(
      const util::StatusOr<std::vector<grpc::ByteBuffer>>& result,
      const LookupCallback& callback);

  using OnCredentials = std::function<void(const util::StatusOr<auth::Token>&)>;
  void ResumeRpcWithCredentials(const OnCredentials& on_credentials);

  void HandleCallStatus(const util::Status& status);

  void RemoveGrpcCall(GrpcCall* to_remove);

  // In case Auth tries to invoke a callback after `Datastore` has been shut
  // down.
  bool is_shut_down_ = false;

  std::shared_ptr<util::AsyncQueue> worker_queue_;
  std::shared_ptr<auth::CredentialsProvider> credentials_;

  // A separate executor dedicated to polling gRPC completion queue (which is
  // shared for all spawned gRPC streams and calls).
  std::unique_ptr<util::Executor> rpc_executor_;
  grpc::CompletionQueue grpc_queue_;
  ConnectivityMonitor* connectivity_monitor_ = nullptr;
  GrpcConnection grpc_connection_;

  std::vector<std::unique_ptr<GrpcCall>> active_calls_;
  DatastoreSerializer datastore_serializer_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_DATASTORE_H_
