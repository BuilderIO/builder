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

#ifndef FIRESTORE_CORE_SRC_MODEL_BASE_PATH_H_
#define FIRESTORE_CORE_SRC_MODEL_BASE_PATH_H_

#include <algorithm>
#include <cctype>
#include <initializer_list>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"

namespace firebase {
namespace firestore {
namespace model {
namespace impl {

/**
 * BasePath represents a path sequence in the Firestore database. It is composed
 * of an ordered sequence of string segments.
 *
 * BasePath is reassignable and movable. Apart from those, all other mutating
 * operations return new independent instances.
 *
 * ## Subclassing Notes
 *
 * BasePath is strictly meant as a base class for concrete implementations. It
 * doesn't contain a single virtual method, can't be instantiated, and should
 * never be used in any polymorphic way. BasePath is templated to allow static
 * factory methods to return objects of the derived class (the expected
 * inheritance would use CRTP: struct Derived : BasePath<Derived>).
 */
template <typename T>
class BasePath {
 protected:
  using SegmentsT = std::vector<std::string>;

 public:
  using const_iterator = SegmentsT::const_iterator;

  /** Returns i-th segment of the path. */
  const std::string& operator[](const size_t i) const {
    HARD_ASSERT(i < segments_.size(), "index %s out of range", i);
    return segments_[i];
  }

  /** Returns the first segment of the path. */
  const std::string& first_segment() const {
    HARD_ASSERT(!empty(), "Cannot call first_segment on empty path");
    return segments_[0];
  }
  /** Returns the last segment of the path. */
  const std::string& last_segment() const {
    HARD_ASSERT(!empty(), "Cannot call last_segment on empty path");
    return segments_[size() - 1];
  }

  size_t size() const {
    return segments_.size();
  }
  bool empty() const {
    return segments_.empty();
  }

  const_iterator begin() const {
    return segments_.begin();
  }
  const_iterator end() const {
    return segments_.end();
  }

  /**
   * Returns a new path which is the result of concatenating this path with an
   * additional segment.
   */
  T Append(const std::string& segment) const {
    auto appended = segments_;
    appended.push_back(segment);
    return T{std::move(appended)};
  }
  T Append(std::string&& segment) const {
    auto appended = segments_;
    appended.push_back(std::move(segment));
    return T{std::move(appended)};
  }

  /**
   * Returns a new path which is the result of concatenating this path with an
   * another path.
   */
  T Append(const T& path) const {
    auto appended = segments_;
    appended.insert(appended.end(), path.begin(), path.end());
    return T{std::move(appended)};
  }

  /**
   * Returns a new path which is the result of omitting the first n segments of
   * this path.
   */
  T PopFirst(const size_t n = 1) const {
    HARD_ASSERT(n <= size(), "Cannot call PopFirst(%s) on path of length %s", n,
                size());
    return T{begin() + n, end()};
  }

  /**
   * Returns a new path which is the result of omitting the last segment of
   * this path.
   */
  T PopLast() const {
    HARD_ASSERT(!empty(), "Cannot call PopLast() on empty path");
    return T{begin(), end() - 1};
  }

  /**
   * Returns true if this path is a prefix of the given path.
   *
   * Empty path is a prefix of any path. Any path is a prefix of itself.
   */
  bool IsPrefixOf(const T& rhs) const {
    return size() <= rhs.size() && std::equal(begin(), end(), rhs.begin());
  }

  /**
   * Returns true if the given argument is a direct child of this path.
   *
   * Empty path is a parent of any path that consists of a single segment.
   */
  bool IsImmediateParentOf(const T& potential_child) const {
    return size() + 1 == potential_child.size() &&
           std::equal(begin(), end(), potential_child.begin());
  }

  util::ComparisonResult CompareTo(const T& rhs) const {
    return util::CompareContainer(segments_, rhs.segments_);
  }

  friend bool operator==(const BasePath& lhs, const BasePath& rhs) {
    return lhs.segments_ == rhs.segments_;
  }

  size_t Hash() const {
    return util::Hash(segments_);
  }

 protected:
  BasePath() = default;
  template <typename IterT>
  BasePath(const IterT begin, const IterT end) : segments_{begin, end} {
  }
  BasePath(std::initializer_list<std::string> list) : segments_{list} {
  }
  explicit BasePath(SegmentsT&& segments) : segments_{std::move(segments)} {
  }

 private:
  SegmentsT segments_;
};

}  // namespace impl
}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_BASE_PATH_H_
