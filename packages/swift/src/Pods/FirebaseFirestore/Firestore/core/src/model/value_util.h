/*
 * Copyright 2021 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_MODEL_VALUE_UTIL_H_
#define FIRESTORE_CORE_SRC_MODEL_VALUE_UTIL_H_

#include <ostream>
#include <string>
#include <vector>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/nanopb/message.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace util {
enum class ComparisonResult;
}

namespace model {

class DocumentKey;
class DatabaseId;

/**
 * The order of types in Firestore. This order is based on the backend's
 * ordering, but modified to support server timestamps.
 */
enum class TypeOrder {
  kNull = 0,
  kBoolean = 1,
  kNumber = 2,
  kTimestamp = 3,
  kServerTimestamp = 4,
  kString = 5,
  kBlob = 6,
  kReference = 7,
  kGeoPoint = 8,
  kArray = 9,
  kMap = 10
};

/** Returns the backend's type order of the given Value type. */
TypeOrder GetTypeOrder(const google_firestore_v1_Value& value);

/** Traverses a Value proto and sorts all MapValues by key. */
void SortFields(google_firestore_v1_Value& value);

/** Traverses an ArrayValue proto and sorts all MapValues by key. */
void SortFields(google_firestore_v1_ArrayValue& value);

util::ComparisonResult Compare(const google_firestore_v1_Value& left,
                               const google_firestore_v1_Value& right);

bool Equals(const google_firestore_v1_Value& left,
            const google_firestore_v1_Value& right);

bool Equals(const google_firestore_v1_ArrayValue& left,
            const google_firestore_v1_ArrayValue& right);

/**
 * Generates the canonical ID for the provided field value (as used in Target
 * serialization).
 */
std::string CanonicalId(const google_firestore_v1_Value& value);

/**
 * Generates the canonical ID for the provided array value (as used in Target
 * serialization).
 */
std::string CanonicalId(const google_firestore_v1_ArrayValue& value);

/** Returns true if the array value contains the specified element. */
bool Contains(google_firestore_v1_ArrayValue haystack,
              google_firestore_v1_Value needle);

/** Returns a null Protobuf value. */
nanopb::Message<google_firestore_v1_Value> NullValue();

/** Returns `true` if `value` is null in its Protobuf representation. */
bool IsNullValue(const google_firestore_v1_Value& value);

/** Returns `NaN` in its Protobuf representation. */
nanopb::Message<google_firestore_v1_Value> NaNValue();

/** Returns `true` if `value` is `NaN` in its Protobuf representation. */
bool IsNaNValue(const google_firestore_v1_Value& value);

/** Returns a Protobuf reference value representing the given location. */
nanopb::Message<google_firestore_v1_Value> RefValue(
    const DatabaseId& database_id, const DocumentKey& document_key);

/** Creates a copy of the contents of the Value proto. */
nanopb::Message<google_firestore_v1_Value> DeepClone(
    const google_firestore_v1_Value& source);

/** Creates a copy of the contents of the ArrayValue proto. */
nanopb::Message<google_firestore_v1_ArrayValue> DeepClone(
    const google_firestore_v1_ArrayValue& source);

/** Returns true if `value` is a INTEGER_VALUE. */
inline bool IsInteger(const absl::optional<google_firestore_v1_Value>& value) {
  return value &&
         value->which_value_type == google_firestore_v1_Value_integer_value_tag;
}

/** Returns true if `value` is a DOUBLE_VALUE. */
inline bool IsDouble(const absl::optional<google_firestore_v1_Value>& value) {
  return value &&
         value->which_value_type == google_firestore_v1_Value_double_value_tag;
}

/** Returns true if `value` is either a INTEGER_VALUE or a DOUBLE_VALUE. */
inline bool IsNumber(const absl::optional<google_firestore_v1_Value>& value) {
  return IsInteger(value) || IsDouble(value);
}

/** Returns true if `value` is an ARRAY_VALUE. */
inline bool IsArray(const absl::optional<google_firestore_v1_Value>& value) {
  return value &&
         value->which_value_type == google_firestore_v1_Value_array_value_tag;
}

/** Returns true if `value` is a MAP_VALUE. */
inline bool IsMap(const absl::optional<google_firestore_v1_Value>& value) {
  return value &&
         value->which_value_type == google_firestore_v1_Value_map_value_tag;
}

}  // namespace model

inline bool operator==(const google_firestore_v1_Value& lhs,
                       const google_firestore_v1_Value& rhs) {
  return model::Equals(lhs, rhs);
}

inline bool operator!=(const google_firestore_v1_Value& lhs,
                       const google_firestore_v1_Value& rhs) {
  return !model::Equals(lhs, rhs);
}

inline bool operator==(const google_firestore_v1_ArrayValue& lhs,
                       const google_firestore_v1_ArrayValue& rhs) {
  return model::Equals(lhs, rhs);
}

inline bool operator!=(const google_firestore_v1_ArrayValue& lhs,
                       const google_firestore_v1_ArrayValue& rhs) {
  return !model::Equals(lhs, rhs);
}

inline std::ostream& operator<<(std::ostream& out,
                                const google_firestore_v1_Value& value) {
  return out << model::CanonicalId(value);
}

}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_VALUE_UTIL_H_
