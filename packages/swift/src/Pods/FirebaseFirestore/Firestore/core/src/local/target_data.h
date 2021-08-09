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

#ifndef FIRESTORE_CORE_SRC_LOCAL_TARGET_DATA_H_
#define FIRESTORE_CORE_SRC_LOCAL_TARGET_DATA_H_

#include <iosfwd>
#include <memory>
#include <string>
#include <vector>

#include "Firestore/core/src/core/target.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/nanopb/byte_string.h"

namespace firebase {
namespace firestore {
namespace local {

/** An enumeration for the different purposes we have for queries. */
enum class QueryPurpose {
  /** A regular, normal query. */
  Listen,

  /**
   * The query was used to refill a query after an existence filter mismatch.
   */
  ExistenceFilterMismatch,

  /** The query was used to resolve a limbo document. */
  LimboResolution,
};

std::ostream& operator<<(std::ostream& os, QueryPurpose purpose);

/**
 * An immutable set of metadata that the store will need to keep track of for
 * each target.
 */
class TargetData {
 public:
  /**
   * Creates a new TargetData with the given values.
   *
   * @param target The target being listened to.
   * @param target_id The target to which the query corresponds, assigned by the
   *     LocalStore for user queries or the SyncEngine for limbo queries.
   * @param purpose The purpose of the query.
   * @param snapshot_version The latest snapshot version seen for this target.
   * @param last_limbo_free_snapshot_version The maximum snapshot version at
   *     which the associated target view contained no limbo documents.
   * @param resume_token An opaque, server-assigned token that allows watching a
   *     target to be resumed after disconnecting without retransmitting all the
   *     data that matches the query. The resume token essentially identifies a
   *     point in time from which the server should resume sending results.
   */
  TargetData(core::Target target,
             model::TargetId target_id,
             model::ListenSequenceNumber sequence_number,
             QueryPurpose purpose,
             model::SnapshotVersion snapshot_version,
             model::SnapshotVersion last_limbo_free_snapshot_version,
             nanopb::ByteString resume_token);

  /**
   * Convenience constructor for use when creating a TargetData for the first
   * time.
   */
  TargetData(const core::Target target,
             int target_id,
             model::ListenSequenceNumber sequence_number,
             QueryPurpose purpose);

  /**
   * Creates an invalid TargetData. Prefer TargetData::Invalid() for
   * readability.
   */
  TargetData() = default;

  /**
   * Constructs an invalid TargetData. Reading any properties of the returned
   * value is undefined.
   */
  static TargetData Invalid();

  /** The target being listened to. */
  const core::Target& target() const {
    return target_;
  }

  /**
   * The TargetId to which the target corresponds, assigned by the LocalStore
   * for user queries or the SyncEngine for limbo queries.
   */
  model::TargetId target_id() const {
    return target_id_;
  }

  model::ListenSequenceNumber sequence_number() const {
    return sequence_number_;
  }

  /** The purpose of the target. */
  QueryPurpose purpose() const {
    return purpose_;
  }

  /** The latest snapshot version seen for this target. */
  const model::SnapshotVersion& snapshot_version() const {
    return snapshot_version_;
  }

  /**
   * Returns the last snapshot version for which the associated view contained
   * no limbo documents.
   */
  const model::SnapshotVersion& last_limbo_free_snapshot_version() const {
    return last_limbo_free_snapshot_version_;
  }

  /**
   * An opaque, server-assigned token that allows watching a query to be resumed
   * after disconnecting without retransmitting all the data that matches the
   * query. The resume token essentially identifies a point in time from which
   * the server should resume sending results.
   */
  const nanopb::ByteString& resume_token() const {
    return resume_token_;
  }

  /** Creates a new target data instance with an updated sequence number. */
  TargetData WithSequenceNumber(
      model::ListenSequenceNumber sequence_number) const;

  /**
   * Creates a new target data instance with an updated resume token and
   * snapshot version.
   */
  TargetData WithResumeToken(nanopb::ByteString resume_token,
                             model::SnapshotVersion snapshot_version) const;

  /**
   * Creates a new target data instance with an updated last limbo free snapshot
   * version.
   */
  TargetData WithLastLimboFreeSnapshotVersion(
      model::SnapshotVersion last_limbo_free_snapshot_version) const;

  friend bool operator==(const TargetData& lhs, const TargetData& rhs);

  size_t Hash() const;

  std::string ToString() const;

  friend std::ostream& operator<<(std::ostream& os, const TargetData& value);

 private:
  core::Target target_;
  model::TargetId target_id_ = 0;
  model::ListenSequenceNumber sequence_number_ = 0;
  QueryPurpose purpose_ = QueryPurpose::Listen;
  model::SnapshotVersion snapshot_version_;
  model::SnapshotVersion last_limbo_free_snapshot_version_;
  nanopb::ByteString resume_token_;
};

inline bool operator!=(const TargetData& lhs, const TargetData& rhs) {
  return !(lhs == rhs);
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_TARGET_DATA_H_
