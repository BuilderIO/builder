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

#ifndef FIRESTORE_CORE_SRC_LOCAL_MEMORY_TARGET_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_MEMORY_TARGET_CACHE_H_

#include <cstdint>
#include <unordered_map>
#include <utility>

#include "Firestore/core/src/core/target.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/local/target_cache.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {
namespace local {

class MemoryPersistence;
class Sizer;

class MemoryTargetCache : public TargetCache {
 public:
  explicit MemoryTargetCache(MemoryPersistence* persistence);

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
  void AddMatchingKeys(const model::DocumentKeySet& keys,
                       model::TargetId target_id) override;

  void RemoveMatchingKeys(const model::DocumentKeySet& keys,
                          model::TargetId target_id) override;

  void RemoveMatchingKeysForTarget(model::TargetId target_id) override;

  model::DocumentKeySet GetMatchingKeys(model::TargetId target_id) override;

  bool Contains(const model::DocumentKey& key) override;

  // Other methods and accessors
  int64_t CalculateByteSize(const Sizer& sizer);

  size_t size() const override {
    return targets_.size();
  }

  model::ListenSequenceNumber highest_listen_sequence_number() const override {
    return highest_listen_sequence_number_;
  }

  model::TargetId highest_target_id() const override {
    return highest_target_id_;
  }

  const model::SnapshotVersion& GetLastRemoteSnapshotVersion() const override;

  void SetLastRemoteSnapshotVersion(model::SnapshotVersion version) override;

 private:
  // This instance is owned by MemoryPersistence.
  MemoryPersistence* persistence_;

  /** The highest sequence number encountered */
  model::ListenSequenceNumber highest_listen_sequence_number_;
  /** The highest numbered target ID encountered. */
  model::TargetId highest_target_id_;
  /** The last received snapshot version. */
  model::SnapshotVersion last_remote_snapshot_version_;

  /** Maps a target to the data about that query. */
  std::unordered_map<core::Target, TargetData> targets_;

  /**
   * A ordered bidirectional mapping between documents and the remote target
   * IDs.
   */
  ReferenceSet references_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_MEMORY_TARGET_CACHE_H_
