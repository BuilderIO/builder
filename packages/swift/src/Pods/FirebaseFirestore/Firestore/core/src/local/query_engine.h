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

#ifndef FIRESTORE_CORE_SRC_LOCAL_QUERY_ENGINE_H_
#define FIRESTORE_CORE_SRC_LOCAL_QUERY_ENGINE_H_

#include "Firestore/core/src/model/model_fwd.h"

namespace firebase {
namespace firestore {

namespace core {
class Query;
enum class LimitType;
}  // namespace core

namespace local {

class LocalDocumentsView;

/**
 * A query engine that takes advantage of the target document mapping in the
 * TargetCache. Query execution is optimizes by only reading the documents that
 * previously matched a query plus any documents that were edited after the
 * query was last listened to.
 *
 * There are some cases where Index-Free queries are not guaranteed to
 * produce the same results as full collection scans. In these cases, the
 * query processing falls back to full scans. These cases are:
 *
 * - Limit queries where a document that matched the query previously no
 *   longer matches the query.
 * - Limit queries where a document edit may cause the document to sort below
 *   another document that is in the local cache.
 * - Queries that have never been CURRENT or free of limbo documents.
 */
class QueryEngine {
 public:
  virtual ~QueryEngine() = default;

  /**
   * Sets the document view to query against.
   *
   * The caller owns the LocalDocumentView and must ensure that it outlives the
   * QueryEngine.
   */
  virtual void SetLocalDocumentsView(LocalDocumentsView* local_documents) {
    local_documents_view_ = local_documents;
  }

  /** Returns all local documents matching the specified query. */
  model::DocumentMap GetDocumentsMatchingQuery(
      const core::Query& query,
      const model::SnapshotVersion& last_limbo_free_snapshot_version,
      const model::DocumentKeySet& remote_keys);

 private:
  /** Applies the query filter and sorting to the provided documents. */
  model::DocumentSet ApplyQuery(const core::Query& query,
                                const model::DocumentMap& documents) const;

  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param limit_type The type of limit query for refill calculation.
   * @param sorted_previous_results The documents that matched the query when it
   *     was last synchronized, sorted by the query's comparator.
   * @param remote_keys The document keys that matched the query at the last
   *     snapshot.
   * @param limbo_free_snapshot_version The version of the snapshot when the
   *     query was last synchronized.
   */
  bool NeedsRefill(
      core::LimitType limit_type,
      const model::DocumentSet& sorted_previous_results,
      const model::DocumentKeySet& remote_keys,
      const model::SnapshotVersion& limbo_free_snapshot_version) const;

  model::DocumentMap ExecuteFullCollectionScan(const core::Query& query);

  LocalDocumentsView* local_documents_view_ = nullptr;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_QUERY_ENGINE_H_
