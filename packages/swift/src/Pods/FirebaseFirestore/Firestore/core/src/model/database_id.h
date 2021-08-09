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

#ifndef FIRESTORE_CORE_SRC_MODEL_DATABASE_ID_H_
#define FIRESTORE_CORE_SRC_MODEL_DATABASE_ID_H_

#include <iosfwd>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/util/comparison.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace model {

/** A DatabaseId represents a particular database in the Firestore. */
class DatabaseId : public util::Comparable<DatabaseId> {
 public:
  /** The default name for "unset" database ID in resource names. */
  static constexpr const char* kDefault = "(default)";

  // TODO(wilhuff): Remove this after FieldValue rewrite.
  DatabaseId() = default;

  /**
   * Creates and returns a new DatabaseId.
   *
   * @param project_id The project for the database.
   * @param database_id The database in the project to use.
   */
  explicit DatabaseId(std::string project_id,
                      std::string database_id = kDefault);

  /** Returns a DatabaseId from a fully qualified resource name. */
  static DatabaseId FromName(const std::string& name);

  const std::string& project_id() const {
    return rep_->project_id;
  }

  const std::string& database_id() const {
    return rep_->database_id;
  }

  /** Whether this is the default database of the project. */
  bool IsDefaultDatabase() const {
    return rep_->database_id == kDefault;
  }

  util::ComparisonResult CompareTo(const DatabaseId& rhs) const;

  std::string ToString() const;
  friend std::ostream& operator<<(std::ostream& out,
                                  const DatabaseId& database_id);

  size_t Hash() const;

 private:
  // DocumentIds are copied into every ReferenceValue we create so hide the
  // actual values behind a shared_ptr to make copying cheaper.
  struct Rep {
    Rep(std::string&& project_id, std::string&& database_id)
        : project_id{std::move(project_id)},
          database_id{std::move(database_id)} {
    }
    std::string project_id;
    std::string database_id;
  };

  std::shared_ptr<const Rep> rep_;
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_DATABASE_ID_H_
