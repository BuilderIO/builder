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

#include "Firestore/core/src/util/filesystem.h"

#include <dirent.h>
#include <pwd.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>

#include <cerrno>
#include <cstdio>
#include <deque>
#include <string>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/path.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {

#if !__APPLE__ && !_WIN32
// See filesystem_apple.mm and filesystem_win.cc for other implementations.

namespace {

StatusOr<Path> HomeDir() {
  const char* home_dir = getenv("HOME");
  if (home_dir) return Path::FromUtf8(home_dir);

  passwd pwd;
  passwd* result;
  auto buffer_size = static_cast<size_t>(sysconf(_SC_GETPW_R_SIZE_MAX));
  std::string buffer(buffer_size, '\0');
  uid_t uid = getuid();
  int rc;
  do {
    rc = getpwuid_r(uid, &pwd, &buffer[0], buffer_size, &result);
  } while (rc == EINTR);

  if (rc != 0) {
    return Status::FromErrno(
        rc, "Failed to find the home directory for the current user");
  }

  return Path::FromUtf8(pwd.pw_dir);
}

#if __linux__ && !__ANDROID__
StatusOr<Path> XdgDataHomeDir() {
  const char* data_home = getenv("XDG_DATA_HOME");
  if (data_home) return Path::FromUtf8(data_home);

  StatusOr<Path> maybe_home_dir = HomeDir();
  if (!maybe_home_dir.ok()) return maybe_home_dir;

  const Path& home_dir = maybe_home_dir.ValueOrDie();
  return home_dir.AppendUtf8(".local/share");
}
#endif  // __linux__ && !__ANDROID__

}  // namespace

StatusOr<Path> Filesystem::AppDataDir(absl::string_view app_name) {
#if __linux__ && !__ANDROID__
  // On Linux, use XDG data home, usually $HOME/.local/share/$app_name
  StatusOr<Path> maybe_data_home = XdgDataHomeDir();
  if (!maybe_data_home.ok()) return maybe_data_home;

  return maybe_data_home.ValueOrDie().AppendUtf8(app_name);

#elif !__ANDROID__
  // On any other UNIX, use an old school dotted directory in $HOME.
  StatusOr<Path> maybe_home = HomeDir();
  if (!maybe_home.ok()) return maybe_home;

  std::string dot_prefixed = absl::StrCat(".", app_name);
  return maybe_home.ValueOrDie().AppendUtf8(dot_prefixed);

#else
  // TODO(wilhuff): On Android, use internal storage
#error "Don't know where to store documents on this platform."

#endif  // __linux__ && !__ANDROID__
}

StatusOr<Path> Filesystem::LegacyDocumentsDir(absl::string_view) {
  return Status(Error::kErrorUnimplemented,
                "No legacy storage on this platform.");
}

Path Filesystem::TempDir() {
  const char* env_tmpdir = getenv("TMPDIR");
  if (env_tmpdir) {
    return Path::FromUtf8(env_tmpdir);
  }

#if __ANDROID__
  // The /tmp directory doesn't exist as a fallback; each application is
  // supposed to keep its own temporary files. Previously /data/local/tmp may
  // have been reasonable, but current lore points to this being unreliable for
  // writing at higher API levels or certain phone models because default
  // permissions on this directory no longer permit writing.
  //
  // TODO(wilhuff): Validate on recent Android.
#error "Not yet sure about temporary file locations on Android."
  return Path::FromUtf8("/data/local/tmp");

#else
  return Path::FromUtf8("/tmp");
#endif  // __ANDROID__
}
#endif  // !__APPLE__ && !_WIN32

Status Filesystem::IsDirectory(const Path& path) {
  struct stat buffer {};
  if (::stat(path.c_str(), &buffer)) {
    if (errno == ENOENT) {
      // Expected common error case.
      return Status{Error::kErrorNotFound, path.ToUtf8String()};

    } else if (errno == ENOTDIR) {
      // This is a case where POSIX and Windows differ in behavior in a way
      // that's hard to reconcile from Windows. Under POSIX, ENOTDIR indicates
      // that not only does the path not exist, but that some parent of the
      // path also isn't a directory.
      //
      // Windows, OTOH, returns ERROR_FILE_NOT_FOUND if the file doesn't exist,
      // its immediate parent exists, and the parent is a directory. Otherwise
      // Windows returns ERROR_PATH_NOT_FOUND. To emulate POSIX behavior you
      // have to find the leaf-most existing parent and figure out if it's not a
      // directory.
      //
      // Since we really don't care about this distinction it's easier to
      // resolve this by returning NotFound here.
      return Status{Error::kErrorNotFound, path.ToUtf8String()};
    } else {
      return Status::FromErrno(errno, path.ToUtf8String());
    }
  }

  if (!S_ISDIR(buffer.st_mode)) {
    return Status{Error::kErrorFailedPrecondition,
                  StringFormat("Path %s exists but is not a directory",
                               path.ToUtf8String())};
  }

  return Status::OK();
}

StatusOr<int64_t> Filesystem::FileSize(const Path& path) {
  struct stat st {};
  if (::stat(path.c_str(), &st) == 0) {
    return st.st_size;
  } else {
    return Status::FromErrno(
        errno, StringFormat("Failed to stat file: %s", path.ToUtf8String()));
  }
}

Status Filesystem::CreateDir(const Path& path) {
  if (::mkdir(path.c_str(), 0777)) {
    if (errno != EEXIST) {
      return Status::FromErrno(
          errno,
          StringFormat("Could not create directory %s", path.ToUtf8String()));
    }
  }

  return Status::OK();
}

Status Filesystem::RemoveDir(const Path& path) {
  if (::rmdir(path.c_str())) {
    if (errno != ENOENT) {
      return Status::FromErrno(
          errno,
          StringFormat("Could not delete directory %s", path.ToUtf8String()));
    }
  }
  return Status::OK();
}

Status Filesystem::RemoveFile(const Path& path) {
  if (::unlink(path.c_str())) {
    if (errno != ENOENT) {
      return Status::FromErrno(
          errno, StringFormat("Could not delete file %s", path.ToUtf8String()));
    }
  }
  return Status::OK();
}

Status Filesystem::Rename(const Path& from_path, const Path& to_path) {
  if (::rename(from_path.ToUtf8String().c_str(),
               to_path.ToUtf8String().c_str())) {
    return Status::FromErrno(errno, from_path.ToUtf8String());
  }

  return Status::OK();
}

namespace {

class PosixDirectoryIterator : public DirectoryIterator {
 public:
  explicit PosixDirectoryIterator(const util::Path& path);
  virtual ~PosixDirectoryIterator();

  void Next() override;
  bool Valid() const override;
  Path file() const override;

 private:
  void Advance();

  DIR* dir_ = nullptr;
  struct dirent* entry_ = nullptr;
};

PosixDirectoryIterator::PosixDirectoryIterator(const util::Path& path)
    : DirectoryIterator{path} {
  dir_ = ::opendir(parent_.c_str());
  if (!dir_) {
    status_ = Status::FromErrno(
        errno,
        StringFormat("Could not open directory %s", parent_.ToUtf8String()));
    return;
  }
  Advance();
}

PosixDirectoryIterator::~PosixDirectoryIterator() {
  if (dir_) {
    if (::closedir(dir_) != 0) {
      HARD_FAIL("Could not close directory %s", parent_.ToUtf8String());
    }
  }
}

void PosixDirectoryIterator::Advance() {
  HARD_ASSERT(status_.ok(), "Advancing an errored iterator");
  errno = 0;
  entry_ = ::readdir(dir_);
  if (!entry_) {
    if (errno != 0) {
      status_ = Status::FromErrno(
          errno, StringFormat("Could not read %s", parent_.ToUtf8String()));
    }
  } else if (status_.ok()) {
    // Skip self- and parent-pointer
    if (::strcmp(".", entry_->d_name) == 0 ||
        ::strcmp("..", entry_->d_name) == 0) {
      Advance();
    }
  }
}

void PosixDirectoryIterator::Next() {
  HARD_ASSERT(Valid(), "Next() called on invalid iterator");
  Advance();
}

bool PosixDirectoryIterator::Valid() const {
  return status_.ok() && entry_ != nullptr;
}

Path PosixDirectoryIterator::file() const {
  HARD_ASSERT(Valid(), "file() called on invalid iterator");
  return parent_.AppendUtf8(entry_->d_name, strlen(entry_->d_name));
}

}  // namespace

std::unique_ptr<DirectoryIterator> DirectoryIterator::Create(
    const util::Path& path) {
  return absl::make_unique<PosixDirectoryIterator>(path);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
