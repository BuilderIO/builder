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

#include "Firestore/core/src/model/mutation_batch_result.h"

#include <ostream>
#include <utility>

#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/to_string.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace model {

MutationBatchResult::MutationBatchResult(
    MutationBatch batch,
    model::SnapshotVersion commit_version,
    std::vector<model::MutationResult> mutation_results,
    nanopb::ByteString stream_token)
    : batch_(std::move(batch)),
      commit_version_(commit_version),
      mutation_results_(std::move(mutation_results)),
      stream_token_(std::move(stream_token)) {
  HARD_ASSERT(batch_.mutations().size() == mutation_results_.size(),
              "Number of mutations sent %s must equal results received %s",
              batch_.mutations().size(), mutation_results_.size());

  const auto& mutations = batch_.mutations();
  for (size_t i = 0; i < mutations.size(); i++) {
    absl::optional<SnapshotVersion> version = mutation_results_[i].version();
    if (!version) {
      // Deletes don't have a version, so we substitute the commit_version
      // of the entire batch.
      version = commit_version_;
    }

    const DocumentKey& key = mutations[i].key();
    doc_versions_[key] = *version;
  }
}

std::string MutationBatchResult::ToString() const {
  return absl::StrCat("MutationBatchResult(batch=", batch_.ToString(),
                      ", commit_version=", commit_version_.ToString(),
                      ", mutation_results=", util::ToString(mutation_results_),
                      ", stream_token=", util::ToString(stream_token_), ")");
}

std::ostream& operator<<(std::ostream& os, const MutationBatchResult& result) {
  return os << result.ToString();
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
