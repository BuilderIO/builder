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

#include "Firestore/core/src/core/view_snapshot.h"

#include <ostream>

#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/string_format.h"
#include "Firestore/core/src/util/to_string.h"

namespace firebase {
namespace firestore {
namespace core {

using model::Document;
using model::DocumentKey;
using model::DocumentKeySet;
using model::DocumentSet;
using util::StringFormat;

// DocumentViewChange

DocumentViewChange::DocumentViewChange(Document document, Type type)
    : document_{std::move(document)}, type_{type} {
}

const Document& DocumentViewChange::document() const {
  return document_;
}

std::string DocumentViewChange::ToString() const {
  return StringFormat("<DocumentViewChange doc:%s type:%s>",
                      util::ToString(document()), type());
}

size_t DocumentViewChange::Hash() const {
  return util::Hash(document(), type());
}

bool operator==(const DocumentViewChange& lhs, const DocumentViewChange& rhs) {
  return lhs.document() == rhs.document() && lhs.type() == rhs.type();
}

// DocumentViewChangeSet

void DocumentViewChangeSet::AddChange(DocumentViewChange&& change) {
  const DocumentKey& key = change.document()->key();
  auto old_change_iter = change_map_.find(key);
  if (old_change_iter == change_map_.end()) {
    change_map_ = change_map_.insert(key, change);
    return;
  }

  const DocumentViewChange& old = old_change_iter->second;
  DocumentViewChange::Type old_type = old.type();
  DocumentViewChange::Type new_type = change.type();

  // Merge the new change with the existing change.
  if (new_type != DocumentViewChange::Type::Added &&
      old_type == DocumentViewChange::Type::Metadata) {
    change_map_ = change_map_.insert(key, change);

  } else if (new_type == DocumentViewChange::Type::Metadata &&
             old_type != DocumentViewChange::Type::Removed) {
    DocumentViewChange new_change{change.document(), old_type};
    change_map_ = change_map_.insert(key, new_change);

  } else if (new_type == DocumentViewChange::Type::Modified &&
             old_type == DocumentViewChange::Type::Modified) {
    DocumentViewChange new_change{change.document(),
                                  DocumentViewChange::Type::Modified};
    change_map_ = change_map_.insert(key, new_change);

  } else if (new_type == DocumentViewChange::Type::Modified &&
             old_type == DocumentViewChange::Type::Added) {
    DocumentViewChange new_change{change.document(),
                                  DocumentViewChange::Type::Added};
    change_map_ = change_map_.insert(key, new_change);

  } else if (new_type == DocumentViewChange::Type::Removed &&
             old_type == DocumentViewChange::Type::Added) {
    change_map_ = change_map_.erase(key);

  } else if (new_type == DocumentViewChange::Type::Removed &&
             old_type == DocumentViewChange::Type::Modified) {
    DocumentViewChange new_change{old.document(),
                                  DocumentViewChange::Type::Removed};
    change_map_ = change_map_.insert(key, new_change);

  } else if (new_type == DocumentViewChange::Type::Added &&
             old_type == DocumentViewChange::Type::Removed) {
    DocumentViewChange new_change{change.document(),
                                  DocumentViewChange::Type::Modified};
    change_map_ = change_map_.insert(key, new_change);

  } else {
    // This includes these cases, which don't make sense:
    // Added -> Added
    // Removed -> Removed
    // Modified -> Added
    // Removed -> Modified
    // Metadata -> Added
    // Removed -> Metadata
    HARD_FAIL("Unsupported combination of changes: %s after %s", new_type,
              old_type);
  }
}

std::vector<DocumentViewChange> DocumentViewChangeSet::GetChanges() const {
  std::vector<DocumentViewChange> changes;
  for (const auto& kv : change_map_) {
    const DocumentViewChange& change = kv.second;
    changes.push_back(change);
  }
  return changes;
}

std::string DocumentViewChangeSet::ToString() const {
  return util::ToString(change_map_);
}

// ViewSnapshot

ViewSnapshot::ViewSnapshot(Query query,
                           DocumentSet documents,
                           DocumentSet old_documents,
                           std::vector<DocumentViewChange> document_changes,
                           model::DocumentKeySet mutated_keys,
                           bool from_cache,
                           bool sync_state_changed,
                           bool excludes_metadata_changes)
    : query_{std::move(query)},
      documents_{std::move(documents)},
      old_documents_{std::move(old_documents)},
      document_changes_{std::move(document_changes)},
      mutated_keys_{std::move(mutated_keys)},
      from_cache_{from_cache},
      sync_state_changed_{sync_state_changed},
      excludes_metadata_changes_{excludes_metadata_changes} {
}

ViewSnapshot ViewSnapshot::FromInitialDocuments(
    Query query,
    DocumentSet documents,
    DocumentKeySet mutated_keys,
    bool from_cache,
    bool excludes_metadata_changes) {
  std::vector<DocumentViewChange> view_changes;
  for (const Document& doc : documents) {
    view_changes.emplace_back(doc, DocumentViewChange::Type::Added);
  }

  DocumentSet old_documents(query.Comparator());
  return ViewSnapshot{std::move(query),
                      documents,
                      old_documents,
                      std::move(view_changes),
                      std::move(mutated_keys),
                      from_cache,
                      /*sync_state_changed=*/true,
                      excludes_metadata_changes};
}

const Query& ViewSnapshot::query() const {
  return query_;
}

std::string ViewSnapshot::ToString() const {
  return StringFormat(
      "<ViewSnapshot query: %s documents: %s old_documents: %s changes: %s "
      "from_cache: %s mutated_keys: %s sync_state_changed: %s "
      "excludes_metadata_changes: %s>",
      query_.ToString(), documents_.ToString(), old_documents_.ToString(),
      util::ToString(document_changes()), from_cache(), mutated_keys().size(),
      sync_state_changed(), excludes_metadata_changes());
}

std::ostream& operator<<(std::ostream& out, const ViewSnapshot& value) {
  return out << value.ToString();
}

size_t ViewSnapshot::Hash() const {
  // Note: We are omitting `mutated_keys_` from the hash, since we don't have a
  // straightforward way to compute its hash value. Since `ViewSnapshot` is
  // currently not stored in any dictionaries, this has no side effects.

  return util::Hash(query(), documents(), old_documents(), document_changes(),
                    from_cache(), sync_state_changed(),
                    excludes_metadata_changes());
}

bool operator==(const ViewSnapshot& lhs, const ViewSnapshot& rhs) {
  return lhs.query() == rhs.query() && lhs.documents() == rhs.documents() &&
         lhs.old_documents() == rhs.old_documents() &&
         lhs.document_changes() == rhs.document_changes() &&
         lhs.from_cache() == rhs.from_cache() &&
         lhs.mutated_keys() == rhs.mutated_keys() &&
         lhs.sync_state_changed() == rhs.sync_state_changed() &&
         lhs.excludes_metadata_changes() == rhs.excludes_metadata_changes();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
