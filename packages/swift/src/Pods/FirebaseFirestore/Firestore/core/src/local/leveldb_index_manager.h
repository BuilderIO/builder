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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_INDEX_MANAGER_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_INDEX_MANAGER_H_

#include <string>
#include <vector>

#include "Firestore/core/src/local/index_manager.h"
#include "Firestore/core/src/local/memory_index_manager.h"

namespace firebase {
namespace firestore {
namespace local {

class LevelDbPersistence;

/** A persisted implementation of IndexManager. */
class LevelDbIndexManager : public IndexManager {
 public:
  explicit LevelDbIndexManager(LevelDbPersistence* db);

  void AddToCollectionParentIndex(
      const model::ResourcePath& collection_path) override;

  std::vector<model::ResourcePath> GetCollectionParents(
      const std::string& collection_id) override;

 private:
  // The LevelDbIndexManager is owned by LevelDbPersistence.
  LevelDbPersistence* db_;

  /**
   * An in-memory copy of the index entries we've already written since the SDK
   * launched. Used to avoid re-writing the same entry repeatedly.
   *
   * This is *NOT* a complete cache of what's in persistence and so can never
   * be used to satisfy reads.
   */
  MemoryCollectionParentIndex collection_parents_cache_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_INDEX_MANAGER_H_
