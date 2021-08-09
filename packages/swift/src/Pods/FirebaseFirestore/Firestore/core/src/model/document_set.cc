/*
 * Copyright 2017 Google
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

#include "Firestore/core/src/model/document_set.h"

#include <ostream>
#include <utility>

#include "Firestore/core/src/immutable/sorted_set.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/to_string.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace model {
namespace {

inline absl::optional<Document> none() {
  return absl::optional<Document>{};
}

}  // namespace

DocumentComparator DocumentComparator::ByKey() {
  return DocumentComparator([](const Document& lhs, const Document& rhs) {
    return util::Compare(lhs->key(), rhs->key());
  });
}

DocumentSet::DocumentSet(DocumentComparator&& comparator)
    : index_{}, sorted_set_{std::move(comparator)} {
}

bool operator==(const DocumentSet& lhs, const DocumentSet& rhs) {
  return absl::c_equal(lhs.sorted_set_, rhs.sorted_set_);
}

std::string DocumentSet::ToString() const {
  return util::ToString(sorted_set_);
}

std::ostream& operator<<(std::ostream& os, const DocumentSet& set) {
  return os << set.ToString();
}

size_t DocumentSet::Hash() const {
  return util::Hash(sorted_set_);
}

bool DocumentSet::ContainsKey(const DocumentKey& key) const {
  return index_.find(key) != index_.end();
}

absl::optional<Document> DocumentSet::GetDocument(
    const DocumentKey& key) const {
  auto found = index_.find(key);
  return found != index_.end() ? Document(found->second) : none();
}

absl::optional<Document> DocumentSet::GetFirstDocument() const {
  auto result = sorted_set_.min();
  return result != sorted_set_.end() ? *result : none();
}

absl::optional<Document> DocumentSet::GetLastDocument() const {
  auto result = sorted_set_.max();
  return result != sorted_set_.end() ? *result : none();
}

size_t DocumentSet::IndexOf(const DocumentKey& key) const {
  absl::optional<Document> doc = GetDocument(key);
  return doc ? sorted_set_.find_index(*doc) : npos;
}

DocumentSet DocumentSet::insert(
    const absl::optional<Document>& document) const {
  // TODO(mcg): look into making document non-optional.
  if (!document) {
    return *this;
  }

  // Remove any prior mapping of the document's key before adding, preventing
  // the sorted_set_ from accumulating values that aren't in the index.
  const DocumentKey& key = (*document)->key();
  DocumentSet removed = erase(key);

  DocumentMap index = removed.index_.insert(key, *document);
  SetType set = removed.sorted_set_.insert(*document);
  return {std::move(index), std::move(set)};
}

DocumentSet DocumentSet::erase(const DocumentKey& key) const {
  absl::optional<Document> doc = GetDocument(key);
  if (!doc) {
    return *this;
  }

  DocumentMap index = index_.erase(key);
  SetType set = sorted_set_.erase(*doc);
  return {std::move(index), std::move(set)};
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
