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

#include "Firestore/core/src/core/bound.h"

#include <ostream>

#include "Firestore/core/src/core/order_by.h"
#include "Firestore/core/src/immutable/append_only_list.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/to_string.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Compare;
using model::DocumentKey;
using model::FieldPath;
using model::GetTypeOrder;
using model::TypeOrder;
using nanopb::SharedMessage;
using util::ComparisonResult;

Bound Bound::FromValue(SharedMessage<google_firestore_v1_ArrayValue> position,
                       bool is_before) {
  model::SortFields(*position);
  return Bound(std::move(position), is_before);
}

bool Bound::SortsBeforeDocument(const OrderByList& order_by,
                                const model::Document& document) const {
  HARD_ASSERT(position_->values_count <= order_by.size(),
              "Bound has more components than the provided order by.");

  ComparisonResult result = ComparisonResult::Same;
  for (size_t idx = 0; idx < position_->values_count; ++idx) {
    const google_firestore_v1_Value& field_value = position_->values[idx];
    const OrderBy& ordering_component = order_by[idx];

    ComparisonResult comparison;
    if (ordering_component.field() == FieldPath::KeyFieldPath()) {
      HARD_ASSERT(
          GetTypeOrder(field_value) == TypeOrder ::kReference,
          "Bound has a non-key value where the key path is being used %s",
          field_value.ToString());
      auto key = DocumentKey::FromName(
          nanopb::MakeString(field_value.reference_value));
      comparison = key.CompareTo(document->key());

    } else {
      absl::optional<google_firestore_v1_Value> doc_value =
          document->field(ordering_component.field());
      HARD_ASSERT(
          doc_value.has_value(),
          "Field should exist since document matched the orderBy already.");
      comparison = Compare(field_value, *doc_value);
    }

    comparison = ordering_component.direction().ApplyTo(comparison);
    if (!util::Same(comparison)) {
      result = comparison;
      break;
    }
  }

  return before_ ? result <= ComparisonResult::Same
                 : result < ComparisonResult::Same;
}

std::string Bound::CanonicalId() const {
  std::string result = before_ ? "b:" : "a:";
  for (pb_size_t i = 0; i < position_->values_count; ++i) {
    result.append(model::CanonicalId(position_->values[i]));
  }
  return result;
}

std::string Bound::ToString() const {
  return util::StringFormat("Bound(position=%s, before=%s)",
                            model::CanonicalId(*position_),
                            util::ToString(before_));
}

std::ostream& operator<<(std::ostream& os, const Bound& bound) {
  return os << bound.ToString();
}

bool operator==(const Bound& lhs, const Bound& rhs) {
  return *lhs.position() == *rhs.position() && lhs.before() == rhs.before();
}

size_t Bound::Hash() const {
  return util::Hash(model::CanonicalId(*position_), before_);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
