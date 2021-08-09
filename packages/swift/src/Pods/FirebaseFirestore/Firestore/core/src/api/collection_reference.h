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

#ifndef FIRESTORE_CORE_SRC_API_COLLECTION_REFERENCE_H_
#define FIRESTORE_CORE_SRC_API_COLLECTION_REFERENCE_H_

#include <memory>
#include <string>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/api/query_core.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace model {
class ResourcePath;
}  // namespace model

namespace api {

/**
 * A `CollectionReference` object can be used for adding documents, getting
 * document references, and querying for documents (using the methods inherited
 * from `Query`).
 */
class CollectionReference : public Query {
 public:
  CollectionReference() = default;
  CollectionReference(model::ResourcePath path,
                      std::shared_ptr<Firestore> firestore);

  /** ID of the referenced collection. */
  const std::string& collection_id() const;

  /**
   * For subcollections, `parent` returns the containing `DocumentReference`.
   * For root collections, nullopt is returned.
   */
  absl::optional<DocumentReference> parent() const;

  /**
   * A string containing the slash-separated path to this `CollectionReference`
   * (relative to the root of the database).
   */
  std::string path() const;

  /**
   * Returns a `DocumentReference` pointing to a new document with an
   * auto-generated ID.
   */
  DocumentReference Document() const;

  /**
   * Gets a `DocumentReference` referring to the document at the specified path,
   * relative to this collection's own path.
   *
   * @param document_path The slash-separated relative path of the document for
   * which to get a `DocumentReference`.
   *
   * @return The `DocumentReference` for the specified document path.
   */
  DocumentReference Document(const std::string& document_path) const;

  /**
   * Add a new document to this collection with the specified data, assigning it
   * a document ID automatically.
   *
   * @param data A `ParsedSetData` containing the data for the new document.
   * @param callback A callback to execute once the document has been
   *     successfully written to the server. This callback will not be called
   *     while the client is offline, though local changes will be visible
   *     immediately.
   *
   * @return A `DocumentReference` pointing to the newly created document.
   */
  DocumentReference AddDocument(core::ParsedSetData&& data,
                                util::StatusCallback callback) const;

  size_t Hash() const;
};

bool operator==(const CollectionReference& lhs, const CollectionReference& rhs);

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_COLLECTION_REFERENCE_H_
