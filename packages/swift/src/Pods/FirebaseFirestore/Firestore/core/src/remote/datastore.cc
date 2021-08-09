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

#include "Firestore/core/src/remote/datastore.h"

#include <unordered_set>
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/auth/credentials_provider.h"
#include "Firestore/core/src/auth/token.h"
#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/remote/connectivity_monitor.h"
#include "Firestore/core/src/remote/firebase_metadata_provider.h"
#include "Firestore/core/src/remote/grpc_completion.h"
#include "Firestore/core/src/remote/grpc_connection.h"
#include "Firestore/core/src/remote/grpc_nanopb.h"
#include "Firestore/core/src/remote/grpc_stream.h"
#include "Firestore/core/src/remote/grpc_streaming_reader.h"
#include "Firestore/core/src/remote/grpc_unary_call.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/memory/memory.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace remote {
namespace {

using auth::CredentialsProvider;
using auth::Token;
using core::DatabaseInfo;
using model::DocumentKey;
using model::Mutation;
using util::AsyncQueue;
using util::Executor;
using util::LogIsDebugEnabled;
using util::Status;
using util::StatusOr;

const auto kRpcNameCommit = "/google.firestore.v1.Firestore/Commit";
const auto kRpcNameLookup = "/google.firestore.v1.Firestore/BatchGetDocuments";

std::unique_ptr<Executor> CreateExecutor() {
  return Executor::CreateSerial("com.google.firebase.firestore.rpc");
}

std::string MakeString(grpc::string_ref grpc_str) {
  return {grpc_str.begin(), grpc_str.size()};
}

absl::string_view MakeStringView(grpc::string_ref grpc_str) {
  return {grpc_str.begin(), grpc_str.size()};
}

void LogGrpcCallFinished(absl::string_view rpc_name,
                         GrpcCall* call,
                         const Status& status) {
  LOG_DEBUG("RPC %s completed. Error: %s: %s", rpc_name, status.code(),
            status.error_message());
  if (LogIsDebugEnabled()) {
    auto headers =
        Datastore::GetAllowlistedHeadersAsString(call->GetResponseHeaders());
    LOG_DEBUG("RPC %s returned headers (allowlisted): %s", rpc_name, headers);
  }
}

}  // namespace

Datastore::Datastore(const DatabaseInfo& database_info,
                     const std::shared_ptr<AsyncQueue>& worker_queue,
                     std::shared_ptr<CredentialsProvider> credentials,
                     ConnectivityMonitor* connectivity_monitor,
                     FirebaseMetadataProvider* firebase_metadata_provider)
    : worker_queue_{NOT_NULL(worker_queue)},
      credentials_{std::move(credentials)},
      rpc_executor_{CreateExecutor()},
      connectivity_monitor_{connectivity_monitor},
      grpc_connection_{database_info, worker_queue, &grpc_queue_,
                       connectivity_monitor_, firebase_metadata_provider},
      datastore_serializer_{database_info} {
  if (!database_info.ssl_enabled()) {
    GrpcConnection::UseInsecureChannel(database_info.host());
  }
}

void Datastore::Start() {
  rpc_executor_->Execute([this] { PollGrpcQueue(); });
}

void Datastore::Shutdown() {
  is_shut_down_ = true;

  // Order matters here: shutting down `grpc_connection_`, which will quickly
  // finish any pending gRPC calls, must happen before shutting down the gRPC
  // queue.
  grpc_connection_.Shutdown();

  // `grpc::CompletionQueue::Next` will only return `false` once `Shutdown` has
  // been called and all submitted tags have been extracted. Without this call,
  // `rpc_executor_` will never finish.
  grpc_queue_.Shutdown();
  // Drain the executor to make sure it extracted all the operations from gRPC
  // completion queue.
  rpc_executor_->ExecuteBlocking([] {});
}

void Datastore::PollGrpcQueue() {
  HARD_ASSERT(rpc_executor_->IsCurrentExecutor(),
              "PollGrpcQueue should only be called on the "
              "dedicated Datastore executor");

  void* tag = nullptr;
  bool ok = false;
  while (grpc_queue_.Next(&tag, &ok)) {
    auto completion = static_cast<GrpcCompletion*>(tag);
    // While it's valid in principle, we never deliberately pass a null pointer
    // to gRPC completion queue and expect it back. This assertion might be
    // relaxed if necessary.
    HARD_ASSERT(tag, "gRPC queue returned a null tag");
    completion->Complete(ok);
  }
}

std::shared_ptr<WatchStream> Datastore::CreateWatchStream(
    WatchStreamCallback* callback) {
  return std::make_shared<WatchStream>(worker_queue_, credentials_,
                                       datastore_serializer_.serializer(),
                                       &grpc_connection_, callback);
}

std::shared_ptr<WriteStream> Datastore::CreateWriteStream(
    WriteStreamCallback* callback) {
  return std::make_shared<WriteStream>(worker_queue_, credentials_,
                                       datastore_serializer_.serializer(),
                                       &grpc_connection_, callback);
}

void Datastore::CommitMutations(const std::vector<Mutation>& mutations,
                                CommitCallback&& callback) {
  ResumeRpcWithCredentials(
      // TODO(c++14): move into lambda.
      [this, mutations,
       callback](const StatusOr<Token>& maybe_credentials) mutable {
        if (!maybe_credentials.ok()) {
          callback(maybe_credentials.status());
          return;
        }
        CommitMutationsWithCredentials(maybe_credentials.ValueOrDie(),
                                       mutations, std::move(callback));
      });
}

void Datastore::CommitMutationsWithCredentials(
    const Token& token,
    const std::vector<Mutation>& mutations,
    CommitCallback&& callback) {
  grpc::ByteBuffer message =
      MakeByteBuffer(datastore_serializer_.EncodeCommitRequest(mutations));

  std::unique_ptr<GrpcUnaryCall> call_owning = grpc_connection_.CreateUnaryCall(
      kRpcNameCommit, token, std::move(message));
  GrpcUnaryCall* call = call_owning.get();
  active_calls_.push_back(std::move(call_owning));

  call->Start(
      // TODO(c++14): move into lambda.
      [this, call, callback](const StatusOr<grpc::ByteBuffer>& result) {
        LogGrpcCallFinished("CommitRequest", call, result.status());
        HandleCallStatus(result.status());

        // Response is deliberately ignored
        callback(result.status());

        RemoveGrpcCall(call);
      });
}

void Datastore::LookupDocuments(const std::vector<DocumentKey>& keys,
                                LookupCallback&& callback) {
  ResumeRpcWithCredentials(
      // TODO(c++14): move into lambda.
      [this, keys, callback](const StatusOr<Token>& maybe_credentials) mutable {
        if (!maybe_credentials.ok()) {
          callback(maybe_credentials.status());
          return;
        }
        LookupDocumentsWithCredentials(maybe_credentials.ValueOrDie(), keys,
                                       std::move(callback));
      });
}

void Datastore::LookupDocumentsWithCredentials(
    const Token& token,
    const std::vector<DocumentKey>& keys,
    LookupCallback&& callback) {
  grpc::ByteBuffer message =
      MakeByteBuffer(datastore_serializer_.EncodeLookupRequest(keys));

  std::unique_ptr<GrpcStreamingReader> call_owning =
      grpc_connection_.CreateStreamingReader(kRpcNameLookup, token,
                                             std::move(message));
  GrpcStreamingReader* call = call_owning.get();
  active_calls_.push_back(std::move(call_owning));

  // TODO(c++14): move into lambda.
  call->Start([this, call, callback](
                  const StatusOr<std::vector<grpc::ByteBuffer>>& result) {
    LogGrpcCallFinished("BatchGetDocuments", call, result.status());
    HandleCallStatus(result.status());

    OnLookupDocumentsResponse(result, callback);

    RemoveGrpcCall(call);
  });
}

void Datastore::OnLookupDocumentsResponse(
    const StatusOr<std::vector<grpc::ByteBuffer>>& result,
    const LookupCallback& callback) {
  if (!result.ok()) {
    callback(result.status());
    return;
  }

  std::vector<grpc::ByteBuffer> responses = std::move(result).ValueOrDie();
  callback(datastore_serializer_.MergeLookupResponses(responses));
}

void Datastore::ResumeRpcWithCredentials(const OnCredentials& on_credentials) {
  // Auth may outlive Firestore
  std::weak_ptr<Datastore> weak_this{shared_from_this()};

  credentials_->GetToken(
      [weak_this, on_credentials](const StatusOr<Token>& result) {
        auto strong_this = weak_this.lock();
        if (!strong_this) {
          return;
        }

        strong_this->worker_queue_->EnqueueRelaxed(
            [weak_this, result, on_credentials] {
              auto strong_this = weak_this.lock();
              if (!strong_this) {
                return;
              }
              // In case Auth callback is invoked after Datastore has been shut
              // down.
              if (strong_this->is_shut_down_) {
                return;
              }

              on_credentials(result);
            });
      });
}

void Datastore::HandleCallStatus(const Status& status) {
  if (status.code() == Error::kErrorUnauthenticated) {
    credentials_->InvalidateToken();
  }
}

void Datastore::RemoveGrpcCall(GrpcCall* to_remove) {
  auto found = std::find_if(active_calls_.begin(), active_calls_.end(),
                            [to_remove](const std::unique_ptr<GrpcCall>& call) {
                              return call.get() == to_remove;
                            });
  HARD_ASSERT(found != active_calls_.end(), "Missing gRPC call");
  active_calls_.erase(found);
}

bool Datastore::IsAbortedError(const Status& error) {
  return error.code() == Error::kErrorAborted;
}

bool Datastore::IsPermanentError(const Status& error) {
  switch (error.code()) {
    case Error::kErrorOk:
      HARD_FAIL("Treated status OK as error");
    case Error::kErrorCancelled:
    case Error::kErrorUnknown:
    case Error::kErrorDeadlineExceeded:
    case Error::kErrorResourceExhausted:
    case Error::kErrorInternal:
    case Error::kErrorUnavailable:
      // Unauthenticated means something went wrong with our token and we need
      // to retry with new credentials which will happen automatically.
    case Error::kErrorUnauthenticated:
      return false;
    case Error::kErrorInvalidArgument:
    case Error::kErrorNotFound:
    case Error::kErrorAlreadyExists:
    case Error::kErrorPermissionDenied:
    case Error::kErrorFailedPrecondition:
    case Error::kErrorAborted:
      // Aborted might be retried in some scenarios, but that is dependant on
      // the context and should handled individually by the calling code.
      // See https://cloud.google.com/apis/design/errors
    case Error::kErrorOutOfRange:
    case Error::kErrorUnimplemented:
    case Error::kErrorDataLoss:
      return true;
  }

  HARD_FAIL("Unknown status code: %s", error.code());
}

bool Datastore::IsPermanentWriteError(const Status& error) {
  return IsPermanentError(error) && !IsAbortedError(error);
}

std::string Datastore::GetAllowlistedHeadersAsString(
    const GrpcCall::Metadata& headers) {
  static auto* allowlist = new std::unordered_set<std::string>{
      "date", "x-google-backends", "x-google-netmon-label", "x-google-service",
      "x-google-gfe-request-trace"};

  std::string result;
  auto end = allowlist->end();
  for (const auto& kv : headers) {
    if (allowlist->find(MakeString(kv.first)) != end) {
      absl::StrAppend(&result, MakeStringView(kv.first), ": ",
                      MakeStringView(kv.second), "\n");
    }
  }
  return result;
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
