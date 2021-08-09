/*
 * Copyright 2020 Google LLC
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

#include "Firestore/core/src/core/not_in_filter.h"

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
using model::NullValue;
using nanopb::SharedMessage;

using Operator = Filter::Operator;

class NotInFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field, SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(std::move(field), Operator::NotIn, std::move(value)) {
    HARD_ASSERT(IsArray(this->value()), "NotInFilter expects an ArrayValue");
  }

  Type type() const override {
    return Type::kNotInFilter;
  }

  bool Matches(const model::Document& doc) const override;
};

NotInFilter::NotInFilter(const FieldPath& field,
                         SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<const Rep>(field, std::move(value))) {
}

bool NotInFilter::Rep::Matches(const Document& doc) const {
  const google_firestore_v1_ArrayValue& array_value = value().array_value;
  if (Contains(array_value, *NullValue())) {
    return false;
  }
  absl::optional<google_firestore_v1_Value> maybe_lhs = doc->field(field());
  return maybe_lhs && !Contains(array_value, *maybe_lhs);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
