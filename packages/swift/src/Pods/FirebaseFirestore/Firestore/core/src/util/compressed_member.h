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

#ifndef FIRESTORE_CORE_SRC_UTIL_COMPRESSED_MEMBER_H_
#define FIRESTORE_CORE_SRC_UTIL_COMPRESSED_MEMBER_H_

#include <type_traits>
#include <utility>

namespace firebase {
namespace firestore {
namespace util {

/**
 * A numbered member of some other class that implements the empty
 * base optimization. This makes it possible to hold a value of an
 * empty type without using any space.
 *
 * Use by inheriting privately from CompressedMember.
 */
template <typename T, int position = 0, bool = std::is_empty<T>::value>
class CompressedMember : private T {
 public:
  CompressedMember() = default;
  explicit CompressedMember(const T& t) : T(t) {
  }
  explicit CompressedMember(T&& t) : T(std::move(t)) {
  }

  T& get() noexcept {
    return *this;
  }
  const T& get() const noexcept {
    return *this;
  }
};

/**
 * Specialization of CompressedMember for the case where the type T
 * is non-empty.
 */
template <typename T, int position>
class CompressedMember<T, position, false> {
 public:
  CompressedMember() = default;
  explicit CompressedMember(const T& t) : value_(t) {
  }
  explicit CompressedMember(T&& t) : value_(std::move(t)) {
  }

  T& get() noexcept {
    return value_;
  }
  const T& get() const noexcept {
    return value_;
  }

 private:
  T value_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_COMPRESSED_MEMBER_H_
