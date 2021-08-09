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

#ifndef FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_SET_H_
#define FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_SET_H_

#include "Firestore/core/src/immutable/sorted_set.h"
#include "Firestore/core/src/model/document_key.h"

namespace firebase {
namespace firestore {
namespace model {

/** Convenience type for a set of keys, since they are so common. */
using DocumentKeySet = immutable::SortedSet<DocumentKey>;

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_SET_H_
