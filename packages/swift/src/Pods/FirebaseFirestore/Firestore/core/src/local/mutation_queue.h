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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MUTATION_QUEUE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MUTATION_QUEUE_H_

#include <vector>

#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/types.h"
#include "absl/types/optional.h"

namespace firebase {
class Timestamp;

namespace firestore {

namespace core {
class Query;
}  // namespace core

namespace nanopb {
class ByteString;
}  // namespace nanopb

namespace local {

/** A queue of mutations to apply to the remote store. */
class MutationQueue {
 public:
  virtual ~MutationQueue() = default;

  /**
   * Starts the mutation queue, performing any initial reads that might be
   * required to establish invariants, etc.
   */
  virtual void Start() = 0;

  /** Returns true if this queue contains no mutation batches. */
  virtual bool IsEmpty() = 0;

  /** Acknowledges the given batch. */
  virtual void AcknowledgeBatch(const model::MutationBatch& batch,
                                const nanopb::ByteString& stream_token) = 0;

  /**
   * Creates a new mutation batch and adds it to this mutation queue.
   *
   * @param local_write_time The original write time of this mutation.
   * @param base_mutations Mutations that are used to populate the base values
   * when this mutation is applied locally. These mutations are used to locally
   * overwrite values that are persisted in the remote document cache.
   * @param mutations The user-provided mutations in this mutation batch.
   */
  virtual model::MutationBatch AddMutationBatch(
      const Timestamp& local_write_time,
      std::vector<model::Mutation>&& base_mutations,
      std::vector<model::Mutation>&& mutations) = 0;

  /**
   * Removes the given mutation batch from the queue. This is useful in two
   * circumstances:
   *
   * + Removing applied mutations from the head of the queue
   * + Removing rejected mutations from anywhere in the queue
   */
  virtual void RemoveMutationBatch(const model::MutationBatch& batch) = 0;

  /** Gets all mutation batches in the mutation queue. */
  // TODO(mikelehen): PERF: Current consumer only needs mutated keys; if we can
  // provide that cheaply, we should replace this.
  virtual std::vector<model::MutationBatch> AllMutationBatches() = 0;

  /**
   * Finds all mutation batches that could @em possibly affect the given
   * document keys. Not all mutations in a batch will necessarily affect each
   * key, so when looping through the batches you'll need to check that the
   * mutation itself matches the key.
   *
   * Note that because of this requirement implementations are free to return
   * mutation batches that don't contain any of the given document keys at all
   * if it's convenient.
   */
  // TODO(mcg): This should really return an iterator
  virtual std::vector<model::MutationBatch>
  AllMutationBatchesAffectingDocumentKeys(
      const model::DocumentKeySet& document_keys) = 0;

  /**
   * Finds all mutation batches that could @em possibly affect the given
   * document key. Not all mutations in a batch will necessarily affect the
   * document key, so when looping through the batch you'll need to check that
   * the mutation itself matches the key.
   *
   * Note that because of this requirement implementations are free to return
   * mutation batches that don't contain the document key at all if it's
   * convenient.
   */
  // TODO(mcg): This should really return an iterator
  virtual std::vector<model::MutationBatch>
  AllMutationBatchesAffectingDocumentKey(const model::DocumentKey& key) = 0;

  /**
   * Finds all mutation batches that could affect the results for the given
   * query. Not all mutations in a batch will necessarily affect the query, so
   * when looping through the batch you'll need to check that the mutation
   * itself matches the query.
   *
   * Note that because of this requirement implementations are free to return
   * mutation batches that don't match the query at all if it's convenient.
   *
   * NOTE: A PatchMutation does not need to include all fields in the query
   * filter criteria in order to be a match (but any fields it does contain do
   * need to match).
   */
  // TODO(mikelehen): This should perhaps return an iterator, though I'm not
  // sure we can avoid loading them all in memory.
  virtual std::vector<model::MutationBatch> AllMutationBatchesAffectingQuery(
      const core::Query& query) = 0;

  /** Loads the mutation batch with the given batch_id. */
  virtual absl::optional<model::MutationBatch> LookupMutationBatch(
      model::BatchId batch_id) = 0;

  /**
   * Gets the first unacknowledged mutation batch after the passed in batch_id
   * in the mutation queue or nil if empty.
   *
   * @param batch_id The batch to search after, or kBatchIdUnknown for the first
   * mutation in the queue.
   *
   * @return the next mutation or nil if there wasn't one.
   */
  virtual absl::optional<model::MutationBatch> NextMutationBatchAfterBatchId(
      model::BatchId batch_id) = 0;

  /**
   * Gets the largest (latest) batch id in mutation queue for the current user
   * that is pending server response, returns `kBatchIdUnknown` if the queue
   * is empty.
   *
   * @return the largest batch id in the mutation queue that is not
   * acknowledged.
   */
  virtual model::BatchId GetHighestUnacknowledgedBatchId() = 0;

  /**
   * Performs a consistency check, examining the mutation queue for any leaks,
   * if possible.
   */
  virtual void PerformConsistencyCheck() = 0;

  /** Returns the current stream token for this mutation queue. */
  virtual nanopb::ByteString GetLastStreamToken() = 0;

  /** Sets the stream token for this mutation queue. */
  virtual void SetLastStreamToken(nanopb::ByteString stream_token) = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_MUTATION_QUEUE_H_
