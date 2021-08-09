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

#include "Firestore/core/src/core/array_contains_any_filter.h"

#include <memory>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Contains;
using model::Document;
using model::FieldPath;
using model::IsArray;
using nanopb::SharedMessage;

using Operator = Filter::Operator;

class ArrayContainsAnyFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field, SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(
            std::move(field), Operator::ArrayContainsAny, std::move(value)) {
    HARD_ASSERT(IsArray(this->value()),
                "ArrayContainsAnyFilter expects an ArrayValue");
  }

  Type type() const override {
    return Type::kArrayContainsAnyFilter;
  }

  bool Matches(const model::Document& doc) const override;
};

ArrayContainsAnyFilter::ArrayContainsAnyFilter(
    const model::FieldPath& field,
    SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<Rep>(field, std::move(value))) {
}

bool ArrayContainsAnyFilter::Rep::Matches(const Document& doc) const {
  const google_firestore_v1_ArrayValue& array_value = value().array_value;
  absl::optional<google_firestore_v1_Value> maybe_lhs = doc->field(field());
  if (!maybe_lhs) return false;

  const google_firestore_v1_Value& lhs = *maybe_lhs;
  if (!IsArray(lhs)) return false;

  for (pb_size_t i = 0; i < lhs.array_value.values_count; ++i) {
    if (Contains(array_value, lhs.array_value.values[i])) {
      return true;
    }
  }
  return false;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
