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

#include "Firestore/core/src/model/field_mask.h"

#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace model {

bool FieldMask::covers(const FieldPath& field_path) const {
  for (const FieldPath& field_mask_path : fields_) {
    if (field_mask_path.IsPrefixOf(field_path)) {
      return true;
    }
  }

  return false;
}

std::string FieldMask::ToString() const {
  // Ideally, one should use a string builder. Since this is only non-critical
  // code for logging and debugging, the logic is kept simple here.
  std::string result("{ ");
  for (const FieldPath& field : fields_) {
    result += field.CanonicalString() + " ";
  }
  return result + "}";
}

size_t FieldMask::Hash() const {
  return util::Hash(fields_);
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
