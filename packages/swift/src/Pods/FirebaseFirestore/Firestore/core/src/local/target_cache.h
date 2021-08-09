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

#ifndef FIRESTORE_CORE_SRC_LOCAL_TARGET_CACHE_H_
#define FIRESTORE_CORE_SRC_LOCAL_TARGET_CACHE_H_

#include <functional>
#include <unordered_map>

#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {

namespace core {
class Query;
class Target;
}  // namespace core

namespace local {
class TargetData;

using OrphanedDocumentCallback =
    std::function<void(const model::DocumentKey&, model::ListenSequenceNumber)>;

using SequenceNumberCallback = std::function<void(model::ListenSequenceNumber)>;

/**
 * Represents cached targets received from the remote backend. This contains
 * both a mapping between targets and the documents that matched them according
 * to the server, but also metadata about the targets.
 *
 * The cache is keyed by Target and entries in the cache are TargetData
 * instances.
 */
class TargetCache {
 public:
  virtual ~TargetCache() = default;

  // Target-related methods

  /**
   * Adds an entry in the cache.
   *
   * The cache key is extracted from `TargetData.target()`. The key must not
   * already exist in the cache.
   *
   * @param target_data A new TargetData instance to put in the cache.
   */
  virtual void AddTarget(const TargetData& target_data) = 0;

  /**
   * Updates an entry in the cache.
   *
   * The cache key is extracted from `TargetData.target()`. The entry must
   * already exist in the cache, and it will be replaced.
   *
   * @param target_data A TargetData instance to replace an existing entry in
   *     the cache
   */
  virtual void UpdateTarget(const TargetData& target_data) = 0;

  /**
   * Removes the cached entry for the given target data. The entry must already
   * exist in the cache.
   */
  virtual void RemoveTarget(const TargetData& target_data) = 0;

  /**
   * Looks up a TargetData entry in the cache.
   *
   * @param target The target corresponding to the entry to look up.
   * @return The cached TargetData entry, or nullopt if the cache has no entry
   * for the target.
   */
  virtual absl::optional<TargetData> GetTarget(const core::Target& target) = 0;

  /** Enumerates all sequence numbers in the TargetCache. */
  virtual void EnumerateSequenceNumbers(
      const SequenceNumberCallback& callback) = 0;

  /**
   * Removes all target by sequence number up to (and including) the given
   * sequence number. Targets in `live_targets` are ignored.
   *
   * @param upper_bound The upper bound for last target's sequence number
   *     (inclusive).
   * @param live_targets Targets to ignore.
   * @return The number of targets removed.
   */
  virtual size_t RemoveTargets(
      model::ListenSequenceNumber upper_bound,
      const std::unordered_map<model::TargetId, TargetData>& live_targets) = 0;

  // Key-related methods
  virtual void AddMatchingKeys(const model::DocumentKeySet& keys,
                               model::TargetId target_id) = 0;

  virtual void RemoveMatchingKeys(const model::DocumentKeySet& keys,
                                  model::TargetId target_id) = 0;

  /** Removes all document keys in the query results of the given target ID. */
  virtual void RemoveMatchingKeysForTarget(model::TargetId target_id) = 0;

  virtual model::DocumentKeySet GetMatchingKeys(model::TargetId target_id) = 0;

  virtual bool Contains(const model::DocumentKey& key) = 0;

  // Accessors

  /** Returns the number of targets cached. */
  virtual size_t size() const = 0;

  /**
   * Returns the highest listen sequence number of any target seen by the cache.
   */
  virtual model::ListenSequenceNumber highest_listen_sequence_number()
      const = 0;

  /**
   * Returns the highest target ID of any target in the cache. Typically called
   * during startup to seed a target ID generator and avoid collisions with
   * existing queries. If there are no targets in the cache, returns zero.
   */
  virtual model::TargetId highest_target_id() const = 0;

  /**
   * A global snapshot version representing the last consistent snapshot we
   * received from the backend. This is monotonically increasing and any
   * snapshots received from the backend prior to this version (e.g. for targets
   * resumed with a resume_token) should be suppressed (buffered) until the
   * backend has caught up to this snapshot version again. This prevents our
   * cache from ever going backwards in time.
   *
   * This is updated whenever our we get a TargetChange with a read_time and
   * empty target_ids.
   */
  virtual const model::SnapshotVersion& GetLastRemoteSnapshotVersion()
      const = 0;

  /**
   * Set the snapshot version representing the last consistent snapshot received
   * from the backend. (see `GetLastRemoteSnapshotVersion()` for more details).
   *
   * @param version The new snapshot version.
   */
  virtual void SetLastRemoteSnapshotVersion(model::SnapshotVersion version) = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_TARGET_CACHE_H_
