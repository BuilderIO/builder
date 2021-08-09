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

#ifndef FIRESTORE_CORE_SRC_REMOTE_GRPC_STREAMING_READER_H_
#define FIRESTORE_CORE_SRC_REMOTE_GRPC_STREAMING_READER_H_

#include <functional>
#include <map>
#include <memory>
#include <vector>

#include "Firestore/core/src/remote/grpc_stream.h"
#include "Firestore/core/src/remote/grpc_stream_observer.h"
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
 * Sends a single request to the server, reads one or more streaming server
 * responses, and invokes the given callback with the accumulated responses.
 */
class GrpcStreamingReader : public GrpcCall, public GrpcStreamObserver {
 public:
  using ResponsesT = std::vector<grpc::ByteBuffer>;
  using Callback = std::function<void(const util::StatusOr<ResponsesT>&)>;

  GrpcStreamingReader(
      std::unique_ptr<grpc::ClientContext> context,
      std::unique_ptr<grpc::GenericClientAsyncReaderWriter> call,
      const std::shared_ptr<util::AsyncQueue>& worker_queue,
      GrpcConnection* grpc_connection,
      const grpc::ByteBuffer& request);

  /**
   * Starts the call; the given `callback` will be invoked with the accumulated
   * results of the call. If the call fails, the `callback` will be invoked with
   * a non-ok status.
   */
  void Start(Callback&& callback);

  /**
   * If the call is in progress, attempts to cancel the call; otherwise, it's
   * a no-op. Cancellation is done on best-effort basis; however:
   * - the call is guaranteed to be finished when this function returns;
   * - this function is blocking but should finish very fast (order of
   *   milliseconds).
   *
   * If this function succeeds in cancelling the call, the callback will not be
   * invoked.
   */
  void FinishImmediately() override;

  void FinishAndNotify(const util::Status& status) override;

  /**
   * Returns the metadata received from the server.
   *
   * Can only be called once the `GrpcStreamingReader` has received the first
   * message from the server.
   */
  Metadata GetResponseHeaders() const override {
    return stream_->GetResponseHeaders();
  }

  void OnStreamStart() override;
  void OnStreamRead(const grpc::ByteBuffer& message) override;
  void OnStreamFinish(const util::Status& status) override;

  /** For tests only */
  grpc::ClientContext* context() override {
    return stream_->context();
  }

 private:
  std::unique_ptr<GrpcStream> stream_;
  grpc::ByteBuffer request_;

  Callback callback_;
  ResponsesT responses_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_GRPC_STREAMING_READER_H_
