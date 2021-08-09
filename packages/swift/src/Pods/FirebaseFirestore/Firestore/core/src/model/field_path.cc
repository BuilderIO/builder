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

#include "Firestore/core/src/model/field_path.h"

#include <algorithm>
#include <utility>

#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/strings/str_join.h"
#include "absl/strings/str_replace.h"
#include "absl/strings/str_split.h"

namespace firebase {
namespace firestore {
namespace model {
namespace {

using util::Status;
using util::StatusOr;
using util::StringFormat;
using util::ThrowInvalidArgument;

/**
 * True if the string could be used as a segment in a field path without
 * escaping. Valid identifies follow the regex [a-zA-Z_][a-zA-Z0-9_]*
 */
bool IsValidIdentifier(const std::string& segment) {
  if (segment.empty()) {
    return false;
  }

  // Note: strictly speaking, only digits are guaranteed by the Standard to
  // be a contiguous range, while alphabetic characters may have gaps. Ignoring
  // this peculiarity, because it doesn't affect the platforms that Firestore
  // supports.
  const unsigned char first = segment.front();
  if (first != '_' && (first < 'a' || first > 'z') &&
      (first < 'A' || first > 'Z')) {
    return false;
  }
  for (size_t i = 1; i != segment.size(); ++i) {
    const unsigned char c = segment[i];
    if (c != '_' && (c < 'a' || c > 'z') && (c < 'A' || c > 'Z') &&
        (c < '0' || c > '9')) {
      return false;
    }
  }

  return true;
}

/** A custom formatter to be used with absl::StrJoin(). */
struct JoinEscaped {
  static std::string escaped_segment(const std::string& segment) {
    auto escaped = absl::StrReplaceAll(segment, {{"\\", "\\\\"}, {"`", "\\`"}});
    const bool needs_escaping = !IsValidIdentifier(escaped);
    if (needs_escaping) {
      escaped.insert(escaped.begin(), '`');
      escaped.push_back('`');
    }
    return escaped;
  }

  template <typename T>
  void operator()(T* out, const std::string& segment) {
    out->append(escaped_segment(segment));
  }
};

}  // namespace

constexpr const char* FieldPath::kDocumentKeyPath;

FieldPath FieldPath::FromDotSeparatedString(const std::string& path) {
  return FromDotSeparatedStringView(path);
}

FieldPath FieldPath::FromDotSeparatedStringView(absl::string_view path) {
  if (path.find_first_of("~*/[]") != absl::string_view::npos) {
    ThrowInvalidArgument(
        "Invalid field path (%s). Paths must not contain '~', '*', '/', '[', "
        "or ']'",
        path);
  }

  SegmentsT segments =
      absl::StrSplit(path, '.', [path](absl::string_view segment) {
        if (segment.empty()) {
          ThrowInvalidArgument(
              "Invalid field path (%s). Paths must not be empty, begin with "
              "'.', end with '.', or contain '..'",
              path);
        }
        return true;
      });

  return FieldPath(std::move(segments));
}

StatusOr<FieldPath> FieldPath::FromServerFormat(const std::string& path) {
  return FromServerFormatView(path);
}

StatusOr<FieldPath> FieldPath::FromServerFormatView(absl::string_view path) {
  SegmentsT segments;
  std::string segment;
  segment.reserve(path.size());

  Status status;

  const auto finish_segment = [&segments, &segment, &path] {
    if (segment.empty()) {
      return Status{
          Error::kErrorInvalidArgument,
          StringFormat(
              "Invalid field path (%s). Paths must not be empty, begin with "
              "'.', end with '.', or contain '..'",
              path)};
    }
    // Move operation will clear segment, but capacity will remain the same
    // (not, strictly speaking, required by the standard, but true in practice).
    segments.push_back(std::move(segment));
    return Status::OK();
  };

  // Inside backticks, dots are treated literally.
  bool inside_backticks = false;
  size_t i = 0;
  while (i < path.size()) {
    const char c = path[i];
    // std::string (and string_view) may contain embedded nulls. For full
    // compatibility with Objective C behavior, finish upon encountering the
    // first terminating null.
    if (c == '\0') {
      break;
    }

    switch (c) {
      case '.':
        if (!inside_backticks) {
          status = finish_segment();
        } else {
          segment += c;
        }
        break;

      case '`':
        inside_backticks = !inside_backticks;
        break;

      case '\\':
        if (i + 1 == path.size()) {
          status =
              Status{Error::kErrorInvalidArgument,
                     StringFormat(
                         "Trailing escape characters not allowed in %s", path)};
        } else {
          ++i;
          segment += path[i];
        }
        break;

      default:
        segment += c;
        break;
    }
    ++i;

    if (!status.ok()) return status;
  }

  status = finish_segment();
  if (!status.ok()) return status;

  if (inside_backticks) {
    return Status{Error::kErrorInvalidArgument,
                  StringFormat("Unterminated ` in path %s", path)};
  }

  return FieldPath{std::move(segments)};
}

const FieldPath& FieldPath::EmptyPath() {
  static const FieldPath empty_path;
  return empty_path;
}

const FieldPath& FieldPath::KeyFieldPath() {
  static const FieldPath key_field_path{FieldPath::kDocumentKeyPath};
  return key_field_path;
}

bool FieldPath::IsKeyFieldPath() const {
  return size() == 1 && first_segment() == FieldPath::kDocumentKeyPath;
}

std::string FieldPath::CanonicalString() const {
  return absl::StrJoin(begin(), end(), ".", JoinEscaped());
}

void FieldPath::ValidateSegments(const SegmentsT& segments) {
  if (segments.empty()) {
    ThrowInvalidArgument(
        "Invalid field path. Provided names must not be empty.");
  }

  for (size_t i = 0; i < segments.size(); i++) {
    if (segments[i].empty()) {
      ThrowInvalidArgument(
          "Invalid field name at index %s. Field names must not be empty.", i);
    }
  }
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
