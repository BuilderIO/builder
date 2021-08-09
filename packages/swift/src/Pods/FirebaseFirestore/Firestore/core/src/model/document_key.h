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

#ifndef FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_H_
#define FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_H_

#include <functional>
#include <initializer_list>
#include <iosfwd>
#include <memory>
#include <string>

#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {

namespace util {
enum class ComparisonResult;
}  // namespace util

namespace model {

class ResourcePath;

/**
 * DocumentKey represents the location of a document in the Firestore database.
 */
class DocumentKey {
 public:
  /** Creates a "blank" document key not associated with any document. */
  DocumentKey();

  /** Creates a new document key containing a copy of the given path. */
  explicit DocumentKey(const ResourcePath& path);

  /** Creates a new document key, taking ownership of the given path. */
  explicit DocumentKey(ResourcePath&& path);

  /**
   * Creates and returns a new document key using '/' to split the string into
   * segments.
   */
  static DocumentKey FromPathString(const std::string& path);

  /** Creates and returns a new document key with the given segments. */
  static DocumentKey FromSegments(std::initializer_list<std::string> list);

  /** Returns a DocumentKey from a fully qualified resource name. */
  static DocumentKey FromName(const std::string& name);

  /** Returns a shared instance of an empty document key. */
  static const DocumentKey& Empty();

  /** Returns true iff the given path is a path to a document. */
  static bool IsDocumentKey(const ResourcePath& path);

  util::ComparisonResult CompareTo(const DocumentKey& other) const;

  friend bool operator==(const DocumentKey& lhs, const DocumentKey& rhs);

  size_t Hash() const;

  std::string ToString() const;

  friend std::ostream& operator<<(std::ostream& os, const DocumentKey& key);

  /** The path to the document. */
  const ResourcePath& path() const;

  /** Returns true if the document is in the specified collection_id. */
  bool HasCollectionId(const std::string& collection_id) const;

 private:
  // This is an optimization to make passing DocumentKey around cheaper (it's
  // copied often).
  std::shared_ptr<const ResourcePath> path_;
};

inline bool operator!=(const DocumentKey& lhs, const DocumentKey& rhs) {
  return !(lhs == rhs);
}

bool operator<(const DocumentKey& lhs, const DocumentKey& rhs);
bool operator>(const DocumentKey& lhs, const DocumentKey& rhs);

inline bool operator<=(const DocumentKey& lhs, const DocumentKey& rhs) {
  return !(rhs < lhs);
}

inline bool operator>=(const DocumentKey& lhs, const DocumentKey& rhs) {
  return !(lhs < rhs);
}

struct DocumentKeyHash {
  size_t operator()(const DocumentKey& key) const;
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_DOCUMENT_KEY_H_
