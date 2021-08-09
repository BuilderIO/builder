/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/api/settings.h"

#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace api {

constexpr const char* Settings::DefaultHost;
constexpr bool Settings::DefaultSslEnabled;
constexpr bool Settings::DefaultPersistenceEnabled;
constexpr int64_t Settings::DefaultCacheSizeBytes;
constexpr int64_t Settings::MinimumCacheSizeBytes;

size_t Settings::Hash() const {
  return util::Hash(host_, ssl_enabled_, persistence_enabled_,
                    cache_size_bytes_);
}

bool operator==(const Settings& lhs, const Settings& rhs) {
  return lhs.host_ == rhs.host_ && lhs.ssl_enabled_ == rhs.ssl_enabled_ &&
         lhs.persistence_enabled_ == rhs.persistence_enabled_ &&
         lhs.cache_size_bytes_ == rhs.cache_size_bytes_;
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
