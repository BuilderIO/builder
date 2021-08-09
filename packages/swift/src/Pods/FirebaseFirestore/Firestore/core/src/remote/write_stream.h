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

#ifndef FIRESTORE_CORE_SRC_REMOTE_WRITE_STREAM_H_
#define FIRESTORE_CORE_SRC_REMOTE_WRITE_STREAM_H_

#include <memory>
#include <string>
#include <vector>

#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/remote/grpc_connection.h"
#include "Firestore/core/src/remote/remote_objc_bridge.h"
#include "Firestore/core/src/remote/stream.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"
#include "grpcpp/support/byte_buffer.h"

namespace firebase {
namespace firestore {
namespace remote {

class Serializer;

class WriteStreamCallback {
 public:
  virtual ~WriteStreamCallback() = default;

  /**
   * Called by the `WriteStream` when it is ready to accept outbound request
   * messages.
   */
  virtual void OnWriteStreamOpen() = 0;

  /**
   * Called by the `WriteStream` upon a successful handshake response from the
   * server, which is the receiver's cue to send any pending writes.
   */
  virtual void OnWriteStreamHandshakeComplete() = 0;

  /**
   * Called by the `WriteStream` upon receiving a StreamingWriteResponse from
   * the server that contains mutation results.
   */
  virtual void OnWriteStreamMutationResult(
      model::SnapshotVersion commit_version,
      std::vector<model::MutationResult> results) = 0;

  /**
   * Called when the `WriteStream`'s underlying RPC is interrupted for whatever
   * reason, usually because of an error, but possibly due to an idle timeout.
   * The status passed to this method may be "ok", in which case the stream was
   * closed without attributable fault.
   *
   * NOTE: This will not be called after `Stop` is called on the stream. See
   * "Starting and Stopping" on `Stream` for details.
   */
  virtual void OnWriteStreamClose(const util::Status& status) = 0;
};

/**
 * A Stream that implements the Write RPC.
 *
 * The Write RPC requires the caller to maintain special stream token
 * state in-between calls, to help the server understand which responses the
 * client has processed by the time the next request is made. Every response
 * will contain a stream token; this value must be passed to the next
 * request.
 *
 * After calling `Start` on this stream, the next request must be a handshake,
 * containing whatever stream token is on hand. Once a response to this
 * request is received, all pending mutations may be submitted. When
 * submitting multiple batches of mutations at the same time, it's
 * okay to use the same stream token for the calls to `WriteMutations`.
 *
 * This class is not intended as a base class; all virtual methods exist only
 * for the sake of tests.
 */
class WriteStream : public Stream {
 public:
  WriteStream(const std::shared_ptr<util::AsyncQueue>& async_queue,
              std::shared_ptr<auth::CredentialsProvider> credentials_provider,
              Serializer serializer,
              GrpcConnection* grpc_connection,
              WriteStreamCallback* callback);

  void set_last_stream_token(nanopb::ByteString token);
  /**
   * The last received stream token from the server, used to acknowledge which
   * responses the client has processed. Stream tokens are opaque checkpoint
   * markers whose only real value is their inclusion in the next request.
   *
   * `WriteStream` manages propagating this value from responses to the
   * next request.
   */
  const nanopb::ByteString& last_stream_token() const;

  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  bool handshake_complete() const {
    return handshake_complete_;
  }

  /**
   * Sends an initial stream token to the server, performing the handshake
   * required to make the StreamingWrite RPC work.
   */
  virtual void WriteHandshake();

  /** Sends a group of mutations to the Firestore backend to apply. */
  virtual void WriteMutations(const std::vector<model::Mutation>& mutations);

 protected:
  // For tests only
  void SetHandshakeComplete(bool value = true) {
    handshake_complete_ = value;
  }

 private:
  std::unique_ptr<GrpcStream> CreateGrpcStream(
      GrpcConnection* grpc_connection, const auth::Token& token) override;
  void TearDown(GrpcStream* grpc_stream) override;

  void NotifyStreamOpen() override;
  util::Status NotifyStreamResponse(const grpc::ByteBuffer& message) override;
  void NotifyStreamClose(const util::Status& status) override;

  std::string GetDebugName() const override {
    return "WriteStream";
  }

  WriteStreamSerializer write_serializer_;
  WriteStreamCallback* callback_ = nullptr;
  bool handshake_complete_ = false;
  nanopb::ByteString last_stream_token_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_WRITE_STREAM_H_
