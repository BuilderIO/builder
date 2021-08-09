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

#include "Firestore/core/src/core/key_field_filter.h"

#include <memory>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::DocumentKey;
using model::FieldPath;
using model::GetTypeOrder;
using model::TypeOrder;
using nanopb::SharedMessage;

using Operator = Filter::Operator;

class KeyFieldFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field,
      Operator op,
      SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(std::move(field), op, std::move(value)) {
    HARD_ASSERT(GetTypeOrder(this->value()) == TypeOrder::kReference,
                "KeyFieldFilter expects a ReferenceValue");
    key_ = DocumentKey::FromName(
        nanopb::MakeString(this->value().reference_value));
  }

  Type type() const override {
    return Type::kKeyFieldFilter;
  }

  bool Matches(const model::Document& doc) const override;

 private:
  DocumentKey key_;
};

KeyFieldFilter::KeyFieldFilter(const FieldPath& field,
                               Operator op,
                               SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<const Rep>(field, op, std::move(value))) {
}

bool KeyFieldFilter::Rep::Matches(const Document& doc) const {
  return MatchesComparison(doc->key().CompareTo(key_));
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
