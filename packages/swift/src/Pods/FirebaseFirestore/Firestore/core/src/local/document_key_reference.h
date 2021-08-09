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

#ifndef FIRESTORE_CORE_SRC_LOCAL_DOCUMENT_KEY_REFERENCE_H_
#define FIRESTORE_CORE_SRC_LOCAL_DOCUMENT_KEY_REFERENCE_H_

#include <string>
#include <utility>

#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/types.h"
#include "Firestore/core/src/util/comparison.h"

namespace firebase {
namespace firestore {
namespace local {

/**
 * An immutable value used to keep track of an association between some
 * referencing target or batch and a document key that the target or batch
 * references.
 *
 * A reference can be from either listen targets (identified by their TargetId)
 * or mutation batches (identified by their BatchId). See GarbageCollector
 * for more details.
 *
 * Not to be confused with FIRDocumentReference.
 */
class DocumentKeyReference {
 public:
  DocumentKeyReference() {
  }

  /** Initializes the document reference with the given key and Id. */
  DocumentKeyReference(model::DocumentKey key, int32_t ref_id)
      : key_{std::move(key)}, ref_id_{ref_id} {
  }

  /** The document key that's the target of this reference. */
  const model::DocumentKey& key() const {
    return key_;
  }

  /**
   * The TargetId of a referring target or the BatchId of a referring mutation
   * batch. (Which this is depends upon which ReferenceSet this reference is
   * a part of.)
   */
  int32_t ref_id() const {
    return ref_id_;
  }

  friend bool operator==(const DocumentKeyReference& lhs,
                         const DocumentKeyReference& rhs);

  size_t Hash() const;

  std::string ToString() const;

  /** Sorts document references by key then Id. */
  struct ByKey {
    util::ComparisonResult Compare(const DocumentKeyReference& lhs,
                                   const DocumentKeyReference& rhs) const;
  };

  /** Sorts document references by Id then key. */
  struct ById {
    util::ComparisonResult Compare(const DocumentKeyReference& lhs,
                                   const DocumentKeyReference& rhs) const;
  };

 private:
  model::DocumentKey key_;

  // PORTING NOTE: this is `id` on other platforms but that's a reserved word in
  // Objective-C++.
  int32_t ref_id_ = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_DOCUMENT_KEY_REFERENCE_H_
