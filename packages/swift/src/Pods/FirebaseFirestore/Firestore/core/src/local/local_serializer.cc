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

#include "Firestore/core/src/local/local_serializer.h"

#include <cstdlib>
#include <limits>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/firestore/bundle.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/maybe_document.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/mutation.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/target.nanopb.h"
#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/types/span.h"

namespace firebase {
namespace firestore {
namespace local {
namespace {

using bundle::BundledQuery;
using bundle::BundleMetadata;
using bundle::NamedQuery;
using core::Target;
using model::DeepClone;
using model::FieldTransform;
using model::MutableDocument;
using model::Mutation;
using model::MutationBatch;
using model::ObjectValue;
using model::SnapshotVersion;
using nanopb::ByteString;
using nanopb::CheckedSize;
using nanopb::CopyBytesArray;
using nanopb::MakeArray;
using nanopb::Message;
using nanopb::Reader;
using nanopb::ReleaseFieldOwnership;
using nanopb::SafeReadBoolean;
using nanopb::SetRepeatedField;
using nanopb::Writer;
using util::Status;
using util::StringFormat;

}  // namespace

Message<firestore_client_MaybeDocument> LocalSerializer::EncodeMaybeDocument(
    const MutableDocument& document) const {
  Message<firestore_client_MaybeDocument> result;

  if (document.is_found_document()) {
    result->which_document_type = firestore_client_MaybeDocument_document_tag;
    result->document = EncodeDocument(document);
    result->has_committed_mutations = document.has_committed_mutations();
    return result;
  } else if (document.is_no_document()) {
    result->which_document_type =
        firestore_client_MaybeDocument_no_document_tag;
    result->no_document = EncodeNoDocument(document);
    result->has_committed_mutations = document.has_committed_mutations();
    return result;
  } else if (document.is_unknown_document()) {
    result->which_document_type =
        firestore_client_MaybeDocument_unknown_document_tag;
    result->unknown_document = EncodeUnknownDocument(document);
    result->has_committed_mutations = true;
    return result;
  } else {
    HARD_FAIL("Unknown document type %s", document.ToString());
  }

  UNREACHABLE();
}

MutableDocument LocalSerializer::DecodeMaybeDocument(
    Reader* reader, firestore_client_MaybeDocument& proto) const {
  if (!reader->status().ok()) return {};

  switch (proto.which_document_type) {
    case firestore_client_MaybeDocument_document_tag:
      return DecodeDocument(reader, proto.document,
                            SafeReadBoolean(proto.has_committed_mutations));

    case firestore_client_MaybeDocument_no_document_tag:
      return DecodeNoDocument(reader, proto.no_document,
                              SafeReadBoolean(proto.has_committed_mutations));

    case firestore_client_MaybeDocument_unknown_document_tag:
      return DecodeUnknownDocument(reader, proto.unknown_document);

    default:
      reader->Fail(
          StringFormat("Invalid document type: %s. Expected 'no_document' (%s) "
                       "or 'document' (%s)",
                       proto.which_document_type,
                       firestore_client_MaybeDocument_no_document_tag,
                       firestore_client_MaybeDocument_document_tag));
      return {};
  }

  UNREACHABLE();
}

google_firestore_v1_Document LocalSerializer::EncodeDocument(
    const MutableDocument& doc) const {
  google_firestore_v1_Document result{};

  result.name = rpc_serializer_.EncodeKey(doc.key());

  // Encode Document.fields (unless it's empty)
  google_firestore_v1_MapValue fields_map = doc.value().map_value;
  SetRepeatedField(
      &result.fields, &result.fields_count,
      absl::Span<google_firestore_v1_MapValue_FieldsEntry>(
          fields_map.fields, fields_map.fields_count),
      [](const google_firestore_v1_MapValue_FieldsEntry& map_entry) {
        // TODO(mrschmidt): Figure out how to remove this copy
        return google_firestore_v1_Document_FieldsEntry{
            nanopb::CopyBytesArray(map_entry.key),
            *DeepClone(map_entry.value).release()};
      });

  result.has_update_time = true;
  result.update_time = rpc_serializer_.EncodeVersion(doc.version());
  // Ignore Document.create_time. (We don't use this in our on-disk protos.)

  return result;
}

MutableDocument LocalSerializer::DecodeDocument(
    Reader* reader,
    google_firestore_v1_Document& proto,
    bool has_committed_mutations) const {
  ObjectValue fields =
      ObjectValue::FromFieldsEntry(proto.fields, proto.fields_count);
  SnapshotVersion version =
      rpc_serializer_.DecodeVersion(reader->context(), proto.update_time);

  MutableDocument document = MutableDocument::FoundDocument(
      rpc_serializer_.DecodeKey(reader->context(), proto.name), version,
      std::move(fields));
  if (has_committed_mutations) {
    document.SetHasCommittedMutations();
  }
  return document;
}

firestore_client_NoDocument LocalSerializer::EncodeNoDocument(
    const MutableDocument& no_doc) const {
  firestore_client_NoDocument result{};

  result.name = rpc_serializer_.EncodeKey(no_doc.key());
  result.read_time = rpc_serializer_.EncodeVersion(no_doc.version());

  return result;
}

MutableDocument LocalSerializer::DecodeNoDocument(
    Reader* reader,
    const firestore_client_NoDocument& proto,
    bool has_committed_mutations) const {
  SnapshotVersion version =
      rpc_serializer_.DecodeVersion(reader->context(), proto.read_time);

  MutableDocument document = MutableDocument::NoDocument(
      rpc_serializer_.DecodeKey(reader->context(), proto.name), version);
  if (has_committed_mutations) {
    document.SetHasCommittedMutations();
  }
  return document;
}

firestore_client_UnknownDocument LocalSerializer::EncodeUnknownDocument(
    const MutableDocument& unknown_doc) const {
  firestore_client_UnknownDocument result{};

  result.name = rpc_serializer_.EncodeKey(unknown_doc.key());
  result.version = rpc_serializer_.EncodeVersion(unknown_doc.version());

  return result;
}

MutableDocument LocalSerializer::DecodeUnknownDocument(
    Reader* reader, const firestore_client_UnknownDocument& proto) const {
  SnapshotVersion version =
      rpc_serializer_.DecodeVersion(reader->context(), proto.version);

  return MutableDocument::UnknownDocument(
      rpc_serializer_.DecodeKey(reader->context(), proto.name), version);
}

Message<firestore_client_Target> LocalSerializer::EncodeTargetData(
    const TargetData& target_data) const {
  HARD_ASSERT(target_data.purpose() == QueryPurpose::Listen,
              "Only queries with purpose %s may be stored, got %s",
              QueryPurpose::Listen, target_data.purpose());

  Message<firestore_client_Target> result;

  result->target_id = target_data.target_id();
  result->last_listen_sequence_number = target_data.sequence_number();
  result->snapshot_version = rpc_serializer_.EncodeTimestamp(
      target_data.snapshot_version().timestamp());
  result->last_limbo_free_snapshot_version = rpc_serializer_.EncodeTimestamp(
      target_data.last_limbo_free_snapshot_version().timestamp());

  // Force a copy because pb_release would otherwise double-free.
  result->resume_token =
      nanopb::CopyBytesArray(target_data.resume_token().get());

  const Target& target = target_data.target();
  if (target.IsDocumentQuery()) {
    result->which_target_type = firestore_client_Target_documents_tag;
    result->documents = rpc_serializer_.EncodeDocumentsTarget(target);
  } else {
    result->which_target_type = firestore_client_Target_query_tag;
    result->query = rpc_serializer_.EncodeQueryTarget(target);
  }

  return result;
}

TargetData LocalSerializer::DecodeTargetData(
    Reader* reader, firestore_client_Target& proto) const {
  if (!reader->status().ok()) return TargetData();

  model::TargetId target_id = proto.target_id;
  model::ListenSequenceNumber sequence_number =
      static_cast<model::ListenSequenceNumber>(
          proto.last_listen_sequence_number);
  SnapshotVersion version =
      rpc_serializer_.DecodeVersion(reader->context(), proto.snapshot_version);
  SnapshotVersion last_limbo_free_snapshot_version =
      rpc_serializer_.DecodeVersion(reader->context(),
                                    proto.last_limbo_free_snapshot_version);
  ByteString resume_token(proto.resume_token);
  Target target;

  switch (proto.which_target_type) {
    case firestore_client_Target_query_tag:
      target =
          rpc_serializer_.DecodeQueryTarget(reader->context(), proto.query);
      break;

    case firestore_client_Target_documents_tag:
      target = rpc_serializer_.DecodeDocumentsTarget(reader->context(),
                                                     proto.documents);
      break;

    default:
      reader->Fail(
          StringFormat("Unknown target_type: %s", proto.which_target_type));
  }

  if (!reader->status().ok()) return TargetData();
  return TargetData(std::move(target), target_id, sequence_number,
                    QueryPurpose::Listen, version,
                    last_limbo_free_snapshot_version, std::move(resume_token));
}

Message<firestore_client_WriteBatch> LocalSerializer::EncodeMutationBatch(
    const MutationBatch& mutation_batch) const {
  Message<firestore_client_WriteBatch> result;

  result->batch_id = mutation_batch.batch_id();

  pb_size_t count = CheckedSize(mutation_batch.base_mutations().size());
  result->base_writes_count = count;
  result->base_writes = MakeArray<google_firestore_v1_Write>(count);
  int i = 0;
  for (const auto& mutation : mutation_batch.base_mutations()) {
    result->base_writes[i] = rpc_serializer_.EncodeMutation(mutation);
    ++i;
  }

  count = CheckedSize(mutation_batch.mutations().size());
  result->writes_count = count;
  result->writes = MakeArray<google_firestore_v1_Write>(count);
  i = 0;
  for (const auto& mutation : mutation_batch.mutations()) {
    result->writes[i] = rpc_serializer_.EncodeMutation(mutation);
    ++i;
  }

  result->local_write_time =
      rpc_serializer_.EncodeTimestamp(mutation_batch.local_write_time());

  return result;
}

MutationBatch LocalSerializer::DecodeMutationBatch(
    nanopb::Reader* reader, firestore_client_WriteBatch& proto) const {
  int batch_id = proto.batch_id;
  Timestamp local_write_time = rpc_serializer_.DecodeTimestamp(
      reader->context(), proto.local_write_time);

  std::vector<Mutation> base_mutations;
  for (size_t i = 0; i < proto.base_writes_count; i++) {
    base_mutations.push_back(rpc_serializer_.DecodeMutation(
        reader->context(), proto.base_writes[i]));
  }

  std::vector<Mutation> mutations;

  // Squash old transform mutations into existing patch of set mutations. The
  // replacement of representing `transforms` with `update_transforms` on the
  // SDK means that old `transform` mutations stored in LevelDB need to be
  // updated to `update_transforms`.
  // TODO(b/174608374): Remove this code once we perform a schema migration.
  for (size_t i = 0; i < proto.writes_count; ++i) {
    google_firestore_v1_Write current_mutation = proto.writes[i];
    bool has_transform = i + 1 < proto.writes_count &&
                         proto.writes[i + 1].which_operation ==
                             google_firestore_v1_Write_transform_tag;
    if (has_transform) {
      google_firestore_v1_Write& transform_mutation = proto.writes[i + 1];
      HARD_ASSERT(
          proto.writes[i].which_operation ==
              google_firestore_v1_Write_update_tag,
          "TransformMutation should be preceded by a patch or set mutation");
      google_firestore_v1_Write new_mutation{current_mutation};
      new_mutation.update_transforms_count =
          transform_mutation.transform.field_transforms_count;
      new_mutation.update_transforms =
          transform_mutation.transform.field_transforms;
      // Prevent double-freeing of the write's fields. The fields are now owned
      // by the mutation.
      transform_mutation.transform.field_transforms_count = 0;
      transform_mutation.transform.field_transforms = nullptr;
      mutations.push_back(
          rpc_serializer_.DecodeMutation(reader->context(), new_mutation));
      ++i;
    } else {
      mutations.push_back(
          rpc_serializer_.DecodeMutation(reader->context(), current_mutation));
    }
  }

  return MutationBatch(batch_id, local_write_time, std::move(base_mutations),
                       std::move(mutations));
}

google_protobuf_Timestamp LocalSerializer::EncodeVersion(
    const model::SnapshotVersion& version) const {
  return rpc_serializer_.EncodeVersion(version);
}

model::SnapshotVersion LocalSerializer::DecodeVersion(
    nanopb::Reader* reader, const google_protobuf_Timestamp& proto) const {
  return rpc_serializer_.DecodeVersion(reader->context(), proto);
}

Message<firestore_BundleMetadata> LocalSerializer::EncodeBundle(
    const BundleMetadata& metadata) const {
  Message<firestore_BundleMetadata> result;

  // Note: only fields intended to be stored get encoded here, `total_documents`
  // and `total_bytes` are skipped for example, they are not useful once the
  // bundle has been parsed and loaded.
  result->id = rpc_serializer_.EncodeString(metadata.bundle_id());
  result->version = metadata.version();
  result->create_time = EncodeVersion(metadata.create_time());
  return result;
}

BundleMetadata LocalSerializer::DecodeBundle(
    Reader* reader, const firestore_BundleMetadata& proto) const {
  return BundleMetadata(rpc_serializer_.DecodeString(proto.id), proto.version,
                        DecodeVersion(reader, proto.create_time));
}

Message<firestore_NamedQuery> LocalSerializer::EncodeNamedQuery(
    const NamedQuery& query) const {
  Message<firestore_NamedQuery> result;

  result->name = rpc_serializer_.EncodeString(query.query_name());
  result->read_time = EncodeVersion(query.read_time());
  result->bundled_query = EncodeBundledQuery(query.bundled_query());

  return result;
}

NamedQuery LocalSerializer::DecodeNamedQuery(
    nanopb::Reader* reader, firestore_NamedQuery& proto) const {
  return NamedQuery(rpc_serializer_.DecodeString(proto.name),
                    DecodeBundledQuery(reader, proto.bundled_query),
                    DecodeVersion(reader, proto.read_time));
}

firestore_BundledQuery LocalSerializer::EncodeBundledQuery(
    const BundledQuery& query) const {
  firestore_BundledQuery result{};

  result.limit_type = query.limit_type() == core::LimitType::First
                          ? _firestore_BundledQuery_LimitType::
                                firestore_BundledQuery_LimitType_FIRST
                          : _firestore_BundledQuery_LimitType::
                                firestore_BundledQuery_LimitType_LAST;

  auto query_target = rpc_serializer_.EncodeQueryTarget(query.target());
  result.parent = query_target.parent;
  result.which_query_type = firestore_BundledQuery_structured_query_tag;
  result.structured_query = query_target.structured_query;

  return result;
}

BundledQuery LocalSerializer::DecodeBundledQuery(
    nanopb::Reader* reader, firestore_BundledQuery& query) const {
  // The QueryTarget oneof only has a single valid value.
  if (query.which_query_type != firestore_BundledQuery_structured_query_tag) {
    reader->Fail(
        StringFormat("Unknown bundled query_type: %s", query.which_query_type));
    return BundledQuery();
  }

  auto limit_type = query.limit_type ==
                            _firestore_BundledQuery_LimitType::
                                firestore_BundledQuery_LimitType_FIRST
                        ? core::LimitType::First
                        : core::LimitType::Last;
  return BundledQuery(
      rpc_serializer_.DecodeStructuredQuery(reader->context(), query.parent,
                                            query.structured_query),
      limit_type);
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
