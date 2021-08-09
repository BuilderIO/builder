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

#ifndef FIRESTORE_CORE_SRC_LOCAL_QUERY_RESULT_H_
#define FIRESTORE_CORE_SRC_LOCAL_QUERY_RESULT_H_

#include <utility>
#include <vector>

#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/model_fwd.h"

namespace firebase {
namespace firestore {
namespace local {

/** The result of executing a query against the local store. */
class QueryResult {
 public:
  QueryResult() = default;

  /** Creates a new QueryResult with the given values. */
  QueryResult(model::DocumentMap documents, model::DocumentKeySet remote_keys)
      : documents_{std::move(documents)}, remote_keys_{std::move(remote_keys)} {
  }

  const model::DocumentMap& documents() const {
    return documents_;
  }

  const model::DocumentKeySet& remote_keys() const {
    return remote_keys_;
  }

 private:
  model::DocumentMap documents_;
  model::DocumentKeySet remote_keys_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_QUERY_RESULT_H_
