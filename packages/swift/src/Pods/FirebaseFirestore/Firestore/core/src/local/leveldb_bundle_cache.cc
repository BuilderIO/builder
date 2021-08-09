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

#include "Firestore/core/src/local/leveldb_bundle_cache.h"

#include <utility>

#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"
#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/leveldb_persistence.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace local {

using bundle::BundleMetadata;
using bundle::NamedQuery;
using nanopb::Message;
using nanopb::StringReader;

LevelDbBundleCache::LevelDbBundleCache(LevelDbPersistence* db,
                                       LocalSerializer* serializer)
    : db_(NOT_NULL(db)), serializer_(NOT_NULL(serializer)) {
}

absl::optional<BundleMetadata> LevelDbBundleCache::GetBundleMetadata(
    const std::string& bundle_id) const {
  auto key = LevelDbBundleKey::Key(bundle_id);
  std::string encoded;
  auto done = db_->current_transaction()->Get(key, &encoded);

  if (!done.ok()) {
    return absl::nullopt;
  }

  nanopb::StringReader reader{encoded};
  auto message = Message<firestore_BundleMetadata>::TryParse(&reader);
  if (!reader.ok()) {
    HARD_FAIL("BundleMetadata proto failed to parse: %s",
              reader.status().ToString());
  }

  BundleMetadata bundle = serializer_->DecodeBundle(&reader, *message);
  if (!reader.ok()) {
    HARD_FAIL("BundleMetadata proto failed to decode: %s",
              reader.status().ToString());
  }
  return absl::make_optional(std::move(bundle));
}

void LevelDbBundleCache::SaveBundleMetadata(const BundleMetadata& metadata) {
  auto key = LevelDbBundleKey::Key(metadata.bundle_id());
  db_->current_transaction()->Put(key, serializer_->EncodeBundle(metadata));
}

absl::optional<NamedQuery> LevelDbBundleCache::GetNamedQuery(
    const std::string& query_name) const {
  auto key = LevelDbNamedQueryKey::Key(query_name);
  std::string encoded;
  auto done = db_->current_transaction()->Get(key, &encoded);

  if (!done.ok()) {
    return absl::nullopt;
  }

  nanopb::StringReader reader{encoded};
  auto message = Message<firestore_NamedQuery>::TryParse(&reader);
  if (!reader.ok()) {
    HARD_FAIL("NamedQuery proto failed to parse: %s",
              reader.status().ToString());
  }

  auto named_query = serializer_->DecodeNamedQuery(&reader, *message);
  if (!reader.ok()) {
    HARD_FAIL("NamedQuery proto failed to decode: %s",
              reader.status().ToString());
  }
  return absl::make_optional(std::move(named_query));
}

void LevelDbBundleCache::SaveNamedQuery(const NamedQuery& query) {
  auto key = LevelDbNamedQueryKey::Key(query.query_name());
  db_->current_transaction()->Put(key, serializer_->EncodeNamedQuery(query));
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
