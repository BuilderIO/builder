/*
 * Copyright 2020 Google LLC
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

#include "Firestore/core/src/model/verify_mutation.h"

#include <utility>

#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace model {

static_assert(
    sizeof(Mutation) == sizeof(VerifyMutation),
    "VerifyMutation may not have additional members (everything goes in Rep)");

VerifyMutation::VerifyMutation(DocumentKey key, Precondition precondition)
    : Mutation(std::make_shared<Rep>(std::move(key), std::move(precondition))) {
}

VerifyMutation::VerifyMutation(const Mutation& mutation) : Mutation(mutation) {
  HARD_ASSERT(type() == Type::Verify);
}

void VerifyMutation::Rep::ApplyToRemoteDocument(MutableDocument&,
                                                const MutationResult&) const {
  HARD_FAIL("VerifyMutation should only be used in Transactions.");
}

void VerifyMutation::Rep::ApplyToLocalView(MutableDocument&,
                                           const Timestamp&) const {
  HARD_FAIL("VerifyMutation should only be used in Transactions.");
}

std::string VerifyMutation::Rep::ToString() const {
  return absl::StrCat("VerifyMutation(key=", key().ToString(),
                      ", precondition=", precondition().ToString(), ")");
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
