/*
 * Copyright 2018 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_REMOTE_GRPC_UNARY_CALL_H_
#define FIRESTORE_CORE_SRC_REMOTE_GRPC_UNARY_CALL_H_

#include <functional>
#include <map>
#include <memory>

#include "Firestore/core/src/remote/grpc_call.h"
#include "Firestore/core/src/remote/grpc_completion.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "Firestore/core/src/util/warnings.h"
#include "grpcpp/client_context.h"
#include "grpcpp/support/byte_buffer.h"

SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN()
#include "grpcpp/generic/generic_stub.h"
SUPPRESS_END()

namespace firebase {
namespace firestore {
namespace remote {

class GrpcConnection;

/**
 * Sends a single request to the server and invokes the given callback with the
 * server response.
 */
class GrpcUnaryCall : public GrpcCall {
 public:
  using Callback = std::function<void(const util::StatusOr<grpc::ByteBuffer>&)>;

  GrpcUnaryCall(std::unique_ptr<grpc::ClientContext> context,
                std::unique_ptr<grpc::GenericClientAsyncResponseReader> call,
                const std::shared_ptr<util::AsyncQueue>& worker_queue,
                GrpcConnection* grpc_connection,
                const grpc::ByteBuffer& request);
  ~GrpcUnaryCall();

  /**
   * Starts the call; the given `callback` will be invoked with the result of
   * the call. If the call fails, the `callback` will be invoked with a non-ok
   * status.
   */
  void Start(Callback&& callback);

  /**
   * If the call is in progress, attempts to finish the call early, effectively
   * cancelling it; otherwise, it's a no-op. Cancellation is done on best-effort
   * basis; however:
   * - the call is guaranteed to be finished when this function returns;
   * - this function is blocking but should be done very fast (order of
   *   milliseconds).
   *
   * If this function succeeds in cancelling the call, the callback will not be
   * invoked.
   */
  void FinishImmediately() override;

  /** Like `Finish`, but always invokes the callback with the given `status`. */
  void FinishAndNotify(const util::Status& status) override;

  /**
   * Returns the metadata received from the server.
   *
   * Can only be called once the `GrpcUnaryCall` has finished.
   */
  Metadata GetResponseHeaders() const override;

  /** For tests only */
  grpc::ClientContext* context() override {
    return context_.get();
  }

 private:
  void Shutdown();
  void MaybeUnregister();

  // See comments in `GrpcStream` on lifetime issues for gRPC objects.
  std::unique_ptr<grpc::ClientContext> context_;
  std::unique_ptr<grpc::GenericClientAsyncResponseReader> call_;
  // Stored to avoid lifetime issues with gRPC.
  grpc::ByteBuffer request_;

  std::shared_ptr<util::AsyncQueue> worker_queue_;
  GrpcConnection* grpc_connection_ = nullptr;

  std::shared_ptr<GrpcCompletion> finish_completion_;
  Callback callback_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_GRPC_UNARY_CALL_H_
