/*
 * Copyright 2021 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_QUERY_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_QUERY_H_

#include <utility>

#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/target.h"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * A bundled query represents a query target and its limit type.
 */
class BundledQuery {
 public:
  BundledQuery() = default;

  BundledQuery(core::Target target, core::LimitType limit_type)
      : target_(std::move(target)), limit_type_(limit_type) {
  }

  /**
   * @return The target that represents the user-issued query when building
   * bundles. Client side transformations are not performed for client-specific
   * features: order by constraints are not inverted for limit to last queries,
   * for example.
   */
  const core::Target& target() const {
    return target_;
  }

  /** @return The user provided limit type. */
  core::LimitType limit_type() const {
    return limit_type_;
  }

 private:
  core::Target target_;
  core::LimitType limit_type_;
};

inline bool operator==(const BundledQuery& lhs, const BundledQuery& rhs) {
  return lhs.target() == rhs.target() && lhs.limit_type() == rhs.limit_type();
}

inline bool operator!=(const BundledQuery& lhs, const BundledQuery& rhs) {
  return !(lhs == rhs);
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_QUERY_H_
