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

#include "Firestore/core/src/core/key_field_not_in_filter.h"
#include "Firestore/core/src/core/key_field_in_filter.h"

#include <memory>
#include <unordered_set>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::DocumentKey;
using model::DocumentKeyHash;
using model::FieldPath;
using nanopb::SharedMessage;

using Operator = Filter::Operator;

class KeyFieldNotInFilter::Rep : public FieldFilter::Rep {
 public:
  Rep(FieldPath field, SharedMessage<google_firestore_v1_Value> value)
      : FieldFilter::Rep(std::move(field), Operator::NotIn, std::move(value)) {
    keys_ = KeyFieldInFilter::ExtractDocumentKeysFromValue(this->value());
  }

  Type type() const override {
    return Type::kKeyFieldInFilter;
  }

  bool Matches(const model::Document& doc) const override;

 private:
  std::unordered_set<DocumentKey, DocumentKeyHash> keys_;
};

KeyFieldNotInFilter::KeyFieldNotInFilter(
    const FieldPath& field, SharedMessage<google_firestore_v1_Value> value)
    : FieldFilter(std::make_shared<const Rep>(field, std::move(value))) {
}

bool KeyFieldNotInFilter::Rep::Matches(const Document& doc) const {
  return keys_.find(doc->key()) == keys_.end();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
