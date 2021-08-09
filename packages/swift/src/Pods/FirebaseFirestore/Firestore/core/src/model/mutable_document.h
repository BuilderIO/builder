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

#ifndef FIRESTORE_CORE_SRC_MODEL_MUTABLE_DOCUMENT_H_
#define FIRESTORE_CORE_SRC_MODEL_MUTABLE_DOCUMENT_H_

#include <iosfwd>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/object_value.h"
#include "Firestore/core/src/model/snapshot_version.h"

namespace firebase {
namespace firestore {
namespace model {

/**
 * Represents a document in Firestore with a key, version, data and whether it
 * has local mutations applied to it.
 *
 * Documents can transition between states via `ConvertToFoundDocument()`,
 * `ConvertToNoDocument()` and `ConvertToUnknownDocument()`. If a document does
 * not transition to one of these states even after all mutations have been
 * applied, `is_valid_document()` returns false and the document should be
 * removed from all views.
 */
class MutableDocument {
 private:
  enum class DocumentType {
    /**
     * Represents the initial state of a MutableDocument when only the document
     * key is known. Invalid documents transition to other states as mutations
     * are applied. If a document remains invalid after applying mutations, it
     * should be discarded.
     */
    kInvalid,
    /**
     * Represents a document in Firestore with a key, version, data and whether
     * the data has local mutations applied to it.
     */
    kFoundDocument,
    /** Represents that no documents exists for the key at the given version. */
    kNoDocument,
    /**
     * Represents an existing document whose data is unknown (e.g. a document
     * that was updated without a known base document).
     */
    kUnknownDocument
  };

  /** Describes the `hasPendingWrites` state of a document. */
  enum class DocumentState {
    /**
     * Local mutations applied via the mutation queue. Document is potentially
     * inconsistent.
     */
    kHasLocalMutations,
    /**
     * Mutations applied based on a write acknowledgment. Document is
     * potentially inconsistent.
     */
    kHasCommittedMutations,
    /** No mutations applied. Document was sent to us by Watch. */
    kSynced
  };

 public:
  MutableDocument() = default;

  /**
   * Creates a document with no known version or data. This document can serve
   * as a base document for mutations.
   */
  static MutableDocument InvalidDocument(DocumentKey document_key);

  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static MutableDocument FoundDocument(DocumentKey document_key,
                                       const SnapshotVersion& version,
                                       ObjectValue value);

  /** Creates a new document that is known to not exisr at the given version. */
  static MutableDocument NoDocument(DocumentKey document_key,
                                    const SnapshotVersion& version);

  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static MutableDocument UnknownDocument(const DocumentKey& document_key,
                                         const SnapshotVersion& version);

  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  MutableDocument& ConvertToFoundDocument(const SnapshotVersion& version,
                                          ObjectValue value);

  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  MutableDocument& ConvertToFoundDocument(const SnapshotVersion& version);

  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  MutableDocument& ConvertToNoDocument(const SnapshotVersion& version);

  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a
   * known base document).
   */
  MutableDocument& ConvertToUnknownDocument(const SnapshotVersion& version);

  MutableDocument& SetHasCommittedMutations();

  MutableDocument& SetHasLocalMutations();

  /** Creates a new document with a copy of the document's data and state. */
  MutableDocument Clone() const;

  const DocumentKey& key() const {
    return key_;
  }

  const SnapshotVersion& version() const {
    return version_;
  }

  bool has_local_mutations() const {
    return document_state_ == DocumentState::kHasLocalMutations;
  }

  bool has_committed_mutations() const {
    return document_state_ == DocumentState::kHasCommittedMutations;
  }

  bool has_pending_writes() const {
    return has_local_mutations() || has_committed_mutations();
  }

  google_firestore_v1_Value value() const {
    return value_->Get();
  }

  ObjectValue& data() {
    return *value_;
  }

  /**
   * Returns the value at the given path or absl::nullopt. If the path is empty,
   * an identical copy of the FieldValue is returned.
   *
   * @param field_path the path to search.
   * @return The value at the path or absl::nullopt if it doesn't exist.
   */
  absl::optional<google_firestore_v1_Value> field(
      const FieldPath& field_path) const {
    return value_->Get(field_path);
  }

  bool is_valid_document() const {
    return document_type_ != DocumentType ::kInvalid;
  }

  bool is_found_document() const {
    return document_type_ == DocumentType ::kFoundDocument;
  }

  bool is_no_document() const {
    return document_type_ == DocumentType ::kNoDocument;
  }

  bool is_unknown_document() const {
    return document_type_ == DocumentType ::kUnknownDocument;
  }

  size_t Hash() const;

  std::string ToString() const;

  friend bool operator==(const MutableDocument& lhs,
                         const MutableDocument& rhs);

  friend std::ostream& operator<<(std::ostream& os, DocumentState state);
  friend std::ostream& operator<<(std::ostream& os, DocumentType type);

 private:
  MutableDocument(DocumentKey key,
                  DocumentType document_type,
                  SnapshotVersion version,
                  std::shared_ptr<ObjectValue> value,
                  DocumentState document_state)
      : key_{std::move(key)},
        document_type_{document_type},
        version_{version},
        value_{std::move(value)},
        document_state_{document_state} {
  }

  DocumentKey key_;
  DocumentType document_type_ = DocumentType::kInvalid;
  SnapshotVersion version_;
  // Using a shared pointer to ObjectValue makes MutableDocument copy-assignable
  // without having to manually create a deep clone of its Protobuf contents.
  std::shared_ptr<ObjectValue> value_ = std::make_shared<ObjectValue>();
  DocumentState document_state_ = DocumentState::kSynced;
};

bool operator==(const MutableDocument& lhs, const MutableDocument& rhs);

std::ostream& operator<<(std::ostream& os, const MutableDocument& doc);

inline bool operator!=(const MutableDocument& lhs, const MutableDocument& rhs) {
  return !(lhs == rhs);
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_MUTABLE_DOCUMENT_H_
