/*
 * Copyright 2019 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_API_DOCUMENT_SNAPSHOT_H_
#define FIRESTORE_CORE_SRC_API_DOCUMENT_SNAPSHOT_H_

#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/api/snapshot_metadata.h"
#include "Firestore/core/src/core/event_listener.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace api {

class DocumentReference;
class Firestore;

class DocumentSnapshot {
 public:
  DocumentSnapshot() = default;

  static DocumentSnapshot FromDocument(std::shared_ptr<Firestore> firestore,
                                       model::Document document,
                                       SnapshotMetadata metadata);

  static DocumentSnapshot FromNoDocument(std::shared_ptr<Firestore> firestore,
                                         model::DocumentKey key,
                                         SnapshotMetadata metadata);

  size_t Hash() const;

  bool exists() const;
  const absl::optional<model::Document>& internal_document() const;
  const std::string& document_id() const;

  const SnapshotMetadata& metadata() const {
    return metadata_;
  }

  DocumentReference CreateReference() const;

  absl::optional<google_firestore_v1_Value> GetValue(
      const model::FieldPath& field_path) const;

  const std::shared_ptr<Firestore>& firestore() const {
    return firestore_;
  }

  friend bool operator==(const DocumentSnapshot& lhs,
                         const DocumentSnapshot& rhs);

 private:
  // TODO(b/146372592): Make this public once we can use Abseil across
  // iOS/public C++ library boundaries.
  friend class DocumentReference;

  DocumentSnapshot(std::shared_ptr<Firestore> firestore,
                   model::DocumentKey document_key,
                   absl::optional<model::Document> document,
                   SnapshotMetadata metadata);

 private:
  std::shared_ptr<Firestore> firestore_;
  model::DocumentKey internal_key_;
  absl::optional<model::Document> internal_document_;
  SnapshotMetadata metadata_;
};

using DocumentSnapshotListener =
    std::unique_ptr<core::EventListener<DocumentSnapshot>>;

inline bool operator!=(const DocumentSnapshot& lhs,
                       const DocumentSnapshot& rhs) {
  return !(lhs == rhs);
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_DOCUMENT_SNAPSHOT_H_
