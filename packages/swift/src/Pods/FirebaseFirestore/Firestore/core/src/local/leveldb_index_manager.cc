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

#include "Firestore/core/src/local/leveldb_index_manager.h"

#include <string>
#include <vector>

#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/leveldb_persistence.h"
#include "Firestore/core/src/local/memory_index_manager.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace local {

using model::ResourcePath;

LevelDbIndexManager::LevelDbIndexManager(LevelDbPersistence* db) : db_(db) {
}

void LevelDbIndexManager::AddToCollectionParentIndex(
    const ResourcePath& collection_path) {
  HARD_ASSERT(collection_path.size() % 2 == 1, "Expected a collection path.");

  if (collection_parents_cache_.Add(collection_path)) {
    std::string collection_id = collection_path.last_segment();
    ResourcePath parent_path = collection_path.PopLast();

    std::string key =
        LevelDbCollectionParentKey::Key(collection_id, parent_path);
    std::string empty_buffer;
    db_->current_transaction()->Put(key, empty_buffer);
  }
}

std::vector<ResourcePath> LevelDbIndexManager::GetCollectionParents(
    const std::string& collection_id) {
  std::vector<ResourcePath> results;

  auto index_iterator = db_->current_transaction()->NewIterator();
  std::string index_prefix =
      LevelDbCollectionParentKey::KeyPrefix(collection_id);
  LevelDbCollectionParentKey row_key;
  for (index_iterator->Seek(index_prefix); index_iterator->Valid();
       index_iterator->Next()) {
    if (!absl::StartsWith(index_iterator->key(), index_prefix) ||
        !row_key.Decode(index_iterator->key()) ||
        row_key.collection_id() != collection_id) {
      break;
    }

    results.push_back(row_key.parent());
  }
  return results;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
