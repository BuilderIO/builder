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

#include "Firestore/core/src/local/leveldb_lru_reference_delegate.h"

#include <set>
#include <string>
#include <utility>

#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/leveldb_persistence.h"
#include "Firestore/core/src/local/listen_sequence.h"
#include "Firestore/core/src/local/reference_set.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/memory/memory.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace local {

using model::DocumentKey;
using model::ListenSequenceNumber;
using model::ResourcePath;
using util::StatusOr;

LevelDbLruReferenceDelegate::LevelDbLruReferenceDelegate(
    LevelDbPersistence* persistence, LruParams lru_params)
    : db_(persistence) {
  gc_ = absl::make_unique<LruGarbageCollector>(this, lru_params);
}

// Explicit default the destructor after all forward declared types have been
// fully declared.
LevelDbLruReferenceDelegate::~LevelDbLruReferenceDelegate() = default;

void LevelDbLruReferenceDelegate::Start() {
  ListenSequenceNumber highest_sequence_number =
      db_->target_cache()->highest_listen_sequence_number();
  listen_sequence_ = absl::make_unique<ListenSequence>(highest_sequence_number);
}

void LevelDbLruReferenceDelegate::AddInMemoryPins(ReferenceSet* set) {
  // We should be able to assert that additional_references_ is nullptr, but
  // due to restarts in spec tests it would fail.
  additional_references_ = set;
}

void LevelDbLruReferenceDelegate::AddReference(const DocumentKey& key) {
  WriteSentinel(key);
}

void LevelDbLruReferenceDelegate::RemoveReference(const DocumentKey& key) {
  WriteSentinel(key);
}

void LevelDbLruReferenceDelegate::RemoveMutationReference(
    const DocumentKey& key) {
  WriteSentinel(key);
}

void LevelDbLruReferenceDelegate::RemoveTarget(const TargetData& target_data) {
  TargetData updated =
      target_data.WithSequenceNumber(current_sequence_number());
  db_->target_cache()->UpdateTarget(updated);
}

void LevelDbLruReferenceDelegate::UpdateLimboDocument(const DocumentKey& key) {
  WriteSentinel(key);
}

ListenSequenceNumber LevelDbLruReferenceDelegate::current_sequence_number()
    const {
  HARD_ASSERT(current_sequence_number_ != kListenSequenceNumberInvalid,
              "Asking for a sequence number outside of a transaction");
  return current_sequence_number_;
}

void LevelDbLruReferenceDelegate::OnTransactionStarted(absl::string_view) {
  HARD_ASSERT(current_sequence_number_ == kListenSequenceNumberInvalid,
              "Previous sequence number is still in effect");
  current_sequence_number_ = listen_sequence_->Next();
}

void LevelDbLruReferenceDelegate::OnTransactionCommitted() {
  current_sequence_number_ = kListenSequenceNumberInvalid;
}

LruGarbageCollector* LevelDbLruReferenceDelegate::garbage_collector() {
  return gc_.get();
}

StatusOr<int64_t> LevelDbLruReferenceDelegate::CalculateByteSize() {
  return db_->CalculateByteSize();
}

size_t LevelDbLruReferenceDelegate::GetSequenceNumberCount() {
  size_t total_count = db_->target_cache()->size();
  EnumerateOrphanedDocuments(
      [&total_count](const DocumentKey&, ListenSequenceNumber) {
        total_count++;
      });
  return total_count;
}

void LevelDbLruReferenceDelegate::EnumerateTargetSequenceNumbers(
    const SequenceNumberCallback& callback) {
  db_->target_cache()->EnumerateSequenceNumbers(callback);
}

void LevelDbLruReferenceDelegate::EnumerateOrphanedDocuments(
    const OrphanedDocumentCallback& callback) {
  db_->target_cache()->EnumerateOrphanedDocuments(callback);
}

int LevelDbLruReferenceDelegate::RemoveOrphanedDocuments(
    ListenSequenceNumber upper_bound) {
  int count = 0;
  db_->target_cache()->EnumerateOrphanedDocuments(
      [&](const DocumentKey& key, ListenSequenceNumber sequence_number) {
        if (sequence_number <= upper_bound) {
          if (!IsPinned(key)) {
            count++;
            db_->remote_document_cache()->Remove(key);
            RemoveSentinel(key);
          }
        }
      });
  return count;
}

int LevelDbLruReferenceDelegate::RemoveTargets(
    ListenSequenceNumber sequence_number, const LiveQueryMap& live_queries) {
  return static_cast<int>(
      db_->target_cache()->RemoveTargets(sequence_number, live_queries));
}

bool LevelDbLruReferenceDelegate::IsPinned(const DocumentKey& key) {
  if (additional_references_->ContainsKey(key)) {
    return true;
  }
  return MutationQueuesContainKey(key);
}

bool LevelDbLruReferenceDelegate::MutationQueuesContainKey(
    const DocumentKey& key) {
  const std::set<std::string>& users = db_->users();
  const ResourcePath& path = key.path();
  std::string buffer;
  auto it = db_->current_transaction()->NewIterator();
  // For each user, if there is any batch that contains this document in any
  // batch, we know it's pinned.
  for (const std::string& user : users) {
    std::string mutation_key =
        LevelDbDocumentMutationKey::KeyPrefix(user, path);
    it->Seek(mutation_key);
    if (it->Valid() && absl::StartsWith(it->key(), mutation_key)) {
      return true;
    }
  }
  return false;
}

void LevelDbLruReferenceDelegate::RemoveSentinel(const DocumentKey& key) {
  db_->current_transaction()->Delete(
      LevelDbDocumentTargetKey::SentinelKey(key));
}

void LevelDbLruReferenceDelegate::WriteSentinel(const DocumentKey& key) {
  std::string sentinel_key = LevelDbDocumentTargetKey::SentinelKey(key);
  std::string encoded_sequence_number =
      LevelDbDocumentTargetKey::EncodeSentinelValue(current_sequence_number());
  db_->current_transaction()->Put(sentinel_key, encoded_sequence_number);
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
