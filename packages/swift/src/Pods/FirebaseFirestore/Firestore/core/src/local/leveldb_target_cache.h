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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_TARGET_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_TARGET_CACHE_H_

#include <unordered_map>
#include <unordered_set>

#include "Firestore/Protos/nanopb/firestore/local/target.nanopb.h"
#include "Firestore/core/src/local/target_cache.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/nanopb/message.h"
#include "absl/strings/string_view.h"
#include "absl/types/optional.h"
#include "leveldb/db.h"

namespace firebase {
namespace firestore {
namespace local {

class LevelDbPersistence;
class LocalSerializer;
class TargetData;

/** Cached Queries backed by LevelDB. */
class LevelDbTargetCache : public TargetCache {
 public:
  /**
   * Retrieves the global singleton metadata row from the given database. If the
   * metadata row doesn't exist, this will result in an assertion failure.
   *
   * TODO(gsoltis): remove this method once fully ported to transactions.
   */
  static nanopb::Message<firestore_client_TargetGlobal> ReadMetadata(
      leveldb::DB* db);

  /**
   * Test-only -- same as `ReadMetadata`, but returns an empty optional if the
   * metadata row doesn't exist.
   */
  static absl::optional<nanopb::Message<firestore_client_TargetGlobal>>
  TryReadMetadata(leveldb::DB* db);

  /**
   * Creates a new target cache in the given LevelDB.
   *
   * @param db The LevelDB in which to create the cache.
   */
  LevelDbTargetCache(LevelDbPersistence* db, LocalSerializer* serializer);

  // Target-related methods
  void AddTarget(const TargetData& target_data) override;

  void UpdateTarget(const TargetData& target_data) override;

  void RemoveTarget(const TargetData& target_data) override;

  absl::optional<TargetData> GetTarget(const core::Target& target) override;

  void EnumerateSequenceNumbers(
      const SequenceNumberCallback& callback) override;

  size_t RemoveTargets(model::ListenSequenceNumber upper_bound,
                       const std::unordered_map<model::TargetId, TargetData>&
                           live_targets) override;

  // Key-related methods

  /**
   * Adds the given document keys to cached query results of the given target
   * ID.
   */
  void AddMatchingKeys(const model::DocumentKeySet& keys,
                       model::TargetId target_id) override;

  /** Removes the given document keys from the cached query results of the given
   * target ID. */
  void RemoveMatchingKeys(const model::DocumentKeySet& keys,
                          model::TargetId target_id) override;

  /** Removes all document keys in the query results of the given target ID. */
  void RemoveMatchingKeysForTarget(model::TargetId target_id) override;

  model::DocumentKeySet GetMatchingKeys(model::TargetId target_id) override;

  /**
   * Checks to see if there are any references to a document with the given key.
   */
  bool Contains(const model::DocumentKey& key) override;

  // Other methods and accessors
  size_t size() const override {
    return metadata_->target_count;
  }

  model::TargetId highest_target_id() const override {
    return metadata_->highest_target_id;
  }

  model::ListenSequenceNumber highest_listen_sequence_number() const override {
    return metadata_->highest_listen_sequence_number;
  }

  const model::SnapshotVersion& GetLastRemoteSnapshotVersion() const override;

  void SetLastRemoteSnapshotVersion(model::SnapshotVersion version) override;

  // Non-interface methods
  void Start();

  void EnumerateOrphanedDocuments(const OrphanedDocumentCallback& callback);

 private:
  void Save(const TargetData& target_data);
  bool UpdateMetadata(const TargetData& target_data);
  void SaveMetadata();

  /** Parses the given bytes as a `firestore_client_Target` protocol buffer. */
  nanopb::Message<firestore_client_Target> DecodeTargetProto(
      nanopb::Reader* reader);

  /**
   * Parses the given bytes as a `firestore_client_Target` protocol buffer and
   * then converts to the equivalent target data.
   */
  TargetData DecodeTarget(absl::string_view encoded);

  /** Removes the given targets from the query to target mapping. */
  void RemoveQueryTargetKeyForTargets(
      const std::unordered_set<model::TargetId>& target_id);

  // The LevelDbTargetCache is owned by LevelDbPersistence.
  LevelDbPersistence* db_;
  // Owned by LevelDbPersistence.
  LocalSerializer* serializer_ = nullptr;

  /** A write-through cached copy of the metadata for the target cache. */
  nanopb::Message<firestore_client_TargetGlobal> metadata_;

  model::SnapshotVersion last_remote_snapshot_version_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_TARGET_CACHE_H_
