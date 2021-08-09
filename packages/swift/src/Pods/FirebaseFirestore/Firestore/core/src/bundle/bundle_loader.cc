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

#include "Firestore/core/src/bundle/bundle_loader.h"

#include <memory>
#include <unordered_map>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/api/load_bundle_task.h"
#include "Firestore/core/src/bundle/bundle_document.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/mutable_document.h"

namespace firebase {
namespace firestore {
namespace bundle {

using firestore::Error;
using firestore::api::LoadBundleTaskProgress;
using firestore::api::LoadBundleTaskState;
using model::DocumentKeySet;
using model::DocumentMap;
using model::MutableDocument;
using util::Status;
using util::StatusOr;

Status BundleLoader::AddElementInternal(const BundleElement& element) {
  HARD_ASSERT(element.element_type() != BundleElement::Type::Metadata,
              "Unexpected bundle metadata element.");

  switch (element.element_type()) {
    case BundleElement::Type::NamedQuery: {
      queries_.push_back(static_cast<const NamedQuery&>(element));
      break;
    }

    case BundleElement::Type::DocumentMetadata: {
      const auto& document_metadata =
          static_cast<const BundledDocumentMetadata&>(element);
      current_document_ = document_metadata.key();
      documents_metadata_.emplace(document_metadata.key(), document_metadata);

      if (!document_metadata.exists()) {
        documents_ = documents_.insert(
            document_metadata.key(),
            MutableDocument::NoDocument(document_metadata.key(),
                                        document_metadata.read_time()));
        current_document_ = absl::nullopt;
      }
      break;
    }

    case BundleElement::Type::Document: {
      const auto& document = static_cast<const BundleDocument&>(element);
      if (!current_document_.has_value() ||
          document.key() != current_document_.value()) {
        return {Status(
            Error::kErrorInvalidArgument,
            "The document being added does not match the stored metadata.")};
      }

      documents_ = documents_.insert(document.key(), document.document());
      current_document_ = absl::nullopt;
      break;
    }

    default:
      // It is impossible to reach here, because Type::Metadata is checked at
      // the beginning of the method.
      UNREACHABLE();
  }

  return Status::OK();
}

StatusOr<absl::optional<LoadBundleTaskProgress>> BundleLoader::AddElement(
    std::unique_ptr<BundleElement> element_ptr, uint64_t byte_size) {
  HARD_ASSERT(element_ptr->element_type() != BundleElement::Type::Metadata,
              "Unexpected bundle metadata element.");

  auto before_count = documents_.size();

  auto result = AddElementInternal(*element_ptr);
  if (!result.ok()) {
    return result;
  }

  bytes_loaded_ += byte_size;

  // Document has only been partially loaded, no progress to report.
  if (before_count == documents_.size()) {
    return {absl::nullopt};
  }

  LoadBundleTaskProgress progress{
      documents_.size(), metadata_.total_documents(), bytes_loaded_,
      metadata_.total_bytes(), LoadBundleTaskState::kInProgress};
  return {absl::make_optional(std::move(progress))};
}

StatusOr<DocumentMap> BundleLoader::ApplyChanges() {
  if (current_document_ != absl::nullopt) {
    return StatusOr<DocumentMap>(
        Status(Error::kErrorInvalidArgument,
               "Bundled documents end with a document metadata "
               "element instead of a document."));
  }
  if (metadata_.total_documents() != documents_.size()) {
    return StatusOr<DocumentMap>(
        Status(Error::kErrorInvalidArgument,
               "Loaded documents count is not the same as in metadata."));
  }

  auto changes =
      callback_->ApplyBundledDocuments(documents_, metadata_.bundle_id());
  auto query_document_map = GetQueryDocumentMapping();
  for (const auto& named_query : queries_) {
    const auto& matching_keys = query_document_map[named_query.query_name()];
    callback_->SaveNamedQuery(named_query, matching_keys);
  }

  callback_->SaveBundle(metadata_);

  return changes;
}

std::unordered_map<std::string, DocumentKeySet>
BundleLoader::GetQueryDocumentMapping() {
  std::unordered_map<std::string, DocumentKeySet> result;
  for (const auto& named_query : queries_) {
    result.emplace(named_query.query_name(), DocumentKeySet{});
  }

  for (const auto& doc_metadata : documents_metadata_) {
    const auto& metadata = doc_metadata.second;
    for (const auto& query : doc_metadata.second.queries()) {
      auto inserted = result[query].insert(metadata.key());
      result[query] = std::move(inserted);
    }
  }

  return result;
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase
