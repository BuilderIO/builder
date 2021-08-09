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

#include "Firestore/core/src/api/query_snapshot.h"

#include <utility>

#include "Firestore/core/src/api/document_change.h"
#include "Firestore/core/src/api/document_snapshot.h"
#include "Firestore/core/src/api/query_core.h"
#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace api {

using api::Firestore;
using core::DocumentViewChange;
using core::ViewSnapshot;
using model::Document;
using model::DocumentComparator;
using model::DocumentSet;
using util::ThrowInvalidArgument;

QuerySnapshot::QuerySnapshot(std::shared_ptr<Firestore> firestore,
                             core::Query query,
                             core::ViewSnapshot&& snapshot,
                             SnapshotMetadata metadata)
    : firestore_(std::move(firestore)),
      internal_query_(std::move(query)),
      snapshot_(std::move(snapshot)),
      metadata_(std::move(metadata)) {
}

Query QuerySnapshot::query() const {
  return Query(internal_query_, firestore_);
}

const core::Query& QuerySnapshot::internal_query() const {
  return internal_query_;
}

bool operator==(const QuerySnapshot& lhs, const QuerySnapshot& rhs) {
  return lhs.firestore_ == rhs.firestore_ &&
         lhs.internal_query_ == rhs.internal_query_ &&
         lhs.snapshot_ == rhs.snapshot_ && lhs.metadata_ == rhs.metadata_;
}

size_t QuerySnapshot::Hash() const {
  return util::Hash(firestore_.get(), internal_query_, snapshot_, metadata_);
}

void QuerySnapshot::ForEachDocument(
    const std::function<void(DocumentSnapshot)>& callback) const {
  DocumentSet document_set = snapshot_.documents();
  bool from_cache = metadata_.from_cache();

  for (const Document& document : document_set) {
    bool has_pending_writes =
        snapshot_.mutated_keys().contains(document->key());
    auto snap = DocumentSnapshot::FromDocument(
        firestore_, document, SnapshotMetadata(has_pending_writes, from_cache));
    callback(std::move(snap));
  }
}

static DocumentChange::Type DocumentChangeTypeForChange(
    const DocumentViewChange& change) {
  switch (change.type()) {
    case DocumentViewChange::Type::Added:
      return DocumentChange::Type::Added;
    case DocumentViewChange::Type::Modified:
    case DocumentViewChange::Type::Metadata:
      return DocumentChange::Type::Modified;
    case DocumentViewChange::Type::Removed:
      return DocumentChange::Type::Removed;
  }

  HARD_FAIL("Unknown DocumentViewChange::Type: %s", change.type());
}

void QuerySnapshot::ForEachChange(
    bool include_metadata_changes,
    const std::function<void(DocumentChange)>& callback) const {
  if (include_metadata_changes && snapshot_.excludes_metadata_changes()) {
    ThrowInvalidArgument(
        "To include metadata changes with your document "
        "changes, you must call "
        "addSnapshotListener(includeMetadataChanges:true).");
  }

  if (snapshot_.old_documents().empty()) {
    // Special case the first snapshot because index calculation is easy and
    // fast. Also all changes on the first snapshot are adds so there are also
    // no metadata-only changes to filter out.
    DocumentComparator doc_comparator = snapshot_.query().Comparator();
    absl::optional<Document> last_document;
    size_t index = 0;
    for (const DocumentViewChange& change : snapshot_.document_changes()) {
      const Document& doc = change.document();
      SnapshotMetadata metadata(
          /*pending_writes=*/snapshot_.mutated_keys().contains(doc->key()),
          /*from_cache=*/snapshot_.from_cache());
      auto document =
          DocumentSnapshot::FromDocument(firestore_, doc, std::move(metadata));

      HARD_ASSERT(change.type() == DocumentViewChange::Type::Added,
                  "Invalid event type for first snapshot");
      HARD_ASSERT(!last_document || util::Ascending(doc_comparator.Compare(
                                        *last_document, change.document())),
                  "Got added events in wrong order");

      callback(DocumentChange(DocumentChange::Type::Added, std::move(document),
                              DocumentChange::npos, index++));
      last_document = doc;
    }

  } else {
    // A DocumentSet that is updated incrementally as changes are applied to use
    // to lookup the index of a document.
    DocumentSet index_tracker = snapshot_.old_documents();
    for (const DocumentViewChange& change : snapshot_.document_changes()) {
      if (!include_metadata_changes &&
          change.type() == DocumentViewChange::Type::Metadata) {
        continue;
      }

      const Document& doc = change.document();
      SnapshotMetadata metadata(
          /*pending_writes=*/snapshot_.mutated_keys().contains(doc->key()),
          /*from_cache=*/snapshot_.from_cache());
      auto document = DocumentSnapshot::FromDocument(firestore_, doc, metadata);

      size_t old_index = DocumentChange::npos;
      size_t new_index = DocumentChange::npos;
      if (change.type() != DocumentViewChange::Type::Added) {
        old_index = index_tracker.IndexOf(change.document()->key());
        HARD_ASSERT(old_index != DocumentSet::npos,
                    "Index for document not found");
        index_tracker = index_tracker.erase(change.document()->key());
      }
      if (change.type() != DocumentViewChange::Type::Removed) {
        index_tracker = index_tracker.insert(change.document());
        new_index = index_tracker.IndexOf(change.document()->key());
      }

      DocumentChange::Type type = DocumentChangeTypeForChange(change);
      callback(DocumentChange(type, std::move(document), old_index, new_index));
    }
  }
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
