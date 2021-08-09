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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_LRU_REFERENCE_DELEGATE_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_LRU_REFERENCE_DELEGATE_H_

#include <memory>

#include "Firestore/core/src/local/lru_garbage_collector.h"

namespace firebase {
namespace firestore {
namespace local {

class LevelDbPersistence;
class ListenSequence;

class LevelDbLruReferenceDelegate : public LruDelegate {
 public:
  LevelDbLruReferenceDelegate(LevelDbPersistence* persistence,
                              LruParams lru_params);

  ~LevelDbLruReferenceDelegate();

  void Start();

  // MARK: ReferenceDelegate methods

  model::ListenSequenceNumber current_sequence_number() const override;

  void AddInMemoryPins(ReferenceSet* set) override;

  void AddReference(const model::DocumentKey& key) override;
  void RemoveReference(const model::DocumentKey& key) override;
  void RemoveMutationReference(const model::DocumentKey& key) override;
  void RemoveTarget(const local::TargetData& target_data) override;

  void UpdateLimboDocument(const model::DocumentKey& key) override;

  void OnTransactionStarted(absl::string_view label) override;
  void OnTransactionCommitted() override;

  // MARK: LruDelegate methods

  LruGarbageCollector* garbage_collector() override;

  util::StatusOr<int64_t> CalculateByteSize() override;
  size_t GetSequenceNumberCount() override;

  void EnumerateTargetSequenceNumbers(
      const SequenceNumberCallback& callback) override;
  void EnumerateOrphanedDocuments(
      const OrphanedDocumentCallback& callback) override;

  int RemoveOrphanedDocuments(model::ListenSequenceNumber upper_bound) override;
  int RemoveTargets(model::ListenSequenceNumber sequence_number,
                    const LiveQueryMap& live_queries) override;

 private:
  bool IsPinned(const model::DocumentKey& key);

  bool MutationQueuesContainKey(const model::DocumentKey& key);

  void RemoveSentinel(const model::DocumentKey& key);
  void WriteSentinel(const model::DocumentKey& key);

  std::unique_ptr<LruGarbageCollector> gc_;

  // Persistence instances are owned by FirestoreClient
  LevelDbPersistence* db_;

  // Additional references are owned by LocalStore
  ReferenceSet* additional_references_;

  // This needs to be a pointer because initialization is delayed until after
  // we read from the target cache.
  std::unique_ptr<ListenSequence> listen_sequence_;

  // The current sequence number for the currently active transaction. If no
  // transaction is active, resets back to kListenSequenceNumberInvalid.
  model::ListenSequenceNumber current_sequence_number_ =
      kListenSequenceNumberInvalid;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_LRU_REFERENCE_DELEGATE_H_
