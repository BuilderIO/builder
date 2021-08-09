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

#include "Firestore/core/src/local/memory_lru_reference_delegate.h"

#include <vector>

#include "Firestore/core/src/local/listen_sequence.h"
#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/memory_mutation_queue.h"
#include "Firestore/core/src/local/memory_persistence.h"
#include "Firestore/core/src/local/memory_remote_document_cache.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/local/remote_document_cache.h"
#include "Firestore/core/src/local/sizer.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace local {

using model::DocumentKey;
using model::ListenSequenceNumber;
using util::StatusOr;

MemoryLruReferenceDelegate::MemoryLruReferenceDelegate(
    MemoryPersistence* persistence,
    LruParams lru_params,
    std::unique_ptr<Sizer> sizer)
    : persistence_(persistence),
      sizer_(std::move(sizer)),
      gc_(this, lru_params) {
  // Theoretically this is always 0, since this is all in-memory...
  ListenSequenceNumber highest_sequence_number =
      persistence_->target_cache()->highest_listen_sequence_number();
  listen_sequence_ = absl::make_unique<ListenSequence>(highest_sequence_number);
}

LruGarbageCollector* MemoryLruReferenceDelegate::garbage_collector() {
  return &gc_;
}

ListenSequenceNumber MemoryLruReferenceDelegate::current_sequence_number()
    const {
  HARD_ASSERT(current_sequence_number_ != kListenSequenceNumberInvalid,
              "Asking for a sequence number outside of a transaction");
  return current_sequence_number_;
}

void MemoryLruReferenceDelegate::AddInMemoryPins(ReferenceSet* set) {
  // We should be able to assert that additional_references_ is nullptr, but due
  // to restarts in spec tests it would fail.
  additional_references_ = set;
}

void MemoryLruReferenceDelegate::RemoveTarget(const TargetData& target_data) {
  TargetData updated = target_data.WithSequenceNumber(current_sequence_number_);
  persistence_->target_cache()->UpdateTarget(updated);
}

void MemoryLruReferenceDelegate::UpdateLimboDocument(
    const model::DocumentKey& key) {
  sequence_numbers_[key] = current_sequence_number_;
}

void MemoryLruReferenceDelegate::OnTransactionStarted(absl::string_view) {
  current_sequence_number_ = listen_sequence_->Next();
}

void MemoryLruReferenceDelegate::OnTransactionCommitted() {
  current_sequence_number_ = kListenSequenceNumberInvalid;
}

void MemoryLruReferenceDelegate::EnumerateTargetSequenceNumbers(
    const SequenceNumberCallback& callback) {
  return persistence_->target_cache()->EnumerateSequenceNumbers(callback);
}

void MemoryLruReferenceDelegate::EnumerateOrphanedDocuments(
    const OrphanedDocumentCallback& callback) {
  for (const auto& entry : sequence_numbers_) {
    const DocumentKey& key = entry.first;
    ListenSequenceNumber sequence_number = entry.second;
    // Pass in the exact sequence number as the upper bound so we know it won't
    // be pinned by being too recent.
    if (!IsPinnedAtSequenceNumber(sequence_number, key)) {
      callback(key, sequence_number);
    }
  }
}

size_t MemoryLruReferenceDelegate::GetSequenceNumberCount() {
  size_t total_count = persistence_->target_cache()->size();
  EnumerateOrphanedDocuments(
      [&total_count](const DocumentKey&, ListenSequenceNumber) {
        total_count++;
      });
  return total_count;
}

int MemoryLruReferenceDelegate::RemoveTargets(
    model::ListenSequenceNumber sequence_number,
    const LiveQueryMap& live_queries) {
  return static_cast<int>(persistence_->target_cache()->RemoveTargets(
      sequence_number, live_queries));
}

int MemoryLruReferenceDelegate::RemoveOrphanedDocuments(
    model::ListenSequenceNumber upper_bound) {
  std::vector<DocumentKey> removed =
      persistence_->remote_document_cache()->RemoveOrphanedDocuments(
          this, upper_bound);
  for (const auto& key : removed) {
    sequence_numbers_.erase(key);
  }
  return static_cast<int>(removed.size());
}

void MemoryLruReferenceDelegate::AddReference(const DocumentKey& key) {
  sequence_numbers_[key] = current_sequence_number_;
}

void MemoryLruReferenceDelegate::RemoveReference(const DocumentKey& key) {
  sequence_numbers_[key] = current_sequence_number_;
}

bool MemoryLruReferenceDelegate::MutationQueuesContainKey(
    const DocumentKey& key) const {
  const auto& queues = persistence_->mutation_queues();
  for (const auto& entry : queues) {
    if (entry.second->ContainsKey(key)) {
      return true;
    }
  }
  return false;
}

void MemoryLruReferenceDelegate::RemoveMutationReference(
    const DocumentKey& key) {
  sequence_numbers_[key] = current_sequence_number_;
}

bool MemoryLruReferenceDelegate::IsPinnedAtSequenceNumber(
    ListenSequenceNumber upper_bound, const DocumentKey& key) const {
  if (MutationQueuesContainKey(key)) {
    return true;
  }
  if (additional_references_ && additional_references_->ContainsKey(key)) {
    return true;
  }
  if (persistence_->target_cache()->Contains(key)) {
    return true;
  }

  auto it = sequence_numbers_.find(key);
  if (it != sequence_numbers_.end() && it->second > upper_bound) {
    return true;
  }
  return false;
}

StatusOr<int64_t> MemoryLruReferenceDelegate::CalculateByteSize() {
  // Note that this method is only used for testing because this delegate is
  // only used for testing. The algorithm here (loop through everything,
  // serialize it and count bytes) is inefficient and inexact, but won't run in
  // production.
  int64_t count = 0;
  count += persistence_->target_cache()->CalculateByteSize(*sizer_);
  count += persistence_->remote_document_cache()->CalculateByteSize(*sizer_);
  const auto& queues = persistence_->mutation_queues();
  for (const auto& entry : queues) {
    count += entry.second->CalculateByteSize(*sizer_);
  }
  return count;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
