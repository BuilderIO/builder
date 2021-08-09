/*
 * Copyright 2017 Google
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

#include "Firestore/core/src/local/local_documents_view.h"

#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/local/mutation_queue.h"
#include "Firestore/core/src/local/remote_document_cache.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace local {

using core::Query;
using model::Document;
using model::DocumentKey;
using model::DocumentKeySet;
using model::DocumentMap;
using model::MutableDocument;
using model::MutableDocumentMap;
using model::Mutation;
using model::MutationBatch;
using model::ResourcePath;
using model::SnapshotVersion;

const Document LocalDocumentsView::GetDocument(const DocumentKey& key) {
  std::vector<MutationBatch> batches =
      mutation_queue_->AllMutationBatchesAffectingDocumentKey(key);
  return GetDocument(key, batches);
}

Document LocalDocumentsView::GetDocument(
    const DocumentKey& key, const std::vector<MutationBatch>& batches) {
  MutableDocument document = remote_document_cache_->Get(key);
  for (const MutationBatch& batch : batches) {
    batch.ApplyToLocalDocument(document);
  }
  return Document{std::move(document)};
}

DocumentMap LocalDocumentsView::ApplyLocalMutationsToDocuments(
    MutableDocumentMap& docs, const std::vector<MutationBatch>& batches) {
  DocumentMap results;
  for (const auto& kv : docs) {
    MutableDocument local_view = kv.second;
    for (const MutationBatch& batch : batches) {
      batch.ApplyToLocalDocument(local_view);
    }
    results = results.insert(kv.first, std::move(local_view));
  }
  return results;
}

DocumentMap LocalDocumentsView::GetDocuments(const DocumentKeySet& keys) {
  MutableDocumentMap docs = remote_document_cache_->GetAll(keys);
  return GetLocalViewOfDocuments(std::move(docs));
}

DocumentMap LocalDocumentsView::GetLocalViewOfDocuments(
    MutableDocumentMap docs) {
  DocumentKeySet all_keys;
  for (const auto& kv : docs) {
    all_keys = all_keys.insert(kv.first);
  }
  std::vector<MutationBatch> batches =
      mutation_queue_->AllMutationBatchesAffectingDocumentKeys(all_keys);
  return ApplyLocalMutationsToDocuments(docs, batches);
}

DocumentMap LocalDocumentsView::GetDocumentsMatchingQuery(
    const Query& query, const model::SnapshotVersion& since_read_time) {
  if (query.IsDocumentQuery()) {
    return GetDocumentsMatchingDocumentQuery(query.path());
  } else if (query.IsCollectionGroupQuery()) {
    return GetDocumentsMatchingCollectionGroupQuery(query, since_read_time);
  } else {
    return GetDocumentsMatchingCollectionQuery(query, since_read_time);
  }
}

DocumentMap LocalDocumentsView::GetDocumentsMatchingDocumentQuery(
    const ResourcePath& doc_path) {
  DocumentMap result;
  // Just do a simple document lookup.
  Document doc = GetDocument(DocumentKey{doc_path});
  if (doc->is_found_document()) {
    result = result.insert(doc->key(), doc);
  }
  return result;
}

model::DocumentMap LocalDocumentsView::GetDocumentsMatchingCollectionGroupQuery(
    const Query& query, const SnapshotVersion& since_read_time) {
  HARD_ASSERT(
      query.path().empty(),
      "Currently we only support collection group queries at the root.");

  const std::string& collection_id = *query.collection_group();
  std::vector<ResourcePath> parents =
      index_manager_->GetCollectionParents(collection_id);
  DocumentMap results;

  // Perform a collection query against each parent that contains the
  // collection_id and aggregate the results.
  for (const ResourcePath& parent : parents) {
    Query collection_query =
        query.AsCollectionQueryAtPath(parent.Append(collection_id));
    DocumentMap collection_results =
        GetDocumentsMatchingCollectionQuery(collection_query, since_read_time);
    for (const auto& kv : collection_results) {
      const DocumentKey& key = kv.first;
      results = results.insert(key, Document(kv.second));
    }
  }
  return results;
}

DocumentMap LocalDocumentsView::GetDocumentsMatchingCollectionQuery(
    const Query& query, const SnapshotVersion& since_read_time) {
  MutableDocumentMap remote_documents =
      remote_document_cache_->GetMatching(query, since_read_time);
  // Get locally persisted mutation batches.
  std::vector<MutationBatch> matching_batches =
      mutation_queue_->AllMutationBatchesAffectingQuery(query);

  remote_documents =
      AddMissingBaseDocuments(matching_batches, std::move(remote_documents));

  for (const MutationBatch& batch : matching_batches) {
    for (const Mutation& mutation : batch.mutations()) {
      // Only process documents belonging to the collection.
      if (!query.path().IsImmediateParentOf(mutation.key().path())) {
        continue;
      }

      const DocumentKey& key = mutation.key();
      // base_doc may be unset for the documents that weren't yet written to
      // the backend.
      absl::optional<MutableDocument> document = remote_documents.get(key);
      if (!document) {
        // Create invalid document to apply mutations on top of
        document = MutableDocument::InvalidDocument(key);
      }

      mutation.ApplyToLocalView(*document, batch.local_write_time());
      remote_documents = remote_documents.insert(key, *document);
    }
  }

  // Finally, filter out any documents that don't actually match the query. Note
  // that the extra reference here prevents DocumentMap's destructor from
  // deallocating the initial unfiltered results while we're iterating over
  // them.
  DocumentMap results;
  for (const auto& kv : remote_documents) {
    const DocumentKey& key = kv.first;
    if (query.Matches(kv.second)) {
      results = results.insert(key, kv.second);
    }
  }

  return results;
}

MutableDocumentMap LocalDocumentsView::AddMissingBaseDocuments(
    const std::vector<MutationBatch>& matching_batches,
    MutableDocumentMap existing_docs) {
  DocumentKeySet missing_doc_keys;
  for (const MutationBatch& batch : matching_batches) {
    for (const Mutation& mutation : batch.mutations()) {
      const DocumentKey& key = mutation.key();
      if (mutation.type() == Mutation::Type::Patch &&
          !existing_docs.contains(key)) {
        missing_doc_keys = missing_doc_keys.insert(key);
      }
    }
  }

  MutableDocumentMap merged_docs = existing_docs;
  MutableDocumentMap missing_docs =
      remote_document_cache_->GetAll(missing_doc_keys);
  for (const auto& kv : missing_docs) {
    const MutableDocument document = kv.second;
    if (document.is_found_document()) {
      existing_docs = existing_docs.insert(kv.first, document);
    }
  }

  return existing_docs;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
