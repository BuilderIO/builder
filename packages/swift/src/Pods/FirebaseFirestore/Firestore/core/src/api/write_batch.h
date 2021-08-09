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

#ifndef FIRESTORE_CORE_SRC_API_WRITE_BATCH_H_
#define FIRESTORE_CORE_SRC_API_WRITE_BATCH_H_

#include <memory>
#include <utility>
#include <vector>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {
namespace api {

class WriteBatch {
 public:
  explicit WriteBatch(std::shared_ptr<Firestore> firestore)
      : firestore_{std::move(firestore)} {
  }

  void SetData(const DocumentReference& reference,
               core::ParsedSetData&& set_data);
  void UpdateData(const DocumentReference& reference,
                  core::ParsedUpdateData&& update_data);
  void DeleteData(const DocumentReference& reference);

  void Commit(util::StatusCallback callback);

  const std::shared_ptr<Firestore>& firestore() const {
    return firestore_;
  }

 private:
  std::shared_ptr<Firestore> firestore_;
  std::vector<model::Mutation> mutations_;
  bool committed_ = false;

  void VerifyNotCommitted() const;
  void ValidateReference(const DocumentReference& reference) const;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_WRITE_BATCH_H_
