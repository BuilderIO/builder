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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LOCAL_VIEW_CHANGES_H_
#define FIRESTORE_CORE_SRC_LOCAL_LOCAL_VIEW_CHANGES_H_

#include <utility>

#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/document_key_set.h"
#include "Firestore/core/src/model/types.h"

namespace firebase {
namespace firestore {
namespace local {

/**
 * Represents changes applying to the local view of a given query, including
 * what documents are currently in view and out of view.
 *
 * Example usage: these changes are sent to the LocalStore by the View (via the
 * SyncEngine) and are used to pin / unpin documents as appropriate.
 */
class LocalViewChanges {
 public:
  static LocalViewChanges FromViewSnapshot(const core::ViewSnapshot& snapshot,
                                           model::TargetId target_id);

  LocalViewChanges(model::TargetId target_id,
                   bool from_cache,
                   model::DocumentKeySet added_keys,
                   model::DocumentKeySet removed_keys)
      : target_id_(target_id),
        from_cache_(from_cache),
        added_keys_(std::move(added_keys)),
        removed_keys_(std::move(removed_keys)) {
  }

  /** The batch ID of the local write. */
  model::TargetId target_id() const {
    return target_id_;
  }

  bool is_from_cache() const {
    return from_cache_;
  }

  /** The document changes resulting from the local write. */
  const model::DocumentKeySet& added_keys() const {
    return added_keys_;
  }

  const model::DocumentKeySet& removed_keys() const {
    return removed_keys_;
  }

 private:
  model::TargetId target_id_ = 0;
  bool from_cache_ = false;
  model::DocumentKeySet added_keys_;
  model::DocumentKeySet removed_keys_;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LOCAL_VIEW_CHANGES_H_
