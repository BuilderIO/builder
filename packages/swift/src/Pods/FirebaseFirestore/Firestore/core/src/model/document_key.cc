/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/model/document_key.h"

#include <ostream>
#include <utility>

#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace model {
namespace {

void AssertValidPath(const ResourcePath& path) {
  HARD_ASSERT(DocumentKey::IsDocumentKey(path), "invalid document key path: %s",
              path.CanonicalString());
}

}  // namespace

DocumentKey::DocumentKey() : path_{std::make_shared<ResourcePath>()} {
}

DocumentKey::DocumentKey(const ResourcePath& path)
    : path_{std::make_shared<ResourcePath>(path)} {
  AssertValidPath(*path_);
}

DocumentKey::DocumentKey(ResourcePath&& path)
    : path_{std::make_shared<ResourcePath>(std::move(path))} {
  AssertValidPath(*path_);
}

DocumentKey DocumentKey::FromPathString(const std::string& path) {
  return DocumentKey{ResourcePath::FromString(path)};
}

DocumentKey DocumentKey::FromSegments(std::initializer_list<std::string> list) {
  return DocumentKey{ResourcePath{list}};
}

DocumentKey DocumentKey::FromName(const std::string& name) {
  auto resource_name = ResourcePath::FromString(name);
  HARD_ASSERT(resource_name.size() > 4 && resource_name[0] == "projects" &&
                  resource_name[2] == "databases" &&
                  resource_name[4] == "documents",
              "Tried to parse an invalid key: %s", name);
  return DocumentKey{resource_name.PopFirst(5)};
}

const DocumentKey& DocumentKey::Empty() {
  static const DocumentKey* empty = new DocumentKey();
  return *empty;
}

bool DocumentKey::IsDocumentKey(const ResourcePath& path) {
  return path.size() % 2 == 0;
}

util::ComparisonResult DocumentKey::CompareTo(const DocumentKey& other) const {
  return path().CompareTo(other.path());
}

bool operator==(const DocumentKey& lhs, const DocumentKey& rhs) {
  return lhs.path() == rhs.path();
}

bool operator<(const DocumentKey& lhs, const DocumentKey& rhs) {
  return util::Ascending(lhs.CompareTo(rhs));
}
bool operator>(const DocumentKey& lhs, const DocumentKey& rhs) {
  return util::Descending(lhs.CompareTo(rhs));
}

size_t DocumentKey::Hash() const {
  return util::Hash(ToString());
}

std::string DocumentKey::ToString() const {
  return path().CanonicalString();
}

std::ostream& operator<<(std::ostream& os, const DocumentKey& key) {
  return os << key.ToString();
}

const ResourcePath& DocumentKey::path() const {
  return path_ ? *path_ : Empty().path();
}

/** Returns true if the document is in the specified collection_id. */
bool DocumentKey::HasCollectionId(const std::string& collection_id) const {
  size_t size = path().size();
  return size >= 2 && path()[size - 2] == collection_id;
}

size_t DocumentKeyHash::operator()(const DocumentKey& key) const {
  return util::Hash(key.path());
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
