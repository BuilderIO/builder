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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MEMORY_BUNDLE_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MEMORY_BUNDLE_CACHE_H_

#include <string>
#include <unordered_map>

#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"
#include "Firestore/core/src/local/bundle_cache.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace local {

class MemoryBundleCache : public BundleCache {
 public:
  absl::optional<bundle::BundleMetadata> GetBundleMetadata(
      const std::string& bundle_id) const override;

  void SaveBundleMetadata(const bundle::BundleMetadata& metadata) override;

  absl::optional<bundle::NamedQuery> GetNamedQuery(
      const std::string& query_name) const override;

  void SaveNamedQuery(const bundle::NamedQuery& query) override;

 private:
  std::unordered_map<std::string, bundle::BundleMetadata> bundles_;
  std::unordered_map<std::string, bundle::NamedQuery> named_queries_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_MEMORY_BUNDLE_CACHE_H_
