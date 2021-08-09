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

#ifndef FIRESTORE_CORE_SRC_UTIL_HASHING_H_
#define FIRESTORE_CORE_SRC_UTIL_HASHING_H_

#include <functional>
#include <iterator>
#include <string>
#include <type_traits>

#include "Firestore/core/src/objc/objc_type_traits.h"
#include "Firestore/core/src/util/type_traits.h"
#include "absl/meta/type_traits.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace util {

// This is a pretty terrible hash implementation for lack of a better one being
// readily available. It exists as a portability crutch between our existing
// Objective-C code where overriding `-isEqual:` also requires `-hash` and C++
// where `operator==()` can be defined without defining a hash code.
//
// It's based on the recommendation in Effective Java, Item 9, wherein you
// implement composite hashes like so:
//
//     size_t result = first_;
//     result = 31 * result + second_;
//     result = 31 * result + third_;
//     // ...
//     return result;
//
// This is the basis of this implementation because that's what the existing
// Objective-C code mostly does by hand. Using this implementation gets the
// same result by calling
//
//     return util::Hash(first_, second_, /* ..., */ third_);
//
// TODO(wilhuff): Replace this with whatever Abseil releases.

namespace impl {

/**
 * A type trait that identifies whether or not std::hash is available for a
 * given type.
 *
 * This type should not be necessary since specialization failure on an
 * expression like `decltype(std::hash<K>{}(value)` should be enough to disable
 * overloads that require `std::hash` to be defined but unfortunately some
 * standard libraries ship with std::hash defined for all types that only
 * fail later (e.g. via static_assert). One such implementation is the libc++
 * that ships with Xcode 8.3.3, which is a supported platform.
 */
template <typename T>
struct has_std_hash {
  // There may be other types for which std::hash is defined but they don't
  // matter for our purposes.
  enum {
    value = std::is_arithmetic<T>{} || std::is_pointer<T>{} ||
            std::is_same<T, std::string>{}
  };

  constexpr operator bool() const {
    return value;
  }
};

/**
 * A type that's equivalent to size_t if std::hash<T> is defined or a compile
 * error otherwise.
 *
 * This is effectively just a safe implementation of
 * `decltype(std::hash<T>{}(std::declval<T>()))`.
 */
template <typename T>
using std_hash_type =
    typename absl::enable_if_t<has_std_hash<T>::value, size_t>;

/**
 * Combines a hash_value with whatever accumulated state there is so far.
 */
constexpr size_t Combine(size_t state, size_t hash_value) {
  return 31 * state + hash_value;
}

/**
 * Explicit ordering of hashers, allowing SFINAE without all the enable_if
 * cruft.
 *
 * In order we try:
 *   * A Hash() member, if defined and the return type is an integral type
 *   * A `-hash` method, if dealing with an Objective-C class
 *   * A std::hash specialization, if available
 *   * A range-based specialization, valid if either of the above hold on the
 *     members of the range.
 *
 * Explicit ordering resolves the ambiguity of the case where a std::hash
 * specialization is available, but the type is also a range for whose members
 * std::hash is also available, e.g. with std::string.
 *
 * HashChoice is a recursive type, defined such that HashChoice<0> is the most
 * specific type with HashChoice<1> and beyond being progressively less
 * specific. This causes the compiler to prioritize the overloads with
 * lower-numbered HashChoice types, allowing compilation to succeed even if
 * multiple specializations match.
 */
template <int I>
struct HashChoice : HashChoice<I + 1> {};

template <>
struct HashChoice<5> {};

template <typename K>
size_t InvokeHash(const K& value);

/**
 * Hashes the given value if it defines a Hash() member.
 *
 * @return The result of `value.Hash()`.
 */
template <typename K>
auto RankedInvokeHash(const K& value, HashChoice<0>) -> decltype(value.Hash()) {
  return value.Hash();
}

#if __OBJC__

/**
 * Hashes the given value if it's of an Objective-C class (and thus defines
 * `-hash`.
 *
 * @return The result of `[value hash]`, converted to `size_t`.
 */
template <typename K,
          typename = absl::enable_if_t<objc::is_objc_pointer<K>::value>>
size_t RankedInvokeHash(const K& value, HashChoice<1>) {
  return static_cast<size_t>([value hash]);
}

#endif

/**
 * Hashes the given value if it has a specialization of std::hash.
 *
 * @return The result of `std::hash<K>{}(value)`
 */
template <typename K>
std_hash_type<K> RankedInvokeHash(const K& value, HashChoice<2>) {
  return std::hash<K>{}(value);
}

/**
 * Hashes the contents of the given range of values if the value_type of the
 * range can be hashed.
 */
template <typename Range>
auto RankedInvokeHash(const Range& range, HashChoice<3>)
    -> decltype(InvokeHash(*std::begin(range))) {
  size_t result = 0;
  size_t size = 0;
  for (auto&& element : range) {
    ++size;
    size_t piece = InvokeHash(element);
    result = Combine(result, piece);
  }
  size_t size_hash = InvokeHash(size);
  result = Combine(result, size_hash);
  return result;
}

/**
 * Hashes the contents of the given optional value, only if the underlying
 * value can itself be hashed.
 */
template <typename K>
auto RankedInvokeHash(const absl::optional<K>& option, HashChoice<4>)
    -> decltype(InvokeHash(*option)) {
  return option ? InvokeHash(*option) : -1171;
}

template <typename K, typename = absl::enable_if_t<std::is_enum<K>::value>>
size_t RankedInvokeHash(K value, HashChoice<5>) {
  auto underlying = static_cast<typename std::underlying_type<K>::type>(value);
  return InvokeHash(underlying);
}

template <typename K>
size_t InvokeHash(const K& value) {
  return RankedInvokeHash(value, HashChoice<0>{});
}

inline size_t HashInternal(size_t state) {
  return state;
}

template <typename T, typename... Ts>
size_t HashInternal(size_t state, const T& value, const Ts&... rest) {
  state = Combine(state, InvokeHash(value));
  return HashInternal(state, rest...);
}

}  // namespace impl

template <typename... Ts>
size_t Hash(const Ts&... values) {
  return impl::HashInternal(0u, values...);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_HASHING_H_
