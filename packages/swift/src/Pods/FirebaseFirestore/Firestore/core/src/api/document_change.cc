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

#include "Firestore/core/src/api/document_change.h"

#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace api {

size_t DocumentChange::Hash() const {
  return util::Hash(type_, document_, old_index_, new_index_);
}

bool operator==(const DocumentChange& lhs, const DocumentChange& rhs) {
  return lhs.type() == rhs.type() && lhs.document() == rhs.document() &&
         lhs.old_index() == rhs.old_index() &&
         lhs.new_index() == rhs.new_index();
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
