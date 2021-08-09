/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/local/leveldb_persistence.h"

#include <limits>
#include <utility>

#include "Firestore/core/src/auth/user.h"
#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/local/leveldb_key.h"
#include "Firestore/core/src/local/leveldb_lru_reference_delegate.h"
#include "Firestore/core/src/local/leveldb_migrations.h"
#include "Firestore/core/src/local/leveldb_opener.h"
#include "Firestore/core/src/local/leveldb_util.h"
#include "Firestore/core/src/local/listen_sequence.h"
#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/sizer.h"
#include "Firestore/core/src/util/filesystem.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/string_util.h"
#include "absl/memory/memory.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace local {
namespace {

using auth::User;
using leveldb::DB;
using model::ListenSequenceNumber;
using util::Filesystem;
using util::Path;
using util::Status;
using util::StatusOr;
using util::StringFormat;

/**
 * Finds all user ids in the database based on the existence of a mutation
 * queue.
 */
std::set<std::string> CollectUserSet(LevelDbTransaction* transaction) {
  std::set<std::string> result;

  std::string table_prefix = LevelDbMutationKey::KeyPrefix();
  auto it = transaction->NewIterator();
  it->Seek(table_prefix);

  LevelDbMutationKey row_key;
  while (it->Valid() && absl::StartsWith(it->key(), table_prefix) &&
         row_key.Decode(it->key())) {
    result.insert(row_key.user_id());

    auto user_end = LevelDbMutationKey::KeyPrefix(row_key.user_id());
    user_end = util::PrefixSuccessor(user_end);
    it->Seek(user_end);
  }
  return result;
}

}  // namespace

StatusOr<std::unique_ptr<LevelDbPersistence>> LevelDbPersistence::Create(
    util::Path dir, LocalSerializer serializer, const LruParams& lru_params) {
  auto* fs = Filesystem::Default();
  Status status = EnsureDirectory(dir);
  if (!status.ok()) return status;

  status = fs->ExcludeFromBackups(dir);
  if (!status.ok()) return status;

  StatusOr<std::unique_ptr<DB>> created = OpenDb(dir);
  if (!created.ok()) return created.status();

  std::unique_ptr<DB> db = std::move(created).ValueOrDie();
  LevelDbMigrations::RunMigrations(db.get(), serializer);

  LevelDbTransaction transaction(db.get(), "Start LevelDB");
  std::set<std::string> users = CollectUserSet(&transaction);
  transaction.Commit();

  // Explicit conversion is required to allow the StatusOr to be created.
  std::unique_ptr<LevelDbPersistence> result(
      new LevelDbPersistence(std::move(db), std::move(dir), std::move(users),
                             std::move(serializer), lru_params));
  return {std::move(result)};
}

LevelDbPersistence::LevelDbPersistence(std::unique_ptr<leveldb::DB> db,
                                       util::Path directory,
                                       std::set<std::string> users,
                                       LocalSerializer serializer,
                                       const LruParams& lru_params)
    : db_(std::move(db)),
      directory_(std::move(directory)),
      users_(std::move(users)),
      serializer_(std::move(serializer)) {
  target_cache_ = absl::make_unique<LevelDbTargetCache>(this, &serializer_);
  document_cache_ =
      absl::make_unique<LevelDbRemoteDocumentCache>(this, &serializer_);
  index_manager_ = absl::make_unique<LevelDbIndexManager>(this);
  reference_delegate_ =
      absl::make_unique<LevelDbLruReferenceDelegate>(this, lru_params);
  bundle_cache_ = absl::make_unique<LevelDbBundleCache>(this, &serializer_);

  // TODO(gsoltis): set up a leveldb transaction for these operations.
  target_cache_->Start();
  reference_delegate_->Start();
  started_ = true;
}

// Handle unique_ptrs to forward declarations
LevelDbPersistence::~LevelDbPersistence() = default;

// MARK: - Startup

Status LevelDbPersistence::EnsureDirectory(const Path& dir) {
  auto* fs = Filesystem::Default();
  Status status = fs->RecursivelyCreateDir(dir);
  if (!status.ok()) {
    return Status{Error::kErrorInternal,
                  "Failed to create persistence directory"}
        .CausedBy(status);
  }

  return Status::OK();
}

StatusOr<std::unique_ptr<DB>> LevelDbPersistence::OpenDb(const Path& dir) {
  leveldb::Options options;
  options.create_if_missing = true;

  DB* database = nullptr;
  leveldb::Status status = DB::Open(options, dir.ToUtf8String(), &database);
  if (!status.ok()) {
    return Status{Error::kErrorInternal,
                  StringFormat("Failed to open LevelDB database at %s",
                               dir.ToUtf8String())}
        .CausedBy(ConvertStatus(status));
  }

  return std::unique_ptr<DB>(database);
}

// MARK: - LevelDB utilities

LevelDbTransaction* LevelDbPersistence::current_transaction() {
  HARD_ASSERT(transaction_ != nullptr,
              "Attempting to access transaction before one has started");
  return transaction_.get();
}

util::Status LevelDbPersistence::ClearPersistence(
    const core::DatabaseInfo& database_info) {
  LevelDbOpener opener(database_info);
  StatusOr<Path> maybe_data_dir = opener.LevelDbDataDir();
  HARD_ASSERT(maybe_data_dir.ok(), "Failed to find local LevelDB files: %s",
              maybe_data_dir.status().ToString());
  Path leveldb_dir = std::move(maybe_data_dir).ValueOrDie();

  LOG_DEBUG("Clearing persistence for path: %s", leveldb_dir.ToUtf8String());
  auto* fs = Filesystem::Default();
  return fs->RecursivelyRemove(leveldb_dir);
}

StatusOr<int64_t> LevelDbPersistence::CalculateByteSize() {
  auto* fs = Filesystem::Default();

  // Accumulate the total size in an unsigned integer to avoid undefined
  // behavior on overflow.
  uint64_t count = 0;
  auto iter = util::DirectoryIterator::Create(directory_);
  for (; iter->Valid(); iter->Next()) {
    StatusOr<int64_t> maybe_size = fs->FileSize(iter->file());
    if (!maybe_size.ok()) {
      return Status::FromCause("Failed to size LevelDB directory",
                               maybe_size.status());
    }

    uint64_t old_count = count;
    int64_t file_size = maybe_size.ValueOrDie();
    count += file_size;

    auto max_signed_value =
        static_cast<uint64_t>(std::numeric_limits<int64_t>::max());
    if (count < old_count || count > max_signed_value) {
      return Status(Error::kErrorOutOfRange,
                    "Failed to size LevelDB: count overflowed");
    }
  }

  if (!iter->status().ok()) {
    return Status::FromCause("Failed to iterate over LevelDB files",
                             iter->status());
  }
  return static_cast<int64_t>(count);
}

// MARK: - Persistence

model::ListenSequenceNumber LevelDbPersistence::current_sequence_number()
    const {
  return reference_delegate_->current_sequence_number();
}

void LevelDbPersistence::Shutdown() {
  HARD_ASSERT(started_, "LevelDbPersistence shutdown without start!");
  started_ = false;
  db_.reset();
}

LevelDbMutationQueue* LevelDbPersistence::GetMutationQueueForUser(
    const auth::User& user) {
  users_.insert(user.uid());
  current_mutation_queue_ =
      absl::make_unique<LevelDbMutationQueue>(user, this, &serializer_);
  return current_mutation_queue_.get();
}

LevelDbTargetCache* LevelDbPersistence::target_cache() {
  return target_cache_.get();
}

LevelDbRemoteDocumentCache* LevelDbPersistence::remote_document_cache() {
  return document_cache_.get();
}

LevelDbIndexManager* LevelDbPersistence::index_manager() {
  return index_manager_.get();
}

LevelDbLruReferenceDelegate* LevelDbPersistence::reference_delegate() {
  return reference_delegate_.get();
}

LevelDbBundleCache* LevelDbPersistence::bundle_cache() {
  return bundle_cache_.get();
}

void LevelDbPersistence::RunInternal(absl::string_view label,
                                     std::function<void()> block) {
  HARD_ASSERT(transaction_ == nullptr,
              "Starting a transaction while one is already in progress");

  transaction_ = absl::make_unique<LevelDbTransaction>(db_.get(), label);
  reference_delegate_->OnTransactionStarted(label);

  block();

  reference_delegate_->OnTransactionCommitted();
  transaction_->Commit();
  transaction_.reset();
}

leveldb::ReadOptions StandardReadOptions() {
  // For now this is paranoid, but perhaps disable that in production builds.
  leveldb::ReadOptions options;
  options.verify_checksums = true;
  return options;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
