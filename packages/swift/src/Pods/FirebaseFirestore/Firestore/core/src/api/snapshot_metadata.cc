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

#include "Firestore/core/src/api/snapshot_metadata.h"

#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace api {

bool operator==(const SnapshotMetadata& lhs, const SnapshotMetadata& rhs) {
  return lhs.pending_writes_ == rhs.pending_writes_ &&
         lhs.from_cache_ == rhs.from_cache_;
}

size_t SnapshotMetadata::Hash() const {
  return util::Hash(pending_writes_, from_cache_);
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
