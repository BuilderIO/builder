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

#ifndef FIRESTORE_CORE_SRC_MODEL_SNAPSHOT_VERSION_H_
#define FIRESTORE_CORE_SRC_MODEL_SNAPSHOT_VERSION_H_

#include <iosfwd>
#include <string>

#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/util/comparison.h"

namespace firebase {
namespace firestore {
namespace model {

/**
 * A version of a document in Firestore. This corresponds to the version
 * timestamp, such as update_time or read_time.
 */
class SnapshotVersion : public util::Comparable<SnapshotVersion> {
 public:
  /**
   * Creates a default SnapshotVersion equivalent to SnapshotVersion::None().
   * Prefer SnapshotVersion::None() for readability.
   */
  SnapshotVersion() = default;

  explicit SnapshotVersion(const Timestamp& timestamp);

  const Timestamp& timestamp() const {
    return timestamp_;
  }

  /** Creates a new version that is smaller than all other versions. */
  static const SnapshotVersion& None();

  util::ComparisonResult CompareTo(const SnapshotVersion& rhs) const;

  size_t Hash() const;

  std::string ToString() const;

  friend std::ostream& operator<<(std::ostream& os,
                                  const SnapshotVersion& version);

 private:
  Timestamp timestamp_;
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_SNAPSHOT_VERSION_H_
