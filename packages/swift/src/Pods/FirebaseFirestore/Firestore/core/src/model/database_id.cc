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

#include "Firestore/core/src/model/database_id.h"

#include <ostream>

#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace model {

constexpr const char* DatabaseId::kDefault;

DatabaseId::DatabaseId(std::string project_id, std::string database_id) {
  HARD_ASSERT(!project_id.empty());
  HARD_ASSERT(!database_id.empty());

  rep_ = std::make_shared<Rep>(std::move(project_id), std::move(database_id));
}

DatabaseId DatabaseId::FromName(const std::string& name) {
  auto resource_name = ResourcePath::FromString(name);
  HARD_ASSERT(resource_name.size() > 3 && resource_name[0] == "projects" &&
                  resource_name[2] == "databases",
              "Tried to parse an invalid resource name: %s", name);
  return DatabaseId{resource_name[1], resource_name[3]};
}

util::ComparisonResult DatabaseId::CompareTo(
    const firebase::firestore::model::DatabaseId& rhs) const {
  util::ComparisonResult cmp = util::Compare(project_id(), rhs.project_id());
  if (!util::Same(cmp)) return cmp;

  return util::Compare(database_id(), rhs.database_id());
}

std::string DatabaseId::ToString() const {
  return absl::StrCat("DatabaseId(", project_id(), ":", database_id(), ")");
}

std::ostream& operator<<(std::ostream& out, const DatabaseId& database_id) {
  return out << database_id.ToString();
}

size_t DatabaseId::Hash() const {
  return util::Hash(project_id(), database_id());
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
