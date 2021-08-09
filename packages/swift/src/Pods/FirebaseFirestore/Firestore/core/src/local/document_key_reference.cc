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

#include "Firestore/core/src/local/document_key_reference.h"

#include <string>
#include <utility>

#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace local {

using model::DocumentKey;
using util::ComparisonResult;

bool operator==(const DocumentKeyReference& lhs,
                const DocumentKeyReference& rhs) {
  return lhs.key_ == rhs.key_ && lhs.ref_id_ == rhs.ref_id_;
}

size_t DocumentKeyReference::Hash() const {
  return util::Hash(key_.ToString(), ref_id_);
}

std::string DocumentKeyReference::ToString() const {
  return util::StringFormat("<DocumentKeyReference: key=%s, id=%s>",
                            key_.ToString(), ref_id_);
}

/** Sorts document references by key then ID. */
ComparisonResult DocumentKeyReference::ByKey::Compare(
    const DocumentKeyReference& lhs, const DocumentKeyReference& rhs) const {
  ComparisonResult result = util::Compare(lhs.key_, rhs.key_);
  if (!util::Same(result)) return result;

  return util::Compare(lhs.ref_id_, rhs.ref_id_);
}

/** Sorts document references by ID then key. */
ComparisonResult DocumentKeyReference::ById::Compare(
    const DocumentKeyReference& lhs, const DocumentKeyReference& rhs) const {
  ComparisonResult result = util::Compare(lhs.ref_id_, rhs.ref_id_);
  if (!util::Same(result)) return result;

  return util::Compare(lhs.key_, rhs.key_);
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
