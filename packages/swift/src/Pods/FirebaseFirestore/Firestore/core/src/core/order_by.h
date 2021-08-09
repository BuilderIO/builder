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

#ifndef FIRESTORE_CORE_SRC_CORE_ORDER_BY_H_
#define FIRESTORE_CORE_SRC_CORE_ORDER_BY_H_

#include <iosfwd>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/core/direction.h"
#include "Firestore/core/src/model/field_path.h"

namespace firebase {
namespace firestore {

namespace immutable {
template <typename T>
class AppendOnlyList;
}  // namespace immutable

namespace model {
class Document;
}  // namespace model

namespace util {
enum class ComparisonResult;
}  // namespace util

namespace core {

/** OrderBy is a field and direction by which to order query results. */
class OrderBy {
 public:
  static std::shared_ptr<OrderBy> Create(model::FieldPath field,
                                         Direction direction) {
    return std::make_shared<OrderBy>(std::move(field), direction);
  }

  OrderBy() = default;

  /** Creates a new sort order with the given field and direction. */
  OrderBy(model::FieldPath field, Direction direction)
      : field_(std::move(field)), direction_(direction) {
  }

  /** The field by which to sort. */
  const model::FieldPath& field() const {
    return field_;
  }

  /** The direction of the sort. */
  const Direction& direction() const {
    return direction_;
  }

  bool ascending() const {
    return direction_ == Direction::Ascending;
  }

  /**
   * Compares two documents based on the field and direction of this sort
   * order.
   */
  util::ComparisonResult Compare(const model::Document& lhs,
                                 const model::Document& rhs) const;

  /** A unique ID identifying the filter; used when serializing queries. */
  std::string CanonicalId() const;

  std::string ToString() const;

 private:
  model::FieldPath field_;
  Direction direction_;
};

/** A list of OrderBys, as used in Queries and elsewhere. */
using OrderByList = immutable::AppendOnlyList<OrderBy>;

std::ostream& operator<<(std::ostream& os, const OrderBy& order);

bool operator==(const OrderBy& lhs, const OrderBy& rhs);

inline bool operator!=(const OrderBy& lhs, const OrderBy& rhs) {
  return !(lhs == rhs);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_ORDER_BY_H_
