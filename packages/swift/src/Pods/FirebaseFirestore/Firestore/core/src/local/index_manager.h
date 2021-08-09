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

#ifndef FIRESTORE_CORE_SRC_LOCAL_INDEX_MANAGER_H_
#define FIRESTORE_CORE_SRC_LOCAL_INDEX_MANAGER_H_

#include <string>
#include <vector>

namespace firebase {
namespace firestore {

namespace model {
class ResourcePath;
}  // namespace model

namespace local {

/**
 * Represents a set of indexes that are used to execute queries efficiently.
 *
 * Currently the only index is a [collection id] => [parent path] index, used
 * to execute Collection Group queries.
 */
class IndexManager {
 public:
  virtual ~IndexManager() = default;

  /**
   * Creates an index entry mapping the collection_id (last segment of the path)
   * to the parent path (either the containing document location or the empty
   * path for root-level collections). Index entries can be retrieved via
   * GetCollectionParents().
   *
   * NOTE: Currently we don't remove index entries. If this ends up being an
   * issue we can devise some sort of GC strategy.
   */
  virtual void AddToCollectionParentIndex(
      const model::ResourcePath& collection_path) = 0;

  /**
   * Retrieves all parent locations containing the given collection_id, as a set
   * of paths (each path being either a document location or the empty path for
   * a root-level collection).
   */
  virtual std::vector<model::ResourcePath> GetCollectionParents(
      const std::string& collection_id) = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_INDEX_MANAGER_H_
