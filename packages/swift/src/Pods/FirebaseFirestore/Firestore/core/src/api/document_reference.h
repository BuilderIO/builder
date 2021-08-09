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

#ifndef FIRESTORE_CORE_SRC_API_DOCUMENT_REFERENCE_H_
#define FIRESTORE_CORE_SRC_API_DOCUMENT_REFERENCE_H_

#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {

namespace model {
class ResourcePath;
}  // namespace model

namespace api {

class DocumentReference {
 public:
  DocumentReference() = default;
  DocumentReference(model::ResourcePath path,
                    std::shared_ptr<Firestore> firestore);
  DocumentReference(model::DocumentKey document_key,
                    std::shared_ptr<Firestore> firestore)
      : firestore_{std::move(firestore)}, key_{std::move(document_key)} {
  }

  size_t Hash() const;

  const std::shared_ptr<Firestore>& firestore() const {
    return firestore_;
  }
  const model::DocumentKey& key() const {
    return key_;
  }

  const std::string& document_id() const;

  CollectionReference Parent() const;

  std::string Path() const;

  CollectionReference GetCollectionReference(
      const std::string& collection_path) const;

  void SetData(core::ParsedSetData&& set_data, util::StatusCallback callback);

  void UpdateData(core::ParsedUpdateData&& update_data,
                  util::StatusCallback callback);

  void DeleteDocument(util::StatusCallback callback);

  void GetDocument(Source source, DocumentSnapshotListener&& callback);

  std::unique_ptr<ListenerRegistration> AddSnapshotListener(
      core::ListenOptions options, DocumentSnapshotListener&& listener);

 private:
  std::shared_ptr<Firestore> firestore_;
  model::DocumentKey key_;
};

bool operator==(const DocumentReference& lhs, const DocumentReference& rhs);

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_DOCUMENT_REFERENCE_H_
