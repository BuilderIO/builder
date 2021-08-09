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
#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_CALLBACK_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_CALLBACK_H_

#include <string>

#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Interface implemented by components that can apply changes from a bundle to
 * local storage.
 */
class BundleCallback {
 public:
  virtual ~BundleCallback() = default;

  /**
   * Applies the documents from a bundle to the "ground-state" (remote)
   * documents.
   *
   * Local documents are re-calculated if there are remaining mutations in the
   * queue.
   */
  virtual model::DocumentMap ApplyBundledDocuments(
      const model::MutableDocumentMap& documents,
      const std::string& bundle_id) = 0;

  /** Saves the given NamedQuery to local persistence. */
  virtual void SaveNamedQuery(const NamedQuery& query,
                              const model::DocumentKeySet& keys) = 0;

  /** Saves the given BundleMetadata to local persistence. */
  virtual void SaveBundle(const BundleMetadata& metadata) = 0;
};

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_CALLBACK_H_
