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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MUTATION_QUEUE_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MUTATION_QUEUE_H_

#include <set>
#include <string>
#include <vector>

#include "Firestore/Protos/nanopb/firestore/local/mutation.nanopb.h"
#include "Firestore/core/src/local/mutation_queue.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/nanopb/message.h"
#include "absl/strings/string_view.h"
#include "absl/types/optional.h"
#include "leveldb/db.h"

namespace firebase {
class Timestamp;

namespace firestore {

namespace auth {
class User;
}  // namespace auth

namespace local {
class LevelDbPersistence;
class LocalSerializer;

/**
 * Returns one larger than the largest batch ID that has been stored. If there
 * are no mutations returns 0. Note that batch IDs are global.
 */
model::BatchId LoadNextBatchIdFromDb(leveldb::DB* db);

class LevelDbMutationQueue : public MutationQueue {
 public:
  LevelDbMutationQueue(const auth::User& user,
                       LevelDbPersistence* db,
                       LocalSerializer* serializer);

  void Start() override;

  bool IsEmpty() override;

  void AcknowledgeBatch(const model::MutationBatch& batch,
                        const nanopb::ByteString& stream_token) override;

  model::MutationBatch AddMutationBatch(
      const Timestamp& local_write_time,
      std::vector<model::Mutation>&& base_mutations,
      std::vector<model::Mutation>&& mutations) override;

  void RemoveMutationBatch(const model::MutationBatch& batch) override;

  std::vector<model::MutationBatch> AllMutationBatches() override;

  std::vector<model::MutationBatch> AllMutationBatchesAffectingDocumentKeys(
      const model::DocumentKeySet& document_keys) override;

  std::vector<model::MutationBatch> AllMutationBatchesAffectingDocumentKey(
      const model::DocumentKey& key) override;

  std::vector<model::MutationBatch> AllMutationBatchesAffectingQuery(
      const core::Query& query) override;

  absl::optional<model::MutationBatch> LookupMutationBatch(
      model::BatchId batch_id) override;

  absl::optional<model::MutationBatch> NextMutationBatchAfterBatchId(
      model::BatchId batch_id) override;

  model::BatchId GetHighestUnacknowledgedBatchId() override;

  void PerformConsistencyCheck() override;

  nanopb::ByteString GetLastStreamToken() override;

  void SetLastStreamToken(nanopb::ByteString stream_token) override;

 private:
  /**
   * Constructs a vector of matching batches, sorted by batch_id to ensure that
   * multiple mutations affecting the same document key are applied in order.
   */
  std::vector<model::MutationBatch> AllMutationBatchesWithIds(
      const std::set<model::BatchId>& batch_ids);

  std::string mutation_queue_key() const;

  std::string mutation_batch_key(model::BatchId batch_id) const;

  /** Parses the MutationQueue metadata from the given LevelDB row contents. */
  nanopb::Message<firestore_client_MutationQueue> MetadataForKey(
      const std::string& key);

  model::MutationBatch ParseMutationBatch(absl::string_view encoded);

  // The LevelDbMutationQueue instance is owned by LevelDbPersistence.
  LevelDbPersistence* db_;

  // Owned by LevelDbPersistence.
  LocalSerializer* serializer_ = nullptr;

  /**
   * The normalized user_id (i.e. after converting null to empty) as used in our
   * LevelDB keys.
   */
  std::string user_id_;

  /**
   * Next value to use when assigning sequential IDs to each mutation batch.
   *
   * NOTE: There can only be one LevelDbMutationQueue for a given db at a time,
   * hence it is safe to track next_batch_id_ as an instance-level property.
   * Should we ever relax this constraint we'll need to revisit this.
   */
  model::BatchId next_batch_id_;

  /**
   * A write-through cache copy of the metadata describing the current queue.
   */
  nanopb::Message<firestore_client_MutationQueue> metadata_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MUTATION_QUEUE_H_
