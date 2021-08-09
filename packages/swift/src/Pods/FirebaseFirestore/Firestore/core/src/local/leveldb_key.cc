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

#include "Firestore/core/src/local/leveldb_key.h"

#include <utility>
#include <vector>

#include "Firestore/core/src/local/leveldb_util.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/util/ordered_code.h"
#include "absl/base/attributes.h"
#include "absl/strings/escaping.h"
#include "absl/strings/str_cat.h"

using firebase::firestore::model::DocumentKey;
using firebase::firestore::model::ResourcePath;
using firebase::firestore::util::OrderedCode;

namespace firebase {
namespace firestore {
namespace local {

namespace {

const char* kVersionGlobalTable = "version";
const char* kMutationsTable = "mutation";
const char* kDocumentMutationsTable = "document_mutation";
const char* kMutationQueuesTable = "mutation_queue";
const char* kTargetGlobalTable = "target_global";
const char* kTargetsTable = "target";
const char* kQueryTargetsTable = "query_target";
const char* kTargetDocumentsTable = "target_document";
const char* kDocumentTargetsTable = "document_target";
const char* kRemoteDocumentsTable = "remote_document";
const char* kCollectionParentsTable = "collection_parent";
const char* kRemoteDocumentReadTimeTable = "remote_document_read_time";
const char* kBundlesTable = "bundles";
const char* kNamedQueriesTable = "named_queries";

/**
 * Labels for the components of keys. These serve to make keys self-describing.
 *
 * These are intended to sort similarly to keys in the server storage format.
 *
 * Note that the server writes component labels using the equivalent to
 * OrderedCode::WriteSignedNumDecreasing. This means that despite the higher
 * numeric value, a terminator sorts before a path segment. In order to avoid
 * needing the WriteSignedNumDecreasing code just for these values, this enum's
 * values are in the reverse order to the server side.
 *
 * Most server-side values don't apply here. For example, the server embeds
 * projects, databases, namespaces and similar values in its entity keys where
 * the clients just open a different leveldb. Similarly, many of these values
 * don't apply to the server since the server is backed by spanner which
 * natively has concepts of tables and indexes. Where there's overlap, a comment
 * denotes the server value from the storage_format_internal.proto.
 */
enum ComponentLabel {
  /**
   * A terminator is the final component of a key. All complete keys have a
   * terminator and a key is known to be a key prefix if it doesn't have a
   * terminator.
   */
  Terminator = 0,  // TERMINATOR_COMPONENT = 63, server-side

  /**
   * A table name component names the logical table to which the key belongs.
   */
  TableName = 5,

  /** A component containing the batch Id of a mutation. */
  BatchId = 10,

  /** A component containing the canonical Id of a query. */
  CanonicalId = 11,

  /** A component containing the target Id of a query. */
  TargetId = 12,

  /** A component containing a user Id. */
  UserId = 13,

  /**
   * A component containing a standalone collection ID (e.g. as used by the
   * collection_parent table, but not for collection IDs within paths).
   */
  CollectionId = 14,

  /**
   * A component containing a standalone document ID (as used by the
   * remote_document_read_time table).
   */
  DocumentId = 15,

  /** A component containing a snapshot version. */
  SnapshotVersion = 16,

  /** A component containing a Firestore bundle id. */
  BundleId = 17,

  /** A component containing the name of a named query. */
  QueryName = 18,

  /**
   * A path segment describes just a single segment in a resource path. Path
   * segments that occur sequentially in a key represent successive segments in
   * a single path.
   *
   * This value must be greater than ComponentLabel::Terminator to ensure that
   * longer paths sort after paths that are prefixes of them.
   *
   * This value must also be larger than other separators so that path suffixes
   * sort after other key components.
   */
  PathSegment = 62,  // PATH = 60, server-side

  /**
   * The maximum value that can be encoded by WriteSignedNumIncreasing in a
   * single byte.
   */
  Unknown = 63,
};

/**
 * A helper for reading through the string form of a LevelDB key, as written
 * by Writer.
 */
class Reader {
 public:
  explicit Reader(leveldb::Slice src) : src_(src), ok_(true) {
  }

  explicit Reader(absl::string_view src) : Reader{MakeSlice(src)} {
  }

  /** Returns true if the Reader has encountered no errors. */
  bool ok() const {
    return ok_;
  }

  /** Returns true if the Reader has no more bytes to read. */
  bool empty() const {
    return !ok_ || src_.empty();
  }

  /**
   * Parses the components of the key and returns a string description of them.
   */
  std::string Describe();

  void ReadTableNameMatching(const char* expected_table_name) {
    if (!ReadLabeledStringMatching(ComponentLabel::TableName,
                                   expected_table_name)) {
      Fail();
    }
  }

  model::BatchId ReadBatchId() {
    return ReadLabeledInt32(ComponentLabel::BatchId);
  }

  std::string ReadCanonicalId() {
    return ReadLabeledString(ComponentLabel::CanonicalId);
  }

  model::TargetId ReadTargetId() {
    return ReadLabeledInt32(ComponentLabel::TargetId);
  }

  std::string ReadUserId() {
    return ReadLabeledString(ComponentLabel::UserId);
  }

  std::string ReadCollectionId() {
    return ReadLabeledString(ComponentLabel::CollectionId);
  }

  std::string ReadDocumentId() {
    return ReadLabeledString(ComponentLabel::DocumentId);
  }

  std::string ReadBundleId() {
    return ReadLabeledString(ComponentLabel::BundleId);
  }

  std::string ReadQueryName() {
    return ReadLabeledString(ComponentLabel::QueryName);
  }

  /**
   * Reads a snapshot version, encoded as a component label and a pair of
   * seconds (int64) and nanoseconds (int32).
   */
  model::SnapshotVersion ReadSnapshotVersion();

  /**
   * Reads component labels and strings from the key until it finds a component
   * label other than ComponentLabel::PathSegment (or the key is exhausted).
   * All matched path segments are assembled into a ResourcePath.
   */
  ResourcePath ReadResourcePath();

  /**
   * Reads component labels and strings from the key until it finds a component
   * label other than ComponentLabel::PathSegment (or the key is exhausted).
   * All matched path segments are assembled into a ResourcePath and wrapped in
   * a DocumentKey.
   *
   * If the read is unsuccessful or the document key is invalid, returns a
   * default DocumentKey and fails the Reader.
   *
   * Otherwise returns the decoded DocumentKey and the Reader advances to the
   * next unread byte.
   */
  DocumentKey ReadDocumentKey();

  /**
   * Reads a terminator component from the key.
   *
   * If the read is unsuccessful or the component wasn't a Terminator, fails
   * the Reader.
   *
   * Otherwise the Reader advances to the next unread byte (which for valid
   * keys should make the Reader empty).
   */
  void ReadTerminator() {
    if (!ReadComponentLabelMatching(ComponentLabel::Terminator)) {
      Fail();
    }
  }

 private:
  /** OrderedCode::ReadSignedNumIncreasing adapted to leveldb::Slice. */
  int64_t ReadSignedNumIncreasing() {
    if (ok_) {
      int64_t result = 0;
      absl::string_view tmp = MakeStringView(src_);
      if (OrderedCode::ReadSignedNumIncreasing(&tmp, &result)) {
        src_ = MakeSlice(tmp);
        return result;
      }
    }

    Fail();
    return 0;
  }

  /** OrderedCode::ReadString adapted to leveldb::Slice. */
  std::string ReadString() {
    if (ok_) {
      std::string result;
      absl::string_view tmp = MakeStringView(src_);
      if (OrderedCode::ReadString(&tmp, &result)) {
        src_ = MakeSlice(tmp);
        return result;
      }
    }

    Fail();
    return "";
  }

  /**
   * Reads a component label from the key.
   *
   * If the read is unsuccessful, returns ComponentLabel::Unknown and fails the
   * Reader.
   *
   * Otherwise, returns the ComponentLabel and advances the Reader to the next
   * unread byte.
   */
  ComponentLabel ReadComponentLabel() {
    if (ok_) {
      int64_t raw_result = ReadSignedNumIncreasing();
      if (ok_ && raw_result >= ComponentLabel::Terminator &&
          raw_result <= ComponentLabel::Unknown) {
        return static_cast<ComponentLabel>(raw_result);
      }
    }

    Fail();
    return ComponentLabel::Unknown;
  }

  /**
   * Reads a component label from the key.
   *
   * If the read is unsuccessful, returns false, and fails the Reader.
   *
   * Otherwise returns whether or not the component label is equal to the
   * `expected_label` and advances the Reader to the next unread byte.
   */
  ABSL_MUST_USE_RESULT
  bool ReadComponentLabelMatching(ComponentLabel expected_label) {
    if (ok_) {
      int64_t raw_result = ReadSignedNumIncreasing();
      if (ok_) {
        // Note: mismatch of a component label is not necessarily a failure.
        // It's treated as a potential branch point within the parser.
        return raw_result == expected_label;
      }
    }

    Fail();
    return false;
  }

  /**
   * Reads a signed number from the key and verifies that the value fits in a
   * 32-bit integer.
   *
   * If the read is unsuccessful or the number was out of range, returns 0 and
   * fails the Reader.
   *
   * Otherwise, returns the number and advances the Reader to the next unread
   * byte.
   */
  int32_t ReadInt32() {
    if (ok_) {
      int64_t raw_result = ReadSignedNumIncreasing();
      if (ok_ && raw_result >= INT32_MIN && raw_result <= INT32_MAX) {
        return static_cast<int32_t>(raw_result);
      }
    }

    Fail();
    return 0;
  }

  /**
   * Reads a component label and signed number from the key and verifies that
   * the label matches the expected_label and the value fits in a 32-bit
   * integer.
   *
   * If the read is unsuccessful, the label didn't match, or the number was out
   * of range, returns 0 and fails the Reader.
   *
   * Otherwise, returns the number and advances the Reader to the next unread
   * byte.
   */
  int32_t ReadLabeledInt32(ComponentLabel expected_label) {
    if (!ReadComponentLabelMatching(expected_label)) {
      Fail();
    }
    return ReadInt32();
  }

  /**
   * Reads a signed number from the key.
   *
   * If the read is unsuccessful, returns 0 and fails the Reader.
   *
   * Otherwise, returns the number and advances the Reader to the next unread
   * byte.
   */
  int64_t ReadInt64() {
    return ReadSignedNumIncreasing();
  }

  /**
   * Reads a component label and a string from the key verifies that the label
   * matches the expected_label.
   *
   * If the read is unsuccessful or the label didn't match, returns an empty
   * string and fails the Reader.
   *
   * Otherwise, returns the string and advances the Reader to the next unread
   * byte.
   */
  std::string ReadLabeledString(ComponentLabel expected_label) {
    if (!ReadComponentLabelMatching(expected_label)) {
      Fail();
    }
    return ReadString();
  }

  /**
   * Reads a component label and a string from the key and verifies that the
   * label matches the expected_label and the string matches the
   * expected_value.
   *
   * If the read is unsuccessful or the label wasn't a string, returns false
   * and fails the Reader.
   *
   * Otherwise returns whether or not the string that was read was equal to the
   * expected value and advances the reader to the next unread byte.
   */
  ABSL_MUST_USE_RESULT
  bool ReadLabeledStringMatching(ComponentLabel expected_label,
                                 const char* expected_value) {
    std::string value = ReadLabeledString(expected_label);
    if (ok_) {
      // Value mismatch does not constitute a failure:
      return value == expected_value;
    }

    Fail();
    return false;
  }

  /**
   * Fails the Reader. All subsequent read operations will exit early if
   * possible. Return values from any method will be defaults, as if those
   * methods had failed themselves.
   */
  void Fail() {
    ok_ = false;
  }

  leveldb::Slice src_;
  bool ok_;
};

ResourcePath Reader::ReadResourcePath() {
  std::vector<std::string> path_segments;
  while (!empty()) {
    // Advance a temporary slice to avoid advancing contents into the next key
    // component which may not be a path segment.
    leveldb::Slice saved_position = src_;
    if (!ReadComponentLabelMatching(ComponentLabel::PathSegment)) {
      src_ = saved_position;
      break;
    }

    std::string segment = ReadString();
    if (!ok_) break;

    path_segments.push_back(std::move(segment));
  }

  return ResourcePath{std::move(path_segments)};
}

DocumentKey Reader::ReadDocumentKey() {
  ResourcePath path = ReadResourcePath();

  // Avoid assertion failures in DocumentKey if path is invalid.
  if (ok_ && !path.empty() && DocumentKey::IsDocumentKey(path)) {
    return DocumentKey{std::move(path)};
  }

  Fail();
  return DocumentKey{};
}

model::SnapshotVersion Reader::ReadSnapshotVersion() {
  if (!ReadComponentLabelMatching(ComponentLabel::SnapshotVersion)) {
    Fail();
  }

  int64_t seconds = ReadInt64();
  int32_t nanos = ReadInt32();

  return model::SnapshotVersion({seconds, nanos});
}

/**
 * Returns a base64-encoded string for an invalid key, used for debug-friendly
 * description text.
 */
std::string InvalidKey(leveldb::Slice key) {
  std::string result;
  absl::Base64Escape(MakeStringView(key), &result);
  return result;
}

std::string Reader::Describe() {
  leveldb::Slice original = src_;

  bool is_terminated = false;

  std::string description;
  absl::StrAppend(&description, "[");

  while (!empty()) {
    leveldb::Slice saved_source = src_;

    ComponentLabel label = ReadComponentLabel();
    if (!ok_) {
      break;
    }
    if (label == ComponentLabel::Terminator) {
      is_terminated = true;
      break;
    }

    // Reset the reader since all the different read routines expect to see the
    // separator first
    src_ = saved_source;

    if (label == ComponentLabel::PathSegment) {
      ResourcePath resource_path = ReadResourcePath();
      if (ok_) {
        absl::StrAppend(&description,
                        " path=", resource_path.CanonicalString());
      }

    } else if (label == ComponentLabel::TableName) {
      std::string table = ReadLabeledString(ComponentLabel::TableName);
      if (ok_) {
        absl::StrAppend(&description, table, ":");
      }

    } else if (label == ComponentLabel::BatchId) {
      model::BatchId batch_id = ReadBatchId();
      if (ok_) {
        absl::StrAppend(&description, " batch_id=", batch_id);
      }

    } else if (label == ComponentLabel::CanonicalId) {
      std::string canonical_id = ReadCanonicalId();
      if (ok_) {
        absl::StrAppend(&description, " canonical_id=", canonical_id);
      }

    } else if (label == ComponentLabel::TargetId) {
      model::TargetId target_id = ReadTargetId();
      if (ok_) {
        absl::StrAppend(&description, " target_id=", target_id);
      }

    } else if (label == ComponentLabel::UserId) {
      std::string user_id = ReadUserId();
      if (ok_) {
        absl::StrAppend(&description, " user_id=", user_id);
      }

    } else if (label == ComponentLabel::CollectionId) {
      std::string collection_id = ReadCollectionId();
      if (ok_) {
        absl::StrAppend(&description, " collection_id=", collection_id);
      }

    } else if (label == ComponentLabel::DocumentId) {
      std::string document_id = ReadDocumentId();
      if (ok_) {
        absl::StrAppend(&description, " document_id=", document_id);
      }

    } else if (label == ComponentLabel::SnapshotVersion) {
      model::SnapshotVersion snapshot_version = ReadSnapshotVersion();
      if (ok_) {
        absl::StrAppend(&description,
                        " snapshot_version=", snapshot_version.ToString());
      }
    } else if (label == ComponentLabel::BundleId) {
      std::string bundle_id = ReadBundleId();
      if (ok_) {
        absl::StrAppend(&description, " bundle_id=", bundle_id);
      }
    } else if (label == ComponentLabel::QueryName) {
      std::string query_name = ReadQueryName();
      if (ok_) {
        absl::StrAppend(&description, " query_name=", query_name);
      }
    } else {
      absl::StrAppend(&description, " unknown label=", static_cast<int>(label));
      Fail();
    }
  }

  if (!ok_ || !empty()) {
    absl::StrAppend(&description, " invalid key=<", InvalidKey(original), ">");

  } else if (!is_terminated) {
    absl::StrAppend(&description, " incomplete key");
  }

  absl::StrAppend(&description, "]");
  return description;
}

class Writer {
 public:
  std::string result() const {
    return dest_;
  }

  void WriteTerminator() {
    OrderedCode::WriteSignedNumIncreasing(&dest_, ComponentLabel::Terminator);
  }

  void WriteTableName(const char* table_name) {
    WriteLabeledString(ComponentLabel::TableName, table_name);
  }

  void WriteBatchId(model::BatchId batch_id) {
    WriteLabeledInt32(ComponentLabel::BatchId, batch_id);
  }

  void WriteCanonicalId(absl::string_view canonical_id) {
    WriteLabeledString(ComponentLabel::CanonicalId, canonical_id);
  }

  void WriteTargetId(model::TargetId target_id) {
    WriteLabeledInt32(ComponentLabel::TargetId, target_id);
  }

  void WriteUserId(absl::string_view user_id) {
    WriteLabeledString(ComponentLabel::UserId, user_id);
  }

  void WriteCollectionId(absl::string_view collection_id) {
    WriteLabeledString(ComponentLabel::CollectionId, collection_id);
  }

  void WriteDocumentId(absl::string_view document_id) {
    WriteLabeledString(ComponentLabel::DocumentId, document_id);
  }

  void WriteSnapshotVersion(model::SnapshotVersion snapshot_version) {
    WriteComponentLabel(ComponentLabel::SnapshotVersion);
    OrderedCode::WriteSignedNumIncreasing(
        &dest_, snapshot_version.timestamp().seconds());
    OrderedCode::WriteSignedNumIncreasing(
        &dest_, snapshot_version.timestamp().nanoseconds());
  }

  void WriteBundleId(absl::string_view bundle_id) {
    WriteLabeledString(ComponentLabel::BundleId, bundle_id);
  }

  void WriteQueryName(absl::string_view query_name) {
    WriteLabeledString(ComponentLabel::QueryName, query_name);
  }

  /**
   * For each segment in the given resource path writes a
   * ComponentLabel::PathSegment component label and a string containing the
   * path segment.
   */
  void WriteResourcePath(const ResourcePath& path) {
    for (const auto& segment : path) {
      WriteComponentLabel(ComponentLabel::PathSegment);
      OrderedCode::WriteString(&dest_, segment);
    }
  }

 private:
  /** Writes a component label to the given key destination. */
  void WriteComponentLabel(ComponentLabel label) {
    OrderedCode::WriteSignedNumIncreasing(&dest_, label);
  }

  /**
   * Writes a component label and a signed integer to the given key destination.
   */
  void WriteLabeledInt32(ComponentLabel label, int32_t value) {
    WriteComponentLabel(label);
    OrderedCode::WriteSignedNumIncreasing(&dest_, value);
  }

  /**
   * Writes a component label and an encoded string to the given key
   * destination.
   */
  void WriteLabeledString(ComponentLabel label, absl::string_view value) {
    WriteComponentLabel(label);
    OrderedCode::WriteString(&dest_, value);
  }

  std::string dest_;
};

}  // namespace

std::string DescribeKey(leveldb::Slice key) {
  Reader reader{key};
  return reader.Describe();
}

std::string DescribeKey(absl::string_view key) {
  return DescribeKey(MakeSlice(key));
}

std::string DescribeKey(const std::string& key) {
  return DescribeKey(leveldb::Slice{key});
}

std::string DescribeKey(const char* key) {
  return DescribeKey(leveldb::Slice{key});
}

std::string LevelDbVersionKey::Key() {
  Writer writer;
  writer.WriteTableName(kVersionGlobalTable);
  writer.WriteTerminator();
  return writer.result();
}

std::string LevelDbMutationKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kMutationsTable);
  return writer.result();
}

std::string LevelDbMutationKey::KeyPrefix(absl::string_view user_id) {
  Writer writer;
  writer.WriteTableName(kMutationsTable);
  writer.WriteUserId(user_id);
  return writer.result();
}

std::string LevelDbMutationKey::Key(absl::string_view user_id,
                                    model::BatchId batch_id) {
  Writer writer;
  writer.WriteTableName(kMutationsTable);
  writer.WriteUserId(user_id);
  writer.WriteBatchId(batch_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbMutationKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kMutationsTable);
  user_id_ = reader.ReadUserId();
  batch_id_ = reader.ReadBatchId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbDocumentMutationKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kDocumentMutationsTable);
  return writer.result();
}

std::string LevelDbDocumentMutationKey::KeyPrefix(absl::string_view user_id) {
  Writer writer;
  writer.WriteTableName(kDocumentMutationsTable);
  writer.WriteUserId(user_id);
  return writer.result();
}

std::string LevelDbDocumentMutationKey::KeyPrefix(
    absl::string_view user_id, const ResourcePath& resource_path) {
  Writer writer;
  writer.WriteTableName(kDocumentMutationsTable);
  writer.WriteUserId(user_id);
  writer.WriteResourcePath(resource_path);
  return writer.result();
}

std::string LevelDbDocumentMutationKey::Key(absl::string_view user_id,
                                            const DocumentKey& document_key,
                                            model::BatchId batch_id) {
  Writer writer;
  writer.WriteTableName(kDocumentMutationsTable);
  writer.WriteUserId(user_id);
  writer.WriteResourcePath(document_key.path());
  writer.WriteBatchId(batch_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbDocumentMutationKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kDocumentMutationsTable);
  user_id_ = reader.ReadUserId();
  document_key_ = reader.ReadDocumentKey();
  batch_id_ = reader.ReadBatchId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbMutationQueueKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kMutationQueuesTable);
  return writer.result();
}

std::string LevelDbMutationQueueKey::Key(absl::string_view user_id) {
  Writer writer;
  writer.WriteTableName(kMutationQueuesTable);
  writer.WriteUserId(user_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbMutationQueueKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kMutationQueuesTable);
  user_id_ = reader.ReadUserId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbTargetGlobalKey::Key() {
  Writer writer;
  writer.WriteTableName(kTargetGlobalTable);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbTargetGlobalKey::Decode(leveldb::Slice key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kTargetGlobalTable);
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbTargetKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kTargetsTable);
  return writer.result();
}

std::string LevelDbTargetKey::Key(model::TargetId target_id) {
  Writer writer;
  writer.WriteTableName(kTargetsTable);
  writer.WriteTargetId(target_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbTargetKey::Decode(leveldb::Slice key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kTargetsTable);
  target_id_ = reader.ReadTargetId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbQueryTargetKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kQueryTargetsTable);
  return writer.result();
}

std::string LevelDbQueryTargetKey::KeyPrefix(absl::string_view canonical_id) {
  Writer writer;
  writer.WriteTableName(kQueryTargetsTable);
  writer.WriteCanonicalId(canonical_id);
  return writer.result();
}

std::string LevelDbQueryTargetKey::Key(absl::string_view canonical_id,
                                       model::TargetId target_id) {
  Writer writer;
  writer.WriteTableName(kQueryTargetsTable);
  writer.WriteCanonicalId(canonical_id);
  writer.WriteTargetId(target_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbQueryTargetKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kQueryTargetsTable);
  canonical_id_ = reader.ReadCanonicalId();
  target_id_ = reader.ReadTargetId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbTargetDocumentKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kTargetDocumentsTable);
  return writer.result();
}

std::string LevelDbTargetDocumentKey::KeyPrefix(model::TargetId target_id) {
  Writer writer;
  writer.WriteTableName(kTargetDocumentsTable);
  writer.WriteTargetId(target_id);
  return writer.result();
}

std::string LevelDbTargetDocumentKey::Key(model::TargetId target_id,
                                          const DocumentKey& document_key) {
  Writer writer;
  writer.WriteTableName(kTargetDocumentsTable);
  writer.WriteTargetId(target_id);
  writer.WriteResourcePath(document_key.path());
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbTargetDocumentKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kTargetDocumentsTable);
  target_id_ = reader.ReadTargetId();
  document_key_ = reader.ReadDocumentKey();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbDocumentTargetKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kDocumentTargetsTable);
  return writer.result();
}

std::string LevelDbDocumentTargetKey::KeyPrefix(
    const ResourcePath& resource_path) {
  Writer writer;
  writer.WriteTableName(kDocumentTargetsTable);
  writer.WriteResourcePath(resource_path);
  return writer.result();
}

std::string LevelDbDocumentTargetKey::Key(const DocumentKey& document_key,
                                          model::TargetId target_id) {
  Writer writer;
  writer.WriteTableName(kDocumentTargetsTable);
  writer.WriteResourcePath(document_key.path());
  writer.WriteTargetId(target_id);
  writer.WriteTerminator();
  return writer.result();
}

std::string LevelDbDocumentTargetKey::SentinelKey(
    const DocumentKey& document_key) {
  return Key(document_key, kInvalidTargetId);
}

std::string LevelDbDocumentTargetKey::EncodeSentinelValue(
    model::ListenSequenceNumber sequence_number) {
  std::string encoded;
  OrderedCode::WriteSignedNumIncreasing(&encoded, sequence_number);
  return encoded;
}

model::ListenSequenceNumber LevelDbDocumentTargetKey::DecodeSentinelValue(
    absl::string_view slice) {
  model::ListenSequenceNumber decoded;
  if (!OrderedCode::ReadSignedNumIncreasing(&slice, &decoded)) {
    HARD_FAIL("Failed to read sequence number from a sentinel row");
  }
  return decoded;
}

bool LevelDbDocumentTargetKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kDocumentTargetsTable);
  document_key_ = reader.ReadDocumentKey();
  target_id_ = reader.ReadTargetId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbRemoteDocumentKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kRemoteDocumentsTable);
  return writer.result();
}

std::string LevelDbRemoteDocumentKey::KeyPrefix(
    const ResourcePath& resource_path) {
  Writer writer;
  writer.WriteTableName(kRemoteDocumentsTable);
  writer.WriteResourcePath(resource_path);
  return writer.result();
}

std::string LevelDbRemoteDocumentKey::Key(const DocumentKey& key) {
  Writer writer;
  writer.WriteTableName(kRemoteDocumentsTable);
  writer.WriteResourcePath(key.path());
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbRemoteDocumentKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kRemoteDocumentsTable);
  document_key_ = reader.ReadDocumentKey();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbCollectionParentKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kCollectionParentsTable);
  return writer.result();
}

std::string LevelDbCollectionParentKey::KeyPrefix(
    absl::string_view collection_id) {
  Writer writer;
  writer.WriteTableName(kCollectionParentsTable);
  writer.WriteCollectionId(collection_id);
  return writer.result();
}

std::string LevelDbCollectionParentKey::Key(absl::string_view collection_id,
                                            const ResourcePath& parent) {
  Writer writer;
  writer.WriteTableName(kCollectionParentsTable);
  writer.WriteCollectionId(collection_id);
  writer.WriteResourcePath(parent);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbCollectionParentKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kCollectionParentsTable);
  collection_id_ = reader.ReadCollectionId();
  parent_ = reader.ReadResourcePath();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbRemoteDocumentReadTimeKey::KeyPrefix(
    const model::ResourcePath& collection_path,
    model::SnapshotVersion read_time) {
  Writer writer;
  writer.WriteTableName(kRemoteDocumentReadTimeTable);
  writer.WriteResourcePath(collection_path);
  writer.WriteSnapshotVersion(read_time);
  return writer.result();
}

std::string LevelDbRemoteDocumentReadTimeKey::Key(
    const model::ResourcePath& collection_path,
    model::SnapshotVersion read_time,
    absl::string_view document_id) {
  Writer writer;
  writer.WriteTableName(kRemoteDocumentReadTimeTable);
  writer.WriteResourcePath(collection_path);
  writer.WriteSnapshotVersion(read_time);
  writer.WriteDocumentId(document_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbRemoteDocumentReadTimeKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kRemoteDocumentReadTimeTable);
  collection_path_ = reader.ReadResourcePath();
  read_time_ = reader.ReadSnapshotVersion();
  document_id_ = reader.ReadDocumentId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbBundleKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kBundlesTable);
  return writer.result();
}

std::string LevelDbBundleKey::Key(absl::string_view bundle_id) {
  Writer writer;
  writer.WriteTableName(kBundlesTable);
  writer.WriteBundleId(bundle_id);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbBundleKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kBundlesTable);
  bundle_id_ = reader.ReadBundleId();
  reader.ReadTerminator();
  return reader.ok();
}

std::string LevelDbNamedQueryKey::KeyPrefix() {
  Writer writer;
  writer.WriteTableName(kNamedQueriesTable);
  return writer.result();
}

std::string LevelDbNamedQueryKey::Key(absl::string_view query_name) {
  Writer writer;
  writer.WriteTableName(kNamedQueriesTable);
  writer.WriteQueryName(query_name);
  writer.WriteTerminator();
  return writer.result();
}

bool LevelDbNamedQueryKey::Decode(absl::string_view key) {
  Reader reader{key};
  reader.ReadTableNameMatching(kNamedQueriesTable);
  name_ = reader.ReadQueryName();
  reader.ReadTerminator();
  return reader.ok();
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
