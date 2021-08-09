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

#include "Firestore/core/src/core/order_by.h"

#include <ostream>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::FieldPath;
using util::ComparisonResult;

ComparisonResult OrderBy::Compare(const Document& lhs,
                                  const Document& rhs) const {
  ComparisonResult result;
  if (field_ == FieldPath::KeyFieldPath()) {
    result = lhs->key().CompareTo(rhs->key());
  } else {
    absl::optional<google_firestore_v1_Value> value1 = lhs->field(field_);
    absl::optional<google_firestore_v1_Value> value2 = rhs->field(field_);
    HARD_ASSERT(value1.has_value() && value2.has_value(),
                "Trying to compare documents on fields that don't exist.");
    result = model::Compare(*value1, *value2);
  }

  return direction_.ApplyTo(result);
}

std::string OrderBy::CanonicalId() const {
  return absl::StrCat(field_.CanonicalString(), direction_.CanonicalId());
}

std::string OrderBy::ToString() const {
  return util::StringFormat("OrderBy(path=%s, dir=%s)",
                            field_.CanonicalString(), direction_.CanonicalId());
}

std::ostream& operator<<(std::ostream& os, const OrderBy& order) {
  return os << order.ToString();
}

bool operator==(const OrderBy& lhs, const OrderBy& rhs) {
  return lhs.field() == rhs.field() && lhs.direction() == rhs.direction();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
