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

#ifndef FIRESTORE_CORE_SRC_REMOTE_SERIALIZER_H_
#define FIRESTORE_CORE_SRC_REMOTE_SERIALIZER_H_

#include <stddef.h>

#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/Protos/nanopb/google/firestore/v1/firestore.nanopb.h"
#include "Firestore/Protos/nanopb/google/type/latlng.nanopb.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "Firestore/core/src/remote/watch_change.h"
#include "Firestore/core/src/util/read_context.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/base/attributes.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {

namespace local {
class LocalSerializer;
class TargetData;

enum class QueryPurpose;
}  // namespace local

namespace remote {

core::Target InvalidTarget();

/**
 * @brief Converts internal model objects to their equivalent protocol buffer
 * form, and protocol buffer objects to their equivalent bytes.
 *
 * Methods starting with "Encode" convert from a model object to a nanopb
 * protocol buffer, and methods starting with "Decode" convert from a nanopb
 * protocol buffer to a model object.
 *
 * For encoded messages, `nanopb::FreeNanopbMessage()` must be called on the
 * returned nanopb proto buffer or a memory leak will occur.
 *
 * All errors that occur during serialization are fatal.
 *
 * All deserialization methods (that can fail) take a nanopb::Reader parameter
 * whose status will be set to failed upon an error. Callers must check this
 * before using the returned value via `reader->status()`. A deserialization
 * method might fail if a protocol buffer is missing a critical field or has a
 * value we can't interpret. On error, the return value from a deserialization
 * method is unspecified.
 */
class Serializer {
 public:
  /**
   * @param database_id Must remain valid for the lifetime of this Serializer
   * object.
   */
  explicit Serializer(model::DatabaseId database_id);

  /**
   * Encodes the string to nanopb bytes.
   *
   * This method allocates memory; the caller is responsible for freeing it.
   * Typically, the returned value will be added to a pointer field within a
   * nanopb proto struct. Calling pb_release() on the resulting struct will
   * cause all proto fields to be freed.
   */
  static pb_bytes_array_t* EncodeString(const std::string& str);

  /**
   * Decodes the nanopb bytes to a std::string. If the input pointer is null,
   * then this method will return an empty string.
   */
  static std::string DecodeString(const pb_bytes_array_t* str);

  /**
   * Returns the database ID, such as
   * `projects/{project_id}/databases/{database_id}`.
   */
  pb_bytes_array_t* EncodeDatabaseName() const;

  /**
   * Encodes the given document key as a fully qualified name. This includes the
   * DatabaseId associated with this Serializer and the key path.
   */
  pb_bytes_array_t* EncodeKey(
      const firebase::firestore::model::DocumentKey& key) const;

  /**
   * Decodes the given document key from a fully qualified name.
   */
  firebase::firestore::model::DocumentKey DecodeKey(
      util::ReadContext* context, const pb_bytes_array_t* name) const;

  /**
   * @brief Converts the Document (i.e. key/value) into bytes.
   */
  google_firestore_v1_Document EncodeDocument(
      const model::DocumentKey& key, const model::ObjectValue& value) const;

  /**
   * @brief Converts from nanopb proto to the model Document format.
   */
  model::MutableDocument DecodeMaybeDocument(
      util::ReadContext* context,
      google_firestore_v1_BatchGetDocumentsResponse& response) const;

  google_firestore_v1_Write EncodeMutation(
      const model::Mutation& mutation) const;
  model::Mutation DecodeMutation(util::ReadContext* context,
                                 google_firestore_v1_Write& mutation) const;

  static google_firestore_v1_Precondition EncodePrecondition(
      const model::Precondition& precondition);
  static model::Precondition DecodePrecondition(
      util::ReadContext* context,
      const google_firestore_v1_Precondition& precondition);

  static google_firestore_v1_DocumentMask EncodeFieldMask(
      const model::FieldMask& mask);
  static model::FieldMask DecodeFieldMask(
      util::ReadContext* context, const google_firestore_v1_DocumentMask& mask);

  google_firestore_v1_DocumentTransform_FieldTransform EncodeFieldTransform(
      const model::FieldTransform& field_transform) const;
  model::FieldTransform DecodeFieldTransform(
      util::ReadContext* context,
      google_firestore_v1_DocumentTransform_FieldTransform& proto) const;

  model::MutationResult DecodeMutationResult(
      util::ReadContext* context,
      google_firestore_v1_WriteResult& write_result,
      const model::SnapshotVersion& commit_version) const;

  std::vector<google_firestore_v1_ListenRequest_LabelsEntry>
  EncodeListenRequestLabels(const local::TargetData& target_data) const;

  static pb_bytes_array_t* EncodeFieldPath(const model::FieldPath& field_path);
  static model::FieldPath DecodeFieldPath(util::ReadContext* context,
                                          const pb_bytes_array_t* field_path);

  static google_protobuf_Timestamp EncodeVersion(
      const model::SnapshotVersion& version);

  static google_protobuf_Timestamp EncodeTimestamp(
      const Timestamp& timestamp_value);

  static model::SnapshotVersion DecodeVersion(
      util::ReadContext* context, const google_protobuf_Timestamp& proto);

  static Timestamp DecodeTimestamp(
      util::ReadContext* context,
      const google_protobuf_Timestamp& timestamp_proto);

  google_firestore_v1_Target EncodeTarget(
      const local::TargetData& target_data) const;
  google_firestore_v1_Target_DocumentsTarget EncodeDocumentsTarget(
      const core::Target& target) const;
  core::Target DecodeDocumentsTarget(
      util::ReadContext* context,
      const google_firestore_v1_Target_DocumentsTarget& proto) const;
  google_firestore_v1_Target_QueryTarget EncodeQueryTarget(
      const core::Target& target) const;

  /**
   * Decodes the query target. Modifies the provided proto to release ownership
   * of any Value messages.
   */
  core::Target DecodeQueryTarget(
      util::ReadContext* context,
      google_firestore_v1_Target_QueryTarget& query) const;

  core::Target DecodeStructuredQuery(
      util::ReadContext* context,
      pb_bytes_array_t* parent,
      google_firestore_v1_StructuredQuery& query) const;

  /**
   * Decodes the watch change. Modifies the provided proto to release
   * ownership of any Value messages.
   */
  std::unique_ptr<remote::WatchChange> DecodeWatchChange(
      util::ReadContext* context,
      google_firestore_v1_ListenResponse& watch_change) const;

  model::SnapshotVersion DecodeVersionFromListenResponse(
      util::ReadContext* context,
      const google_firestore_v1_ListenResponse& listen_response) const;

  // Public for the sake of tests.
  google_firestore_v1_StructuredQuery_Filter EncodeFilters(
      const core::FilterList& filters) const;

  /**
   * Decodes the structured query. Modifies the provided proto to release
   * ownership of any Value messages.
   */
  core::FilterList DecodeFilters(
      util::ReadContext* context,
      google_firestore_v1_StructuredQuery_Filter& proto) const;

  /**
   * Encodes a database ID and resource path into the following form:
   * /projects/$project_id/database/$database_id/documents/$path
   *
   * Does not verify that the database_id matches the current instance.
   */
  pb_bytes_array_t* EncodeResourceName(const model::DatabaseId& database_id,
                                       const model::ResourcePath& path) const;

  bool IsLocalResourceName(const model::ResourcePath& path) const;

  bool IsLocalDocumentKey(absl::string_view path) const;

 private:
  model::MutableDocument DecodeFoundDocument(
      util::ReadContext* context,
      google_firestore_v1_BatchGetDocumentsResponse& response) const;
  model::MutableDocument DecodeMissingDocument(
      util::ReadContext* context,
      const google_firestore_v1_BatchGetDocumentsResponse& response) const;

  pb_bytes_array_t* EncodeQueryPath(const model::ResourcePath& path) const;
  model::ResourcePath DecodeQueryPath(util::ReadContext* context,
                                      absl::string_view name) const;

  /**
   * Decodes a fully qualified resource name into a resource path and validates
   * that there is a project and database encoded in the path. There are no
   * guarantees that a local path is also encoded in this resource name.
   */
  model::ResourcePath DecodeResourceName(util::ReadContext* context,
                                         absl::string_view encoded) const;

  void ValidateDocumentKeyPath(util::ReadContext* context,
                               const model::ResourcePath& resource_name) const;
  model::DocumentKey DecodeKey(util::ReadContext* context,
                               const model::ResourcePath& resource_name) const;

  std::string EncodeLabel(local::QueryPurpose purpose) const;

  google_firestore_v1_StructuredQuery_Filter EncodeSingularFilter(
      const core::FieldFilter& filter) const;
  core::Filter DecodeFieldFilter(
      util::ReadContext* context,
      google_firestore_v1_StructuredQuery_FieldFilter& field_filter) const;
  core::Filter DecodeUnaryFilter(
      util::ReadContext* context,
      const google_firestore_v1_StructuredQuery_UnaryFilter& unary) const;
  core::FilterList DecodeCompositeFilter(
      util::ReadContext* context,
      const google_firestore_v1_StructuredQuery_CompositeFilter& composite)
      const;

  google_firestore_v1_StructuredQuery_FieldFilter_Operator
  EncodeFieldFilterOperator(core::Filter::Operator op) const;
  core::Filter::Operator DecodeFieldFilterOperator(
      util::ReadContext* context,
      google_firestore_v1_StructuredQuery_FieldFilter_Operator op) const;

  google_firestore_v1_StructuredQuery_Order* EncodeOrderBys(
      const core::OrderByList& orders) const;
  core::OrderByList DecodeOrderBys(
      util::ReadContext* context,
      google_firestore_v1_StructuredQuery_Order* order_bys,
      pb_size_t size) const;
  core::OrderBy DecodeOrderBy(
      util::ReadContext* context,
      const google_firestore_v1_StructuredQuery_Order& order_by) const;

  google_firestore_v1_Cursor EncodeBound(const core::Bound& bound) const;
  core::Bound DecodeBound(google_firestore_v1_Cursor& cursor) const;

  std::unique_ptr<remote::WatchChange> DecodeTargetChange(
      util::ReadContext* context,
      const google_firestore_v1_TargetChange& change) const;
  static remote::WatchTargetChangeState DecodeTargetChangeState(
      util::ReadContext* context,
      const google_firestore_v1_TargetChange_TargetChangeType state);

  std::unique_ptr<remote::WatchChange> DecodeDocumentChange(
      util::ReadContext* context,
      google_firestore_v1_DocumentChange& change) const;
  std::unique_ptr<remote::WatchChange> DecodeDocumentDelete(
      util::ReadContext* context,
      const google_firestore_v1_DocumentDelete& change) const;
  std::unique_ptr<remote::WatchChange> DecodeDocumentRemove(
      util::ReadContext* context,
      const google_firestore_v1_DocumentRemove& change) const;
  std::unique_ptr<remote::WatchChange> DecodeExistenceFilterWatchChange(
      util::ReadContext* context,
      const google_firestore_v1_ExistenceFilter& filter) const;

  model::DatabaseId database_id_;
  // TODO(varconst): Android caches the result of calling `EncodeDatabaseName`
  // as well, consider implementing that.
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_SERIALIZER_H_
