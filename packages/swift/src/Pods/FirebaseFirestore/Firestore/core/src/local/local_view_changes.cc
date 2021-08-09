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

#include "Firestore/core/src/local/local_view_changes.h"

#include "Firestore/core/src/core/view_snapshot.h"

namespace firebase {
namespace firestore {
namespace local {

using core::DocumentViewChange;
using core::ViewSnapshot;
using model::DocumentKeySet;
using model::TargetId;

LocalViewChanges LocalViewChanges::FromViewSnapshot(
    const core::ViewSnapshot& snapshot, model::TargetId target_id) {
  DocumentKeySet added_keys;
  DocumentKeySet removed_keys;

  for (const DocumentViewChange& doc_change : snapshot.document_changes()) {
    switch (doc_change.type()) {
      case DocumentViewChange::Type::Added:
        added_keys = added_keys.insert(doc_change.document()->key());
        break;

      case DocumentViewChange::Type::Removed:
        removed_keys = removed_keys.insert(doc_change.document()->key());
        break;

      default:
        // Do nothing.
        break;
    }
  }

  return LocalViewChanges(target_id, snapshot.from_cache(),
                          std::move(added_keys), std::move(removed_keys));
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
