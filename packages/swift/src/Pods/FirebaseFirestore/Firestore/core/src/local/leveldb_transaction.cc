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

#include "Firestore/core/src/local/leveldb_transaction.h"

#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "absl/memory/memory.h"
#include "absl/strings/str_cat.h"
#include "leveldb/write_batch.h"

using leveldb::DB;
using leveldb::ReadOptions;
using leveldb::Slice;
using leveldb::Status;
using leveldb::WriteBatch;
using leveldb::WriteOptions;

namespace firebase {
namespace firestore {
namespace local {

LevelDbTransaction::Iterator::Iterator(LevelDbTransaction* txn)
    : db_iter_(txn->db_->NewIterator(txn->read_options_)),
      last_version_(txn->version_),
      txn_(txn),
      mutations_iter_(txn->mutations_.begin()),
      current_(),
      is_mutation_(false),
      // Iterator doesn't really point to anything yet, so is
      // invalid
      is_valid_(false) {
}

void LevelDbTransaction::Iterator::UpdateCurrent() {
  bool mutation_is_valid = mutations_iter_ != txn_->mutations_.end();
  is_valid_ = mutation_is_valid || db_iter_->Valid();

  if (is_valid_) {
    if (!mutation_is_valid) {
      is_mutation_ = false;
    } else if (!db_iter_->Valid()) {
      is_mutation_ = true;
    } else {
      // Both iterators are valid. If the leveldb key is equal to or greater
      // than the current mutation key, we are looking at a mutation next. It's
      // either sooner in the iteration or directly shadowing the underlying
      // committed value in leveldb.
      is_mutation_ = db_iter_->key().compare(mutations_iter_->first) >= 0;
    }
    if (is_mutation_) {
      current_ = *mutations_iter_;
    } else {
      current_ = {db_iter_->key().ToString(), db_iter_->value().ToString()};
    }
  }
}

void LevelDbTransaction::Iterator::Seek(const std::string& key) {
  db_iter_->Seek(key);
  HARD_ASSERT(db_iter_->status().ok(), "leveldb iterator reported an error: %s",
              db_iter_->status().ToString());
  for (; db_iter_->Valid() && IsDeleted(db_iter_->key()); db_iter_->Next()) {
  }
  HARD_ASSERT(db_iter_->status().ok(), "leveldb iterator reported an error: %s",
              db_iter_->status().ToString());
  mutations_iter_ = txn_->mutations_.lower_bound(key);
  UpdateCurrent();
  last_version_ = txn_->version_;
}

const std::string& LevelDbTransaction::Iterator::key() const {
  HARD_ASSERT(Valid(), "key() called on invalid iterator");
  return current_.first;
}

const std::string& LevelDbTransaction::Iterator::value() const {
  HARD_ASSERT(Valid(), "value() called on invalid iterator");
  return current_.second;
}

bool LevelDbTransaction::Iterator::IsDeleted(leveldb::Slice slice) {
  return txn_->deletions_.find(slice.ToString()) != txn_->deletions_.end();
}

bool LevelDbTransaction::Iterator::SyncToTransaction() {
  if (last_version_ < txn_->version_) {
    // Intentionally copying here since Seek() may update current_. We need the
    // copy to do the comparison below.
    const std::string current_key = current_.first;
    Seek(current_key);
    // If we advanced, we don't need to advance again.
    return is_valid_ && current_.first > current_key;
  } else {
    return false;
  }
}

void LevelDbTransaction::Iterator::AdvanceLDB() {
  do {
    db_iter_->Next();
  } while (db_iter_->Valid() && IsDeleted(db_iter_->key()));
  HARD_ASSERT(db_iter_->status().ok(), "leveldb iterator reported an error: %s",
              db_iter_->status().ToString());
}

void LevelDbTransaction::Iterator::Next() {
  HARD_ASSERT(Valid(), "Next() called on invalid iterator");
  bool advanced = SyncToTransaction();
  if (!advanced && is_valid_) {
    if (is_mutation_) {
      // A mutation might be shadowing leveldb. If so, advance both.
      if (db_iter_->Valid() && db_iter_->key() == mutations_iter_->first) {
        AdvanceLDB();
      }
      ++mutations_iter_;
    } else {
      AdvanceLDB();
    }
    UpdateCurrent();
  }
}

LevelDbTransaction::LevelDbTransaction(DB* db,
                                       absl::string_view label,
                                       const ReadOptions& read_options,
                                       const WriteOptions& write_options)
    : db_(NOT_NULL(db)),
      read_options_(read_options),
      write_options_(write_options),
      label_(label) {
}

const ReadOptions& LevelDbTransaction::DefaultReadOptions() {
  // ReadOptions is trivial so it does not need to be heap-allocated.
  static ReadOptions options = [] {
    ReadOptions read_options;
    read_options.verify_checksums = true;
    return read_options;
  }();
  return options;
}

const WriteOptions& LevelDbTransaction::DefaultWriteOptions() {
  // WriteOptions is trivial so it does not need to be heap-allocated.
  static WriteOptions options;
  return options;
}

void LevelDbTransaction::Put(std::string key, std::string value) {
  deletions_.erase(key);
  mutations_[std::move(key)] = std::move(value);
  version_++;
}

std::unique_ptr<LevelDbTransaction::Iterator>
LevelDbTransaction::NewIterator() {
  return absl::make_unique<LevelDbTransaction::Iterator>(this);
}

Status LevelDbTransaction::Get(absl::string_view key, std::string* value) {
  std::string key_string(key);
  if (deletions_.find(key_string) != deletions_.end()) {
    return Status::NotFound(key_string + " is not present in the transaction");
  } else {
    Mutations::iterator iter{mutations_.find(key_string)};
    if (iter != mutations_.end()) {
      *value = iter->second;
      return Status::OK();
    } else {
      return db_->Get(read_options_, key_string, value);
    }
  }
}

void LevelDbTransaction::Delete(absl::string_view key) {
  std::string to_delete(key);
  deletions_.insert(to_delete);
  mutations_.erase(to_delete);
  version_++;
}

void LevelDbTransaction::Commit() {
  WriteBatch batch;
  for (const auto& deletion : deletions_) {
    batch.Delete(deletion);
  }

  for (const auto& entry : mutations_) {
    batch.Put(entry.first, entry.second);
  }

  LOG_DEBUG("Committing transaction: %s", ToString());

  Status status = db_->Write(write_options_, &batch);
  HARD_ASSERT(status.ok(), "Failed to commit transaction:\n%s\n Failed: %s",
              ToString(), status.ToString());
}

std::string LevelDbTransaction::ToString() {
  std::string dest = absl::StrCat("<LevelDbTransaction ", label_, ": ");
  size_t changes = deletions_.size() + mutations_.size();
  size_t bytes = 0;  // accumulator for size of individual mutations.
  dest += std::to_string(changes) + " changes ";
  std::string items;  // accumulator for individual changes.
  for (const auto& deletion : deletions_) {
    absl::StrAppend(&items, "\n  - Delete ", DescribeKey(deletion));
  }
  for (const auto& entry : mutations_) {
    size_t change_bytes = entry.second.size();
    bytes += change_bytes;
    absl::StrAppend(&items, "\n  - Put ", DescribeKey(entry.first), " (",
                    change_bytes, " bytes)");
  }
  absl::StrAppend(&dest, "(", bytes, " bytes):", items, ">");
  return dest;
}

std::string DescribeKey(
    const std::unique_ptr<LevelDbTransaction::Iterator>& iterator) {
  if (iterator->Valid()) {
    return DescribeKey(iterator->key());
  } else {
    return "the end of the table";
  }
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
