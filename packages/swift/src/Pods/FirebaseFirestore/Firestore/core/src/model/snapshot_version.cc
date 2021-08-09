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

#include "Firestore/core/src/model/snapshot_version.h"

#include <ostream>

#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace model {

SnapshotVersion::SnapshotVersion(const Timestamp& timestamp)
    : timestamp_(timestamp) {
}

const SnapshotVersion& SnapshotVersion::None() {
  static const SnapshotVersion kNone(Timestamp{});
  return kNone;
}

util::ComparisonResult SnapshotVersion::CompareTo(
    const SnapshotVersion& rhs) const {
  return util::Compare(timestamp(), rhs.timestamp());
}

size_t SnapshotVersion::Hash() const {
  return util::Hash(timestamp_.seconds(), timestamp_.nanoseconds());
}

std::string SnapshotVersion::ToString() const {
  return timestamp_.ToString();
}

std::ostream& operator<<(std::ostream& os, const SnapshotVersion& version) {
  return os << version.timestamp_;
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
