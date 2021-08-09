/*
 * Copyright 2021 Google LLC
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
#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_DOCUMENT_METADATA_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_DOCUMENT_METADATA_H_

#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/bundle/bundle_element.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/snapshot_version.h"

namespace firebase {
namespace firestore {
namespace bundle {

/** Metadata describing a Firestore document saved in the bundle. */
class BundledDocumentMetadata : public BundleElement {
 public:
  BundledDocumentMetadata() = default;

  BundledDocumentMetadata(model::DocumentKey key,
                          model::SnapshotVersion read_time,
                          bool exists,
                          std::vector<std::string> queries)
      : key_(std::move(key)),
        read_time_(read_time),
        exists_(exists),
        queries_(std::move(queries)) {
  }

  Type element_type() const override {
    return Type::DocumentMetadata;
  }

  /** Returns the document key of a bundled document. */
  const model::DocumentKey& key() const {
    return key_;
  }

  /** Returns the snapshot version of the document data bundled. */
  const model::SnapshotVersion& read_time() const {
    return read_time_;
  }

  /** Returns whether the document exists. */
  bool exists() const {
    return exists_;
  }

  /**
   * Returns the names of the queries in this bundle that this document matches
   * to.
   */
  const std::vector<std::string>& queries() const {
    return queries_;
  }

 private:
  model::DocumentKey key_;
  model::SnapshotVersion read_time_;
  bool exists_ = false;
  std::vector<std::string> queries_;
};

inline bool operator==(const BundledDocumentMetadata& lhs,
                       const BundledDocumentMetadata& rhs) {
  return lhs.key() == rhs.key() && lhs.exists() == rhs.exists() &&
         lhs.read_time() == rhs.read_time() && lhs.queries() == rhs.queries();
}

inline bool operator!=(const BundledDocumentMetadata& lhs,
                       const BundledDocumentMetadata& rhs) {
  return !(lhs == rhs);
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLED_DOCUMENT_METADATA_H_
