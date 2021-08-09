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

#include "Firestore/core/src/model/mutation_batch.h"

#include <ostream>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch_result.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/to_string.h"

namespace firebase {
namespace firestore {
namespace model {

MutationBatch::MutationBatch(int batch_id,
                             Timestamp local_write_time,
                             std::vector<Mutation> base_mutations,
                             std::vector<Mutation> mutations)
    : batch_id_(batch_id),
      local_write_time_(std::move(local_write_time)),
      base_mutations_(std::move(base_mutations)),
      mutations_(std::move(mutations)) {
  HARD_ASSERT(!mutations_.empty(), "Cannot create an empty mutation batch");
}

void MutationBatch::ApplyToRemoteDocument(
    MutableDocument& document,
    const MutationBatchResult& mutation_batch_result) const {
  const auto& mutation_results = mutation_batch_result.mutation_results();
  HARD_ASSERT(mutation_results.size() == mutations_.size(),
              "Mismatch between mutations length (%s) and results length (%s)",
              mutations_.size(), mutation_results.size());

  for (size_t i = 0; i < mutations_.size(); i++) {
    const Mutation& mutation = mutations_[i];
    if (mutation.key() == document.key()) {
      mutation.ApplyToRemoteDocument(document, mutation_results[i]);
    }
  }
}

void MutationBatch::ApplyToLocalDocument(MutableDocument& document) const {
  // First, apply the base state. This allows us to apply non-idempotent
  // transform against a consistent set of values.
  for (const Mutation& mutation : base_mutations_) {
    if (mutation.key() == document.key()) {
      mutation.ApplyToLocalView(document, local_write_time_);
    }
  }

  // Second, apply all user-provided mutations.
  for (const Mutation& mutation : mutations_) {
    if (mutation.key() == document.key()) {
      mutation.ApplyToLocalView(document, local_write_time_);
    }
  }
}

void MutationBatch::ApplyToLocalDocumentSet(DocumentMap& document_map) const {
  // TODO(mrschmidt): This implementation is O(n^2). If we iterate through the
  // mutations first (as done in `applyToLocalDocument:documentKey:`), we can
  // reduce the complexity to O(n).

  for (const Mutation& mutation : mutations_) {
    const DocumentKey& key = mutation.key();

    auto it = document_map.find(key);
    HARD_ASSERT(it != document_map.end(), "document for key %s not found",
                key.ToString());
    // TODO(mutabledocuments): This method should take a map of MutableDocuments
    // and we should remove this cast.
    auto& document = const_cast<MutableDocument&>(it->second.get());
    ApplyToLocalDocument(document);
    if (!document.is_valid_document()) {
      document.ConvertToNoDocument(SnapshotVersion::None());
    }
  }
}

DocumentKeySet MutationBatch::keys() const {
  DocumentKeySet set;
  for (const Mutation& mutation : mutations_) {
    set = set.insert(mutation.key());
  }
  return set;
}

bool operator==(const MutationBatch& lhs, const MutationBatch& rhs) {
  return lhs.batch_id() == rhs.batch_id() &&
         lhs.local_write_time() == rhs.local_write_time() &&
         lhs.base_mutations() == rhs.base_mutations() &&
         lhs.mutations() == rhs.mutations();
}

std::string MutationBatch::ToString() const {
  return absl::StrCat("MutationBatch(id=", batch_id_,
                      ", local_write_time=", local_write_time_.ToString(),
                      ", mutations=", util::ToString(mutations_), ")");
}

std::ostream& operator<<(std::ostream& os, const MutationBatch& batch) {
  return os << batch.ToString();
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
