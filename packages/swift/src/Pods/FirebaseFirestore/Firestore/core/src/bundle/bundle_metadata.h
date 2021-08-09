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

#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_METADATA_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_METADATA_H_

#include <cstdint>
#include <string>
#include <utility>

#include "Firestore/core/src/bundle/bundle_element.h"
#include "Firestore/core/src/model/snapshot_version.h"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Represents Firestore bundle metadata saved by the SDK in its local storage.
 */
class BundleMetadata : public BundleElement {
 public:
  BundleMetadata() = default;

  BundleMetadata(std::string bundle_id,
                 int version,
                 model::SnapshotVersion create_time)
      : bundle_id_(std::move(bundle_id)),
        version_(version),
        create_time_(create_time) {
  }

  BundleMetadata(std::string bundle_id,
                 int version,
                 model::SnapshotVersion create_time,
                 uint32_t total_documents,
                 uint64_t total_bytes)
      : bundle_id_(std::move(bundle_id)),
        version_(version),
        create_time_(create_time),
        total_documents_(total_documents),
        total_bytes_(total_bytes) {
  }

  Type element_type() const override {
    return Type::Metadata;
  }

  /**
   * @return The ID of the bundle. It is used together with `create_time()` to
   * determine if a bundle has been loaded by the SDK.
   */
  const std::string& bundle_id() const {
    return bundle_id_;
  }

  /**
   * @return The schema version of the bundle.
   */
  uint32_t version() const {
    return version_;
  }

  /**
   * @return The snapshot version of the bundle when created by the server SDKs.
   */
  model::SnapshotVersion create_time() const {
    return create_time_;
  }

  /** @return The number of documents in the bundle. */
  uint32_t total_documents() const {
    return total_documents_;
  }

  /** @return The number of bytes of the bundle. */
  uint64_t total_bytes() const {
    return total_bytes_;
  }

 private:
  std::string bundle_id_;
  uint32_t version_ = 0;
  model::SnapshotVersion create_time_;

  uint32_t total_documents_ = 0;
  uint64_t total_bytes_ = 0;
};

inline bool operator==(const BundleMetadata& lhs, const BundleMetadata& rhs) {
  return lhs.bundle_id() == rhs.bundle_id() && lhs.version() == rhs.version() &&
         lhs.create_time() == rhs.create_time() &&
         lhs.total_documents() == rhs.total_documents() &&
         lhs.total_bytes() == rhs.total_bytes();
}

inline bool operator!=(const BundleMetadata& lhs, const BundleMetadata& rhs) {
  return !(lhs == rhs);
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_METADATA_H_
