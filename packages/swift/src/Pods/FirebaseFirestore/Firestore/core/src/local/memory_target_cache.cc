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

#include "Firestore/core/src/local/memory_target_cache.h"

#include <vector>

#include "Firestore/core/src/local/memory_persistence.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/sizer.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document_key.h"

namespace firebase {
namespace firestore {
namespace local {

using core::Target;
using model::DocumentKey;
using model::DocumentKeySet;
using model::ListenSequenceNumber;
using model::SnapshotVersion;
using model::TargetId;

MemoryTargetCache::MemoryTargetCache(MemoryPersistence* persistence)
    : persistence_(persistence),
      highest_listen_sequence_number_(ListenSequenceNumber(0)),
      highest_target_id_(TargetId(0)),
      last_remote_snapshot_version_(SnapshotVersion::None()),
      targets_() {
}

void MemoryTargetCache::AddTarget(const TargetData& target_data) {
  targets_[target_data.target()] = target_data;
  if (target_data.target_id() > highest_target_id_) {
    highest_target_id_ = target_data.target_id();
  }
  if (target_data.sequence_number() > highest_listen_sequence_number_) {
    highest_listen_sequence_number_ = target_data.sequence_number();
  }
}

void MemoryTargetCache::UpdateTarget(const TargetData& target_data) {
  // For the memory target cache, adds and updates are treated the same.
  AddTarget(target_data);
}

void MemoryTargetCache::RemoveTarget(const TargetData& target_data) {
  targets_.erase(target_data.target());
  references_.RemoveReferences(target_data.target_id());
}

absl::optional<TargetData> MemoryTargetCache::GetTarget(const Target& target) {
  auto iter = targets_.find(target);
  return iter == targets_.end() ? absl::optional<TargetData>{} : iter->second;
}

void MemoryTargetCache::EnumerateSequenceNumbers(
    const SequenceNumberCallback& callback) {
  for (const auto& kv : targets_) {
    callback(kv.second.sequence_number());
  }
}

size_t MemoryTargetCache::RemoveTargets(
    model::ListenSequenceNumber upper_bound,
    const std::unordered_map<TargetId, TargetData>& live_targets) {
  std::vector<const Target*> to_remove;
  for (const auto& kv : targets_) {
    const Target& target = kv.first;
    const TargetData& target_data = kv.second;

    if (target_data.sequence_number() <= upper_bound) {
      if (live_targets.find(target_data.target_id()) == live_targets.end()) {
        to_remove.push_back(&target);
        references_.RemoveReferences(target_data.target_id());
      }
    }
  }

  for (const Target* element : to_remove) {
    targets_.erase(*element);
  }
  return to_remove.size();
}

void MemoryTargetCache::AddMatchingKeys(const DocumentKeySet& keys,
                                        TargetId target_id) {
  references_.AddReferences(keys, target_id);
  for (const DocumentKey& key : keys) {
    persistence_->reference_delegate()->AddReference(key);
  }
}

void MemoryTargetCache::RemoveMatchingKeys(const DocumentKeySet& keys,
                                           TargetId target_id) {
  references_.RemoveReferences(keys, target_id);
  for (const DocumentKey& key : keys) {
    persistence_->reference_delegate()->RemoveReference(key);
  }
}

DocumentKeySet MemoryTargetCache::GetMatchingKeys(TargetId target_id) {
  return references_.ReferencedKeys(target_id);
}

bool MemoryTargetCache::Contains(const DocumentKey& key) {
  return references_.ContainsKey(key);
}

int64_t MemoryTargetCache::CalculateByteSize(const Sizer& sizer) {
  int64_t count = 0;
  for (const auto& kv : targets_) {
    count += sizer.CalculateByteSize(kv.second);
  }
  return count;
}

const SnapshotVersion& MemoryTargetCache::GetLastRemoteSnapshotVersion() const {
  return last_remote_snapshot_version_;
}

void MemoryTargetCache::SetLastRemoteSnapshotVersion(SnapshotVersion version) {
  last_remote_snapshot_version_ = std::move(version);
}

void MemoryTargetCache::RemoveMatchingKeysForTarget(model::TargetId target_id) {
  references_.RemoveReferences(target_id);
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
