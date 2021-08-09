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

#ifndef FIRESTORE_CORE_SRC_LOCAL_BUNDLE_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_BUNDLE_CACHE_H_

#include <string>

#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace bundle {

class BundleMetadata;
class NamedQuery;

}  // namespace bundle

namespace local {

/**
 * Provides methods to save and read Firestore bundles.
 */
class BundleCache {
 public:
  virtual ~BundleCache() = default;

  /**
   * Gets the saved metadata for a given bundle id.
   *
   * @return The `Bundle` corresponding to the given bundle id, or nullopt if
   * no bundles are found for the given id.
   */
  virtual absl::optional<bundle::BundleMetadata> GetBundleMetadata(
      const std::string& bundle_id) const = 0;

  /**
   * Saves the metadata for a bundle into local storage, using its id as the
   * persistent key.
   */
  virtual void SaveBundleMetadata(const bundle::BundleMetadata& metadata) = 0;

  /**
   * Gets a saved `NamedQuery` for the given query name.
   *
   * @return The `NamedQuery` corresponding to the given query name, or nullopt
   * if no queries are found for the given name.
   */
  virtual absl::optional<bundle::NamedQuery> GetNamedQuery(
      const std::string& query_name) const = 0;

  /**
   * Saves a `NamedQuery` from a bundle, using its name as the persistent key.
   */
  virtual void SaveNamedQuery(const bundle::NamedQuery& query) = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_BUNDLE_CACHE_H_
