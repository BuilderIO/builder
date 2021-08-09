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

#include "Firestore/core/src/local/memory_bundle_cache.h"

#include <string>

namespace firebase {
namespace firestore {
namespace local {

using bundle::BundleMetadata;
using bundle::NamedQuery;

absl::optional<BundleMetadata> MemoryBundleCache::GetBundleMetadata(
    const std::string& bundle_id) const {
  auto got = bundles_.find(bundle_id);
  if (got == bundles_.end()) {
    return absl::nullopt;
  }
  return absl::make_optional(got->second);
}

void MemoryBundleCache::SaveBundleMetadata(const BundleMetadata& metadata) {
  bundles_[metadata.bundle_id()] = metadata;
}

absl::optional<NamedQuery> MemoryBundleCache::GetNamedQuery(
    const std::string& query_name) const {
  auto got = named_queries_.find(query_name);
  if (got == named_queries_.end()) {
    return absl::nullopt;
  }
  return absl::make_optional(got->second);
}

void MemoryBundleCache::SaveNamedQuery(const NamedQuery& query) {
  named_queries_[query.query_name()] = query;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
