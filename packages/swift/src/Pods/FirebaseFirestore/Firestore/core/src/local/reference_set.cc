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

#include "Firestore/core/src/local/reference_set.h"

#include "Firestore/core/src/immutable/sorted_set.h"
#include "Firestore/core/src/local/document_key_reference.h"
#include "Firestore/core/src/model/document_key.h"

namespace firebase {
namespace firestore {
namespace local {

using model::DocumentKey;
using model::DocumentKeySet;

void ReferenceSet::AddReference(const DocumentKey& key, int id) {
  DocumentKeyReference reference{key, id};
  by_key_ = by_key_.insert(reference);
  by_id_ = by_id_.insert(reference);
}

void ReferenceSet::AddReferences(const DocumentKeySet& keys, int id) {
  for (const DocumentKey& key : keys) {
    AddReference(key, id);
  }
}

void ReferenceSet::RemoveReference(const DocumentKey& key, int id) {
  RemoveReference(DocumentKeyReference{key, id});
}

void ReferenceSet::RemoveReferences(
    const firebase::firestore::model::DocumentKeySet& keys, int id) {
  for (const DocumentKey& key : keys) {
    RemoveReference(key, id);
  }
}

DocumentKeySet ReferenceSet::RemoveReferences(int id) {
  DocumentKeyReference start{DocumentKey::Empty(), id};
  DocumentKeyReference end{DocumentKey::Empty(), id + 1};

  DocumentKeySet removed{};

  auto initial = by_id_;
  for (const auto& reference : initial.values_in(start, end)) {
    RemoveReference(reference);
    removed = removed.insert(reference.key());
  }
  return removed;
}

void ReferenceSet::RemoveAllReferences() {
  auto initial = by_key_;
  for (const DocumentKeyReference& reference : initial) {
    RemoveReference(reference);
  }
}

void ReferenceSet::RemoveReference(const DocumentKeyReference& reference) {
  by_key_ = by_key_.erase(reference);
  by_id_ = by_id_.erase(reference);
}

DocumentKeySet ReferenceSet::ReferencedKeys(int id) {
  DocumentKeyReference start{DocumentKey::Empty(), id};
  DocumentKeyReference end{DocumentKey::Empty(), id + 1};

  DocumentKeySet keys;
  for (const auto& reference : by_id_.values_in(start, end)) {
    keys = keys.insert(reference.key());
  }
  return keys;
}

bool ReferenceSet::ContainsKey(const DocumentKey& key) {
  // Create a reference with a zero ID as the start position to find any
  // document reference with this key.
  DocumentKeyReference start{key, 0};

  auto range = by_key_.values_from(start);
  auto begin = range.begin();
  return begin != range.end() && begin->key() == key;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
