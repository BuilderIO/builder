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

#ifndef FIRESTORE_CORE_SRC_API_DOCUMENT_CHANGE_H_
#define FIRESTORE_CORE_SRC_API_DOCUMENT_CHANGE_H_

#include <memory>
#include <utility>

#include "Firestore/core/src/api/document_snapshot.h"

namespace firebase {
namespace firestore {
namespace api {

class DocumentChange {
 public:
  enum class Type { Added, Modified, Removed };

  DocumentChange() = default;
  DocumentChange(Type type,
                 DocumentSnapshot document,
                 size_t old_index,
                 size_t new_index)
      : type_(type),
        document_(std::move(document)),
        old_index_(old_index),
        new_index_(new_index) {
  }

  size_t Hash() const;

  Type type() const {
    return type_;
  }

  DocumentSnapshot document() const {
    return document_;
  }

  size_t old_index() const {
    return old_index_;
  }

  size_t new_index() const {
    return new_index_;
  }

  const std::shared_ptr<Firestore>& firestore() const {
    return document_.firestore();
  }

  /**
   * A sentinel return value for old_index() and new_index() indicating that
   * there's no relevant index to return because the document was newly added
   * or removed respectively.
   */
  static constexpr size_t npos = static_cast<size_t>(-1);

 private:
  Type type_;
  DocumentSnapshot document_;
  size_t old_index_;
  size_t new_index_;
};

bool operator==(const DocumentChange& lhs, const DocumentChange& rhs);

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_DOCUMENT_CHANGE_H_
