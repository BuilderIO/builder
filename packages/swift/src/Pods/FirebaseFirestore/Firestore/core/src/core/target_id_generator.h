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

#ifndef FIRESTORE_CORE_SRC_CORE_TARGET_ID_GENERATOR_H_
#define FIRESTORE_CORE_SRC_CORE_TARGET_ID_GENERATOR_H_

#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {
namespace core {

/** The set of all valid generators. */
enum class TargetIdGeneratorId { TargetCache = 0, SyncEngine = 1 };

/**
 * Generates monotonically increasing target IDs for sending targets to the
 * watch stream.
 *
 * The client constructs two generators, one for the query cache (via
 * `QueryCacheTargetIdGenerator(int after)`), and one for limbo documents (via
 * `SyncEngineTargetIdGenerator()`). These two generators produce
 * non-overlapping IDs (by using even and odd IDs respectively).
 *
 * By separating the target ID space, the query cache can generate target IDs
 * that persist across client restarts, while sync engine can independently
 * generate in-memory target IDs that are transient and can be reused after a
 * restart.
 *
 * Not thread-safe.
 */
// TODO(mrschmidt): Explore removing this class in favor of generating these IDs
// directly in SyncEngine and LocalStore.
class TargetIdGenerator {
 public:
  TargetIdGenerator() = default;

  /**
   * Creates and returns the TargetIdGenerator for the local store.
   *
   * @param after An ID to start at. Every call to NextId returns a larger id.
   * @return An instance of TargetIdGenerator.
   */
  static TargetIdGenerator TargetCacheTargetIdGenerator(model::TargetId after) {
    TargetIdGenerator generator(TargetIdGeneratorId::TargetCache, after);
    // Make sure that the next call to `NextId()` returns the first value after
    // 'after'.
    generator.NextId();
    return generator;
  }

  /**
   * Creates and returns the TargetIdGenerator for the sync engine.
   *
   * @return An instance of TargetIdGenerator.
   */
  static TargetIdGenerator SyncEngineTargetIdGenerator() {
    // Sync engine assigns target IDs for limbo document detection.
    return TargetIdGenerator(TargetIdGeneratorId::SyncEngine, 1);
  }

  TargetIdGeneratorId generator_id() {
    return generator_id_;
  }

  model::TargetId NextId();

 private:
  TargetIdGenerator(TargetIdGeneratorId generator_id, model::TargetId seed);
  void seek(model::TargetId target_id);

  TargetIdGeneratorId generator_id_ = TargetIdGeneratorId::TargetCache;
  model::TargetId next_id_ = 0;

  static const int kReservedBits = 1;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_TARGET_ID_GENERATOR_H_
