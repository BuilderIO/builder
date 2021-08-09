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

#ifndef FIRESTORE_CORE_SRC_CORE_TARGET_H_
#define FIRESTORE_CORE_SRC_CORE_TARGET_H_

#include <iosfwd>
#include <limits>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/core/bound.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/core/order_by.h"
#include "Firestore/core/src/immutable/append_only_list.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/remote/serializer.h"

namespace firebase {
namespace firestore {
namespace bundle {
class BundleSerializer;
}
namespace core {

using CollectionGroupId = std::shared_ptr<const std::string>;

/**
 * A Target represents the WatchTarget representation of a Query, which is
 * used by the LocalStore and the RemoteStore to keep track of and to execute
 * backend queries. While multiple Queries can map to the same Target, each
 * Target maps to a single WatchTarget in RemoteStore and a single TargetData
 * entry in persistence.
 */
class Target {
 public:
  static constexpr int32_t kNoLimit = std::numeric_limits<int32_t>::max();

  Target() = default;

  // MARK: - Accessors

  /** The base path of the target. */
  const model::ResourcePath& path() const {
    return path_;
  }

  /** The collection group of the target, if any. */
  const std::shared_ptr<const std::string>& collection_group() const {
    return collection_group_;
  }

  /** Returns true if this Target is for a specific document. */
  bool IsDocumentQuery() const;

  /** The filters on the documents returned by the target. */
  const FilterList& filters() const {
    return filters_;
  }

  /** Returns the list of ordering constraints by the target. */
  const OrderByList& order_bys() const {
    return order_bys_;
  }

  int32_t limit() const {
    return limit_;
  }

  const absl::optional<Bound>& start_at() const {
    return start_at_;
  }

  const absl::optional<Bound>& end_at() const {
    return end_at_;
  }

  const std::string& CanonicalId() const;

  std::string ToString() const;

  friend std::ostream& operator<<(std::ostream& os, const Target& target);

  size_t Hash() const;

 private:
  /**
   * Initializes a Target with a path and additional query constraints.
   * Path must currently be empty if this is a collection group query.
   *
   * NOTE: This is made private and only accessible by `Query` and `Serializer`.
   * You should always construct Target from `Query.toTarget` because Query
   * provides an implicit `orderBy` property.
   */
  Target(model::ResourcePath path,
         CollectionGroupId collection_group,
         FilterList filters,
         OrderByList order_bys,
         int32_t limit,
         absl::optional<Bound> start_at,
         absl::optional<Bound> end_at)
      : path_(std::move(path)),
        collection_group_(std::move(collection_group)),
        filters_(std::move(filters)),
        order_bys_(std::move(order_bys)),
        limit_(limit),
        start_at_(std::move(start_at)),
        end_at_(std::move(end_at)) {
  }
  friend class Query;
  friend class remote::Serializer;
  friend class bundle::BundleSerializer;

  model::ResourcePath path_;
  std::shared_ptr<const std::string> collection_group_;
  FilterList filters_;
  OrderByList order_bys_;
  int32_t limit_ = kNoLimit;
  absl::optional<Bound> start_at_;
  absl::optional<Bound> end_at_;

  mutable std::string canonical_id_;
};

bool operator==(const Target& lhs, const Target& rhs);

inline bool operator!=(const Target& lhs, const Target& rhs) {
  return !(lhs == rhs);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

namespace std {

template <>
struct hash<firebase::firestore::core::Target> {
  size_t operator()(const firebase::firestore::core::Target& target) const {
    return target.Hash();
  }
};

}  // namespace std

#endif  // FIRESTORE_CORE_SRC_CORE_TARGET_H_
