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

#ifndef FIRESTORE_CORE_SRC_MODEL_OBJECT_VALUE_H_
#define FIRESTORE_CORE_SRC_MODEL_OBJECT_VALUE_H_

#include <map>
#include <ostream>
#include <set>
#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/model/field_mask.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace model {

/** A structured object value stored in Firestore. */
class ObjectValue {
 public:
  ObjectValue();

  /** Creates a new ObjectValue */
  explicit ObjectValue(nanopb::Message<google_firestore_v1_Value> value);

  ObjectValue(ObjectValue&& other) noexcept = default;
  ObjectValue& operator=(ObjectValue&& other) noexcept = default;
  ObjectValue(const ObjectValue& other);

  ObjectValue& operator=(const ObjectValue&) = delete;

  /**
   * Creates a new ObjectValue that is backed by the given `map_value`.
   * ObjectValue takes on ownership of the data.
   */
  static ObjectValue FromMapValue(
      nanopb::Message<google_firestore_v1_MapValue> map_value);

  /**
   * Creates a new ObjectValue that is backed by the provided document fields.
   * ObjectValue takes on ownership of the data and zeroes out the pointers in
   * `fields_entry`. This allows the callsite to destruct the Document proto
   * without affecting the fields data.
   */
  static ObjectValue FromFieldsEntry(
      google_firestore_v1_Document_FieldsEntry* fields_entry, pb_size_t count);

  /** Recursively extracts the FieldPaths that are set in this ObjectValue. */
  FieldMask ToFieldMask() const;

  /**
   * Returns the value at the given path or null.
   *
   * @param path the path to search
   * @return The value at the path or null if it doesn't exist.
   */
  absl::optional<google_firestore_v1_Value> Get(const FieldPath& path) const;

  /**
   * Returns the ObjectValue in its Protobuf representation.
   */
  google_firestore_v1_Value Get() const;

  /**
   * Sets the field to the provided value.
   *
   * @param path The field path to set. The path must not be empty.
   * @param value The value to set.
   */
  void Set(const FieldPath& path,
           nanopb::Message<google_firestore_v1_Value> value);

  /**
   * Sets the provided fields to the provided values. Fields set to `nullopt`
   * are deleted.
   *
   * Takes ownership of data.
   *
   * @param data A map of fields to values (or nullopt for deletes)
   */
  void SetAll(TransformMap data);

  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path The field path to remove. The path must not be empty.
   */
  void Delete(const FieldPath& path);

  std::string ToString() const;

  size_t Hash() const;

  friend bool operator==(const ObjectValue& lhs, const ObjectValue& rhs);
  friend std::ostream& operator<<(std::ostream& out,
                                  const ObjectValue& object_value);

 private:
  /** Returns the field mask for the provided map value. */
  FieldMask ExtractFieldMask(const google_firestore_v1_MapValue& value) const;

  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  google_firestore_v1_MapValue* ParentMap(const FieldPath& path);

  nanopb::Message<google_firestore_v1_Value> value_;
};

inline bool operator==(const ObjectValue& lhs, const ObjectValue& rhs) {
  return *lhs.value_ == *rhs.value_;
}

inline bool operator!=(const ObjectValue& lhs, const ObjectValue& rhs) {
  return !(lhs == rhs);
}

inline std::ostream& operator<<(std::ostream& out,
                                const ObjectValue& object_value) {
  return out << "ObjectValue(" << *object_value.value_ << ")";
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_OBJECT_VALUE_H_
