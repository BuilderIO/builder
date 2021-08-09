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

#ifndef FIRESTORE_CORE_SRC_LOCAL_REFERENCE_SET_H_
#define FIRESTORE_CORE_SRC_LOCAL_REFERENCE_SET_H_

#include "Firestore/core/src/immutable/sorted_set.h"
#include "Firestore/core/src/local/document_key_reference.h"
#include "Firestore/core/src/model/model_fwd.h"

namespace firebase {
namespace firestore {
namespace local {

/**
 * A collection of references to a document from some kind of numbered entity
 * (either a TargetId or BatchId). As references are added to or removed from
 * the set corresponding events are emitted to a registered garbage collector.
 *
 * Each reference is represented by a DocumentKeyReference object. Each of them
 * contains enough information to uniquely identify the reference. They are all
 * stored primarily in a set sorted by key. A document is considered garbage if
 * there's no references in that set (this can be efficiently checked thanks to
 * sorting by key).
 *
 * ReferenceSet also keeps a secondary set that contains references sorted by
 * Id. This one is used to efficiently implement removal of all references by
 * some TargetId.
 */
class ReferenceSet {
 public:
  /** Returns true if the reference set contains no references. */
  bool empty() const {
    return by_key_.empty();
  }

  size_t size() const {
    return by_key_.size();
  }

  /** Adds a reference to the given document key for the given Id. */
  void AddReference(const model::DocumentKey& key, int id);

  /** Add references to the given document keys for the given Id. */
  void AddReferences(const model::DocumentKeySet& keys, int id);

  /** Removes a reference to the given document key for the given Id. */
  void RemoveReference(const model::DocumentKey& key, int id);

  /** Removes references to the given document keys for the given Id. */
  void RemoveReferences(const model::DocumentKeySet& keys, int id);

  /** Clears all references with a given ID. Calls -removeReferenceToKey: for
   * each key removed. */
  model::DocumentKeySet RemoveReferences(int id);

  /** Clears all references for all IDs. */
  void RemoveAllReferences();

  /** Returns all of the document keys that have had references added for the
   * given ID. */
  model::DocumentKeySet ReferencedKeys(int id);

  /**
   * Checks to see if there are any references to a document with the given key.
   */
  bool ContainsKey(const model::DocumentKey& key);

 private:
  void RemoveReference(const DocumentKeyReference& reference);

  immutable::SortedSet<DocumentKeyReference, DocumentKeyReference::ByKey>
      by_key_;
  immutable::SortedSet<DocumentKeyReference, DocumentKeyReference::ById> by_id_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_REFERENCE_SET_H_
