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

#include "Firestore/core/src/core/key_field_in_filter.h"

#include <memory>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::DocumentKey;
using model::DocumentKeyHash;
using model::FieldPath;
using model::GetTypeOrder;
using model::IsArray;
using model::TypeOrder;
using nanopb::SharedMessage;

using Operator = Filter::Operator;

class KeyFieldInFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field, SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(std::move(field), Operator::In, std::move(value)) {
    keys_ = ExtractDocumentKeysFromValue(this->value());
  }

  Type type() const override {
    return Type::kKeyFieldInFilter;
  }

  bool Matches(const model::Document& doc) const override;

 private:
  std::unordered_set<DocumentKey, DocumentKeyHash> keys_;
};

KeyFieldInFilter::KeyFieldInFilter(
    const FieldPath& field, SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<const Rep>(field, std::move(value))) {
}

bool KeyFieldInFilter::Rep::Matches(const Document& doc) const {
  return keys_.find(doc->key()) != keys_.end();
}

std::unordered_set<DocumentKey, DocumentKeyHash>
KeyFieldInFilter::ExtractDocumentKeysFromValue(
    const google_firestore_v1_Value& value) {
  HARD_ASSERT(IsArray(value),
              "Comparing on key with In/NotIn, but the value was not an Array");
  std::unordered_set<DocumentKey, DocumentKeyHash> keys;
  const google_firestore_v1_ArrayValue& array_value = value.array_value;
  for (pb_size_t i = 0; i < array_value.values_count; ++i) {
    HARD_ASSERT(GetTypeOrder(array_value.values[i]) == TypeOrder::kReference,
                "Comparing on key with In/NotIn, but an array value was not"
                " a Reference");
    keys.insert(DocumentKey::FromName(
        nanopb::MakeString(array_value.values[i].reference_value)));
  }
  return keys;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
