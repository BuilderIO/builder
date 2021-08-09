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

#include "Firestore/core/src/local/memory_mutation_queue.h"

#include <utility>

#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/local/document_key_reference.h"
#include "Firestore/core/src/local/index_manager.h"
#include "Firestore/core/src/local/memory_persistence.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/sizer.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace local {

using core::Query;
using model::BatchId;
using model::DocumentKey;
using model::DocumentKeySet;
using model::kBatchIdUnknown;
using model::Mutation;
using model::MutationBatch;
using model::ResourcePath;
using nanopb::ByteString;

MemoryMutationQueue::MemoryMutationQueue(MemoryPersistence* persistence)
    : persistence_(persistence) {
}

bool MemoryMutationQueue::IsEmpty() {
  // If the queue has any entries at all, the first entry must not be a
  // tombstone (otherwise it would have been removed already).
  return queue_.empty();
}

void MemoryMutationQueue::AcknowledgeBatch(const MutationBatch& batch,
                                           const ByteString& stream_token) {
  HARD_ASSERT(!queue_.empty(), "Cannot acknowledge batch on an empty queue");

  // Guaranteed to exist, due to above assert
  const MutationBatch& check = queue_.front();
  // Verify that the batch in the queue is the one to be acknowledged.
  HARD_ASSERT(batch.batch_id() == check.batch_id(),
              "Queue ordering failure: expected batch %s, got batch %s",
              batch.batch_id(), check.batch_id());
  last_stream_token_ = stream_token;
}

void MemoryMutationQueue::Start() {
  // Note: The queue may be shutdown / started multiple times, since we maintain
  // the queue for the duration of the app session in case a user logs out /
  // back in. To behave like the LevelDB-backed MutationQueue (and accommodate
  // tests that expect as much), we reset next_batch_id_ if the queue is empty.
  if (IsEmpty()) {
    next_batch_id_ = 1;
  }
}

MutationBatch MemoryMutationQueue::AddMutationBatch(
    const Timestamp& local_write_time,
    std::vector<Mutation>&& base_mutations,
    std::vector<Mutation>&& mutations) {
  HARD_ASSERT(!mutations.empty(), "Mutation batches should not be empty");

  BatchId batch_id = next_batch_id_;
  next_batch_id_++;

  if (!queue_.empty()) {
    const MutationBatch& prior = queue_.back();
    HARD_ASSERT(prior.batch_id() < batch_id,
                "Mutation batch_ids must be in monotonically increasing order");
  }

  MutationBatch batch(batch_id, local_write_time, std::move(base_mutations),
                      std::move(mutations));
  queue_.push_back(batch);

  // Track references by document key and index collection parents.
  for (const Mutation& mutation : batch.mutations()) {
    batches_by_document_key_ = batches_by_document_key_.insert(
        DocumentKeyReference{mutation.key(), batch_id});

    persistence_->index_manager()->AddToCollectionParentIndex(
        mutation.key().path().PopLast());
  }

  return batch;
}

void MemoryMutationQueue::RemoveMutationBatch(const MutationBatch& batch) {
  // Can only remove the first batch
  HARD_ASSERT(!queue_.empty(), "Trying to remove batch from empty queue");
  const MutationBatch& head = queue_.front();
  HARD_ASSERT(head.batch_id() == batch.batch_id(),
              "Can only remove the first entry of the mutation queue");

  queue_.erase(queue_.begin());

  // Remove entries from the index too.
  for (const Mutation& mutation : batch.mutations()) {
    const DocumentKey& key = mutation.key();
    persistence_->reference_delegate()->RemoveMutationReference(key);

    DocumentKeyReference reference{key, batch.batch_id()};
    batches_by_document_key_ = batches_by_document_key_.erase(reference);
  }
}

std::vector<MutationBatch>
MemoryMutationQueue::AllMutationBatchesAffectingDocumentKeys(
    const DocumentKeySet& document_keys) {
  // First find the set of affected batch IDs.
  std::set<BatchId> batch_ids;
  for (const DocumentKey& key : document_keys) {
    DocumentKeyReference start{key, 0};

    for (const auto& reference : batches_by_document_key_.values_from(start)) {
      if (key != reference.key()) break;

      batch_ids.insert(reference.ref_id());
    }
  }

  return AllMutationBatchesWithIds(batch_ids);
}

std::vector<MutationBatch>
MemoryMutationQueue::AllMutationBatchesAffectingDocumentKey(
    const DocumentKey& key) {
  std::vector<MutationBatch> result;

  DocumentKeyReference start{key, 0};
  for (const auto& reference : batches_by_document_key_.values_from(start)) {
    if (key != reference.key()) break;

    auto batch = LookupMutationBatch(reference.ref_id());
    HARD_ASSERT(batch.has_value(),
                "Batches in the index must exist in the main table");
    result.push_back(*batch);
  }
  return result;
}

std::vector<MutationBatch>
MemoryMutationQueue::AllMutationBatchesAffectingQuery(const Query& query) {
  HARD_ASSERT(
      !query.IsCollectionGroupQuery(),
      "CollectionGroup queries should be handled in LocalDocumentsView");

  // Use the query path as a prefix for testing if a document matches the query.
  const ResourcePath& prefix = query.path();
  size_t immediate_children_path_length = prefix.size() + 1;

  // Construct a document reference for actually scanning the index. Unlike the
  // prefix, the document key in this reference must have an even number of
  // segments. The empty segment can be used as a suffix of the query path
  // because it precedes all other segments in an ordered traversal.
  ResourcePath start_path = query.path();
  if (!DocumentKey::IsDocumentKey(start_path)) {
    start_path = start_path.Append("");
  }
  DocumentKeyReference start{DocumentKey{start_path}, 0};

  // Find unique batch_ids referenced by all documents potentially matching the
  // query.
  std::set<BatchId> unique_batch_ids;
  for (const auto& reference : batches_by_document_key_.values_from(start)) {
    const ResourcePath& row_key_path = reference.key().path();
    if (!prefix.IsPrefixOf(row_key_path)) {
      break;
    }

    // Rows with document keys more than one segment longer than the query path
    // can't be matches. For example, a query on 'rooms' can't match the
    // document /rooms/abc/messages/xyx.
    // TODO(mcg): we'll need a different scanner when we implement ancestor
    // queries.
    if (row_key_path.size() != immediate_children_path_length) {
      continue;
    }

    unique_batch_ids.insert(reference.ref_id());
  }

  return AllMutationBatchesWithIds(unique_batch_ids);
}

absl::optional<MutationBatch>
MemoryMutationQueue::NextMutationBatchAfterBatchId(BatchId batch_id) {
  BatchId next_batch_id = batch_id + 1;

  // The requested batch_id may still be out of range so normalize it to the
  // start of the queue.
  int raw_index = IndexOfBatchId(next_batch_id);
  size_t index = raw_index < 0 ? 0 : static_cast<size_t>(raw_index);
  if (queue_.size() <= index) {
    return absl::nullopt;
  }

  return queue_[index];
}

BatchId MemoryMutationQueue::GetHighestUnacknowledgedBatchId() {
  return IsEmpty() ? kBatchIdUnknown : next_batch_id_ - 1;
}

absl::optional<MutationBatch> MemoryMutationQueue::LookupMutationBatch(
    BatchId batch_id) {
  if (queue_.empty()) {
    return absl::nullopt;
  }

  int index = IndexOfBatchId(batch_id);
  if (index < 0 || static_cast<size_t>(index) >= queue_.size()) {
    return absl::nullopt;
  }

  const MutationBatch& batch = queue_[index];
  HARD_ASSERT(batch.batch_id() == batch_id, "If found, batch must match");
  return batch;
}

void MemoryMutationQueue::PerformConsistencyCheck() {
  if (queue_.empty()) {
    HARD_ASSERT(batches_by_document_key_.empty(),
                "Document leak -- detected dangling mutation references when "
                "queue is empty.");
  }
}

bool MemoryMutationQueue::ContainsKey(const model::DocumentKey& key) {
  // Create a reference with a zero ID as the start position to find any
  // document reference with this key.
  DocumentKeyReference reference{key, 0};
  auto range = batches_by_document_key_.values_from(reference);
  auto begin = range.begin();
  return begin != range.end() && begin->key() == key;
}

int64_t MemoryMutationQueue::CalculateByteSize(const Sizer& sizer) {
  int64_t count = 0;
  for (const auto& batch : queue_) {
    count += sizer.CalculateByteSize(batch);
  }
  return count;
}

ByteString MemoryMutationQueue::GetLastStreamToken() {
  return last_stream_token_;
}

void MemoryMutationQueue::SetLastStreamToken(ByteString token) {
  last_stream_token_ = std::move(token);
}

std::vector<MutationBatch> MemoryMutationQueue::AllMutationBatchesWithIds(
    const std::set<BatchId>& batch_ids) {
  std::vector<MutationBatch> result;
  for (BatchId batch_id : batch_ids) {
    auto batch = LookupMutationBatch(batch_id);
    if (batch.has_value()) {
      result.push_back(*batch);
    }
  }

  return result;
}

int MemoryMutationQueue::IndexOfBatchId(BatchId batch_id) {
  if (queue_.empty()) {
    // As an index this is past the end of the queue
    return 0;
  }

  // Examine the front of the queue to figure out the difference between the
  // batch_id and indexes in the array. Note that since the queue is ordered by
  // batch_id, if the first batch has a larger batch_id then the requested
  // batch_id doesn't exist in the queue.
  const MutationBatch& first_batch = queue_.front();
  return batch_id - first_batch.batch_id();
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
