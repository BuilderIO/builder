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

#ifndef FIRESTORE_CORE_SRC_UTIL_FILESYSTEM_H_
#define FIRESTORE_CORE_SRC_UTIL_FILESYSTEM_H_

#include <memory>
#include <string>

#include "Firestore/core/src/util/status.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

class Path;

template <typename T>
class StatusOr;

/**
 * A high-level interface describing filesystem operations.
 */
class Filesystem {
 public:
  virtual ~Filesystem() = default;

  Filesystem(const Filesystem&) = delete;
  Filesystem& operator=(const Filesystem&) = delete;

  /**
   * Returns a singleton default filesystem implementation for the current
   * operating system.
   */
  static Filesystem* Default();

  /**
   * Returns a system-defined best directory in which to create application
   * data. Values vary wildly across platforms. They include:
   *
   *   * iOS: $container/Library/Application Support/$app_name
   *   * Linux: $HOME/.local/share/$app_name
   *   * macOS: $container/Library/Application Support/$app_name
   *   * Other UNIX: $HOME/.$app_name
   *   * tvOS: $container/Library/Caches/$app_name
   *   * Windows: %USERPROFILE%/AppData/Local
   *
   * On iOS, tvOS, and macOS (when running sandboxed), these locations are
   * relative to the data container for the current application. On macOS when
   * the application is not sandboxed, the returned value will be relative to
   * $HOME instead. See "About the iOS File System" in the Apple "File System
   * Programming Guide" at https://apple.co/2Nn7Bsb.
   *
   * Note: the returned path is just where the system thinks the application
   * data should be stored, but AppDataDir does not actually guarantee that this
   * path exists.
   *
   * @param app_name The name of the application.
   */
  virtual StatusOr<Path> AppDataDir(absl::string_view app_name);

  /**
   * Returns the Documents directory in which Firestore used to store
   * application data. Values vary wildly across platforms. They include:
   *
   *   * iOS: $container/Documents/$app_name
   *   * macOS: $HOME/.$app_name
   *
   * On iOS, the Documents folder is relative to the data container for the
   * current application. See "About the iOS File System" in the Apple "File
   * System Programming Guide" at https://apple.co/2Nn7Bsb.
   *
   * Note: the returned path is just where the system thinks the documents
   * directory should be stored, but LegacyDocumentsDir does not actually
   * guarantee that this path exists.
   *
   * @param app_name The name of the application.
   *
   * @returns The documents directory path or a status with
   * Error::kErrorUnimplemented if the current platform does not have a legacy
   * documents directory.
   */
  virtual StatusOr<Path> LegacyDocumentsDir(absl::string_view app_name);

  /**
   * Returns system-defined best directory in which to create temporary files.
   * Typical return values are like `/tmp` on UNIX systems. Clients should
   * create randomly named directories or files within this location to avoid
   * collisions. Absent any changes that might affect the underlying calls, the
   * value returned from TempDir will be stable over time.
   *
   * Note: the returned path is just where the system thinks temporary files
   * should be stored, but TempDir does not actually guarantee that this path
   * exists.
   */
  virtual Path TempDir();

  /**
   * Answers the question "is this path a directory? The path is not required to
   * have a trailing slash.
   *
   * Typical return codes include:
   *   * Ok - The path exists and is a directory.
   *   * FailedPrecondition - Some component of the path is not a directory.
   * This does not necessarily imply that the path exists and is a file.
   *   * NotFound - The path does not exist
   *   * PermissionDenied - Insufficient permissions to access the path.
   */
  virtual Status IsDirectory(const Path& path);

  /**
   * On success, returns the size in bytes of the file specified by
   * `path`.
   */
  virtual StatusOr<int64_t> FileSize(const Path& path);

  /**
   * Recursively creates all the directories in the path name if they don't
   * exist.
   *
   * @return Ok if the directory was created or already existed.
   */
  virtual Status RecursivelyCreateDir(const Path& path);

  /**
   * Recursively deletes the contents of the given pathname. If the pathname is
   * a file, deletes just that file. The the pathname is a directory, deletes
   * everything within the directory.
   *
   * @return Ok if the directory was deleted or did not exist.
   */
  virtual Status RecursivelyRemove(const Path& path);

  /**
   * Creates the given directory. The immediate parent directory must already
   * exist and not already be a file.
   *
   * @return Ok if the directory was created or already existed. On some systems
   *     this may also return Ok if a regular file exists at the given path.
   */
  virtual Status CreateDir(const Path& path);

  /**
   * Deletes the given directory if it exists.
   *
   * @return Ok if the directory was deleted or did not exist. Returns a
   *     system-defined error if the path is not a directory or the directory is
   *     non-empty.
   */
  virtual Status RemoveDir(const Path& path);

  /**
   * Deletes the given file if it exists.
   *
   * @return Ok if the file was deleted or did not exist. Returns a
   * system-defined error if the path exists but is not a regular file.
   */
  virtual Status RemoveFile(const Path& path);

  /**
   * Recursively deletes the contents of the given pathname that is known to be
   * a directory.
   *
   * @return Ok if the directory was deleted or did not exist. Returns a
   *     system-defined error if the path exists but is not a directory.
   *
   */
  virtual Status RecursivelyRemoveDir(const Path& path);

  virtual Status Rename(const Path& from_path, const Path& to_path);

  /**
   * Marks the given directory as excluded from platform-specific backup schemes
   * like iCloud backup.
   */
  virtual Status ExcludeFromBackups(const Path& dir);

  /**
   * On success, opens the file at the given `path` and returns its contents as
   * a string.
   */
  virtual StatusOr<std::string> ReadFile(const Path& path);

 protected:
  Filesystem() = default;
};

/**
 * Returns true if the path is an accessible directory and is empty.
 */
bool IsEmptyDir(const Path& path);

/**
 * Implements an iterator over the contents of a directory. Initializes to the
 * first entry in the directory.
 */
class DirectoryIterator {
 public:
  /**
   * Creates a new platform-specific directory iterator.
   *
   * @param path The path over which to iterate (must outlive the
   *     DirectoryIterator).
   */
  static std::unique_ptr<DirectoryIterator> Create(const Path& path);

  virtual ~DirectoryIterator() = default;

  /**
   * Advances the iterator.
   */
  virtual void Next() = 0;

  /**
   * Returns true if `Next()` and `file()` can be called on the iterator.
   * If `Valid() == false && status().ok()`, then iteration has finished.
   */
  virtual bool Valid() const = 0;

  /**
   * Return the full path of the current entry pointed to by the iterator.
   */
  virtual Path file() const = 0;

  /**
   * Returns the last error encountered by the iterator, or OK.
   */
  Status status() const {
    return status_;
  }

 protected:
  /**
   * `path` should outlive the iterator.
   */
  explicit DirectoryIterator(const Path& path) : parent_{path} {
  }

  DirectoryIterator(const DirectoryIterator& other) = delete;
  DirectoryIterator& operator=(const DirectoryIterator& other) = delete;

  Status status_;
  const Path& parent_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_FILESYSTEM_H_
