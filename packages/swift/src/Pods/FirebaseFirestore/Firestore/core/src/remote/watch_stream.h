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

#ifndef FIRESTORE_CORE_SRC_REMOTE_WATCH_STREAM_H_
#define FIRESTORE_CORE_SRC_REMOTE_WATCH_STREAM_H_

#include <memory>
#include <string>

#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/remote/grpc_connection.h"
#include "Firestore/core/src/remote/remote_objc_bridge.h"
#include "Firestore/core/src/remote/stream.h"
#include "Firestore/core/src/remote/watch_change.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"
#include "grpcpp/support/byte_buffer.h"

namespace firebase {
namespace firestore {

namespace local {
class TargetData;
}  // namespace local

namespace remote {

class Serializer;

/**
 * An interface defining the events that can be emitted by the `WatchStream`.
 */
class WatchStreamCallback {
 public:
  virtual ~WatchStreamCallback() = default;

  /**
   * Called by the `WatchStream` when it is ready to accept outbound request
   * messages.
   */
  virtual void OnWatchStreamOpen() = 0;

  /**
   * Called by the `WatchStream` with changes and the snapshot versions
   * included in in the `WatchChange` responses sent back by the server.
   */
  virtual void OnWatchStreamChange(
      const WatchChange& change,
      const model::SnapshotVersion& snapshot_version) = 0;

  /**
   * Called by the `WatchStream` when the underlying streaming RPC is
   * interrupted for whatever reason, usually because of an error, but possibly
   * due to an idle timeout. The status passed to this method may be ok, in
   * which case the stream was closed without attributable fault.
   *
   * NOTE: This will not be called after `Stop` is called on the stream. See
   * "Starting and Stopping" on `Stream` for details.
   */
  virtual void OnWatchStreamClose(const util::Status& status) = 0;
};

/**
 * A `Stream` that implements the StreamingWatch RPC.
 *
 * Once the `WatchStream` has called the `OnWatchStreamOpen` method on the
 * callback, any number of `WatchQuery` and `UnwatchTargetId` calls can be sent
 * to control what changes will be sent from the server for WatchChanges.
 */
class WatchStream : public Stream {
 public:
  WatchStream(const std::shared_ptr<util::AsyncQueue>& async_queue,
              std::shared_ptr<auth::CredentialsProvider> credentials_provider,
              Serializer serializer,
              GrpcConnection* grpc_connection,
              WatchStreamCallback* callback);

  /**
   * Registers interest in the results of the given query. If the query includes
   * a resume token, it will be included in the request. Results that affect the
   * query will be streamed back as WatchChange messages that reference the
   * target ID included in `query`.
   */
  virtual /*virtual for tests only*/ void WatchQuery(
      const local::TargetData& query);

  /**
   * Unregisters interest in the results of the query associated with the given
   * `target_id`.
   */
  virtual /*virtual for tests only*/ void UnwatchTargetId(
      model::TargetId target_id);

 private:
  std::unique_ptr<GrpcStream> CreateGrpcStream(
      GrpcConnection* grpc_connection, const auth::Token& token) override;
  void TearDown(GrpcStream* grpc_stream) override;

  void NotifyStreamOpen() override;
  util::Status NotifyStreamResponse(const grpc::ByteBuffer& message) override;
  void NotifyStreamClose(const util::Status& status) override;

  std::string GetDebugName() const override {
    return "WatchStream";
  }

  WatchStreamSerializer watch_serializer_;
  WatchStreamCallback* callback_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_WATCH_STREAM_H_
