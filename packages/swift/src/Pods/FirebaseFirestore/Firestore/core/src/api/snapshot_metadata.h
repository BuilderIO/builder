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

#ifndef FIRESTORE_CORE_SRC_API_SNAPSHOT_METADATA_H_
#define FIRESTORE_CORE_SRC_API_SNAPSHOT_METADATA_H_

#include <cstddef>

namespace firebase {
namespace firestore {
namespace api {

/** Metadata about a snapshot, describing the state of the snapshot. */
class SnapshotMetadata {
 public:
  SnapshotMetadata() = default;
  SnapshotMetadata(bool pending_writes, bool from_cache)
      : pending_writes_(pending_writes), from_cache_(from_cache) {
  }

  /**
   * Returns true if the snapshot contains the result of local writes (e.g.
   * set() or update() calls) that have not yet been committed to the backend.
   */
  bool pending_writes() const {
    return pending_writes_;
  }

  /**
   * Returns true if the snapshot was created from cached data rather than
   * guaranteed up-to-date server data.
   */
  bool from_cache() const {
    return from_cache_;
  }

  friend bool operator==(const SnapshotMetadata& lhs,
                         const SnapshotMetadata& rhs);

  size_t Hash() const;

 private:
  bool pending_writes_ = false;
  bool from_cache_ = false;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_SNAPSHOT_METADATA_H_
