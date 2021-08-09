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

#include "Firestore/core/src/core/array_contains_filter.h"

#include <memory>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/value_util.h"
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

class ArrayContainsFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field, SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(
            std::move(field), Operator::ArrayContains, std::move(value)) {
  }

  Type type() const override {
    return Type::kArrayContainsFilter;
  }

  bool Matches(const model::Document& doc) const override;
};

ArrayContainsFilter::ArrayContainsFilter(
    const model::FieldPath& field,
    SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<const Rep>(field, std::move(value))) {
}

bool ArrayContainsFilter::Rep::Matches(const Document& doc) const {
  absl::optional<google_firestore_v1_Value> maybe_lhs = doc->field(field());
  if (!maybe_lhs) return false;

  const google_firestore_v1_Value& lhs = *maybe_lhs;
  if (!IsArray(lhs)) return false;

  const google_firestore_v1_ArrayValue& contents = lhs.array_value;
  return Contains(contents, value());
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
