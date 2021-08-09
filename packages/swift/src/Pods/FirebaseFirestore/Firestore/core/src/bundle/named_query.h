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

#ifndef FIRESTORE_CORE_SRC_BUNDLE_NAMED_QUERY_H_
#define FIRESTORE_CORE_SRC_BUNDLE_NAMED_QUERY_H_

#include <string>
#include <utility>

#include "Firestore/core/src/bundle/bundle_element.h"
#include "Firestore/core/src/bundle/bundled_query.h"
#include "Firestore/core/src/model/snapshot_version.h"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Represents a named query saved by the SDK in its local storage.
 */
class NamedQuery : public BundleElement {
 public:
  NamedQuery() = default;

  NamedQuery(std::string query_name,
             BundledQuery bundled_query,
             model::SnapshotVersion read_time)
      : query_name_(std::move(query_name)),
        bundled_query_(std::move(bundled_query)),
        read_time_(read_time) {
  }

  Type element_type() const override {
    return Type::NamedQuery;
  }

  /**
   * @return The name of the query.
   */
  const std::string& query_name() const {
    return query_name_;
  }

  /**
   * @return The underlying query associated with the given name.
   */
  const BundledQuery& bundled_query() const {
    return bundled_query_;
  }

  /**
   * @return The time at which the results for this query were read.
   */
  model::SnapshotVersion read_time() const {
    return read_time_;
  }

 private:
  std::string query_name_;
  BundledQuery bundled_query_;
  model::SnapshotVersion read_time_;
};

inline bool operator==(const NamedQuery& lhs, const NamedQuery& rhs) {
  return lhs.query_name() == rhs.query_name() &&
         lhs.read_time() == rhs.read_time() &&
         lhs.bundled_query() == rhs.bundled_query();
}

inline bool operator!=(const NamedQuery& lhs, const NamedQuery& rhs) {
  return !(lhs == rhs);
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_NAMED_QUERY_H_
