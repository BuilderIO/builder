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

#ifndef FIRESTORE_CORE_SRC_MODEL_FIELD_TRANSFORM_H_
#define FIRESTORE_CORE_SRC_MODEL_FIELD_TRANSFORM_H_

#include <string>

#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/transform_operation.h"

namespace firebase {
namespace firestore {
namespace model {

/** A field path and the TransformOperation to perform upon it. */
class FieldTransform {
 public:
  FieldTransform(FieldPath path, TransformOperation transformation) noexcept;

  const FieldPath& path() const {
    return path_;
  }

  const TransformOperation& transformation() const {
    return transformation_;
  }

  bool operator==(const FieldTransform& other) const;

  size_t Hash() const;

  std::string ToString() const;

 private:
  FieldPath path_;
  TransformOperation transformation_;
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_FIELD_TRANSFORM_H_
