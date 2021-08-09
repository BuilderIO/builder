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

#include <fstream>
#include <sstream>

#include "Firestore/core/src/util/filesystem.h"
#include "Firestore/core/src/util/path.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace util {

Filesystem* Filesystem::Default() {
  static auto* filesystem = new Filesystem();
  return filesystem;
}

Status Filesystem::RecursivelyCreateDir(const Path& path) {
  Status result = CreateDir(path);
  if (result.ok() || result.code() != Error::kErrorNotFound) {
    // Successfully created the directory, it already existed, or some other
    // unrecoverable error.
    return result;
  }

  // Missing parent
  Path parent = path.Dirname();
  result = RecursivelyCreateDir(parent);
  if (!result.ok()) {
    return result;
  }

  // Successfully created the parent so try again.
  return CreateDir(path);
}

Status Filesystem::RecursivelyRemove(const Path& path) {
  Status status = IsDirectory(path);
  switch (status.code()) {
    case Error::kErrorOk:
      return RecursivelyRemoveDir(path);

    case Error::kErrorFailedPrecondition:
      // Could be a file or something else. Attempt to delete it as a file
      // but otherwise allow that to fail if it's not a file.
      return RemoveFile(path);

    case Error::kErrorNotFound:
      return Status::OK();

    default:
      return status;
  }
}

Status Filesystem::RecursivelyRemoveDir(const Path& path) {
  std::unique_ptr<DirectoryIterator> iter = DirectoryIterator::Create(path);
  for (; iter->Valid(); iter->Next()) {
    Status status = RecursivelyRemove(iter->file());
    if (!status.ok()) {
      return status;
    }
  }

  if (!iter->status().ok()) {
    if (iter->status().code() == Error::kErrorNotFound) {
      return Status::OK();
    }
    return iter->status();
  }
  return RemoveDir(path);
}

#if !__APPLE__
Status Filesystem::ExcludeFromBackups(const Path&) {
  // Non-Apple platforms don't yet implement exclusion from backups.
  return Status::OK();
}
#endif  // !__APPLE__

StatusOr<std::string> Filesystem::ReadFile(const Path& path) {
  std::ifstream file{path.native_value()};
  if (!file) {
    // TODO(varconst): more error details. This will require platform-specific
    // code, because `<iostream>` may not update `errno`.
    return Status{Error::kErrorUnknown,
                  StringFormat("File at path '%s' cannot be opened",
                               path.ToUtf8String())};
  }

  std::stringstream buffer;
  buffer << file.rdbuf();
  return buffer.str();
}

bool IsEmptyDir(const Path& path) {
  // If the DirectoryIterator is valid there's at least one entry.
  auto iter = DirectoryIterator::Create(path);
  return iter->status().ok() && !iter->Valid();
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
