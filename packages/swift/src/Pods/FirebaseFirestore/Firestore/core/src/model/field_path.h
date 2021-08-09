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

#ifndef FIRESTORE_CORE_SRC_MODEL_FIELD_PATH_H_
#define FIRESTORE_CORE_SRC_MODEL_FIELD_PATH_H_

#include <initializer_list>
#include <string>
#include <utility>

#include "Firestore/core/src/model/base_path.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {

namespace remote {
class Serializer;
}  // namespace remote

namespace model {

/**
 * A dot-separated path for navigating sub-objects within a document.
 *
 * Immutable; all instances are fully independent.
 */
class FieldPath : public impl::BasePath<FieldPath>,
                  public util::Comparable<FieldPath> {
 public:
  /** The field path string that represents the document's key. */
  static constexpr const char* kDocumentKeyPath = "__name__";

  // Note: Xcode 8.2 requires explicit specification of the constructor.
  FieldPath() : impl::BasePath<FieldPath>() {
  }

  /** Constructs the path from segments. */
  template <typename IterT>
  FieldPath(const IterT begin, const IterT end) : BasePath{begin, end} {
  }
  FieldPath(std::initializer_list<std::string> list) : BasePath{list} {
  }
  explicit FieldPath(SegmentsT&& segments) : BasePath{std::move(segments)} {
  }

  /**
   * Creates and returns a new path from a dot-separated field-path string,
   * where path segments are separated by a dot ".".
   *
   * PORTING NOTE: We define this on the model class to avoid having a tiny
   * api::FieldPath wrapper class.
   */
  static FieldPath FromDotSeparatedString(const std::string& path);

 private:
  // TODO(b/146372592): Make this public once we can use Abseil across
  // iOS/public C++ library boundaries.
  friend class remote::Serializer;

  static FieldPath FromDotSeparatedStringView(absl::string_view path);

 public:
  /**
   * Creates and returns a new path from a set of segments received from the
   * public API.
   */
  static FieldPath FromSegments(SegmentsT&& segments) {
    ValidateSegments(segments);
    FieldPath path(std::move(segments));
    return path;
  }

  /**
   * Creates and returns a new path from the server formatted field-path string,
   * where path segments are separated by a dot "." and optionally encoded using
   * backticks.
   */
  static util::StatusOr<FieldPath> FromServerFormat(const std::string& path);

 private:
  // TODO(b/146372592): Make this public once we can use Abseil across
  // iOS/public C++ library boundaries.
  static util::StatusOr<FieldPath> FromServerFormatView(absl::string_view path);

 public:
  /** Returns a field path that represents an empty path. */
  static const FieldPath& EmptyPath();
  /** Returns a field path that represents a document key. */
  static const FieldPath& KeyFieldPath();

  /** True if this FieldPath represents a document key. */
  bool IsKeyFieldPath() const;

  /** Returns a standardized string representation of this path. */
  std::string CanonicalString() const;

 private:
  static void ValidateSegments(const SegmentsT& segments);
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_FIELD_PATH_H_
