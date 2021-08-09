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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_UTIL_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_UTIL_H_

#include <string>

#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"
#include "leveldb/slice.h"
#include "leveldb/status.h"

namespace firebase {
namespace firestore {
namespace local {

/** Creates a Slice from a string_view. */
inline leveldb::Slice MakeSlice(absl::string_view view) {
  return leveldb::Slice{view.data(), view.size()};
}

/** Creates a string_view from a Slice. */
inline absl::string_view MakeStringView(leveldb::Slice slice) {
  return absl::string_view{slice.data(), slice.size()};
}

/** Converts the given LevelDB status to a Firestore status. */
util::Status ConvertStatus(const leveldb::Status& status);

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_UTIL_H_
