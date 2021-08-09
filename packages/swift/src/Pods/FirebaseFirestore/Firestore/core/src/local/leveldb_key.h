/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_KEY_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_KEY_H_

#include <string>

#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/types.h"
#include "absl/strings/string_view.h"
#include "leveldb/slice.h"

namespace firebase {
namespace firestore {
namespace local {

// Utilities for encoding and decoding LevelDB row keys and key prefixes.
//
// LevelDB keys are strings, so all the routines in here operate on strings to
// be able to produce and consume leveldb APIs directly.
//
// All leveldb logical tables should have their keys structures described in
// this file.
//
// mutations:
//   - table_name: string = "mutation"
//   - user_id: string
//   - batch_id: model::BatchId
//
// document_mutations:
//   - table_name: string = "document_mutation"
//   - user_id: string
//   - path: ResourcePath
//   - batch_id: model::BatchId
//
// mutation_queues:
//   - table_name: string = "mutation_queue"
//   - user_id: string
//
// targets:
//   - table_name: string = "target"
//   - target_id: model::TargetId
//
// target_globals:
//   - table_name: string = "target_global"
//
// query_targets:
//   - table_name: string = "query_target"
//   - canonical_id: string
//   - target_id: model::TargetId
//
// target_documents:
//   - table_name: string = "target_document"
//   - target_id: model::TargetId
//   - path: ResourcePath
//
// document_targets:
//   - table_name: string = "document_target"
//   - path: ResourcePath
//   - target_id: model::TargetId
//
// remote_documents:
//   - table_name: string = "remote_document"
//   - path: ResourcePath
//
// collection_parents:
//   - table_name: string = "collection_parent"
//   - collectionId: string
//   - parent: ResourcePath
//
// remote_document_read_time:
//   - table_name: string = "remote_document_read_time"
//   - collection: ResourcePath
//   - read_time: SnapshotVersion
//   - document_id: string
//
// bundles:
//   - table_name: string = "bundles"
//   - bundle_id: string
//
// named_queries:
//   - table_name: string = "named_queries"
//   - name: string

/**
 * Parses the given key and returns a human readable description of its
 * contents, suitable for error messages and logging.
 */
std::string DescribeKey(leveldb::Slice key);
std::string DescribeKey(absl::string_view key);
std::string DescribeKey(const std::string& key);
std::string DescribeKey(const char* key);

/** A key to a singleton row storing the version of the schema. */
class LevelDbVersionKey {
 public:
  /**
   * Returns the key pointing to the singleton row storing the schema version.
   */
  static std::string Key();
};

/** A key in the mutations table. */
class LevelDbMutationKey {
 public:
  /**
   * Creates a key prefix that points just before the first key in the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key prefix that points just before the first key for the given
   * user_id.
   */
  static std::string KeyPrefix(absl::string_view user_id);

  /** Creates a complete key that points to a specific user_id and batch_id. */
  static std::string Key(absl::string_view user_id, model::BatchId batch_id);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The user that owns the mutation batches. */
  const std::string& user_id() const {
    return user_id_;
  }

  /** The batch_id of the batch. */
  model::BatchId batch_id() const {
    return batch_id_;
  }

 private:
  std::string user_id_;
  model::BatchId batch_id_ = model::kBatchIdUnknown;
};

/**
 * A key in the document mutations index, which stores the batches in which
 * documents are mutated.
 */
class LevelDbDocumentMutationKey {
 public:
  /**
   * Creates a key prefix that points just before the first key in the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key prefix that points just before the first key for the given
   * user_id.
   */
  static std::string KeyPrefix(absl::string_view user_id);

  /**
   * Creates a key prefix that points just before the first key for the user_id
   * and resource path.
   *
   * Note that this uses a ResourcePath rather than an DocumentKey in order to
   * allow prefix scans over a collection. However a naive scan over those
   * results isn't useful since it would match both immediate children of the
   * collection and any subcollections.
   */
  static std::string KeyPrefix(absl::string_view user_id,
                               const model::ResourcePath& resource_path);

  /**
   * Creates a complete key that points to a specific user_id, document key,
   * and batch_id.
   */
  static std::string Key(absl::string_view user_id,
                         const model::DocumentKey& document_key,
                         model::BatchId batch_id);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The user that owns the mutation batches. */
  const std::string& user_id() const {
    return user_id_;
  }

  /** The path to the document, as encoded in the key. */
  const model::DocumentKey& document_key() const {
    return document_key_;
  }

  /** The batch_id in which the document participates. */
  model::BatchId batch_id() const {
    return batch_id_;
  }

 private:
  std::string user_id_;
  model::DocumentKey document_key_;
  model::BatchId batch_id_ = model::kBatchIdUnknown;
};

/**
 * A key in the mutation_queues table.
 *
 * Note that where `mutation_queues` table contains one row about each queue,
 * the `mutations` table contains the actual mutation batches themselves.
 */
class LevelDbMutationQueueKey {
 public:
  /**
   * Creates a key prefix that points just before the first key in the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a complete key that points to a specific mutation queue entry for
   * the given user_id.
   */
  static std::string Key(absl::string_view user_id);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  const std::string& user_id() const {
    return user_id_;
  }

 private:
  // Deliberately uninitialized: will be assigned in Decode
  std::string user_id_;
};

/**
 * A key in the target globals table, a record of global values across all
 * targets.
 */
class LevelDbTargetGlobalKey {
 public:
  /** Creates a key that points to the single target global row. */
  static std::string Key();

  /**
   * Decodes the contents of a target global key, essentially just verifying
   * that the key has the correct table name.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(leveldb::Slice key);
};

/** A key in the targets table. */
class LevelDbTargetKey {
 public:
  /**
   * Creates a key prefix that points just before the first key in the table.
   */
  static std::string KeyPrefix();

  /** Creates a complete key that points to a specific target, by target_id. */
  static std::string Key(model::TargetId target_id);

  /**
   * Decodes the contents of a target key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(leveldb::Slice key);

  model::TargetId target_id() {
    return target_id_;
  }

 private:
  model::TargetId target_id_ = 0;
};

/**
 * A key in the query targets table, an index of canonical_ids to the targets
 * they may match. This is not a unique mapping because canonical_id does not
 * promise a unique name for all possible queries.
 */
class LevelDbQueryTargetKey {
 public:
  /**
   * Creates a key that contains just the query targets table prefix and points
   * just before the first key.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key that points to the first query-target association for a
   * canonical_id.
   */
  static std::string KeyPrefix(absl::string_view canonical_id);

  /** Creates a key that points to a specific query-target entry. */
  static std::string Key(absl::string_view canonical_id,
                         model::TargetId target_id);

  /**
   * Decodes the contents of a query target key, storing the decoded values in
   * this instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The canonical_id derived from the query. */
  const std::string& canonical_id() const {
    return canonical_id_;
  }

  /** The target_id identifying a target. */
  model::TargetId target_id() const {
    return target_id_;
  }

 private:
  // Deliberately uninitialized: will be assigned in Decode
  std::string canonical_id_;
  model::TargetId target_id_ = 0;
};

/**
 * A key in the target documents table, an index of target_ids to the documents
 * they contain.
 */
class LevelDbTargetDocumentKey {
 public:
  /**
   * Creates a key that contains just the target documents table prefix and
   * points just before the first key.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key that points to the first target-document association for a
   * target_id.
   */
  static std::string KeyPrefix(model::TargetId target_id);

  /** Creates a key that points to a specific target-document entry. */
  static std::string Key(model::TargetId target_id,
                         const model::DocumentKey& document_key);

  /**
   * Decodes the contents of a target document key, storing the decoded values
   * in this instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The target_id identifying a target. */
  model::TargetId target_id() {
    return target_id_;
  }

  /** The path to the document, as encoded in the key. */
  const model::DocumentKey& document_key() {
    return document_key_;
  }

 private:
  // Deliberately uninitialized: will be assigned in Decode
  model::TargetId target_id_ = 0;
  model::DocumentKey document_key_;
};

/**
 * A key in the document targets table, an index from documents to the targets
 * that contain them.
 */
class LevelDbDocumentTargetKey {
 public:
  /**
   * Creates a key that contains just the document targets table prefix and
   * points just before the first key.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key that points to the first document-target association for
   * document.
   */
  static std::string KeyPrefix(const model::ResourcePath& resource_path);

  /** Creates a key that points to a specific document-target entry. */
  static std::string Key(const model::DocumentKey& document_key,
                         model::TargetId target_id);

  /**
   * Creates a key that points to the sentinel row for the given document: a
   * document-target entry with a special, invalid target_id.
   */
  static std::string SentinelKey(const model::DocumentKey& document_key);

  /**
   * Given a sequence number, encodes it for storage in a sentinel row.
   */
  static std::string EncodeSentinelValue(
      model::ListenSequenceNumber sequence_number);

  /**
   * Given an encoded sentinel row, return the sequence number.
   */
  static model::ListenSequenceNumber DecodeSentinelValue(
      absl::string_view slice);

  /**
   * Decodes the contents of a document target key, storing the decoded values
   * in this instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The target_id identifying a target. */
  model::TargetId target_id() const {
    return target_id_;
  }

  /**
   * Returns true if the target_id in this row is a sentintel target ID.
   */
  bool IsSentinel() {
    return target_id_ == kInvalidTargetId;
  }

  /** The path to the document, as encoded in the key. */
  const model::DocumentKey& document_key() const {
    return document_key_;
  }

 private:
  // Used for sentinel row for a document in the document target index. No
  // target has the ID 0, and it will sort first in the list of targets for a
  // document.
  static constexpr model::TargetId kInvalidTargetId = 0;

  // Deliberately uninitialized: will be assigned in Decode
  model::TargetId target_id_;
  model::DocumentKey document_key_;
};

/** A key in the remote documents table. */
class LevelDbRemoteDocumentKey {
 public:
  /**
   * Creates a key that contains just the remote documents table prefix and
   * points just before the first remote document key.
   */
  static std::string KeyPrefix();

  /**
   * Creates a complete key that points to a specific document. The document_key
   * must have an even number of path segments.
   */
  static std::string Key(const model::DocumentKey& document_key);

  /**
   * Creates a key prefix that contains a part of a document path. Odd numbers
   * of segments create a collection key prefix, while an even number of
   * segments create a document key prefix. Note that a document key prefix will
   * match the document itself and any documents that exist in its
   * subcollections.
   */
  static std::string KeyPrefix(const model::ResourcePath& resource_path);

  /**
   * Decodes the contents of a remote document key, storing the decoded values
   * in this instance. This can only decode complete document paths (i.e. the
   * result of Key()).
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The path to the document, as encoded in the key. */
  const model::DocumentKey& document_key() const {
    return document_key_;
  }

 private:
  // Deliberately uninitialized: will be assigned in Decode
  model::DocumentKey document_key_;
};

/**
 * A key in the collection parents index, which stores an association between a
 * Collection ID (e.g. 'messages') to a parent path (e.g. '/chats/123') that
 * contains it as a (sub)collection. This is used to efficiently find all
 * collections to query when performing a Collection Group query. Note that the
 * parent path will be an empty path in the case of root-level collections.
 */
class LevelDbCollectionParentKey {
 public:
  /**
   * Creates a key prefix that points just before the first key in the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key prefix that points just before the first key for the given
   * collection_id.
   */
  static std::string KeyPrefix(absl::string_view collection_id);

  /**
   * Creates a complete key that points to a specific collection_id and parent.
   */
  static std::string Key(absl::string_view collection_id,
                         const model::ResourcePath& parent);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The collection_id, as encoded in the key. */
  const std::string& collection_id() const {
    return collection_id_;
  }

  /** The parent path, as encoded in the key. */
  const model::ResourcePath& parent() const {
    return parent_;
  }

 private:
  // Deliberately uninitialized: will be assigned in Decode
  std::string collection_id_;
  model::ResourcePath parent_;
};

/**
 * A key in the remote documents read time table, storing the collection path,
 * read time and document ID for each entry.
 */
class LevelDbRemoteDocumentReadTimeKey {
 public:
  /**
   * Creates a key prefix that points just before the first key for the given
   * collection_path and read_time.
   */
  static std::string KeyPrefix(const model::ResourcePath& collection_path,
                               model::SnapshotVersion read_time);

  /**
   * Creates a key that points to the key for the given collection_path,
   * read_time and document_id.
   */
  static std::string Key(const model::ResourcePath& collection_path,
                         model::SnapshotVersion read_time,
                         absl::string_view document_id);
  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The collection path for this entry. */
  const model::ResourcePath& collection_path() const {
    return collection_path_;
  }

  /** The read time for for this entry. */
  model::SnapshotVersion read_time() const {
    return read_time_;
  }

  /** The document ID for this entry. */
  const std::string& document_id() const {
    return document_id_;
  }

 private:
  std::string document_id_;
  model::ResourcePath collection_path_;
  model::SnapshotVersion read_time_;
};

/**
 * A key in the bundles table, storing the bundle Id for each entry.
 */
class LevelDbBundleKey {
 public:
  /**
   * Creates a key prefix that points just before the first key of the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key that points to the key for the given bundle id.
   */
  static std::string Key(absl::string_view bundle_id);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The bundle ID for this entry. */
  const std::string& bundle_id() const {
    return bundle_id_;
  }

 private:
  std::string bundle_id_;
};

/**
 * A key in the named_queries table, storing the query name for each entry.
 */
class LevelDbNamedQueryKey {
 public:
  /**
   * Creates a key prefix that points just before the first key of the table.
   */
  static std::string KeyPrefix();

  /**
   * Creates a key that points to the key for the given query name.
   */
  static std::string Key(absl::string_view query_name);

  /**
   * Decodes the given complete key, storing the decoded values in this
   * instance.
   *
   * @return true if the key successfully decoded, false otherwise. If false is
   * returned, this instance is in an undefined state until the next call to
   * `Decode()`.
   */
  ABSL_MUST_USE_RESULT
  bool Decode(absl::string_view key);

  /** The query name for this entry. */
  const std::string& name() const {
    return name_;
  }

 private:
  std::string name_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_KEY_H_
