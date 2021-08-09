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

#include "Firestore/core/src/remote/remote_objc_bridge.h"

#include <map>

#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "Firestore/core/src/remote/grpc_nanopb.h"
#include "Firestore/core/src/remote/grpc_util.h"
#include "Firestore/core/src/remote/watch_change.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"
#include "grpcpp/support/status.h"

namespace firebase {
namespace firestore {
namespace remote {

using core::DatabaseInfo;
using local::TargetData;
using model::Document;
using model::DocumentKey;
using model::Mutation;
using model::MutationResult;
using model::SnapshotVersion;
using model::TargetId;
using nanopb::ByteString;
using nanopb::MakeArray;
using nanopb::Message;
using nanopb::Reader;
using remote::ByteBufferReader;
using remote::Serializer;
using util::StatusOr;

// WatchStreamSerializer

WatchStreamSerializer::WatchStreamSerializer(Serializer serializer)
    : serializer_{std::move(serializer)} {
}

Message<google_firestore_v1_ListenRequest>
WatchStreamSerializer::EncodeWatchRequest(const TargetData& query) const {
  Message<google_firestore_v1_ListenRequest> result;

  result->database = serializer_.EncodeDatabaseName();
  result->which_target_change =
      google_firestore_v1_ListenRequest_add_target_tag;
  result->add_target = serializer_.EncodeTarget(query);

  auto labels = serializer_.EncodeListenRequestLabels(query);
  if (!labels.empty()) {
    result->labels_count = nanopb::CheckedSize(labels.size());
    result->labels = MakeArray<google_firestore_v1_ListenRequest_LabelsEntry>(
        result->labels_count);

    pb_size_t i = 0;
    for (const auto& label : labels) {
      result->labels[i] = label;
      ++i;
    }
  }

  return result;
}

Message<google_firestore_v1_ListenRequest>
WatchStreamSerializer::EncodeUnwatchRequest(TargetId target_id) const {
  Message<google_firestore_v1_ListenRequest> result;

  result->database = serializer_.EncodeDatabaseName();
  result->which_target_change =
      google_firestore_v1_ListenRequest_remove_target_tag;
  result->remove_target = target_id;

  return result;
}

Message<google_firestore_v1_ListenResponse>
WatchStreamSerializer::ParseResponse(Reader* reader) const {
  return Message<google_firestore_v1_ListenResponse>::TryParse(reader);
}

std::unique_ptr<WatchChange> WatchStreamSerializer::DecodeWatchChange(
    nanopb::Reader* reader,
    google_firestore_v1_ListenResponse& response) const {
  return serializer_.DecodeWatchChange(reader->context(), response);
}

SnapshotVersion WatchStreamSerializer::DecodeSnapshotVersion(
    nanopb::Reader* reader,
    const google_firestore_v1_ListenResponse& response) const {
  return serializer_.DecodeVersionFromListenResponse(reader->context(),
                                                     response);
}

// WriteStreamSerializer

WriteStreamSerializer::WriteStreamSerializer(Serializer serializer)
    : serializer_{std::move(serializer)} {
}

Message<google_firestore_v1_WriteRequest>
WriteStreamSerializer::EncodeHandshake() const {
  Message<google_firestore_v1_WriteRequest> result;

  // The initial request cannot contain mutations, but must contain a project
  // ID.
  result->database = serializer_.EncodeDatabaseName();

  return result;
}

Message<google_firestore_v1_WriteRequest>
WriteStreamSerializer::EncodeWriteMutationsRequest(
    const std::vector<Mutation>& mutations,
    const ByteString& last_stream_token) const {
  Message<google_firestore_v1_WriteRequest> result;

  if (!mutations.empty()) {
    result->writes_count = nanopb::CheckedSize(mutations.size());
    result->writes = MakeArray<google_firestore_v1_Write>(result->writes_count);

    for (pb_size_t i = 0; i != result->writes_count; ++i) {
      result->writes[i] = serializer_.EncodeMutation(mutations[i]);
    }
  }

  result->stream_token = nanopb::CopyBytesArray(last_stream_token.get());

  return result;
}

Message<google_firestore_v1_WriteRequest>
WriteStreamSerializer::EncodeEmptyMutationsList(
    const ByteString& last_stream_token) const {
  return EncodeWriteMutationsRequest({}, last_stream_token);
}

Message<google_firestore_v1_WriteResponse> WriteStreamSerializer::ParseResponse(
    Reader* reader) const {
  return Message<google_firestore_v1_WriteResponse>::TryParse(reader);
}

SnapshotVersion WriteStreamSerializer::DecodeCommitVersion(
    nanopb::Reader* reader,
    const google_firestore_v1_WriteResponse& proto) const {
  return serializer_.DecodeVersion(reader->context(), proto.commit_time);
}

std::vector<MutationResult> WriteStreamSerializer::DecodeMutationResults(
    nanopb::Reader* reader, google_firestore_v1_WriteResponse& proto) const {
  SnapshotVersion commit_version = DecodeCommitVersion(reader, proto);
  if (!reader->ok()) {
    return {};
  }

  google_firestore_v1_WriteResult* writes = proto.write_results;
  pb_size_t count = proto.write_results_count;
  std::vector<MutationResult> results;
  results.reserve(count);

  for (pb_size_t i = 0; i != count; ++i) {
    results.push_back(serializer_.DecodeMutationResult(
        reader->context(), writes[i], commit_version));
  }

  return results;
}

// DatastoreSerializer

DatastoreSerializer::DatastoreSerializer(const DatabaseInfo& database_info)
    : serializer_{database_info.database_id()} {
}

Message<google_firestore_v1_CommitRequest>
DatastoreSerializer::EncodeCommitRequest(
    const std::vector<Mutation>& mutations) const {
  Message<google_firestore_v1_CommitRequest> result;

  result->database = serializer_.EncodeDatabaseName();

  if (!mutations.empty()) {
    result->writes_count = nanopb::CheckedSize(mutations.size());
    result->writes = MakeArray<google_firestore_v1_Write>(result->writes_count);
    pb_size_t i = 0;
    for (const Mutation& mutation : mutations) {
      result->writes[i] = serializer_.EncodeMutation(mutation);
      ++i;
    }
  }

  return result;
}

Message<google_firestore_v1_BatchGetDocumentsRequest>
DatastoreSerializer::EncodeLookupRequest(
    const std::vector<DocumentKey>& keys) const {
  Message<google_firestore_v1_BatchGetDocumentsRequest> result;

  result->database = serializer_.EncodeDatabaseName();
  if (!keys.empty()) {
    result->documents_count = nanopb::CheckedSize(keys.size());
    result->documents = MakeArray<pb_bytes_array_t*>(result->documents_count);
    pb_size_t i = 0;
    for (const DocumentKey& key : keys) {
      result->documents[i] = serializer_.EncodeKey(key);
      ++i;
    }
  }

  return result;
}

StatusOr<std::vector<model::Document>>
DatastoreSerializer::MergeLookupResponses(
    const std::vector<grpc::ByteBuffer>& responses) const {
  // Sort by key.
  std::map<DocumentKey, Document> results;

  for (const auto& response : responses) {
    ByteBufferReader reader{response};
    auto message =
        Message<google_firestore_v1_BatchGetDocumentsResponse>::TryParse(
            &reader);

    Document doc = serializer_.DecodeMaybeDocument(reader.context(), *message);
    if (!reader.ok()) {
      return reader.status();
    }

    results[doc->key()] = std::move(doc);
  }

  std::vector<Document> docs;
  docs.reserve(results.size());
  for (const auto& kv : results) {
    docs.push_back(kv.second);
  }

  StatusOr<std::vector<Document>> result{std::move(docs)};
  return result;
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
