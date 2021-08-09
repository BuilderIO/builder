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

#include "Firestore/core/src/util/path.h"

#include <algorithm>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/string_win.h"
#include "absl/strings/ascii.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {
namespace {

#if defined(_WIN32)
constexpr Path::char_type kPreferredSeparator = L'\\';
#else
constexpr Path::char_type kPreferredSeparator = '/';
#endif

/**
 * Returns the offset within the given path that skips the leading drive letter.
 * If there is no drive letter, returns zero.
 */
size_t OffsetAfterDriveLetter(const Path::char_type* path, size_t size) {
#if defined(_WIN32)
  if (size >= 2 && path[1] == L':') {
    wchar_t drive_letter = path[0];
    if (drive_letter <= 0xFF &&
        absl::ascii_isalpha(static_cast<unsigned char>(drive_letter))) {
      return 2;
    }
  }
  return 0;

#else
  (void)path;
  (void)size;
  return 0;
#endif  // defined(_WIN32)
}

/** Returns true if the given character is a pathname separator. */
inline bool IsSeparator(Path::char_type c) {
#if defined(_WIN32)
  return c == L'/' || c == L'\\';
#else
  return c == '/';
#endif  // defined(_WIN32)
}

bool IsAbsolute(const Path::char_type* path, size_t size) {
  size_t offset = OffsetAfterDriveLetter(path, size);
  return size >= offset && IsSeparator(path[offset]);
}

size_t LastNonSeparator(const Path::char_type* path, size_t size) {
  if (size == 0) return Path::npos;

  for (size_t i = size; i-- > 0;) {
    if (!IsSeparator(path[i])) {
      return i;
    }
  }
  return Path::npos;
}

size_t LastSeparator(const Path::char_type* path, size_t size) {
  if (size == 0) return Path::npos;

  for (size_t i = size; i-- > 0;) {
    if (IsSeparator(path[i])) {
      return i;
    }
  }
  return Path::npos;
}

#if defined(_WIN32)
Path::string_type CanonicalPath(const Path::string_type& path) {
  if (path.empty()) {
    return path;
  }

  // Remove trailing separators, but take care not to remove the trailing slash
  // in a root path name (which can have a drive letter).
  std::wstring copy{path};
  size_t rel_path_begin = OffsetAfterDriveLetter(copy.c_str(), copy.size());
  if (rel_path_begin < copy.size() && IsSeparator(copy[rel_path_begin])) {
    rel_path_begin += 1;
  }

  size_t non_slash = LastNonSeparator(copy.c_str(), copy.size());
  if (non_slash != Path::npos) {
    size_t last_slash = std::max(non_slash + 1, rel_path_begin);
    copy.resize(last_slash);
  }

  // Convert separators to canonical separators.
  std::replace(copy.begin(), copy.end(), L'/', kPreferredSeparator);

  // Convert to lowercase. This relies on C++11 semantics of std::basic_string,
  // namely that:
  //   * s.c_str(), s.data(), and &s[0] are all aliases for each other;
  //   * strings are always contiguous and null terminated; and
  //   * Accessing s[s.size()] is valid and is the null terminator.
  errno_t error = _wcslwr_s(&copy[0], copy.size() + 1);
  HARD_ASSERT(error == 0);

  return copy;
}

#else
absl::string_view CanonicalPath(const Path::string_type& path) {
  size_t non_slash = LastNonSeparator(path.c_str(), path.size());
  if (non_slash == Path::npos) {
    return path;
  }

  return absl::string_view{path.c_str(), non_slash + 1};
}
#endif  // defined(_WIN32)

}  // namespace

constexpr size_t Path::npos;

Path Path::FromUtf8(absl::string_view utf8_pathname) {
#if defined(_WIN32)
  return Path{Utf8ToNative(utf8_pathname)};

#else
  return Path{std::string{utf8_pathname}};
#endif  // defined(_WIN32)
}

#if defined(_WIN32)
Path Path::FromUtf16(const wchar_t* path, size_t size) {
  return Path{string_type{path, size}};
}
#endif

#if defined(_WIN32)
std::string Path::ToUtf8String() const {
  return NativeToUtf8(pathname_);
}
#else
const std::string& Path::ToUtf8String() const {
  return pathname_;
}
#endif  // defined(_WIN32)

Path Path::Basename() const {
  size_t slash = LastSeparator(c_str(), size());
  if (slash == npos) {
    // No path separator found => the whole string.
    return *this;
  }

  // Otherwise everything after the slash is the basename (even if empty string)
  size_t start = slash + 1;
  return Path{pathname_.substr(start)};
}

Path Path::Dirname() const {
  size_t last_slash = LastSeparator(c_str(), size());
  if (last_slash == npos) {
    // No path separator found => empty string. Conformance with POSIX would
    // have us return "." here.
    return {};
  }

  // Collapse runs of slashes.
  size_t non_slash = LastNonSeparator(c_str(), last_slash);
  if (non_slash == npos) {
    // All characters preceding the last path separator are slashes
    return Path{pathname_.substr(0, 1)};
  }

  // Otherwise everything up to the slash is the parent directory
  last_slash = non_slash + 1;
  return Path{pathname_.substr(0, last_slash)};
}

bool Path::IsAbsolute() const {
  return util::IsAbsolute(c_str(), size());
}

bool Path::HasExtension(const Path& ext) const {
  return pathname_.size() >= ext.size() &&
         pathname_.compare(pathname_.size() - ext.size(), ext.size(),
                           ext.native_value()) == 0;
}

Path Path::AppendUtf8(absl::string_view path) const {
  Path result{*this};
  result.MutableAppendUtf8(path);
  return result;
}

void Path::MutableAppendSegment(const char_type* path, size_t size) {
  if (util::IsAbsolute(path, size)) {
    pathname_.assign(path, size);

  } else {
    size_t non_slash = LastNonSeparator(pathname_.c_str(), pathname_.size());
    if (non_slash != npos) {
      pathname_.resize(non_slash + 1);
      pathname_.push_back(kPreferredSeparator);
    }

    // If path started with a slash we'd treat it as absolute above
    pathname_.append(path, size);
  }
}

void Path::MutableAppendUtf8Segment(absl::string_view path) {
#if defined(_WIN32)
  Path segment = Path::FromUtf8(path);
  MutableAppendSegment(segment.c_str(), segment.size());

#else
  MutableAppendSegment(path.data(), path.size());
#endif
}

bool operator==(const Path& lhs, const Path& rhs) {
  return CanonicalPath(lhs.pathname_) == CanonicalPath(rhs.pathname_);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
