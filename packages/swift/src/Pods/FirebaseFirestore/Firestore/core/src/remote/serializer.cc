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

#include "Firestore/core/src/remote/serializer.h"

#include <pb_decode.h>
#include <pb_encode.h>

#include <algorithm>
#include <functional>
#include <limits>
#include <map>
#include <set>
#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/Protos/nanopb/google/firestore/v1/firestore.nanopb.h"
#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/core/bound.h"
#include "Firestore/core/src/core/field_filter.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/delete_mutation.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/patch_mutation.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/server_timestamp_util.h"
#include "Firestore/core/src/model/set_mutation.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/model/verify_mutation.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "Firestore/core/src/timestamp_internal.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/algorithm/container.h"
#include "absl/types/span.h"

namespace firebase {
namespace firestore {
namespace remote {

using core::Bound;
using core::CollectionGroupId;
using core::Direction;
using core::FieldFilter;
using core::Filter;
using core::FilterList;
using core::OrderBy;
using core::OrderByList;
using core::Query;
using core::Target;
using local::QueryPurpose;
using local::TargetData;
using model::ArrayTransform;
using model::DatabaseId;
using model::DeepClone;
using model::DeleteMutation;
using model::DocumentKey;
using model::EncodeServerTimestamp;
using model::FieldMask;
using model::FieldPath;
using model::FieldTransform;
using model::IsNaNValue;
using model::IsNullValue;
using model::MutableDocument;
using model::Mutation;
using model::MutationResult;
using model::NaNValue;
using model::NullValue;
using model::NumericIncrementTransform;
using model::ObjectValue;
using model::PatchMutation;
using model::Precondition;
using model::ResourcePath;
using model::ServerTimestampTransform;
using model::SetMutation;
using model::SnapshotVersion;
using model::TargetId;
using model::TransformOperation;
using model::VerifyMutation;
using nanopb::ByteString;
using nanopb::CheckedSize;
using nanopb::MakeArray;
using nanopb::MakeMessage;
using nanopb::MakeSharedMessage;
using nanopb::MakeStringView;
using nanopb::Message;
using nanopb::ReleaseFieldOwnership;
using nanopb::SafeReadBoolean;
using nanopb::SetRepeatedField;
using nanopb::SharedMessage;
using nanopb::Writer;
using remote::WatchChange;
using util::ReadContext;
using util::Status;
using util::StatusOr;
using util::StringFormat;

pb_bytes_array_t* Serializer::EncodeString(const std::string& str) {
  return nanopb::MakeBytesArray(str);
}

std::string Serializer::DecodeString(const pb_bytes_array_t* str) {
  return nanopb::MakeString(str);
}

namespace {

/**
 * Creates the prefix for a fully qualified resource path, without a local path
 * on the end.
 */
ResourcePath DatabaseName(const DatabaseId& database_id) {
  return ResourcePath{"projects", database_id.project_id(), "databases",
                      database_id.database_id()};
}

/**
 * Validates that a path has a prefix that looks like a valid encoded
 * database ID.
 */
bool IsValidResourceName(const ResourcePath& path) {
  // Resource names have at least 4 components (project ID, database ID)
  // and commonly the (root) resource type, e.g. documents
  return path.size() >= 4 && path[0] == "projects" && path[2] == "databases";
}

/**
 * Decodes a fully qualified resource name into a resource path and validates
 * that there is a project and database encoded in the path along with a local
 * path.
 */
ResourcePath ExtractLocalPathFromResourceName(
    ReadContext* context, const ResourcePath& resource_name) {
  if (resource_name.size() <= 4 || resource_name[4] != "documents") {
    context->Fail(StringFormat("Tried to deserialize invalid key %s",
                               resource_name.CanonicalString()));
    return ResourcePath{};
  }
  return resource_name.PopFirst(5);
}

Filter InvalidFilter() {
  // The exact value doesn't matter. Note that there's no way to create the base
  // class `Filter`, so it has to be one of the derived classes.
  return FieldFilter::Create({}, {},
                             MakeSharedMessage(google_firestore_v1_Value{}));
}

FieldPath InvalidFieldPath() {
  return FieldPath::EmptyPath();
}

}  // namespace

Serializer::Serializer(DatabaseId database_id)
    : database_id_(std::move(database_id)) {
}

pb_bytes_array_t* Serializer::EncodeDatabaseName() const {
  return EncodeString(DatabaseName(database_id_).CanonicalString());
}

pb_bytes_array_t* Serializer::EncodeKey(const DocumentKey& key) const {
  return EncodeResourceName(database_id_, key.path());
}

void Serializer::ValidateDocumentKeyPath(
    ReadContext* context, const ResourcePath& resource_name) const {
  if (resource_name.size() < 5) {
    context->Fail(
        StringFormat("Attempted to decode invalid key: '%s'. Should have at "
                     "least 5 segments.",
                     resource_name.CanonicalString()));
  } else if (resource_name[1] != database_id_.project_id()) {
    context->Fail(
        StringFormat("Tried to deserialize key from different project. "
                     "Expected: '%s'. Found: '%s'. (Full key: '%s')",
                     database_id_.project_id(), resource_name[1],
                     resource_name.CanonicalString()));
  } else if (resource_name[3] != database_id_.database_id()) {
    context->Fail(
        StringFormat("Tried to deserialize key from different database. "
                     "Expected: '%s'. Found: '%s'. (Full key: '%s')",
                     database_id_.database_id(), resource_name[3],
                     resource_name.CanonicalString()));
  }
}

DocumentKey Serializer::DecodeKey(ReadContext* context,
                                  const pb_bytes_array_t* name) const {
  ResourcePath resource_name =
      DecodeResourceName(context, MakeStringView(name));
  ValidateDocumentKeyPath(context, resource_name);

  return DecodeKey(context, resource_name);
}

DocumentKey Serializer::DecodeKey(ReadContext* context,
                                  const ResourcePath& resource_name) const {
  ResourcePath local_path =
      ExtractLocalPathFromResourceName(context, resource_name);

  if (!DocumentKey::IsDocumentKey(local_path)) {
    context->Fail(StringFormat("Invalid document key path: %s",
                               local_path.CanonicalString()));
  }

  // Avoid assertion failures in DocumentKey if local_path is invalid.
  if (!context->status().ok()) return DocumentKey{};
  return DocumentKey{std::move(local_path)};
}

pb_bytes_array_t* Serializer::EncodeQueryPath(const ResourcePath& path) const {
  return EncodeResourceName(database_id_, path);
}

ResourcePath Serializer::DecodeQueryPath(ReadContext* context,
                                         absl::string_view name) const {
  ResourcePath resource = DecodeResourceName(context, name);
  if (resource.size() == 4) {
    // In v1beta1 queries for collections at the root did not have a trailing
    // "/documents". In v1 all resource paths contain "/documents". Preserve the
    // ability to read the v1beta1 form for compatibility with queries persisted
    // in the local target cache.
    return ResourcePath::Empty();
  } else {
    return ExtractLocalPathFromResourceName(context, resource);
  }
}

pb_bytes_array_t* Serializer::EncodeResourceName(
    const DatabaseId& database_id, const ResourcePath& path) const {
  return Serializer::EncodeString(DatabaseName(database_id)
                                      .Append("documents")
                                      .Append(path)
                                      .CanonicalString());
}

ResourcePath Serializer::DecodeResourceName(ReadContext* context,
                                            absl::string_view encoded) const {
  auto resource = ResourcePath::FromStringView(encoded);
  if (!IsValidResourceName(resource)) {
    context->Fail(StringFormat("Tried to deserialize an invalid key: %s",
                               resource.CanonicalString()));
  }
  return resource;
}

google_firestore_v1_Document Serializer::EncodeDocument(
    const DocumentKey& key, const ObjectValue& object_value) const {
  google_firestore_v1_Document result{};

  result.name = EncodeKey(key);

  // Encode Document.fields (unless it's empty)
  const google_firestore_v1_MapValue& map_value = object_value.Get().map_value;
  SetRepeatedField(
      &result.fields, &result.fields_count,
      absl::Span<google_firestore_v1_MapValue_FieldsEntry>(
          map_value.fields, map_value.fields_count),
      [](const google_firestore_v1_MapValue_FieldsEntry& entry) {
        // TODO(mrschmidt): Figure out how to remove this copy
        return google_firestore_v1_Document_FieldsEntry{
            nanopb::MakeBytesArray(entry.key->bytes, entry.key->size),
            *DeepClone(entry.value).release()};
      });

  // Skip Document.create_time and Document.update_time, since they're
  // output-only fields.

  return result;
}

MutableDocument Serializer::DecodeMaybeDocument(
    ReadContext* context,
    google_firestore_v1_BatchGetDocumentsResponse& response) const {
  switch (response.which_result) {
    case google_firestore_v1_BatchGetDocumentsResponse_found_tag:
      return DecodeFoundDocument(context, response);
    case google_firestore_v1_BatchGetDocumentsResponse_missing_tag:
      return DecodeMissingDocument(context, response);
    default:
      context->Fail(
          StringFormat("Unknown result case: %s", response.which_result));
      return MutableDocument::InvalidDocument({});
  }

  UNREACHABLE();
}

MutableDocument Serializer::DecodeFoundDocument(
    ReadContext* context,
    google_firestore_v1_BatchGetDocumentsResponse& response) const {
  HARD_ASSERT(response.which_result ==
                  google_firestore_v1_BatchGetDocumentsResponse_found_tag,
              "Tried to deserialize a found document from a missing document.");

  DocumentKey key = DecodeKey(context, response.found.name);
  ObjectValue value = ObjectValue::FromFieldsEntry(response.found.fields,
                                                   response.found.fields_count);
  SnapshotVersion version = DecodeVersion(context, response.found.update_time);

  if (version == SnapshotVersion::None()) {
    context->Fail("Got a document response with no snapshot version");
  }

  return MutableDocument::FoundDocument(std::move(key), version,
                                        std::move(value));
}

MutableDocument Serializer::DecodeMissingDocument(
    ReadContext* context,
    const google_firestore_v1_BatchGetDocumentsResponse& response) const {
  HARD_ASSERT(response.which_result ==
                  google_firestore_v1_BatchGetDocumentsResponse_missing_tag,
              "Tried to deserialize a missing document from a found document.");

  DocumentKey key = DecodeKey(context, response.missing);
  SnapshotVersion version = DecodeVersion(context, response.read_time);

  if (version == SnapshotVersion::None()) {
    context->Fail("Got a no document response with no snapshot version");
  }

  return MutableDocument::NoDocument(std::move(key), version);
}

google_firestore_v1_Write Serializer::EncodeMutation(
    const Mutation& mutation) const {
  HARD_ASSERT(mutation.is_valid(), "Invalid mutation encountered.");
  google_firestore_v1_Write result{};

  if (!mutation.precondition().is_none()) {
    result.has_current_document = true;
    result.current_document = EncodePrecondition(mutation.precondition());
  }

  SetRepeatedField(&result.update_transforms, &result.update_transforms_count,
                   mutation.field_transforms(), [&](const FieldTransform& t) {
                     return EncodeFieldTransform(t);
                   });

  switch (mutation.type()) {
    case Mutation::Type::Set: {
      result.which_operation = google_firestore_v1_Write_update_tag;
      result.update = EncodeDocument(
          mutation.key(), static_cast<const SetMutation&>(mutation).value());
      return result;
    }

    case Mutation::Type::Patch: {
      result.which_operation = google_firestore_v1_Write_update_tag;
      auto patch_mutation = static_cast<const PatchMutation&>(mutation);
      result.update = EncodeDocument(mutation.key(), patch_mutation.value());
      // Note: the fact that this field is set (even if the mask is empty) is
      // what makes the backend treat this as a patch mutation, not a set
      // mutation.
      result.has_update_mask = true;
      if (patch_mutation.mask().size() != 0) {
        result.update_mask = EncodeFieldMask(patch_mutation.mask());
      }
      return result;
    }

    case Mutation::Type::Delete: {
      result.which_operation = google_firestore_v1_Write_delete_tag;
      result.delete_ = EncodeKey(mutation.key());
      return result;
    }

    case Mutation::Type::Verify: {
      result.which_operation = google_firestore_v1_Write_verify_tag;
      result.verify = EncodeKey(mutation.key());
      return result;
    }
  }

  UNREACHABLE();
}

Mutation Serializer::DecodeMutation(ReadContext* context,
                                    google_firestore_v1_Write& mutation) const {
  auto precondition = Precondition::None();
  if (mutation.has_current_document) {
    precondition = DecodePrecondition(context, mutation.current_document);
  }

  std::vector<FieldTransform> field_transforms;
  for (size_t i = 0; i < mutation.update_transforms_count; i++) {
    field_transforms.push_back(
        DecodeFieldTransform(context, mutation.update_transforms[i]));
  }

  switch (mutation.which_operation) {
    case google_firestore_v1_Write_update_tag: {
      DocumentKey key = DecodeKey(context, mutation.update.name);
      ObjectValue value = ObjectValue::FromFieldsEntry(
          mutation.update.fields, mutation.update.fields_count);
      if (mutation.has_update_mask) {
        FieldMask mask = DecodeFieldMask(context, mutation.update_mask);
        return PatchMutation(std::move(key), std::move(value), std::move(mask),
                             std::move(precondition),
                             std::move(field_transforms));
      } else {
        return SetMutation(std::move(key), std::move(value),
                           std::move(precondition),
                           std::move(field_transforms));
      }
    }

    case google_firestore_v1_Write_delete_tag:
      return DeleteMutation(DecodeKey(context, mutation.delete_),
                            std::move(precondition));

    case google_firestore_v1_Write_verify_tag: {
      return VerifyMutation(DecodeKey(context, mutation.verify),
                            std::move(precondition));
    }

    default:
      context->Fail(StringFormat("Unknown mutation operation: %s",
                                 mutation.which_operation));
      return {};
  }

  UNREACHABLE();
}

/* static */
google_firestore_v1_Precondition Serializer::EncodePrecondition(
    const Precondition& precondition) {
  google_firestore_v1_Precondition result{};

  switch (precondition.type()) {
    case Precondition::Type::None:
      HARD_FAIL("Can't serialize an empty precondition");

    case Precondition::Type::UpdateTime:
      result.which_condition_type =
          google_firestore_v1_Precondition_update_time_tag;
      result.update_time = EncodeVersion(precondition.update_time());
      return result;

    case Precondition::Type::Exists:
      result.which_condition_type = google_firestore_v1_Precondition_exists_tag;
      result.exists = precondition.exists();
      return result;
  }

  UNREACHABLE();
}

/* static */
Precondition Serializer::DecodePrecondition(
    ReadContext* context,
    const google_firestore_v1_Precondition& precondition) {
  switch (precondition.which_condition_type) {
    // 0 => type unset. nanopb doesn't provide a constant for this, so we use a
    // raw integer.
    case 0:
      return Precondition::None();
    case google_firestore_v1_Precondition_exists_tag: {
      // TODO(rsgowman): Refactor with other instance of bit_cast.

      // Due to the nanopb implementation, precondition.exists could be an
      // integer other than 0 or 1, (such as 2). This leads to undefined
      // behaviour when it's read as a boolean. eg. on at least gcc, the value
      // is treated as both true *and* false. So we'll instead memcpy to an
      // integer (via absl::bit_cast) and compare with 0.
      int bool_as_int = absl::bit_cast<int8_t>(precondition.exists);
      return Precondition::Exists(bool_as_int != 0);
    }
    case google_firestore_v1_Precondition_update_time_tag:
      return Precondition::UpdateTime(
          DecodeVersion(context, precondition.update_time));
  }

  context->Fail(StringFormat("Unknown Precondition type: %s",
                             precondition.which_condition_type));
  return Precondition::None();
}

/* static */
google_firestore_v1_DocumentMask Serializer::EncodeFieldMask(
    const FieldMask& mask) {
  google_firestore_v1_DocumentMask result{};
  SetRepeatedField(
      &result.field_paths, &result.field_paths_count, mask,
      [&](const FieldPath& path) { return EncodeFieldPath(path); });
  return result;
}

/* static */
FieldMask Serializer::DecodeFieldMask(
    ReadContext* context, const google_firestore_v1_DocumentMask& mask) {
  std::set<FieldPath> fields;
  for (size_t i = 0; i < mask.field_paths_count; i++) {
    fields.insert(DecodeFieldPath(context, mask.field_paths[i]));
  }
  return FieldMask(std::move(fields));
}

google_firestore_v1_DocumentTransform_FieldTransform
Serializer::EncodeFieldTransform(const FieldTransform& field_transform) const {
  using Type = TransformOperation::Type;

  google_firestore_v1_DocumentTransform_FieldTransform proto{};
  proto.field_path = EncodeFieldPath(field_transform.path());

  switch (field_transform.transformation().type()) {
    case Type::ServerTimestamp:
      proto.which_transform_type =
          google_firestore_v1_DocumentTransform_FieldTransform_set_to_server_value_tag;  // NOLINT
      proto.set_to_server_value =
          google_firestore_v1_DocumentTransform_FieldTransform_ServerValue_REQUEST_TIME;  // NOLINT
      return proto;

    case Type::ArrayUnion:
      proto.which_transform_type =
          google_firestore_v1_DocumentTransform_FieldTransform_append_missing_elements_tag;  // NOLINT
      // TODO(mrschmidt): Figure out how to remove this copy
      proto.append_missing_elements =
          *DeepClone(
               ArrayTransform(field_transform.transformation()).elements())
               .release();
      return proto;

    case Type::ArrayRemove:
      proto.which_transform_type =
          google_firestore_v1_DocumentTransform_FieldTransform_remove_all_from_array_tag;  // NOLINT
      // TODO(mrschmidt): Figure out how to remove this copy
      proto.remove_all_from_array =
          *DeepClone(
               ArrayTransform(field_transform.transformation()).elements())
               .release();
      return proto;

    case Type::Increment: {
      proto.which_transform_type =
          google_firestore_v1_DocumentTransform_FieldTransform_increment_tag;
      const auto& increment = static_cast<const NumericIncrementTransform&>(
          field_transform.transformation());
      proto.increment = increment.operand();
      return proto;
    }
  }

  UNREACHABLE();
}

FieldTransform Serializer::DecodeFieldTransform(
    ReadContext* context,
    google_firestore_v1_DocumentTransform_FieldTransform& proto) const {
  FieldPath field = DecodeFieldPath(context, proto.field_path);

  switch (proto.which_transform_type) {
    case google_firestore_v1_DocumentTransform_FieldTransform_set_to_server_value_tag: {  // NOLINT
      HARD_ASSERT(
          proto.set_to_server_value ==
              google_firestore_v1_DocumentTransform_FieldTransform_ServerValue_REQUEST_TIME,  // NOLINT
          "Unknown transform setToServerValue: %s", proto.set_to_server_value);

      return FieldTransform(std::move(field), ServerTimestampTransform());
    }

    case google_firestore_v1_DocumentTransform_FieldTransform_append_missing_elements_tag: {  // NOLINT
      FieldTransform field_transform(
          std::move(field),
          ArrayTransform(TransformOperation::Type::ArrayUnion,
                         MakeMessage(proto.append_missing_elements)));
      // Release field ownership to prevent double-freeing. The values are now
      // owned by the FieldTransform.
      proto.append_missing_elements = {};
      return field_transform;
    }

    case google_firestore_v1_DocumentTransform_FieldTransform_remove_all_from_array_tag: {  // NOLINT
      FieldTransform field_transform(
          std::move(field),
          ArrayTransform(TransformOperation::Type::ArrayRemove,
                         MakeMessage(proto.remove_all_from_array)));
      // Release field ownership to prevent double-freeing. The values are now
      // owned by the FieldTransform.
      proto.append_missing_elements = {};
      return field_transform;
    }

    case google_firestore_v1_DocumentTransform_FieldTransform_increment_tag: {
      return FieldTransform(
          std::move(field),
          NumericIncrementTransform(MakeMessage(proto.increment)));
    }
  }

  UNREACHABLE();
}

google_firestore_v1_Target Serializer::EncodeTarget(
    const TargetData& target_data) const {
  google_firestore_v1_Target result{};
  const Target& target = target_data.target();

  if (target.IsDocumentQuery()) {
    result.which_target_type = google_firestore_v1_Target_documents_tag;
    result.target_type.documents = EncodeDocumentsTarget(target);
  } else {
    result.which_target_type = google_firestore_v1_Target_query_tag;
    result.target_type.query = EncodeQueryTarget(target);
  }

  result.target_id = target_data.target_id();
  if (!target_data.resume_token().empty()) {
    result.which_resume_type = google_firestore_v1_Target_resume_token_tag;
    result.resume_type.resume_token =
        nanopb::CopyBytesArray(target_data.resume_token().get());
  }

  return result;
}

google_firestore_v1_Target_DocumentsTarget Serializer::EncodeDocumentsTarget(
    const core::Target& target) const {
  google_firestore_v1_Target_DocumentsTarget result{};

  result.documents_count = 1;
  result.documents = MakeArray<pb_bytes_array_t*>(result.documents_count);
  result.documents[0] = EncodeQueryPath(target.path());

  return result;
}

Target Serializer::DecodeDocumentsTarget(
    ReadContext* context,
    const google_firestore_v1_Target_DocumentsTarget& proto) const {
  if (proto.documents_count != 1) {
    context->Fail(
        StringFormat("DocumentsTarget contained other than 1 document %s",
                     proto.documents_count));
    return {};
  }

  ResourcePath path =
      DecodeQueryPath(context, DecodeString(proto.documents[0]));
  return Query(std::move(path)).ToTarget();
}

google_firestore_v1_Target_QueryTarget Serializer::EncodeQueryTarget(
    const core::Target& target) const {
  google_firestore_v1_Target_QueryTarget result{};
  result.which_query_type =
      google_firestore_v1_Target_QueryTarget_structured_query_tag;

  pb_size_t from_count = 1;
  result.structured_query.from_count = from_count;
  result.structured_query.from =
      MakeArray<google_firestore_v1_StructuredQuery_CollectionSelector>(
          from_count);
  google_firestore_v1_StructuredQuery_CollectionSelector& from =
      result.structured_query.from[0];

  // Dissect the path into parent, collection_id and optional key filter.
  const ResourcePath& path = target.path();
  if (target.collection_group()) {
    HARD_ASSERT(
        path.size() % 2 == 0,
        "Collection group queries should be within a document path or root.");
    result.parent = EncodeQueryPath(path);

    from.collection_id = EncodeString(*target.collection_group());
    from.all_descendants = true;

  } else {
    HARD_ASSERT(path.size() % 2 != 0,
                "Document queries with filters are not supported.");
    result.parent = EncodeQueryPath(path.PopLast());
    from.collection_id = EncodeString(path.last_segment());
  }

  // Encode the filters.
  const auto& filters = target.filters();
  if (!filters.empty()) {
    result.structured_query.where = EncodeFilters(filters);
  }

  const auto& orders = target.order_bys();
  if (!orders.empty()) {
    result.structured_query.order_by_count = CheckedSize(orders.size());
    result.structured_query.order_by = EncodeOrderBys(orders);
  }

  if (target.limit() != Target::kNoLimit) {
    result.structured_query.has_limit = true;
    result.structured_query.limit.value = target.limit();
  }

  if (target.start_at()) {
    result.structured_query.start_at = EncodeBound(*target.start_at());
  }

  if (target.end_at()) {
    result.structured_query.end_at = EncodeBound(*target.end_at());
  }

  return result;
}

Target Serializer::DecodeStructuredQuery(
    ReadContext* context,
    pb_bytes_array_t* parent,
    google_firestore_v1_StructuredQuery& query) const {
  ResourcePath path = DecodeQueryPath(context, DecodeString(parent));

  CollectionGroupId collection_group;
  size_t from_count = query.from_count;
  if (from_count > 0) {
    if (from_count != 1) {
      context->Fail(
          "StructuredQuery.from with more than one collection is not "
          "supported.");
      return {};
    }

    google_firestore_v1_StructuredQuery_CollectionSelector& from =
        query.from[0];
    auto collection_id = DecodeString(from.collection_id);
    if (from.all_descendants) {
      collection_group = std::make_shared<const std::string>(collection_id);
    } else {
      path = path.Append(collection_id);
    }
  }

  FilterList filter_by;
  if (query.where.which_filter_type != 0) {
    filter_by = DecodeFilters(context, query.where);
  }

  OrderByList order_by;
  if (query.order_by_count > 0) {
    order_by = DecodeOrderBys(context, query.order_by, query.order_by_count);
  }

  int32_t limit = Target::kNoLimit;
  if (query.has_limit) {
    limit = query.limit.value;
  }

  absl::optional<Bound> start_at;
  if (query.start_at.values_count > 0) {
    start_at = DecodeBound(query.start_at);
  }

  absl::optional<Bound> end_at;
  if (query.end_at.values_count > 0) {
    end_at = DecodeBound(query.end_at);
  }

  return Target(std::move(path), std::move(collection_group),
                std::move(filter_by), std::move(order_by), limit,
                std::move(start_at), std::move(end_at));
}

Target Serializer::DecodeQueryTarget(
    ReadContext* context, google_firestore_v1_Target_QueryTarget& query) const {
  // The QueryTarget oneof only has a single valid value.
  if (query.which_query_type !=
      google_firestore_v1_Target_QueryTarget_structured_query_tag) {
    context->Fail(
        StringFormat("Unknown query_type: %s", query.which_query_type));
    return {};
  }

  return DecodeStructuredQuery(context, query.parent, query.structured_query);
}

google_firestore_v1_StructuredQuery_Filter Serializer::EncodeFilters(
    const FilterList& filters) const {
  google_firestore_v1_StructuredQuery_Filter result{};

  auto is_field_filter = [](const Filter& f) { return f.IsAFieldFilter(); };
  size_t filters_count = absl::c_count_if(filters, is_field_filter);
  if (filters_count == 1) {
    auto first = absl::c_find_if(filters, is_field_filter);
    // Special case: no existing filters and we only need to add one filter.
    // This can be made the single root filter without a composite filter.
    FieldFilter filter{*first};
    return EncodeSingularFilter(filter);
  }

  result.which_filter_type =
      google_firestore_v1_StructuredQuery_Filter_composite_filter_tag;
  google_firestore_v1_StructuredQuery_CompositeFilter& composite =
      result.composite_filter;
  composite.op =
      google_firestore_v1_StructuredQuery_CompositeFilter_Operator_AND;

  SetRepeatedField(
      &composite.filters, &composite.filters_count, filters,
      [&](const Filter& f) { return EncodeSingularFilter(FieldFilter{f}); });

  return result;
}

FilterList Serializer::DecodeFilters(
    ReadContext* context,
    google_firestore_v1_StructuredQuery_Filter& proto) const {
  FilterList result;

  switch (proto.which_filter_type) {
    case google_firestore_v1_StructuredQuery_Filter_composite_filter_tag:
      return DecodeCompositeFilter(context, proto.composite_filter);

    case google_firestore_v1_StructuredQuery_Filter_unary_filter_tag:
      return result.push_back(DecodeUnaryFilter(context, proto.unary_filter));

    case google_firestore_v1_StructuredQuery_Filter_field_filter_tag:
      return result.push_back(DecodeFieldFilter(context, proto.field_filter));

    default:
      context->Fail(StringFormat("Unrecognized Filter.which_filter_type %s",
                                 proto.which_filter_type));
      return result;
  }
}

google_firestore_v1_StructuredQuery_Filter Serializer::EncodeSingularFilter(
    const FieldFilter& filter) const {
  google_firestore_v1_StructuredQuery_Filter result{};

  bool is_unary = (filter.op() == Filter::Operator::Equal ||
                   filter.op() == Filter::Operator::NotEqual) &&
                  (IsNaNValue(filter.value()) || IsNullValue(filter.value()));
  if (is_unary) {
    result.which_filter_type =
        google_firestore_v1_StructuredQuery_Filter_unary_filter_tag;
    result.unary_filter.which_operand_type =
        google_firestore_v1_StructuredQuery_UnaryFilter_field_tag;
    result.unary_filter.field.field_path = EncodeFieldPath(filter.field());

    bool is_equality = filter.op() == Filter::Operator::Equal;
    if (IsNaNValue(filter.value())) {
      result.unary_filter.op =
          is_equality
              ? google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NAN
              : google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NOT_NAN;  // NOLINT

    } else if (IsNullValue(filter.value())) {
      result.unary_filter.op =
          is_equality
              ? google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NULL
              : google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NOT_NULL;  // NOLINT

    } else {
      HARD_FAIL("Expected a unary filter");
    }

    return result;
  }

  result.which_filter_type =
      google_firestore_v1_StructuredQuery_Filter_field_filter_tag;

  result.field_filter.field.field_path = EncodeFieldPath(filter.field());
  result.field_filter.op = EncodeFieldFilterOperator(filter.op());
  // TODO(mrschmidt): Figure out how to remove this copy
  result.field_filter.value = *DeepClone(filter.value()).release();

  return result;
}

Filter Serializer::DecodeFieldFilter(
    ReadContext* context,
    google_firestore_v1_StructuredQuery_FieldFilter& field_filter) const {
  FieldPath field_path =
      DecodeFieldPath(context, field_filter.field.field_path);
  Filter::Operator op = DecodeFieldFilterOperator(context, field_filter.op);
  Filter result = FieldFilter::Create(std::move(field_path), op,
                                      MakeSharedMessage(field_filter.value));
  field_filter.value = {};  // Release field ownership
  return result;
}

Filter Serializer::DecodeUnaryFilter(
    ReadContext* context,
    const google_firestore_v1_StructuredQuery_UnaryFilter& unary) const {
  HARD_ASSERT(unary.which_operand_type ==
                  google_firestore_v1_StructuredQuery_UnaryFilter_field_tag,
              "Unexpected UnaryFilter.which_operand_type: %s",
              unary.which_operand_type);

  FieldPath field = DecodeFieldPath(context, unary.field.field_path);

  switch (unary.op) {
    case google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NULL:
      return FieldFilter::Create(field, Filter::Operator::Equal, NullValue());

    case google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NAN:
      return FieldFilter::Create(field, Filter::Operator::Equal, NaNValue());

    case google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NOT_NULL:
      return FieldFilter::Create(field, Filter::Operator::NotEqual,
                                 NullValue());

    case google_firestore_v1_StructuredQuery_UnaryFilter_Operator_IS_NOT_NAN:
      return FieldFilter::Create(field, Filter::Operator::NotEqual, NaNValue());

    default:
      context->Fail(StringFormat("Unrecognized UnaryFilter.op %s", unary.op));
      return InvalidFilter();
  }
}

FilterList Serializer::DecodeCompositeFilter(
    ReadContext* context,
    const google_firestore_v1_StructuredQuery_CompositeFilter& composite)
    const {
  if (composite.op !=
      google_firestore_v1_StructuredQuery_CompositeFilter_Operator_AND) {
    context->Fail(StringFormat(
        "Only AND-type composite filters are supported, got %s", composite.op));
    return FilterList{};
  }

  FilterList result;
  result = result.reserve(composite.filters_count);

  for (pb_size_t i = 0; i != composite.filters_count; ++i) {
    auto& filter = composite.filters[i];
    switch (filter.which_filter_type) {
      case google_firestore_v1_StructuredQuery_Filter_composite_filter_tag:
        context->Fail("Nested composite filters are not supported");
        return FilterList{};

      case google_firestore_v1_StructuredQuery_Filter_unary_filter_tag:
        result =
            result.push_back(DecodeUnaryFilter(context, filter.unary_filter));
        break;

      case google_firestore_v1_StructuredQuery_Filter_field_filter_tag:
        result =
            result.push_back(DecodeFieldFilter(context, filter.field_filter));
        break;

      default:
        context->Fail(StringFormat("Unrecognized Filter.which_filter_type %s",
                                   filter.which_filter_type));
        return FilterList{};
    }
  }

  return result;
}

google_firestore_v1_StructuredQuery_FieldFilter_Operator
Serializer::EncodeFieldFilterOperator(Filter::Operator op) const {
  switch (op) {
    case Filter::Operator::LessThan:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_LESS_THAN;

    case Filter::Operator::LessThanOrEqual:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_LESS_THAN_OR_EQUAL;  // NOLINT

    case Filter::Operator::GreaterThan:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_GREATER_THAN;  // NOLINT

    case Filter::Operator::GreaterThanOrEqual:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_GREATER_THAN_OR_EQUAL;  // NOLINT

    case Filter::Operator::Equal:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_EQUAL;

    case Filter::Operator::NotEqual:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_NOT_EQUAL;

    case Filter::Operator::ArrayContains:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_ARRAY_CONTAINS;  // NOLINT

    case Filter::Operator::In:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_IN;

    case Filter::Operator::ArrayContainsAny:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_ARRAY_CONTAINS_ANY;  // NOLINT

    case Filter::Operator::NotIn:
      return google_firestore_v1_StructuredQuery_FieldFilter_Operator_NOT_IN;  // NOLINT

    default:
      HARD_FAIL("Unhandled Filter::Operator: %s", op);
  }
}

Filter::Operator Serializer::DecodeFieldFilterOperator(
    ReadContext* context,
    google_firestore_v1_StructuredQuery_FieldFilter_Operator op) const {
  switch (op) {
    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_LESS_THAN:
      return Filter::Operator::LessThan;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_LESS_THAN_OR_EQUAL:  // NOLINT
      return Filter::Operator::LessThanOrEqual;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_GREATER_THAN:
      return Filter::Operator::GreaterThan;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_GREATER_THAN_OR_EQUAL:  // NOLINT
      return Filter::Operator::GreaterThanOrEqual;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_EQUAL:
      return Filter::Operator::Equal;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_NOT_EQUAL:
      return Filter::Operator::NotEqual;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_ARRAY_CONTAINS:  // NOLINT
      return Filter::Operator::ArrayContains;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_IN:
      return Filter::Operator::In;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_ARRAY_CONTAINS_ANY:  // NOLINT
      return Filter::Operator::ArrayContainsAny;

    case google_firestore_v1_StructuredQuery_FieldFilter_Operator_NOT_IN:  // NOLINT
      return Filter::Operator::NotIn;

    default:
      context->Fail(StringFormat("Unhandled FieldFilter.op: %s", op));
      return Filter::Operator{};
  }
}

google_firestore_v1_StructuredQuery_Order* Serializer::EncodeOrderBys(
    const OrderByList& orders) const {
  auto* result = MakeArray<google_firestore_v1_StructuredQuery_Order>(
      CheckedSize(orders.size()));

  int i = 0;
  for (const OrderBy& order : orders) {
    auto& encoded_order = result[i];

    encoded_order.field.field_path = EncodeFieldPath(order.field());
    auto dir = order.ascending()
                   ? google_firestore_v1_StructuredQuery_Direction_ASCENDING
                   : google_firestore_v1_StructuredQuery_Direction_DESCENDING;
    encoded_order.direction = dir;

    ++i;
  }

  return result;
}

OrderByList Serializer::DecodeOrderBys(
    ReadContext* context,
    google_firestore_v1_StructuredQuery_Order* order_bys,
    pb_size_t size) const {
  OrderByList result;
  result = result.reserve(size);

  for (pb_size_t i = 0; i != size; ++i) {
    result = result.push_back(DecodeOrderBy(context, order_bys[i]));
  }

  return result;
}

OrderBy Serializer::DecodeOrderBy(
    ReadContext* context,
    const google_firestore_v1_StructuredQuery_Order& order_by) const {
  auto field_path = DecodeFieldPath(context, order_by.field.field_path);

  Direction direction;
  switch (order_by.direction) {
    case google_firestore_v1_StructuredQuery_Direction_ASCENDING:
      direction = Direction::Ascending;
      break;

    case google_firestore_v1_StructuredQuery_Direction_DESCENDING:
      direction = Direction::Descending;
      break;

    default:
      context->Fail(StringFormat(
          "Unrecognized google_firestore_v1_StructuredQuery_Direction %s",
          order_by.direction));
      return OrderBy{};
  }

  return OrderBy(std::move(field_path), direction);
}

google_firestore_v1_Cursor Serializer::EncodeBound(const Bound& bound) const {
  google_firestore_v1_Cursor result{};
  result.before = bound.before();
  SetRepeatedField(
      &result.values, &result.values_count,
      absl::Span<google_firestore_v1_Value>(bound.position()->values,
                                            bound.position()->values_count),
      [](const google_firestore_v1_Value& value) {
        return *DeepClone(value).release();
      });
  return result;
}

Bound Serializer::DecodeBound(google_firestore_v1_Cursor& cursor) const {
  SharedMessage<google_firestore_v1_ArrayValue> index_components{{}};
  SetRepeatedField(&index_components->values, &index_components->values_count,
                   absl::Span<google_firestore_v1_Value>(cursor.values,
                                                         cursor.values_count));
  // Prevent double-freeing of the cursors's fields. The fields are now owned by
  // the bound.
  ReleaseFieldOwnership(cursor.values, cursor.values_count);
  return Bound::FromValue(std::move(index_components), cursor.before);
}

/* static */
pb_bytes_array_t* Serializer::EncodeFieldPath(const FieldPath& field_path) {
  return EncodeString(field_path.CanonicalString());
}

/* static */
FieldPath Serializer::DecodeFieldPath(ReadContext* context,
                                      const pb_bytes_array_t* field_path) {
  absl::string_view str = MakeStringView(field_path);
  StatusOr<FieldPath> decoded_path = FieldPath::FromServerFormatView(str);
  if (!decoded_path.ok()) {
    context->set_status(decoded_path.status());
    return InvalidFieldPath();
  }
  return decoded_path.ConsumeValueOrDie();
}

google_protobuf_Timestamp Serializer::EncodeVersion(
    const SnapshotVersion& version) {
  return EncodeTimestamp(version.timestamp());
}

google_protobuf_Timestamp Serializer::EncodeTimestamp(
    const Timestamp& timestamp_value) {
  google_protobuf_Timestamp result{};
  result.seconds = timestamp_value.seconds();
  result.nanos = timestamp_value.nanoseconds();
  return result;
}

SnapshotVersion Serializer::DecodeVersion(
    ReadContext* context, const google_protobuf_Timestamp& proto) {
  return SnapshotVersion{DecodeTimestamp(context, proto)};
}

Timestamp Serializer::DecodeTimestamp(
    ReadContext* context, const google_protobuf_Timestamp& timestamp_proto) {
  auto decoded = TimestampInternal::FromUntrustedSecondsAndNanos(
      timestamp_proto.seconds, timestamp_proto.nanos);

  if (!decoded.ok()) {
    context->Fail(
        "Failed to decode into valid protobuf Timestamp with error '%s'",
        decoded.status().error_message());
    return {};
  }
  return decoded.ConsumeValueOrDie();
}

MutationResult Serializer::DecodeMutationResult(
    ReadContext* context,
    google_firestore_v1_WriteResult& write_result,
    const SnapshotVersion& commit_version) const {
  // NOTE: Deletes don't have an update_time, use commit_version instead.
  SnapshotVersion version =
      write_result.has_update_time
          ? DecodeVersion(context, write_result.update_time)
          : commit_version;

  Message<google_firestore_v1_ArrayValue> transform_results;
  SetRepeatedField(&transform_results->values, &transform_results->values_count,
                   absl::Span<google_firestore_v1_Value>(
                       write_result.transform_results,
                       write_result.transform_results_count));
  // Prevent double-freeing of the transform result. The fields are now owned by
  // the mutation result.
  ReleaseFieldOwnership(write_result.transform_results,
                        write_result.transform_results_count);
  return MutationResult(version, std::move(transform_results));
}

std::vector<google_firestore_v1_ListenRequest_LabelsEntry>
Serializer::EncodeListenRequestLabels(const TargetData& target_data) const {
  std::vector<google_firestore_v1_ListenRequest_LabelsEntry> result;
  auto value = EncodeLabel(target_data.purpose());
  if (value.empty()) {
    return result;
  }

  result.push_back({/* key */ EncodeString("goog-listen-tags"),
                    /* value */ EncodeString(value)});

  return result;
}

std::string Serializer::EncodeLabel(QueryPurpose purpose) const {
  switch (purpose) {
    case QueryPurpose::Listen:
      return "";
    case QueryPurpose::ExistenceFilterMismatch:
      return "existence-filter-mismatch";
    case QueryPurpose::LimboResolution:
      return "limbo-document";
  }
  UNREACHABLE();
}

std::unique_ptr<WatchChange> Serializer::DecodeWatchChange(
    ReadContext* context,
    google_firestore_v1_ListenResponse& watch_change) const {
  switch (watch_change.which_response_type) {
    case google_firestore_v1_ListenResponse_target_change_tag:
      return DecodeTargetChange(context, watch_change.target_change);

    case google_firestore_v1_ListenResponse_document_change_tag:
      return DecodeDocumentChange(context, watch_change.document_change);

    case google_firestore_v1_ListenResponse_document_delete_tag:
      return DecodeDocumentDelete(context, watch_change.document_delete);

    case google_firestore_v1_ListenResponse_document_remove_tag:
      return DecodeDocumentRemove(context, watch_change.document_remove);

    case google_firestore_v1_ListenResponse_filter_tag:
      return DecodeExistenceFilterWatchChange(context, watch_change.filter);
  }

  // Occasionally Watch will send response_type == 0 (which isn't a valid tag in
  // the enumeration). This has only been observed in tests running against the
  // emulator on Forge. Failing here causes the stream to restart with no ill
  // effects.
  context->Fail(StringFormat("Unknown WatchChange.response_type: %s",
                             watch_change.which_response_type));
  return {};
}

SnapshotVersion Serializer::DecodeVersionFromListenResponse(
    ReadContext* context,
    const google_firestore_v1_ListenResponse& listen_response) const {
  // We have only reached a consistent snapshot for the entire stream if there
  // is a read_time set and it applies to all targets (i.e. the list of targets
  // is empty). The backend is guaranteed to send such responses.
  if (listen_response.which_response_type !=
      google_firestore_v1_ListenResponse_target_change_tag) {
    return SnapshotVersion::None();
  }
  if (listen_response.target_change.target_ids_count != 0) {
    return SnapshotVersion::None();
  }

  return DecodeVersion(context, listen_response.target_change.read_time);
}

std::unique_ptr<WatchChange> Serializer::DecodeTargetChange(
    ReadContext* context,
    const google_firestore_v1_TargetChange& change) const {
  WatchTargetChangeState state =
      DecodeTargetChangeState(context, change.target_change_type);
  std::vector<TargetId> target_ids(change.target_ids,
                                   change.target_ids + change.target_ids_count);
  ByteString resume_token(change.resume_token);

  util::Status cause;
  if (change.has_cause) {
    cause = util::Status{static_cast<Error>(change.cause.code),
                         DecodeString(change.cause.message)};
  }

  return absl::make_unique<WatchTargetChange>(
      state, std::move(target_ids), std::move(resume_token), std::move(cause));
}

WatchTargetChangeState Serializer::DecodeTargetChangeState(
    ReadContext*,
    const google_firestore_v1_TargetChange_TargetChangeType state) {
  switch (state) {
    case google_firestore_v1_TargetChange_TargetChangeType_NO_CHANGE:
      return WatchTargetChangeState::NoChange;
    case google_firestore_v1_TargetChange_TargetChangeType_ADD:
      return WatchTargetChangeState::Added;
    case google_firestore_v1_TargetChange_TargetChangeType_REMOVE:
      return WatchTargetChangeState::Removed;
    case google_firestore_v1_TargetChange_TargetChangeType_CURRENT:
      return WatchTargetChangeState::Current;
    case google_firestore_v1_TargetChange_TargetChangeType_RESET:
      return WatchTargetChangeState::Reset;
  }
  UNREACHABLE();
}

std::unique_ptr<WatchChange> Serializer::DecodeDocumentChange(
    ReadContext* context, google_firestore_v1_DocumentChange& change) const {
  ObjectValue value = ObjectValue::FromFieldsEntry(
      change.document.fields, change.document.fields_count);
  DocumentKey key = DecodeKey(context, change.document.name);

  HARD_ASSERT(change.document.has_update_time,
              "Got a document change with no snapshot version");
  SnapshotVersion version = DecodeVersion(context, change.document.update_time);

  // TODO(b/142956770): other platforms memoize `change.document` inside the
  // `Document`. This currently cannot be implemented efficiently because it
  // would require a reference-counted ownership model for the proto (copying it
  // would defeat the purpose). Note, however, that even without this
  // optimization C++ implementation is on par with the preceding Objective-C
  // implementation.
  MutableDocument document =
      MutableDocument::FoundDocument(key, version, std::move(value));

  std::vector<TargetId> updated_target_ids(
      change.target_ids, change.target_ids + change.target_ids_count);
  std::vector<TargetId> removed_target_ids(
      change.removed_target_ids,
      change.removed_target_ids + change.removed_target_ids_count);

  return absl::make_unique<DocumentWatchChange>(
      std::move(updated_target_ids), std::move(removed_target_ids),
      std::move(key), std::move(document));
}

std::unique_ptr<WatchChange> Serializer::DecodeDocumentDelete(
    ReadContext* context,
    const google_firestore_v1_DocumentDelete& change) const {
  DocumentKey key = DecodeKey(context, change.document);
  // Note that version might be unset in which case we use
  // SnapshotVersion::None().
  SnapshotVersion version = change.has_read_time
                                ? DecodeVersion(context, change.read_time)
                                : SnapshotVersion::None();
  MutableDocument document = MutableDocument::NoDocument(key, version);

  std::vector<TargetId> removed_target_ids(
      change.removed_target_ids,
      change.removed_target_ids + change.removed_target_ids_count);

  return absl::make_unique<DocumentWatchChange>(
      std::vector<TargetId>{}, std::move(removed_target_ids), std::move(key),
      std::move(document));
}

std::unique_ptr<WatchChange> Serializer::DecodeDocumentRemove(
    ReadContext* context,
    const google_firestore_v1_DocumentRemove& change) const {
  DocumentKey key = DecodeKey(context, change.document);
  std::vector<TargetId> removed_target_ids(
      change.removed_target_ids,
      change.removed_target_ids + change.removed_target_ids_count);

  return absl::make_unique<DocumentWatchChange>(std::vector<TargetId>{},
                                                std::move(removed_target_ids),
                                                std::move(key), absl::nullopt);
}

std::unique_ptr<WatchChange> Serializer::DecodeExistenceFilterWatchChange(
    ReadContext*, const google_firestore_v1_ExistenceFilter& filter) const {
  ExistenceFilter existence_filter{filter.count};
  return absl::make_unique<ExistenceFilterWatchChange>(existence_filter,
                                                       filter.target_id);
}

bool Serializer::IsLocalResourceName(const ResourcePath& path) const {
  return IsValidResourceName(path) && path[1] == database_id_.project_id() &&
         path[3] == database_id_.database_id();
}

bool Serializer::IsLocalDocumentKey(absl::string_view path) const {
  auto resource = ResourcePath::FromStringView(path);
  return IsLocalResourceName(resource) &&
         DocumentKey::IsDocumentKey(resource.PopFirst(5));
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
