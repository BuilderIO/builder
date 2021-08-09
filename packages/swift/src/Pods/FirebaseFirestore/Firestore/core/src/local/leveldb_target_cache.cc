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

#include "Firestore/core/src/local/leveldb_target_cache.h"

#include <string>
#include <unordered_set>
#include <utility>

#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/leveldb_persistence.h"
#include "Firestore/core/src/local/leveldb_util.h"
#include "Firestore/core/src/local/local_serializer.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/target_data.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/string_apple.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace local {

using core::Target;
using leveldb::Status;
using model::DocumentKey;
using model::DocumentKeySet;
using model::ListenSequenceNumber;
using model::SnapshotVersion;
using model::TargetId;
using nanopb::Message;
using nanopb::StringReader;

absl::optional<Message<firestore_client_TargetGlobal>>
LevelDbTargetCache::TryReadMetadata(leveldb::DB* db) {
  std::string key = LevelDbTargetGlobalKey::Key();
  std::string value;
  Status status = db->Get(StandardReadOptions(), key, &value);

  StringReader reader{value};
  reader.set_status(ConvertStatus(status));

  auto result = Message<firestore_client_TargetGlobal>::TryParse(&reader);
  if (!reader.ok()) {
    if (reader.status().code() == Error::kErrorNotFound) {
      return absl::nullopt;
    } else {
      HARD_FAIL("ReadMetadata: failed loading key %s with status: %s", key,
                reader.status().ToString());
    }
  }

  return {std::move(result)};
}

Message<firestore_client_TargetGlobal> LevelDbTargetCache::ReadMetadata(
    leveldb::DB* db) {
  auto maybe_metadata = TryReadMetadata(db);
  if (!maybe_metadata) {
    HARD_FAIL(
        "Found no metadata, expected schema to be at version 0 which "
        "ensures metadata existence");
  }
  return std::move(maybe_metadata).value();
}

LevelDbTargetCache::LevelDbTargetCache(LevelDbPersistence* db,
                                       LocalSerializer* serializer)
    : db_(NOT_NULL(db)), serializer_(NOT_NULL(serializer)) {
}

void LevelDbTargetCache::Start() {
  // TODO(gsoltis): switch this usage of ptr to current_transaction()
  metadata_ = ReadMetadata(db_->ptr());

  StringReader reader;
  last_remote_snapshot_version_ = serializer_->DecodeVersion(
      &reader, metadata_->last_remote_snapshot_version);
  if (!reader.ok()) {
    HARD_FAIL("Failed to decode last remote snapshot version, reason: '%s'",
              reader.status().ToString());
  }
}

void LevelDbTargetCache::AddTarget(const TargetData& target_data) {
  Save(target_data);

  const std::string& canonical_id = target_data.target().CanonicalId();
  std::string index_key =
      LevelDbQueryTargetKey::Key(canonical_id, target_data.target_id());
  std::string empty_buffer;
  db_->current_transaction()->Put(index_key, empty_buffer);

  metadata_->target_count++;
  UpdateMetadata(target_data);
  SaveMetadata();
}

void LevelDbTargetCache::UpdateTarget(const TargetData& target_data) {
  Save(target_data);

  if (UpdateMetadata(target_data)) {
    SaveMetadata();
  }
}

void LevelDbTargetCache::RemoveTarget(const TargetData& target_data) {
  TargetId target_id = target_data.target_id();

  RemoveMatchingKeysForTarget(target_id);

  std::string key = LevelDbTargetKey::Key(target_id);
  db_->current_transaction()->Delete(key);

  std::string index_key =
      LevelDbQueryTargetKey::Key(target_data.target().CanonicalId(), target_id);
  db_->current_transaction()->Delete(index_key);

  metadata_->target_count--;
  SaveMetadata();
}

absl::optional<TargetData> LevelDbTargetCache::GetTarget(const Target& target) {
  // Scan the query-target index starting with a prefix starting with the given
  // target's canonical_id. Note that this is a scan rather than a get because
  // canonical_ids are not required to be unique per target.
  const std::string& canonical_id = target.CanonicalId();
  auto index_iterator = db_->current_transaction()->NewIterator();
  std::string index_prefix = LevelDbQueryTargetKey::KeyPrefix(canonical_id);
  index_iterator->Seek(index_prefix);

  // Simultaneously scan the targets table. This works because each
  // (canonical_id, target_id) pair is unique and ordered, so when scanning a
  // table prefixed by exactly one canonical_id, all the target_ids will be
  // unique and in order.
  std::string target_prefix = LevelDbTargetKey::KeyPrefix();
  auto target_iterator = db_->current_transaction()->NewIterator();

  LevelDbQueryTargetKey row_key;
  for (; index_iterator->Valid(); index_iterator->Next()) {
    // Only consider rows matching exactly the specific canonical_id of
    // interest.
    if (!absl::StartsWith(index_iterator->key(), index_prefix) ||
        !row_key.Decode(index_iterator->key()) ||
        canonical_id != row_key.canonical_id()) {
      // End of this canonical_id's possible targets.
      break;
    }

    // Each row is a unique combination of canonical_id and target_id, so this
    // foreign key reference can only occur once.
    std::string target_key = LevelDbTargetKey::Key(row_key.target_id());
    target_iterator->Seek(target_key);
    if (!target_iterator->Valid() || target_iterator->key() != target_key) {
      LOG_WARN(
          "Dangling query-target reference found: "
          "%s points to %s; seeking there found %s",
          DescribeKey(index_iterator), DescribeKey(target_key),
          DescribeKey(target_iterator));
      continue;
    }

    // Finally after finding a potential match, check that the target is
    // actually equal to the requested target.
    TargetData target_data = DecodeTarget(target_iterator->value());
    if (target_data.target() == target) {
      return target_data;
    }
  }

  return absl::nullopt;
}

void LevelDbTargetCache::EnumerateSequenceNumbers(
    const SequenceNumberCallback& callback) {
  // Enumerate all targets, give their sequence numbers.
  std::string target_prefix = LevelDbTargetKey::KeyPrefix();
  auto it = db_->current_transaction()->NewIterator();
  it->Seek(target_prefix);
  for (; it->Valid() && absl::StartsWith(it->key(), target_prefix);
       it->Next()) {
    StringReader reader{it->value()};
    auto target_proto = DecodeTargetProto(&reader);
    callback(target_proto->last_listen_sequence_number);
  }
}

size_t LevelDbTargetCache::RemoveTargets(
    ListenSequenceNumber upper_bound,
    const std::unordered_map<model::TargetId, TargetData>& live_targets) {
  std::string target_prefix = LevelDbTargetKey::KeyPrefix();
  auto it = db_->current_transaction()->NewIterator();
  it->Seek(target_prefix);

  std::unordered_set<TargetId> removed_targets;

  // In https://github.com/firebase/firebase-ios-sdk/issues/6721, a customer
  // reports that their client crashes when deserializing an invalid Target
  // during an LRU run. Instead of deserializing the value into a full Target
  // model, we only convert it into the underlying Protobuf message.
  for (; it->Valid() && absl::StartsWith(it->key(), target_prefix);
       it->Next()) {
    StringReader reader{it->value()};
    auto target_proto = DecodeTargetProto(&reader);
    if (target_proto->last_listen_sequence_number <= upper_bound &&
        live_targets.find(target_proto->target_id) == live_targets.end()) {
      TargetId target_id = target_proto->target_id;

      // Remove the DocumentKey to TargetId mapping
      RemoveMatchingKeysForTarget(target_id);
      // Remove the TargetId to Target mapping
      db_->current_transaction()->Delete(it->key());

      removed_targets.insert(target_id);
    }
  }

  // Remove the CanonicalId to TargetId mapping
  RemoveQueryTargetKeyForTargets(removed_targets);

  metadata_->target_count -= removed_targets.size();
  SaveMetadata();

  return removed_targets.size();
}

void LevelDbTargetCache::AddMatchingKeys(const DocumentKeySet& keys,
                                         TargetId target_id) {
  // Store an empty value in the index which is equivalent to serializing a
  // GPBEmpty message. In the future if we wanted to store some other kind of
  // value here, we can parse these empty values as with some other protocol
  // buffer (and the parser will see all default values).
  std::string empty_buffer;

  for (const DocumentKey& key : keys) {
    db_->current_transaction()->Put(
        LevelDbTargetDocumentKey::Key(target_id, key), empty_buffer);
    db_->current_transaction()->Put(
        LevelDbDocumentTargetKey::Key(key, target_id), empty_buffer);
    db_->reference_delegate()->AddReference(key);
  }
}

void LevelDbTargetCache::RemoveMatchingKeys(const DocumentKeySet& keys,
                                            TargetId target_id) {
  for (const DocumentKey& key : keys) {
    db_->current_transaction()->Delete(
        LevelDbTargetDocumentKey::Key(target_id, key));
    db_->current_transaction()->Delete(
        LevelDbDocumentTargetKey::Key(key, target_id));
    db_->reference_delegate()->RemoveReference(key);
  }
}

void LevelDbTargetCache::RemoveMatchingKeysForTarget(TargetId target_id) {
  std::string index_prefix = LevelDbTargetDocumentKey::KeyPrefix(target_id);
  auto index_iterator = db_->current_transaction()->NewIterator();
  index_iterator->Seek(index_prefix);

  LevelDbTargetDocumentKey row_key;
  for (; index_iterator->Valid(); index_iterator->Next()) {
    absl::string_view index_key = index_iterator->key();

    // Only consider rows matching this specific target_id.
    if (!row_key.Decode(index_key) || row_key.target_id() != target_id) {
      break;
    }
    const DocumentKey& document_key = row_key.document_key();

    // Delete both index rows
    db_->current_transaction()->Delete(index_key);
    db_->current_transaction()->Delete(
        LevelDbDocumentTargetKey::Key(document_key, target_id));
  }
}

void LevelDbTargetCache::RemoveQueryTargetKeyForTargets(
    const std::unordered_set<TargetId>& target_ids) {
  std::string index_prefix = LevelDbQueryTargetKey::KeyPrefix();
  auto index_iterator = db_->current_transaction()->NewIterator();
  index_iterator->Seek(index_prefix);

  LevelDbQueryTargetKey row_key;
  for (; index_iterator->Valid(); index_iterator->Next()) {
    if (!row_key.Decode(index_iterator->key())) {
      break;
    }

    if (target_ids.find(row_key.target_id()) != target_ids.end()) {
      db_->current_transaction()->Delete(index_iterator->key());
    }
  }
}

DocumentKeySet LevelDbTargetCache::GetMatchingKeys(TargetId target_id) {
  std::string index_prefix = LevelDbTargetDocumentKey::KeyPrefix(target_id);
  auto index_iterator = db_->current_transaction()->NewIterator();
  index_iterator->Seek(index_prefix);

  DocumentKeySet result;
  LevelDbTargetDocumentKey row_key;
  for (; index_iterator->Valid(); index_iterator->Next()) {
    // TODO(gsoltis): could we use a StartsWith instead?
    // Only consider rows matching this specific target_id.
    if (!row_key.Decode(index_iterator->key()) ||
        row_key.target_id() != target_id) {
      break;
    }

    result = result.insert(row_key.document_key());
  }

  return result;
}

bool LevelDbTargetCache::Contains(const DocumentKey& key) {
  // ignore sentinel rows when determining if a key belongs to a target.
  // Sentinel row just says the document exists, not that it's a member of any
  // particular target.
  std::string index_prefix = LevelDbDocumentTargetKey::KeyPrefix(key.path());
  auto index_iterator = db_->current_transaction()->NewIterator();
  index_iterator->Seek(index_prefix);

  for (; index_iterator->Valid() &&
         absl::StartsWith(index_iterator->key(), index_prefix);
       index_iterator->Next()) {
    LevelDbDocumentTargetKey row_key;
    if (row_key.Decode(index_iterator->key()) && !row_key.IsSentinel() &&
        row_key.document_key() == key) {
      return true;
    }
  }

  return false;
}

const SnapshotVersion& LevelDbTargetCache::GetLastRemoteSnapshotVersion()
    const {
  return last_remote_snapshot_version_;
}

void LevelDbTargetCache::SetLastRemoteSnapshotVersion(SnapshotVersion version) {
  last_remote_snapshot_version_ = std::move(version);
  metadata_->last_remote_snapshot_version =
      serializer_->EncodeVersion(last_remote_snapshot_version_);
  SaveMetadata();
}

void LevelDbTargetCache::EnumerateOrphanedDocuments(
    const OrphanedDocumentCallback& callback) {
  std::string document_target_prefix = LevelDbDocumentTargetKey::KeyPrefix();
  auto it = db_->current_transaction()->NewIterator();
  it->Seek(document_target_prefix);
  ListenSequenceNumber next_to_report = 0;
  DocumentKey key_to_report;
  LevelDbDocumentTargetKey key;

  for (; it->Valid() && absl::StartsWith(it->key(), document_target_prefix);
       it->Next()) {
    HARD_ASSERT(key.Decode(it->key()), "Failed to decode DocumentTarget key");
    if (key.IsSentinel()) {
      // if next_to_report is non-zero, report it, this is a new key so the last
      // one must be not be a member of any targets.
      if (next_to_report != 0) {
        callback(key_to_report, next_to_report);
      }
      // set next_to_report to be this sequence number. It's the next one we
      // might report, if we don't find any targets for this document.
      next_to_report =
          LevelDbDocumentTargetKey::DecodeSentinelValue(it->value());
      key_to_report = key.document_key();
    } else {
      // set next_to_report to be 0, we know we don't need to report this one
      // since we found a target for it.
      next_to_report = 0;
    }
  }
  // if next_to_report is non-zero, report it. We didn't find any targets for
  // that document, and we weren't asked to stop.
  if (next_to_report != 0) {
    callback(key_to_report, next_to_report);
  }
}

void LevelDbTargetCache::Save(const TargetData& target_data) {
  TargetId target_id = target_data.target_id();
  std::string key = LevelDbTargetKey::Key(target_id);
  db_->current_transaction()->Put(key,
                                  serializer_->EncodeTargetData(target_data));
}

bool LevelDbTargetCache::UpdateMetadata(const TargetData& target_data) {
  bool updated = false;
  if (target_data.target_id() > metadata_->highest_target_id) {
    metadata_->highest_target_id = target_data.target_id();
    updated = true;
  }

  if (target_data.sequence_number() >
      metadata_->highest_listen_sequence_number) {
    metadata_->highest_listen_sequence_number = target_data.sequence_number();
    updated = true;
  }

  return updated;
}

void LevelDbTargetCache::SaveMetadata() {
  db_->current_transaction()->Put(LevelDbTargetGlobalKey::Key(), metadata_);
}

nanopb::Message<firestore_client_Target> LevelDbTargetCache::DecodeTargetProto(
    nanopb::Reader* reader) {
  auto message = Message<firestore_client_Target>::TryParse(reader);
  if (!reader->ok()) {
    HARD_FAIL("Target proto failed to parse: %s", reader->status().ToString());
  }
  return message;
}

TargetData LevelDbTargetCache::DecodeTarget(absl::string_view encoded) {
  StringReader reader{encoded};
  auto message = DecodeTargetProto(&reader);
  auto result = serializer_->DecodeTargetData(&reader, *message);
  if (!reader.ok()) {
    HARD_FAIL("Target failed to parse: %s, message: %s",
              reader.status().ToString(), message.ToString());
  }

  return result;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
