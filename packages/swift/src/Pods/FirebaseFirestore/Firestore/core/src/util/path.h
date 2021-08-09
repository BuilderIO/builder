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

#ifndef FIRESTORE_CORE_SRC_UTIL_PATH_H_
#define FIRESTORE_CORE_SRC_UTIL_PATH_H_

#include <string>
#include <utility>

#include "Firestore/core/src/util/string_apple.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * An immutable native pathname string. Paths can be absolute or relative. Paths
 * internally maintain their filesystem-native encoding.
 *
 * The intent of the API is that high-level code generally just uses UTF-8-
 * encoded string-literals or strings for the segments and constructs a
 * filesystem-native Path using APIs like Path::JoinUtf8.
 *
 * Lower level code may need to construct derived Paths from values obtained
 * from the filesystem that already are in the right encoding.
 */
class Path {
 public:
#if defined(_WIN32)
  using char_type = wchar_t;
#else
  using char_type = char;
#endif

  using string_type = std::basic_string<char_type>;

  static constexpr size_t npos = static_cast<size_t>(-1);

  /**
   * Creates a new Path from a UTF-8-encoded pathname.
   */
  static Path FromUtf8(absl::string_view utf8_pathname);

#if defined(_WIN32)
  /**
   * Creates a new Path from a UTF-16-encoded pathname.
   */
  // absl::wstring_view does not exist :-(.
  static Path FromUtf16(const wchar_t* begin, size_t size);
#endif

#if defined(__OBJC__)
  /**
   * Creates a new Path from the given NSString pathname.
   */
  static Path FromNSString(NSString* path) {
    return FromUtf8(MakeString(path));
  }
#endif

  Path() = default;

  const string_type& native_value() const {
    return pathname_;
  }

  const char_type* c_str() const {
    return pathname_.c_str();
  }

  bool empty() const {
    return pathname_.empty();
  }

  size_t size() const {
    return pathname_.size();
  }

#if defined(_WIN32)
  std::string ToUtf8String() const;
#else
  const std::string& ToUtf8String() const;
#endif  // defined(_WIN32)

#if defined(__OBJC__)
  NSString* ToNSString() const {
    return MakeNSString(native_value());
  }
#endif

  /**
   * Returns a new Path containing the unqualified trailing part of this path,
   * e.g. "c" for "/a/b/c".
   */
  Path Basename() const;

  /**
   * Returns a new Path containing the parent directory of this path, e.g.
   * "/a/b" for "/a/b/c".
   *
   * Note:
   *   * Trailing slashes are treated as a separator between an empty path
   *     segment and the dirname, so the Dirname of "/a/b/c/" is "/a/b/c".
   *   * Runs of more than one slash are treated as a single separator, so
   *     the Dirname of "/a/b//c" is "/a/b".
   *   * Paths are not canonicalized, so the Dirname of "/a//b//c" is "/a//b".
   */
  Path Dirname() const;

  /**
   * Returns true if this Path is an absolute path.
   */
  bool IsAbsolute() const;

  /**
   * Returns true if this pathname's last component has the given file
   * extension.
   *
   * @param ext The file extension (including leading dot).
   */
  bool HasExtension(const Path& ext) const;

  /**
   * Returns a new Path with the given UTF-8 encoded path segment appended,
   * as if by calling `Append(Path::FromUtf8(path))`.
   */
  Path AppendUtf8(absl::string_view path) const;
  Path AppendUtf8(const char* path, size_t size) const {
    return AppendUtf8(absl::string_view{path, size});
  }

#if defined(_WIN32)
  Path AppendUtf16(const wchar_t* path, size_t size) const {
    Path result{*this};
    result.MutableAppendSegment(path, size);
    return result;
  }
#endif

  /**
   * Returns the paths separated by path separators.
   *
   * @param base If base is of type std::string&& the result is moved from this
   *     value. Otherwise the first argument is copied.
   * @param paths The rest of the path segments.
   */
  template <typename P1, typename... PA>
  static Path JoinUtf8(P1&& base, const PA&... paths) {
    Path result = Path::FromUtf8(base);
    result.MutableAppendUtf8(paths...);
    return result;
  }

  friend bool operator==(const Path& lhs, const Path& rhs);
  friend bool operator!=(const Path& lhs, const Path& rhs) {
    return !(lhs == rhs);
  }

 private:
  explicit Path(string_type&& native_pathname)
      : pathname_{std::move(native_pathname)} {
  }

  /**
   * If `path` is relative, appends it to `*this`. If `path` is absolute,
   * replaces `*this`.
   */
  template <typename... P>
  void MutableAppend(const Path& path, const P&... rest) {
    MutableAppendSegment(path.c_str(), path.size());
    MutableAppend(rest...);
  }
  void MutableAppend() {
    // Recursive base case; nothing to do.
  }
  void MutableAppendSegment(const char_type* path, size_t size);

  /**
   * If `path` is relative, appends it to `*this`. If `path` is absolute,
   * replaces `*this`.
   */
  template <typename P1, typename... P>
  void MutableAppendUtf8(const P1& path, const P&... rest) {
    MutableAppendUtf8Segment(path);
    MutableAppendUtf8(rest...);
  }
  void MutableAppendUtf8Segment(absl::string_view path);
  void MutableAppendUtf8Segment(const Path& path) {
    // Allow existing Paths to be passed to Path::JoinUtf8.
    MutableAppendSegment(path.c_str(), path.size());
  }
  void MutableAppendUtf8() {
    // Recursive base case; nothing to do.
  }

  /**
   * Returns a copy of the given path.
   *
   * This non-public variant of FromUtf8 allows JoinUtf8 to take a Path as its
   * first argument.
   */
  static Path FromUtf8(const Path& path) {
    return path;
  }

  string_type pathname_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_PATH_H_
