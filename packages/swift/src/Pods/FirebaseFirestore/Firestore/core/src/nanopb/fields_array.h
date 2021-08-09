/*
 * Copyright 2019 Google
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

#ifndef FIRESTORE_CORE_SRC_NANOPB_FIELDS_ARRAY_H_
#define FIRESTORE_CORE_SRC_NANOPB_FIELDS_ARRAY_H_

#include "Firestore/Protos/nanopb/firestore/bundle.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/maybe_document.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/mutation.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/target.nanopb.h"
#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/Protos/nanopb/google/firestore/v1/firestore.nanopb.h"
#include "Firestore/Protos/nanopb/google/type/latlng.nanopb.h"

namespace firebase {
namespace firestore {
namespace nanopb {

/**
 * Returns a pointer to the Nanopb-generated array that describes the fields
 * of the Nanopb proto; the array is required to call most Nanopb functions.
 *
 * There is always a one-to-one correspondence between a Nanopb-generated
 * message type and its fields descriptor; essentially, the fields descriptor is
 * a property of the type.
 */
// The non-specialized version of this function is deleted to make sure that
// forgetting to specialize it results in a compile-time-, not link-time error.
// If you run into an error where compiler complains about the deleted function,
// simply add the missing specialization.
template <typename T>
const pb_field_t* FieldsArray() = delete;

template <>
inline const pb_field_t* FieldsArray<firestore_client_MaybeDocument>() {
  return firestore_client_MaybeDocument_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_client_MutationQueue>() {
  return firestore_client_MutationQueue_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_client_Target>() {
  return firestore_client_Target_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_client_TargetGlobal>() {
  return firestore_client_TargetGlobal_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_client_WriteBatch>() {
  return firestore_client_WriteBatch_fields;
}

template <>
inline const pb_field_t*
FieldsArray<google_firestore_v1_BatchGetDocumentsRequest>() {
  return google_firestore_v1_BatchGetDocumentsRequest_fields;
}

template <>
inline const pb_field_t*
FieldsArray<google_firestore_v1_BatchGetDocumentsResponse>() {
  return google_firestore_v1_BatchGetDocumentsResponse_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_CommitRequest>() {
  return google_firestore_v1_CommitRequest_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_CommitResponse>() {
  return google_firestore_v1_CommitResponse_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_ListenRequest>() {
  return google_firestore_v1_ListenRequest_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_ListenResponse>() {
  return google_firestore_v1_ListenResponse_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_RunQueryRequest>() {
  return google_firestore_v1_RunQueryRequest_fields;
}

template <>
inline const pb_field_t*
FieldsArray<google_firestore_v1_StructuredQuery_Filter>() {
  return google_firestore_v1_StructuredQuery_Filter_fields;
}

template <>
inline const pb_field_t*
FieldsArray<google_firestore_v1_Target_DocumentsTarget>() {
  return google_firestore_v1_Target_DocumentsTarget_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_TargetChange>() {
  return google_firestore_v1_TargetChange_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_Target_QueryTarget>() {
  return google_firestore_v1_Target_QueryTarget_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_Value>() {
  return google_firestore_v1_Value_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_ArrayValue>() {
  return google_firestore_v1_ArrayValue_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_MapValue>() {
  return google_firestore_v1_MapValue_fields;
}

template <>
inline const pb_field_t*
FieldsArray<google_firestore_v1_MapValue_FieldsEntry>() {
  return google_firestore_v1_MapValue_FieldsEntry_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_Write>() {
  return google_firestore_v1_Write_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_WriteRequest>() {
  return google_firestore_v1_WriteRequest_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_WriteResponse>() {
  return google_firestore_v1_WriteResponse_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_firestore_v1_WriteResult>() {
  return google_firestore_v1_WriteResult_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_BundleMetadata>() {
  return firestore_BundleMetadata_fields;
}

template <>
inline const pb_field_t* FieldsArray<firestore_NamedQuery>() {
  return firestore_NamedQuery_fields;
}

template <>
inline const pb_field_t* FieldsArray<google_protobuf_Empty>() {
  return google_protobuf_Empty_fields;
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_NANOPB_FIELDS_ARRAY_H_
