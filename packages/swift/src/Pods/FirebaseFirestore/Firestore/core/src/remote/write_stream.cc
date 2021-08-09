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

#include "Firestore/core/src/remote/write_stream.h"

#include <utility>

#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/remote/grpc_nanopb.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/status.h"

namespace firebase {
namespace firestore {
namespace remote {

using auth::CredentialsProvider;
using auth::Token;
using model::Mutation;
using nanopb::ByteString;
using nanopb::Message;
using remote::ByteBufferReader;
using util::AsyncQueue;
using util::Status;
using util::TimerId;

WriteStream::WriteStream(
    const std::shared_ptr<AsyncQueue>& async_queue,
    std::shared_ptr<CredentialsProvider> credentials_provider,
    Serializer serializer,
    GrpcConnection* grpc_connection,
    WriteStreamCallback* callback)
    : Stream{async_queue, std::move(credentials_provider), grpc_connection,
             TimerId::WriteStreamConnectionBackoff, TimerId::WriteStreamIdle},
      write_serializer_{std::move(serializer)},
      callback_{NOT_NULL(callback)} {
}

void WriteStream::set_last_stream_token(ByteString token) {
  last_stream_token_ = std::move(token);
}

const ByteString& WriteStream::last_stream_token() const {
  return last_stream_token_;
}

void WriteStream::WriteHandshake() {
  EnsureOnQueue();
  HARD_ASSERT(IsOpen(), "Writing handshake requires an opened stream");
  HARD_ASSERT(!handshake_complete(), "Handshake already completed");

  auto request = write_serializer_.EncodeHandshake();
  LOG_DEBUG("%s initial request: %s", GetDebugDescription(),
            request.ToString());
  Write(MakeByteBuffer(request));

  // TODO(dimond): Support stream resumption. We intentionally do not set the
  // stream token on the handshake, ignoring any stream token we might have.
}

void WriteStream::WriteMutations(const std::vector<Mutation>& mutations) {
  EnsureOnQueue();
  HARD_ASSERT(IsOpen(), "Writing mutations requires an opened stream");
  HARD_ASSERT(handshake_complete(),
              "Handshake must be complete before writing mutations");

  auto request = write_serializer_.EncodeWriteMutationsRequest(
      mutations, last_stream_token());
  LOG_DEBUG("%s write request: %s", GetDebugDescription(), request.ToString());
  Write(MakeByteBuffer(request));
}

std::unique_ptr<GrpcStream> WriteStream::CreateGrpcStream(
    GrpcConnection* grpc_connection, const Token& token) {
  return grpc_connection->CreateStream("/google.firestore.v1.Firestore/Write",
                                       token, this);
}

void WriteStream::TearDown(GrpcStream* grpc_stream) {
  if (handshake_complete()) {
    // Send an empty write request to the backend to indicate imminent stream
    // closure. This isn't mandatory, but it allows the backend to clean up
    // resources.
    auto request =
        write_serializer_.EncodeEmptyMutationsList(last_stream_token());
    grpc_stream->WriteAndFinish(MakeByteBuffer(request));
  } else {
    grpc_stream->FinishImmediately();
  }
}

void WriteStream::NotifyStreamOpen() {
  callback_->OnWriteStreamOpen();
}

void WriteStream::NotifyStreamClose(const Status& status) {
  callback_->OnWriteStreamClose(status);
  // Delegate's logic might depend on whether handshake was completed, so only
  // reset it after notifying.
  handshake_complete_ = false;
}

Status WriteStream::NotifyStreamResponse(const grpc::ByteBuffer& message) {
  ByteBufferReader reader{message};
  Message<google_firestore_v1_WriteResponse> response =
      write_serializer_.ParseResponse(&reader);
  if (!reader.ok()) {
    return reader.status();
  }

  LOG_DEBUG("%s response: %s", GetDebugDescription(), response.ToString());

  // Always capture the last stream token.
  set_last_stream_token(ByteString::Take(response->stream_token));
  response->stream_token = nullptr;

  if (!handshake_complete()) {
    // The first response is the handshake response
    handshake_complete_ = true;
    callback_->OnWriteStreamHandshakeComplete();
  } else {
    // A successful first write response means the stream is healthy.
    // Note that we could consider a successful handshake healthy, however, the
    // write itself might be causing an error we want to back off from.
    backoff_.Reset();

    auto version = write_serializer_.DecodeCommitVersion(&reader, *response);
    auto results = write_serializer_.DecodeMutationResults(&reader, *response);
    if (!reader.ok()) {
      return reader.status();
    }

    callback_->OnWriteStreamMutationResult(version, std::move(results));
  }

  return Status::OK();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
