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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LOCAL_WRITE_RESULT_H_
#define FIRESTORE_CORE_SRC_LOCAL_LOCAL_WRITE_RESULT_H_

#include <utility>

#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {
namespace local {

/** The result of a write to the local store. */
class LocalWriteResult {
 public:
  LocalWriteResult(model::BatchId batch_id, model::DocumentMap&& changes)
      : batch_id_(batch_id), changes_(std::move(changes)) {
  }

  LocalWriteResult() = default;

  /** The batch ID of the local write. */
  model::BatchId batch_id() const {
    return batch_id_;
  }

  /** The document changes resulting from the local write. */
  const model::DocumentMap& changes() const {
    return changes_;
  }

 private:
  model::BatchId batch_id_;
  model::DocumentMap changes_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LOCAL_WRITE_RESULT_H_
