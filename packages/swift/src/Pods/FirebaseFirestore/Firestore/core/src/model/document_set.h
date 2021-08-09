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

#ifndef FIRESTORE_CORE_SRC_MODEL_DOCUMENT_SET_H_
#define FIRESTORE_CORE_SRC_MODEL_DOCUMENT_SET_H_

#include <iosfwd>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/immutable/sorted_set.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/util/comparison.h"

namespace firebase {
namespace firestore {
namespace model {

class DocumentComparator : public util::FunctionComparator<Document> {
 public:
  using FunctionComparator<Document>::FunctionComparator;

  static DocumentComparator ByKey();

  // TODO(wilhuff): Remove this using statement
  // This exists to put these two overloads on equal footing. Once the overload
  // below is gone, this using statement can be removed as well.
  using FunctionComparator<Document>::Compare;
};

/**
 * DocumentSet is an immutable (copy-on-write) collection that holds documents
 * in order specified by the provided comparator. We always add a document key
 * comparator on top of what is provided to guarantee document equality based on
 * the key.
 */
class DocumentSet : public immutable::SortedContainer {
 public:
  /**
   * The type of the main collection of documents in an DocumentSet.
   * @see sorted_set_.
   */
  using SetType = immutable::SortedSet<Document, DocumentComparator>;

  // STL container types
  using value_type = Document;
  using const_iterator = SetType::const_iterator;

  /**
   * Creates a new, empty DocumentSet sorted by the given comparator, then by
   * keys.
   */
  explicit DocumentSet(DocumentComparator&& comparator);

  size_t size() const {
    return index_.size();
  }

  /** Returns true if the dictionary contains no elements. */
  bool empty() const {
    return index_.empty();
  }

  /** Returns true if this set contains a document with the given key. */
  bool ContainsKey(const DocumentKey& key) const;

  const DocumentComparator& comparator() const {
    return sorted_set_.comparator();
  }

  SetType::const_iterator begin() const {
    return sorted_set_.begin();
  }
  SetType::const_iterator end() const {
    return sorted_set_.end();
  }

  /**
   * Returns the document from this set with the given key if it exists or nil
   * if it doesn't.
   */
  absl::optional<Document> GetDocument(const DocumentKey& key) const;

  /**
   * Returns the first document in the set according to its built in ordering,
   * or nil if the set is empty.
   */
  absl::optional<Document> GetFirstDocument() const;

  /**
   * Returns the last document in the set according to its built in ordering, or
   * nil if the set is empty.
   */
  absl::optional<Document> GetLastDocument() const;

  /**
   * Returns the index of the document with the provided key in the document
   * set. Returns `npos` if the key is not present.
   */
  size_t IndexOf(const DocumentKey& key) const;

  /** Returns a new DocumentSet that contains the given document. */
  DocumentSet insert(const absl::optional<Document>& document) const;

  /**
   * Returns a new DocumentSet that excludes any document associated with
   * the given key.
   */
  DocumentSet erase(const DocumentKey& key) const;

  friend bool operator==(const DocumentSet& lhs, const DocumentSet& rhs);

  std::string ToString() const;
  friend std::ostream& operator<<(std::ostream& os, const DocumentSet& set);

  size_t Hash() const;

 private:
  DocumentSet(DocumentMap&& index, SetType&& sorted_set)
      : index_(std::move(index)), sorted_set_(std::move(sorted_set)) {
  }

  /**
   * An index of the documents in the DocumentSet, indexed by document key.
   * The index exists to guarantee the uniqueness of document keys in the set
   * and to allow lookup and removal of documents by key.
   */
  DocumentMap index_;

  /**
   * The main collection of documents in the DocumentSet. The documents are
   * ordered by a comparator supplied from a query. The SetType collection
   * exists in addition to the index to allow ordered traversal of the
   * DocumentSet.
   */
  SetType sorted_set_;
};

inline bool operator!=(const DocumentSet& lhs, const DocumentSet& rhs) {
  return !(lhs == rhs);
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_DOCUMENT_SET_H_
