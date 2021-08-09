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

#include "Firestore/core/src/core/target.h"

#include <ostream>

#include "Firestore/core/src/core/field_filter.h"
#include "Firestore/core/src/core/operator.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/equality.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace core {

using model::DocumentKey;

// MARK: - Accessors

bool Target::IsDocumentQuery() const {
  return DocumentKey::IsDocumentKey(path_) && !collection_group_ &&
         filters_.empty();
}

const std::string& Target::CanonicalId() const {
  if (!canonical_id_.empty()) return canonical_id_;

  std::string result;
  absl::StrAppend(&result, path_.CanonicalString());

  if (collection_group_) {
    absl::StrAppend(&result, "|cg:", *collection_group_);
  }

  // Add filters.
  absl::StrAppend(&result, "|f:");
  for (const auto& filter : filters_) {
    absl::StrAppend(&result, filter.CanonicalId());
  }

  // Add order by.
  absl::StrAppend(&result, "|ob:");
  for (const OrderBy& order_by : order_bys()) {
    absl::StrAppend(&result, order_by.CanonicalId());
  }

  // Add limit.
  if (limit_ != kNoLimit) {
    absl::StrAppend(&result, "|l:", limit_);
  }

  if (start_at_) {
    absl::StrAppend(&result, "|lb:", start_at_->CanonicalId());
  }

  if (end_at_) {
    absl::StrAppend(&result, "|ub:", end_at_->CanonicalId());
  }

  canonical_id_ = std::move(result);
  return canonical_id_;
}

size_t Target::Hash() const {
  return util::Hash(CanonicalId());
}

std::string Target::ToString() const {
  return absl::StrCat("Target(canonical_id=", CanonicalId(), ")");
}

std::ostream& operator<<(std::ostream& os, const Target& target) {
  return os << target.ToString();
}

bool operator==(const Target& lhs, const Target& rhs) {
  return lhs.path() == rhs.path() &&
         util::Equals(lhs.collection_group(), rhs.collection_group()) &&
         lhs.filters() == rhs.filters() && lhs.order_bys() == rhs.order_bys() &&
         lhs.limit() == rhs.limit() && lhs.start_at() == rhs.start_at() &&
         lhs.end_at() == rhs.end_at();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
