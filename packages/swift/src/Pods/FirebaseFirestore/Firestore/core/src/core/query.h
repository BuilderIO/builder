/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_CORE_QUERY_H_
#define FIRESTORE_CORE_SRC_CORE_QUERY_H_

#include <iosfwd>
#include <limits>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/core/order_by.h"
#include "Firestore/core/src/core/target.h"
#include "Firestore/core/src/immutable/append_only_list.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/resource_path.h"

namespace firebase {
namespace firestore {
namespace core {

class Bound;

using CollectionGroupId = std::shared_ptr<const std::string>;

enum class LimitType { None, First, Last };

/**
 * Encapsulates all the query attributes we support in the SDK. It represents
 * query features visible to user, and can be run against the LocalStore.
 * `Query` is first convert to `Target` to run against RemoteStore to query
 * backend results, because `Target` encapsulates features backend knows about.
 */
class Query {
 public:
  Query() = default;

  explicit Query(model::ResourcePath path,
                 CollectionGroupId collection_group = nullptr)
      : path_(std::move(path)), collection_group_(std::move(collection_group)) {
  }

  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  Query(model::ResourcePath path,
        CollectionGroupId collection_group,
        FilterList filters,
        OrderByList explicit_order_bys,
        int32_t limit,
        LimitType limit_type,
        absl::optional<Bound> start_at,
        absl::optional<Bound> end_at)
      : path_(std::move(path)),
        collection_group_(std::move(collection_group)),
        filters_(std::move(filters)),
        explicit_order_bys_(std::move(explicit_order_bys)),
        limit_(limit),
        limit_type_(limit_type),
        start_at_(std::move(start_at)),
        end_at_(std::move(end_at)) {
  }

  Query(model::ResourcePath path, std::string collection_group);

  // MARK: - Accessors

  /** The base path of the query. */
  const model::ResourcePath& path() const {
    return path_;
  }

  /** The collection group of the query, if any. */
  const std::shared_ptr<const std::string>& collection_group() const {
    return collection_group_;
  }

  /** Returns true if this Query is for a specific document. */
  bool IsDocumentQuery() const;

  /** Returns true if this Query is a collection group query. */
  bool IsCollectionGroupQuery() const {
    return collection_group_ != nullptr;
  }

  /**
   * Returns true if this query does not specify any query constraints that
   * could remove results.
   */
  bool MatchesAllDocuments() const;

  /** The filters on the documents returned by the query. */
  const FilterList& filters() const {
    return filters_;
  }

  /**
   * Returns the field of the first filter on this Query that's an inequality,
   * or nullptr if there are no inequalities.
   */
  const model::FieldPath* InequalityFilterField() const;

  /**
   * Checks if any of the provided filter operators are included in the query
   * and returns the first one that is, or null if none are.
   */
  absl::optional<Filter::Operator> FindOperator(
      const std::vector<Filter::Operator>& ops) const;

  /**
   * Returns the list of ordering constraints that were explicitly requested on
   * the query by the user.
   *
   * Note that the actual query performed might add additional sort orders to
   * match the behavior of the backend.
   */
  const OrderByList& explicit_order_bys() const {
    return explicit_order_bys_;
  }

  /**
   * Returns the full list of ordering constraints on the query.
   *
   * This might include additional sort orders added implicitly to match the
   * backend behavior.
   */
  const OrderByList& order_bys() const;

  /** Returns the first field in an order-by constraint, or nullptr if none. */
  const model::FieldPath* FirstOrderByField() const;

  bool has_limit_to_first() const {
    return limit_type_ == LimitType::First && limit_ != Target::kNoLimit;
  }

  bool has_limit_to_last() const {
    return limit_type_ == LimitType::Last && limit_ != Target::kNoLimit;
  }

  LimitType limit_type() const;

  int32_t limit() const;

  const absl::optional<Bound>& start_at() const {
    return start_at_;
  }

  const absl::optional<Bound>& end_at() const {
    return end_at_;
  }

  // MARK: - Builder methods

  /**
   * Returns a copy of this Query object with the additional specified filter.
   */
  Query AddingFilter(Filter filter) const;

  /**
   * Returns a copy of this Query object with the additional specified order by.
   */
  Query AddingOrderBy(OrderBy order_by) const;

  /**
   * Returns a new `Query` that returns the first matching documents up to
   * the specified number.
   *
   * @param limit The maximum number of results to return. If
   *     `limit == kNoLimit`, then no limit is applied. Otherwise, if
   *     `limit <= 0`, behavior is unspecified.
   */
  Query WithLimitToFirst(int32_t limit) const;

  /**
   * Returns a new `Query` that returns the last matching documents up to
   * the specified number.
   *
   * You must specify at least one `OrderBy` clause for `LimitToLast` queries,
   * it is an error otherwise.
   *
   * @param limit The maximum number of results to return. If
   *     `limit == kNoLimit`, then no limit is applied. Otherwise, if
   *     `limit <= 0`, behavior is unspecified.
   */
  Query WithLimitToLast(int32_t limit) const;

  /**
   * Returns a copy of this Query starting at the provided bound.
   */
  Query StartingAt(Bound bound) const;

  /**
   * Returns a copy of this Query ending at the provided bound.
   */
  Query EndingAt(Bound bound) const;

  // MARK: - Matching

  /**
   * Converts this collection group query into a collection query at a specific
   * path. This is used when executing collection group queries, since we have
   * to split the query into a set of collection queries, one for each
   * collection in the group.
   */
  Query AsCollectionQueryAtPath(model::ResourcePath path) const;

  /** Returns true if the document matches the constraints of this query. */
  bool Matches(const model::Document& doc) const;

  /**
   * Returns a comparator that will sort documents according to the order by
   * clauses in this query.
   */
  model::DocumentComparator Comparator() const;

  const std::string CanonicalId() const;

  std::string ToString() const;

  /**
   * Returns a `Target` instance this query will be mapped to in backend
   * and local store.
   */
  const Target& ToTarget() const&;

  friend std::ostream& operator<<(std::ostream& os, const Query& query);

  friend bool operator==(const Query& lhs, const Query& rhs);
  size_t Hash() const;

 private:
  bool MatchesPathAndCollectionGroup(const model::Document& doc) const;
  bool MatchesFilters(const model::Document& doc) const;
  bool MatchesOrderBy(const model::Document& doc) const;
  bool MatchesBounds(const model::Document& doc) const;

  model::ResourcePath path_;
  std::shared_ptr<const std::string> collection_group_;

  // Filters are shared across related Query instance. i.e. when you call
  // Query::Filter(f), a new Query instance is created that contains all of the
  // existing filters, plus the new one. (Both Query and Filter objects are
  // immutable.) Filters are not shared across unrelated Query instances.
  FilterList filters_;

  // A list of fields given to sort by. This does not include the implicit key
  // sort at the end.
  OrderByList explicit_order_bys_;

  // The memoized list of sort orders.
  mutable OrderByList memoized_order_bys_;

  int32_t limit_ = Target::kNoLimit;
  LimitType limit_type_ = LimitType::None;

  absl::optional<Bound> start_at_;
  absl::optional<Bound> end_at_;

  // The corresponding Target of this Query instance.
  mutable std::shared_ptr<const Target> memoized_target;
};

bool operator==(const Query& lhs, const Query& rhs);
inline bool operator!=(const Query& lhs, const Query& rhs) {
  return !(lhs == rhs);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

namespace std {

template <>
struct hash<firebase::firestore::core::Query> {
  size_t operator()(const firebase::firestore::core::Query& query) const {
    return query.Hash();
  }
};

}  // namespace std

#endif  // FIRESTORE_CORE_SRC_CORE_QUERY_H_
