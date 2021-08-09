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

#include "Firestore/core/src/core/transaction.h"

#include <algorithm>
#include <unordered_set>
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/core/user_data.h"
#include "Firestore/core/src/model/delete_mutation.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/verify_mutation.h"
#include "Firestore/core/src/remote/datastore.h"
#include "Firestore/core/src/util/hard_assert.h"

using firebase::firestore::Error;
using firebase::firestore::core::ParsedSetData;
using firebase::firestore::core::ParsedUpdateData;
using firebase::firestore::model::DeleteMutation;
using firebase::firestore::model::Document;
using firebase::firestore::model::DocumentKey;
using firebase::firestore::model::DocumentKeyHash;
using firebase::firestore::model::Mutation;
using firebase::firestore::model::Precondition;
using firebase::firestore::model::SnapshotVersion;
using firebase::firestore::model::VerifyMutation;
using firebase::firestore::remote::Datastore;
using firebase::firestore::util::Status;
using firebase::firestore::util::StatusOr;

namespace firebase {
namespace firestore {
namespace core {

Transaction::Transaction(Datastore* datastore)
    : datastore_{NOT_NULL(datastore)} {
}

Status Transaction::RecordVersion(const Document& doc) {
  SnapshotVersion doc_version;

  if (doc->is_found_document()) {
    doc_version = doc->version();
  } else if (doc->is_no_document()) {
    // For deleted docs, we must record an explicit no version to build the
    // right precondition when writing.
    doc_version = SnapshotVersion::None();
  } else {
    HARD_FAIL("Unexpected document type in transaction: %s", doc.ToString());
  }

  absl::optional<SnapshotVersion> existing_version = GetVersion(doc->key());
  if (existing_version.has_value()) {
    if (doc_version != existing_version.value()) {
      // This transaction will fail no matter what.
      return Status{Error::kErrorAborted,
                    "Document version changed between two reads."};
    }
    return Status::OK();
  } else {
    read_versions_[doc->key()] = doc_version;
    return Status::OK();
  }
}

void Transaction::Lookup(const std::vector<DocumentKey>& keys,
                         LookupCallback&& callback) {
  EnsureCommitNotCalled();

  if (!mutations_.empty()) {
    Status lookup_error = Status{Error::kErrorInvalidArgument,
                                 "Firestore transactions require all reads to "
                                 "be executed before all writes"};
    callback(lookup_error);
    return;
  }

  datastore_->LookupDocuments(
      keys,
      [this, callback](const StatusOr<std::vector<Document>>& maybe_documents) {
        if (!maybe_documents.ok()) {
          callback(maybe_documents.status());
          return;
        }

        const auto& documents = maybe_documents.ValueOrDie();
        for (const Document& doc : documents) {
          Status record_error = RecordVersion(doc);
          if (!record_error.ok()) {
            callback(record_error);
            return;
          }
        }

        // TODO(varconst): see if `maybe_documents` can be moved into the
        // callback.
        callback(maybe_documents);
      });
}

void Transaction::WriteMutations(std::vector<Mutation>&& mutations) {
  EnsureCommitNotCalled();
  // `move` will become appropriate once `Mutation` is replaced by the C++
  // equivalent.
  std::move(mutations.begin(), mutations.end(), std::back_inserter(mutations_));
}

Precondition Transaction::CreatePrecondition(const DocumentKey& key) {
  absl::optional<SnapshotVersion> version = GetVersion(key);
  if (written_docs_.count(key) == 0 && version.has_value()) {
    return Precondition::UpdateTime(version.value());
  } else {
    return Precondition::None();
  }
}

StatusOr<Precondition> Transaction::CreateUpdatePrecondition(
    const DocumentKey& key) {
  absl::optional<SnapshotVersion> version = GetVersion(key);
  // The first time a document is written, we want to take into account the
  // read time and existence.
  if (written_docs_.count(key) == 0 && version.has_value()) {
    if (version.value() == SnapshotVersion::None()) {
      // The document doesn't exist, so fail the transaction.
      //
      // This has to be validated locally because you can't send a
      // precondition that a document does not exist without changing the
      // semantics of the backend write to be an insert. This is the reverse
      // of what we want, since we want to assert that the document doesn't
      // exist but then send the update and have it fail. Since we can't
      // express that to the backend, we have to validate locally.
      //
      // Note: this can change once we can send separate verify writes in the
      // transaction.
      return Status{Error::kErrorInvalidArgument,
                    "Can't update a document that doesn't exist."};
    }
    // Document exists, just base precondition on document update time.
    return Precondition::UpdateTime(version.value());
  } else {
    // Document was not read, so we just use the preconditions for a blind
    // update.
    return Precondition::Exists(true);
  }
}

void Transaction::Set(const DocumentKey& key, ParsedSetData&& data) {
  WriteMutations({std::move(data).ToMutation(key, CreatePrecondition(key))});
  written_docs_.insert(key);
}

void Transaction::Update(const DocumentKey& key, ParsedUpdateData&& data) {
  StatusOr<Precondition> maybe_precondition = CreateUpdatePrecondition(key);
  if (!maybe_precondition.ok()) {
    last_write_error_ = maybe_precondition.status();
  } else {
    WriteMutations(
        {std::move(data).ToMutation(key, maybe_precondition.ValueOrDie())});
  }
  written_docs_.insert(key);
}

void Transaction::Delete(const DocumentKey& key) {
  Mutation mutation = DeleteMutation(key, CreatePrecondition(key));
  WriteMutations({mutation});
  written_docs_.insert(key);
}

void Transaction::Commit(util::StatusCallback&& callback) {
  EnsureCommitNotCalled();

  // If there was an error writing, raise that error now
  if (!last_write_error_.ok()) {
    callback(last_write_error_);
    return;
  }

  // Make a list of read documents that haven't been written.
  std::unordered_set<DocumentKey, DocumentKeyHash> unwritten;
  for (const auto& kv : read_versions_) {
    unwritten.insert(kv.first);
  }
  // For each mutation, note that the doc was written.
  for (const Mutation& mutation : mutations_) {
    unwritten.erase(mutation.key());
  }

  // For each document that was read but not written to, we want to perform a
  // `verify` operation.
  for (const DocumentKey& key : unwritten) {
    mutations_.push_back(VerifyMutation(key, CreatePrecondition(key)));
  }
  committed_ = true;
  datastore_->CommitMutations(mutations_, std::move(callback));
}

void Transaction::MarkPermanentlyFailed() {
  permanent_error_ = true;
}

bool Transaction::IsPermanentlyFailed() const {
  return permanent_error_;
}

void Transaction::EnsureCommitNotCalled() {
  HARD_ASSERT(!committed_,
              "A transaction object cannot be used after its "
              "update callback has been invoked.");
}

absl::optional<SnapshotVersion> Transaction::GetVersion(
    const DocumentKey& key) const {
  auto found = read_versions_.find(key);
  if (found != read_versions_.end()) {
    return found->second;
  }
  return absl::nullopt;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
