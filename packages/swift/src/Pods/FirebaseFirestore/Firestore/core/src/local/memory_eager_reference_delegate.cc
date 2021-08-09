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

#include "Firestore/core/src/local/memory_eager_reference_delegate.h"

#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/memory_mutation_queue.h"
#include "Firestore/core/src/local/memory_persistence.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/local/remote_document_cache.h"
#include "Firestore/core/src/local/target_data.h"

namespace firebase {
namespace firestore {
namespace local {

using model::DocumentKey;
using model::ListenSequenceNumber;

MemoryEagerReferenceDelegate::MemoryEagerReferenceDelegate(
    MemoryPersistence* persistence)
    : persistence_(persistence) {
}

ListenSequenceNumber MemoryEagerReferenceDelegate::current_sequence_number()
    const {
  return kListenSequenceNumberInvalid;
}

void MemoryEagerReferenceDelegate::AddInMemoryPins(ReferenceSet* set) {
  // We should be able to assert that additional_references_ is nullptr, but due
  // to restarts in spec tests it would fail.
  additional_references_ = set;
}

void MemoryEagerReferenceDelegate::RemoveTarget(const TargetData& target_data) {
  for (const DocumentKey& doc_key :
       persistence_->target_cache()->GetMatchingKeys(target_data.target_id())) {
    orphaned_->insert(doc_key);
  }
  persistence_->target_cache()->RemoveTarget(target_data);
}

void MemoryEagerReferenceDelegate::AddReference(const DocumentKey& key) {
  orphaned_->erase(key);
}

void MemoryEagerReferenceDelegate::RemoveReference(const DocumentKey& key) {
  orphaned_->insert(key);
}

void MemoryEagerReferenceDelegate::RemoveMutationReference(
    const DocumentKey& key) {
  orphaned_->insert(key);
}

bool MemoryEagerReferenceDelegate::IsReferenced(const DocumentKey& key) const {
  if (persistence_->target_cache()->Contains(key)) {
    return true;
  }
  if (MutationQueuesContainKey(key)) {
    return true;
  }
  if (additional_references_ && additional_references_->ContainsKey(key)) {
    return true;
  }
  return false;
}

void MemoryEagerReferenceDelegate::UpdateLimboDocument(const DocumentKey& key) {
  if (IsReferenced(key)) {
    orphaned_->erase(key);
  } else {
    orphaned_->insert(key);
  }
}

void MemoryEagerReferenceDelegate::OnTransactionStarted(absl::string_view) {
  // Constructs the unordered map, in place, with no arguments.
  orphaned_.emplace();
}

void MemoryEagerReferenceDelegate::OnTransactionCommitted() {
  for (const auto& key : *orphaned_) {
    if (!IsReferenced(key)) {
      persistence_->remote_document_cache()->Remove(key);
    }
  }
  orphaned_.reset();
}

bool MemoryEagerReferenceDelegate::MutationQueuesContainKey(
    const DocumentKey& key) const {
  const auto& queues = persistence_->mutation_queues();
  for (const auto& entry : queues) {
    if (entry.second->ContainsKey(key)) {
      return true;
    }
  }
  return false;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
