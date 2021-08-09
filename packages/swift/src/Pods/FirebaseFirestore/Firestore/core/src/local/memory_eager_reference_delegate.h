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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MEMORY_EAGER_REFERENCE_DELEGATE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MEMORY_EAGER_REFERENCE_DELEGATE_H_

#include <memory>
#include <unordered_set>

#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/model/document_key.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace local {

class MemoryPersistence;

/**
 * Provides the eager GC implementation for memory persistence.
 */
class MemoryEagerReferenceDelegate : public ReferenceDelegate {
 public:
  explicit MemoryEagerReferenceDelegate(MemoryPersistence* persistence);

  model::ListenSequenceNumber current_sequence_number() const override;

  void AddInMemoryPins(ReferenceSet* set) override;

  void AddReference(const model::DocumentKey& key) override;
  void RemoveReference(const model::DocumentKey& key) override;
  void RemoveMutationReference(const model::DocumentKey& key) override;
  void RemoveTarget(const TargetData& target_data) override;

  void UpdateLimboDocument(const model::DocumentKey& key) override;

  void OnTransactionStarted(absl::string_view label) override;
  void OnTransactionCommitted() override;

 private:
  bool IsReferenced(const model::DocumentKey& key) const;

  bool MutationQueuesContainKey(const model::DocumentKey& key) const;

  absl::optional<std::unordered_set<model::DocumentKey, model::DocumentKeyHash>>
      orphaned_;

  // This instance is owned by MemoryPersistence.
  MemoryPersistence* persistence_ = nullptr;

  // The ReferenceSet is owned by LocalStore.
  ReferenceSet* additional_references_ = nullptr;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_MEMORY_EAGER_REFERENCE_DELEGATE_H_
