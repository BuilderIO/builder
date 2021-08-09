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
#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_ELEMENT_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_ELEMENT_H_

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Abstract class to give all elements from bundles a common type.
 */
class BundleElement {
 public:
  enum class Type { Metadata, NamedQuery, DocumentMetadata, Document };

  virtual ~BundleElement() = default;

  virtual Type element_type() const = 0;
};

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_ELEMENT_H_
