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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MEMORY_LRU_REFERENCE_DELEGATE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MEMORY_LRU_REFERENCE_DELEGATE_H_

#include <memory>
#include <unordered_map>
#include <utility>

#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/model/document_key.h"

namespace firebase {
namespace firestore {
namespace local {

class ListenSequence;
class MemoryPersistence;
class Sizer;

/**
 * Provides the LRU GC implementation for memory persistence.
 */
class MemoryLruReferenceDelegate : public LruDelegate {
 public:
  MemoryLruReferenceDelegate(MemoryPersistence* persistence,
                             LruParams lru_params,
                             std::unique_ptr<Sizer> sizer);

  bool IsPinnedAtSequenceNumber(model::ListenSequenceNumber upper_bound,
                                const model::DocumentKey& key) const;

  // MARK: ReferenceDelegate overrides

  model::ListenSequenceNumber current_sequence_number() const override;

  void AddInMemoryPins(ReferenceSet* set) override;

  void AddReference(const model::DocumentKey& key) override;
  void RemoveReference(const model::DocumentKey& key) override;
  void RemoveMutationReference(const model::DocumentKey& key) override;
  void RemoveTarget(const TargetData& target_data) override;

  void UpdateLimboDocument(const model::DocumentKey& key) override;

  void OnTransactionStarted(absl::string_view label) override;
  void OnTransactionCommitted() override;

  // MARK: LruDelegate overrides

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
  bool MutationQueuesContainKey(const model::DocumentKey& key) const;

  // This instance is owned by MemoryPersistence.
  MemoryPersistence* persistence_ = nullptr;

  std::unique_ptr<Sizer> sizer_;

  LruGarbageCollector gc_;

  // Tracks sequence numbers of when documents are used. Equivalent to sentinel
  // rows in the leveldb implementation.
  std::unordered_map<model::DocumentKey,
                     model::ListenSequenceNumber,
                     model::DocumentKeyHash>
      sequence_numbers_;

  // This ReferenceSet is owned by LocalStore.
  ReferenceSet* additional_references_ = nullptr;

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

#endif  // FIRESTORE_CORE_SRC_LOCAL_MEMORY_LRU_REFERENCE_DELEGATE_H_
