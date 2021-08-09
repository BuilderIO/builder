/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MEMORY_REMOTE_DOCUMENT_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MEMORY_REMOTE_DOCUMENT_CACHE_H_

#include <utility>
#include <vector>

#include "Firestore/core/src/immutable/sorted_map.h"
#include "Firestore/core/src/local/remote_document_cache.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {
namespace local {

class MemoryLruReferenceDelegate;
class MemoryPersistence;
class Sizer;

class MemoryRemoteDocumentCache : public RemoteDocumentCache {
 public:
  explicit MemoryRemoteDocumentCache(MemoryPersistence* persistence);

  void Add(const model::MutableDocument& document,
           const model::SnapshotVersion& read_time) override;
  void Remove(const model::DocumentKey& key) override;

  model::MutableDocument Get(const model::DocumentKey& key) override;
  model::MutableDocumentMap GetAll(const model::DocumentKeySet& keys) override;
  model::MutableDocumentMap GetMatching(
      const core::Query& query,
      const model::SnapshotVersion& since_read_time) override;

  std::vector<model::DocumentKey> RemoveOrphanedDocuments(
      MemoryLruReferenceDelegate* reference_delegate,
      model::ListenSequenceNumber upper_bound);

  int64_t CalculateByteSize(const Sizer& sizer);

 private:
  /** Underlying cache of documents and their read times. */
  immutable::SortedMap<
      model::DocumentKey,
      std::pair<model::MutableDocument, model::SnapshotVersion>>
      docs_;

  // This instance is owned by MemoryPersistence; avoid a retain cycle.
  MemoryPersistence* persistence_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_MEMORY_REMOTE_DOCUMENT_CACHE_H_
