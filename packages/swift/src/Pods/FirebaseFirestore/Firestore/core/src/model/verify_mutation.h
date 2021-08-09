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

#ifndef FIRESTORE_CORE_SRC_MODEL_VERIFY_MUTATION_H_
#define FIRESTORE_CORE_SRC_MODEL_VERIFY_MUTATION_H_

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/model/precondition.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace model {

class MutableDocument;

/**
 * A mutation that verifies the existence of the document at the given key
 * with the provided precondition.
 *
 * The `verify` operation is only used in Transactions, and this class serves
 * primarily to facilitate serialization into protos.
 */
class VerifyMutation : public Mutation {
 public:
  VerifyMutation(DocumentKey key, Precondition precondition);

  /**
   * Casts a Mutation to a VerifyMutation. This is a checked operation that will
   * assert if the type of the Mutation isn't actually Type::Verify.
   */
  explicit VerifyMutation(const Mutation& mutation);

  /** Creates an invalid VerifyMutation instance. */
  VerifyMutation() = default;

 private:
  class Rep : public Mutation::Rep {
   public:
    using Mutation::Rep::Rep;

    Type type() const override {
      return Type::Verify;
    }

    void ApplyToRemoteDocument(
        MutableDocument& document,
        const MutationResult& mutation_result) const override;

    void ApplyToLocalView(MutableDocument& document,
                          const Timestamp&) const override;

    // Does not override Equals or Hash; Mutation's versions are sufficient.

    std::string ToString() const override;
  };
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_VERIFY_MUTATION_H_
