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

#ifndef FIRESTORE_CORE_SRC_REMOTE_REMOTE_OBJC_BRIDGE_H_
#define FIRESTORE_CORE_SRC_REMOTE_REMOTE_OBJC_BRIDGE_H_

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/Protos/nanopb/google/firestore/v1/firestore.nanopb.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/remote/serializer.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "grpcpp/support/byte_buffer.h"

namespace firebase {
namespace firestore {

namespace local {
class TargetData;
}  // namespace local

namespace model {
class DocumentKey;
class SnapshotVersion;
}  // namespace model

namespace remote {

class WatchChange;

// TODO(varconst): remove this file?
//
// The original purpose of this file was to cleanly encapsulate the remaining
// Objective-C dependencies of `remote/` folder. These dependencies no longer
// exist, and this file makes C++ diverge from other platforms.
//
// On the other hand, stream classes are large, and having one easily
// separatable aspect of their implementation (serialization) refactored out is
// arguably a good thing. If this file were to stay (in some form, certainly
// under a different name), other platforms would have to follow suit.
//
// Note: return value optimization should make returning Nanopb messages from
// functions cheap (even though they may be large types that are relatively
// expensive to copy).

class WatchStreamSerializer {
 public:
  explicit WatchStreamSerializer(Serializer serializer);

  nanopb::Message<google_firestore_v1_ListenRequest> EncodeWatchRequest(
      const local::TargetData& query) const;
  nanopb::Message<google_firestore_v1_ListenRequest> EncodeUnwatchRequest(
      model::TargetId target_id) const;

  nanopb::Message<google_firestore_v1_ListenResponse> ParseResponse(
      nanopb::Reader* reader) const;
  /**
   * Decodes the listen response. Modifies the provided proto to release
   * ownership of any Value messages.
   */
  std::unique_ptr<WatchChange> DecodeWatchChange(
      nanopb::Reader* reader,
      google_firestore_v1_ListenResponse& response) const;
  model::SnapshotVersion DecodeSnapshotVersion(
      nanopb::Reader* reader,
      const google_firestore_v1_ListenResponse& response) const;

 private:
  Serializer serializer_;
};

class WriteStreamSerializer {
 public:
  explicit WriteStreamSerializer(Serializer serializer);

  nanopb::Message<google_firestore_v1_WriteRequest> EncodeHandshake() const;
  nanopb::Message<google_firestore_v1_WriteRequest> EncodeWriteMutationsRequest(
      const std::vector<model::Mutation>& mutations,
      const nanopb::ByteString& last_stream_token) const;
  nanopb::Message<google_firestore_v1_WriteRequest> EncodeEmptyMutationsList(
      const nanopb::ByteString& last_stream_token) const;

  nanopb::Message<google_firestore_v1_WriteResponse> ParseResponse(
      nanopb::Reader* reader) const;
  model::SnapshotVersion DecodeCommitVersion(
      nanopb::Reader* reader,
      const google_firestore_v1_WriteResponse& proto) const;
  /**
   * Decodes the write response. Modifies the provided proto to release
   * ownership of any Value messages.
   */
  std::vector<model::MutationResult> DecodeMutationResults(
      nanopb::Reader* reader, google_firestore_v1_WriteResponse& proto) const;

 private:
  Serializer serializer_;
};

class DatastoreSerializer {
 public:
  explicit DatastoreSerializer(const core::DatabaseInfo& database_info);

  nanopb::Message<google_firestore_v1_CommitRequest> EncodeCommitRequest(
      const std::vector<model::Mutation>& mutations) const;

  nanopb::Message<google_firestore_v1_BatchGetDocumentsRequest>
  EncodeLookupRequest(const std::vector<model::DocumentKey>& keys) const;

  /**
   * Merges results of the streaming read together. The array is sorted by the
   * document key.
   */
  util::StatusOr<std::vector<model::Document>> MergeLookupResponses(
      const std::vector<grpc::ByteBuffer>& responses) const;

  const Serializer& serializer() const {
    return serializer_;
  }

 private:
  Serializer serializer_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_REMOTE_OBJC_BRIDGE_H_
