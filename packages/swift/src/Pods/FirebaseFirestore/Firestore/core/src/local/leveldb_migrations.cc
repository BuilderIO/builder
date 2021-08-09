/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/local/leveldb_migrations.h"

#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/firestore/local/mutation.nanopb.h"
#include "Firestore/Protos/nanopb/firestore/local/target.nanopb.h"
#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/memory_index_manager.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace local {
namespace {

using leveldb::Status;
using model::DocumentKey;
using model::ResourcePath;
using nanopb::Message;
using nanopb::StringReader;

/**
 * Schema version for the iOS client.
 *
 * Note that tables aren't a concept in LevelDB. They exist in our schema as
 * just prefixes on keys. This means tables don't need to be created but they
 * also can't easily be dropped and re-created.
 *
 * Migrations:
 *   * Migration 1 used to ensure the target_global row existed, without
 *     clearing it. No longer required because migration 3 unconditionally
 *     clears it.
 *   * Migration 2 used to ensure that the target_global row had a correct count
 *     of targets. No longer required because migration 3 deletes them all.
 *   * Migration 3 deletes the entire query cache to deal with cache corruption
 *     related to limbo resolution. Addresses
 *     https://github.com/firebase/firebase-ios-sdk/issues/1548.
 *   * Migration 4 ensures that every document in the remote document cache
 *     has a sentinel row with a sequence number.
 *   * Migration 5 drops held write acks.
 *   * Migration 6 populates the collection_parents index.
 *   * Migration 7 rewrites query_targets canonical ids in new format.
 */
const LevelDbMigrations::SchemaVersion kSchemaVersion = 7;

/**
 * Save the given version number as the current version of the schema of the
 * database.
 * @param version The version to save
 * @param transaction The transaction in which to save the new version number
 */
void SaveVersion(LevelDbMigrations::SchemaVersion version,
                 LevelDbTransaction* transaction) {
  std::string key = LevelDbVersionKey::Key();
  std::string version_string = std::to_string(version);
  transaction->Put(key, version_string);
}

void DeleteEverythingWithPrefix(const std::string& prefix, leveldb::DB* db) {
  bool more_deletes = true;
  while (more_deletes) {
    LevelDbTransaction transaction(db, "Delete everything with prefix");
    auto it = transaction.NewIterator();

    more_deletes = false;
    for (it->Seek(prefix); it->Valid() && absl::StartsWith(it->key(), prefix);
         it->Next()) {
      if (transaction.changed_keys() >= 1000) {
        more_deletes = true;
        break;
      }
      transaction.Delete(it->key());
    }

    transaction.Commit();
  }
}

/** Migration 3. */
void ClearQueryCache(leveldb::DB* db) {
  DeleteEverythingWithPrefix(LevelDbTargetKey::KeyPrefix(), db);
  DeleteEverythingWithPrefix(LevelDbDocumentTargetKey::KeyPrefix(), db);
  DeleteEverythingWithPrefix(LevelDbTargetDocumentKey::KeyPrefix(), db);
  DeleteEverythingWithPrefix(LevelDbQueryTargetKey::KeyPrefix(), db);

  LevelDbTransaction transaction(db, "Drop query cache");

  // Reset the target global entry too (to reset the target count).
  firestore_client_TargetGlobal target_global{};

  nanopb::StringWriter writer;
  writer.Write(firestore_client_TargetGlobal_fields, &target_global);
  transaction.Put(LevelDbTargetGlobalKey::Key(), writer.Release());

  SaveVersion(3, &transaction);
  transaction.Commit();
}

/**
 * Removes document associations for the given user's mutation queue for
 * any mutation with a `batch_id` less than or equal to
 * `last_acknowledged_batch_id`.
 */
void RemoveMutationDocuments(LevelDbTransaction* transaction,
                             absl::string_view user_id,
                             int32_t last_acknowledged_batch_id) {
  LevelDbDocumentMutationKey doc_key;
  std::string prefix = LevelDbDocumentMutationKey::KeyPrefix(user_id);

  auto it = transaction->NewIterator();
  it->Seek(prefix);
  for (; it->Valid() && absl::StartsWith(it->key(), prefix); it->Next()) {
    HARD_ASSERT(doc_key.Decode(it->key()),
                "Failed to decode document mutation key");
    if (doc_key.batch_id() <= last_acknowledged_batch_id) {
      transaction->Delete(it->key());
    }
  }
}

/**
 * Removes mutation batches for the given user with a `batch_id` less than
 * or equal to `last_acknowledged_batch_id`
 */
void RemoveMutationBatches(LevelDbTransaction* transaction,
                           absl::string_view user_id,
                           int32_t last_acknowledged_batch_id) {
  std::string mutations_key = LevelDbMutationKey::KeyPrefix(user_id);
  std::string last_key =
      LevelDbMutationKey::Key(user_id, last_acknowledged_batch_id);
  auto it = transaction->NewIterator();
  it->Seek(mutations_key);
  for (; it->Valid() && it->key() <= last_key; it->Next()) {
    transaction->Delete(it->key());
  }
}

/** Migration 5. */
void RemoveAcknowledgedMutations(leveldb::DB* db) {
  LevelDbTransaction transaction(db, "remove acknowledged mutations");
  std::string mutation_queue_start = LevelDbMutationQueueKey::KeyPrefix();

  LevelDbMutationQueueKey key;

  auto it = transaction.NewIterator();
  it->Seek(mutation_queue_start);
  for (; it->Valid() && absl::StartsWith(it->key(), mutation_queue_start);
       it->Next()) {
    HARD_ASSERT(key.Decode(it->key()), "Failed to decode mutation queue key");
    StringReader reader(it->value());
    auto mutation_queue =
        Message<firestore_client_MutationQueue>::TryParse(&reader);
    HARD_ASSERT(reader.status().ok(), "Failed to deserialize MutationQueue");
    RemoveMutationBatches(&transaction, key.user_id(),
                          mutation_queue->last_acknowledged_batch_id);
    RemoveMutationDocuments(&transaction, key.user_id(),
                            mutation_queue->last_acknowledged_batch_id);
  }

  SaveVersion(5, &transaction);
  transaction.Commit();
}

/**
 * Reads the highest sequence number from the target global row.
 */
model::ListenSequenceNumber GetHighestSequenceNumber(
    LevelDbTransaction* transaction) {
  std::string bytes;
  transaction->Get(LevelDbTargetGlobalKey::Key(), &bytes);

  StringReader reader(bytes);
  auto target_global =
      Message<firestore_client_TargetGlobal>::TryParse(&reader);
  return target_global->highest_listen_sequence_number;
}

/**
 * Given a document key, ensure it has a sentinel row. If it doesn't have one,
 * add it with the given value.
 */
void EnsureSentinelRow(LevelDbTransaction* transaction,
                       const model::DocumentKey& key,
                       const std::string& sentinel_value) {
  std::string sentinel_key = LevelDbDocumentTargetKey::SentinelKey(key);
  std::string unused_value;
  if (transaction->Get(sentinel_key, &unused_value).IsNotFound()) {
    transaction->Put(sentinel_key, sentinel_value);
  }
}

/**
 * Migration 4.
 *
 * Ensure each document in the remote document table has a corresponding
 * sentinel row in the document target index.
 */
void EnsureSentinelRows(leveldb::DB* db) {
  LevelDbTransaction transaction(db, "Ensure sentinel rows");

  // Get the value we'll use for anything that's missing a row.
  model::ListenSequenceNumber sequence_number =
      GetHighestSequenceNumber(&transaction);
  std::string sentinel_value =
      LevelDbDocumentTargetKey::EncodeSentinelValue(sequence_number);

  std::string documents_prefix = LevelDbRemoteDocumentKey::KeyPrefix();
  auto it = transaction.NewIterator();
  it->Seek(documents_prefix);
  LevelDbRemoteDocumentKey document_key;
  for (; it->Valid() && absl::StartsWith(it->key(), documents_prefix);
       it->Next()) {
    HARD_ASSERT(document_key.Decode(it->key()),
                "Failed to decode document key");
    EnsureSentinelRow(&transaction, document_key.document_key(),
                      sentinel_value);
  }
  SaveVersion(4, &transaction);
  transaction.Commit();
}

// Helper to add an index entry iff we haven't already written it (as determined
// by the provided cache).
void EnsureCollectionParentRow(LevelDbTransaction* transaction,
                               MemoryCollectionParentIndex* cache,
                               const DocumentKey& key) {
  const ResourcePath& collection_path = key.path().PopLast();
  if (cache->Add(collection_path)) {
    std::string collection_id = collection_path.last_segment();
    ResourcePath parent_path = collection_path.PopLast();

    std::string key =
        LevelDbCollectionParentKey::Key(collection_id, parent_path);
    std::string empty_buffer;
    transaction->Put(key, empty_buffer);
  }
}

/**
 * Migration 6.
 *
 * Creates appropriate LevelDbCollectionParentKey rows for all collections
 * of documents in the remote document cache and mutation queue.
 */
void EnsureCollectionParentsIndex(leveldb::DB* db) {
  LevelDbTransaction transaction(db, "Ensure Collection Parents Index");

  MemoryCollectionParentIndex cache;

  // Index existing remote documents.
  std::string documents_prefix = LevelDbRemoteDocumentKey::KeyPrefix();
  auto it = transaction.NewIterator();
  it->Seek(documents_prefix);
  LevelDbRemoteDocumentKey document_key;
  for (; it->Valid() && absl::StartsWith(it->key(), documents_prefix);
       it->Next()) {
    HARD_ASSERT(document_key.Decode(it->key()),
                "Failed to decode document key");

    EnsureCollectionParentRow(&transaction, &cache,
                              document_key.document_key());
  }

  // Index existing mutations.
  std::string mutations_prefix = LevelDbDocumentMutationKey::KeyPrefix();
  it = transaction.NewIterator();
  it->Seek(mutations_prefix);
  LevelDbDocumentMutationKey key;
  for (; it->Valid() && absl::StartsWith(it->key(), mutations_prefix);
       it->Next()) {
    HARD_ASSERT(key.Decode(it->key()),
                "Failed to decode document-mutation key");

    EnsureCollectionParentRow(&transaction, &cache, key.document_key());
  }

  SaveVersion(6, &transaction);
  transaction.Commit();
}

/**
 * Returns a `TargetData` by reading the `targets` table, using the given key
 * for `query_targets` as a foreign key.
 */
util::StatusOr<TargetData> ReadTargetData(
    const LevelDbQueryTargetKey& query_target_key,
    const LocalSerializer& serializer,
    LevelDbTransaction& transaction) {
  auto target_it = transaction.NewIterator();
  const auto& target_key = LevelDbTargetKey::Key(query_target_key.target_id());
  target_it->Seek(target_key);
  if (!target_it->Valid()) {
    return util::Status(
        kErrorNotFound,
        util::StringFormat(
            "Dangling query-target reference found: seeking %s found %s",
            DescribeKey(target_key), DescribeKey(target_it)));
  }

  StringReader reader{target_it->value()};
  auto message = Message<firestore_client_Target>::TryParse(&reader);
  if (!reader.ok()) {
    return util::Status(kErrorDataLoss,
                        util::StringFormat("Target proto failed to parse: %s",
                                           reader.status().ToString()));
  }
  auto target_data = serializer.DecodeTargetData(&reader, *message);
  if (!reader.ok()) {
    return util::Status(
        kErrorDataLoss,
        util::StringFormat("Target failed to parse: %s, message: %s",
                           reader.status().ToString(), message.ToString()));
  }

  return target_data;
}

/**
 * Migration 7.
 *
 * Rewrites targets canonical IDs with new format.
 */
void RewriteTargetsCanonicalIds(leveldb::DB* db,
                                const LocalSerializer& serializer) {
  LevelDbTransaction transaction(db, "Rewrite Targets Canonical Ids");

  std::string query_targets_prefix = LevelDbQueryTargetKey::KeyPrefix();
  auto it = transaction.NewIterator();
  it->Seek(query_targets_prefix);
  LevelDbQueryTargetKey query_target_key;
  for (; it->Valid() && absl::StartsWith(it->key(), query_targets_prefix);
       it->Next()) {
    HARD_ASSERT(query_target_key.Decode(it->key()),
                "Failed to decode query_targets key");

    util::StatusOr<TargetData> target_data =
        ReadTargetData(query_target_key, serializer, transaction);
    if (!target_data.ok()) {
      LOG_WARN("Reading target data failed: %s",
               target_data.status().error_message());
      continue;
    }

    auto new_key = LevelDbQueryTargetKey::Key(
        target_data.ValueOrDie().target().CanonicalId(),
        target_data.ValueOrDie().target_id());

    transaction.Delete(it->key());
    std::string empty_buffer;
    transaction.Put(new_key, empty_buffer);
  }

  transaction.Commit();
}

}  // namespace

LevelDbMigrations::SchemaVersion LevelDbMigrations::ReadSchemaVersion(
    leveldb::DB* db) {
  LevelDbTransaction transaction(db, "Read schema version");
  std::string key = LevelDbVersionKey::Key();
  std::string version_string;
  Status status = transaction.Get(key, &version_string);
  if (status.IsNotFound()) {
    return 0;
  } else {
    HARD_ASSERT(status.ok(),
                "Failed to read version string from LevelDB, error: '%s'",
                status.ToString());
    return stoi(version_string);
  }
}

void LevelDbMigrations::RunMigrations(leveldb::DB* db,
                                      const LocalSerializer& serializer) {
  RunMigrations(db, kSchemaVersion, serializer);
}

void LevelDbMigrations::RunMigrations(leveldb::DB* db,
                                      SchemaVersion to_version,
                                      const LocalSerializer& serializer) {
  SchemaVersion from_version = ReadSchemaVersion(db);
  // If this is a downgrade, just save the downgrade version so we can
  // detect it when we go to upgrade again, allowing us to rerun the
  // data migrations.
  if (from_version > to_version) {
    LevelDbTransaction transaction(db, "Save downgrade version");
    SaveVersion(to_version, &transaction);
    transaction.Commit();
    return;
  }

  // This must run unconditionally because schema migrations were added to iOS
  // after the first release. There may be clients that have never run any
  // migrations that have existing targets.
  if (from_version < 3 && to_version >= 3) {
    ClearQueryCache(db);
  }

  if (from_version < 4 && to_version >= 4) {
    EnsureSentinelRows(db);
  }

  if (from_version < 5 && to_version >= 5) {
    RemoveAcknowledgedMutations(db);
  }

  if (from_version < 6 && to_version >= 6) {
    EnsureCollectionParentsIndex(db);
  }

  if (from_version < 7 && to_version >= 7) {
    RewriteTargetsCanonicalIds(db, serializer);
  }
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
