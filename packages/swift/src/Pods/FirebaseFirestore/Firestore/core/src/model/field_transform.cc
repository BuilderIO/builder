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

#include "Firestore/core/src/model/field_transform.h"

#include <memory>
#include <utility>

#include "Firestore/core/src/model/transform_operation.h"
#include "Firestore/core/src/util/hashing.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace model {

FieldTransform::FieldTransform(FieldPath path,
                               TransformOperation transformation) noexcept
    : path_{std::move(path)}, transformation_{std::move(transformation)} {
}

bool FieldTransform::operator==(const FieldTransform& other) const {
  return path_ == other.path_ && transformation_ == other.transformation_;
}

size_t FieldTransform::Hash() const {
  return util::Hash(path_, transformation_);
}

std::string FieldTransform::ToString() const {
  return absl::StrCat("FieldTransform(path=", path_.CanonicalString(),
                      "transformation=", transformation_.ToString(), ")");
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
