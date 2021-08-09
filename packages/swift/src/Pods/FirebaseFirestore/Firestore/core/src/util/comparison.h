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

#ifndef FIRESTORE_CORE_SRC_UTIL_COMPARISON_H_
#define FIRESTORE_CORE_SRC_UTIL_COMPARISON_H_

#if __OBJC__
#import <Foundation/Foundation.h>
#endif

#include <sys/types.h>

#include <cstdint>
#include <functional>
#include <string>
#include <utility>
#include <vector>

#include "absl/meta/type_traits.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * An enumeration describing the result of a three-way comparison among
 * strongly-ordered values (i.e. where comparison between values always yields
 * less-than, equal-to, or greater-than).
 *
 * This is equivalent to:
 *
 *   * NSComparisonResult from the iOS/macOS Foundation framework.
 *   * std::strong_ordering from C++20
 *
 * The values of the constants are specifically chosen so as to make casting
 * between this type and NSComparisonResult possible.
 */
enum class ComparisonResult {
  /** The left hand side was less than the right. */
  Ascending = -1,

  /** The left hand side was equal to the right. */
  Same = 0,

  /** The left hand side was greater than the right. */
  Descending = 1
};

constexpr bool Ascending(ComparisonResult result) noexcept {
  return result == ComparisonResult::Ascending;
}

constexpr bool Same(ComparisonResult result) noexcept {
  return result == ComparisonResult::Same;
}

constexpr bool Descending(ComparisonResult result) noexcept {
  return result == ComparisonResult::Descending;
}

/**
 * Creates a ComparisonResult from a typical integer return value, where
 * 0 means "same", less than zero means "ascending", and greater than zero
 * means "descending".
 */
constexpr ComparisonResult ComparisonResultFromInt(int value) {
  // TODO(c++14): convert this to an if statement.
  return value < 0 ? ComparisonResult::Ascending
                   : (value > 0 ? ComparisonResult::Descending
                                : ComparisonResult::Same);
}

/**
 * Returns the reverse order (i.e. Ascending => Descending) etc.
 */
constexpr ComparisonResult ReverseOrder(ComparisonResult result) {
  return static_cast<ComparisonResult>(-static_cast<int>(result));
}

#if __OBJC__
/**
 * Returns true if the given ComparisonResult and NSComparisonResult have the
 * same integer values (at compile time).
 */
constexpr bool EqualValue(ComparisonResult lhs, NSComparisonResult rhs) {
  return static_cast<int>(lhs) == static_cast<int>(rhs);
}

static_assert(EqualValue(ComparisonResult::Ascending, NSOrderedAscending),
              "Ascending invalid");
static_assert(EqualValue(ComparisonResult::Same, NSOrderedSame),
              "Same invalid");
static_assert(EqualValue(ComparisonResult::Descending, NSOrderedDescending),
              "Descending invalid");

/** Converts NSComparisonResult to ComparisonResult. */
constexpr ComparisonResult MakeComparisonResult(NSComparisonResult value) {
  return static_cast<ComparisonResult>(value);
}

/** Converts ComparisonResult to NSComparisonResult. */
constexpr NSComparisonResult MakeNSComparisonResult(ComparisonResult value) {
  return static_cast<NSComparisonResult>(value);
}
#endif  // __OBJC__

/**
 * A generalized comparator for types in Firestore, with ordering defined
 * according to Firestore's semantics.
 *
 * How a given type is compared depends on the type itself:
 *
 *   - (Objective-C++-only) If T* is an Objective-C object pointer then
 *     invokes the `-compare:` member. Note that if T does not actually define
 *     `-compare:` this will fail. This is unconditional this way because no
 *     other alternative is valid for pointer types.
 *
 *   - If T defines a `CompareTo(T) const` member function, then Compare will
 *     invoke `lhs.CompareTo(rhs)`.
 *
 *   - Otherwise, invokes `DefaultCompare(lhs, rhs)`.
 */
template <typename T>
struct Comparator;

template <typename T>
struct DefaultComparator {
  ComparisonResult Compare(const T& left, const T& right) const {
    if (left < right) {
      return ComparisonResult::Ascending;
    } else if (right < left) {
      return ComparisonResult::Descending;
    } else {
      return ComparisonResult::Same;
    }
  }
};

/** Compares two strings. */
template <>
struct Comparator<absl::string_view> {
  ComparisonResult Compare(absl::string_view left,
                           absl::string_view right) const;
};

template <>
struct Comparator<std::string> {
  Comparator() = default;
  // GCC 4.8.5 has trouble implicitly generating copy operations (`=default`
  // doesn't work as well).
  Comparator(const Comparator&) {
  }
  Comparator& operator=(const Comparator&) {
    return *this;
  }

  ComparisonResult Compare(const std::string& left,
                           const std::string& right) const;
};

/** Compares two bools: false < true. */
template <>
struct Comparator<bool> : public DefaultComparator<bool> {};

/** Compares two int32_t. */
template <>
struct Comparator<int32_t> : public DefaultComparator<int32_t> {};

/** Compares two int64_t. */
template <>
struct Comparator<int64_t> : public DefaultComparator<int64_t> {};

/** Compares two doubles (using Firestore semantics for NaN). */
template <>
struct Comparator<double> {
  ComparisonResult Compare(double left, double right) const;
};

/**
 * Perform a three-way comparison between the left and right values using
 * the appropriate Comparator for the values based on their type.
 *
 * Essentially a shortcut for Comparator<T>().Compare(left, right), where
 * Comparator<T> is default constructible.
 */
template <typename T, typename C = Comparator<T>>
ComparisonResult Compare(const T& left,
                         const T& right,
                         const C& comparator = C()) {
  return comparator.Compare(left, right);
}

#if __OBJC__
/**
 * Performs a three-way comparison, identically to Compare, but converts the
 * result to an NSComparisonResult.
 *
 * This function exists for interoperation with Objective-C++ and should
 * eventually be removed.
 */
template <typename T>
inline NSComparisonResult WrapCompare(const T& left, const T& right) {
  return MakeNSComparisonResult(Compare<T>(left, right));
}
#endif  // __OBJC__

namespace impl {

/**
 * Checks wither the type T has a `CompareTo` member.
 */
template <typename T, typename = absl::void_t<>>
struct has_compare_to : public std::false_type {};

template <typename T>
struct has_compare_to<
    T,
    absl::void_t<decltype(std::declval<T>().CompareTo(std::declval<T>()))>>
    : public std::true_type {};

/**
 * Implements ranked choice among overloads below.
 */
template <int I>
struct CompareChoice : CompareChoice<I + 1> {};

template <>
struct CompareChoice<2> {};

// Use a `CompareTo` member, if available
template <typename T, typename = absl::enable_if_t<has_compare_to<T>::value>>
ComparisonResult CompareImpl(const T& lhs, const T& rhs, CompareChoice<1>) {
  return lhs.CompareTo(rhs);
}

// Otherwise, fall back on less than.
template <typename T, typename = void>
ComparisonResult CompareImpl(const T& lhs, const T& rhs, CompareChoice<2>) {
  DefaultComparator<T> comparator;
  return comparator.Compare(lhs, rhs);
}

}  // namespace impl

template <typename T>
struct Comparator {
  ComparisonResult Compare(const T& lhs, const T& rhs) const {
    return impl::CompareImpl(lhs, rhs, impl::CompareChoice<0>{});
  }
};

/**
 * A Comparator whose behavior is defined by a std::function.
 */
template <typename T>
class FunctionComparator {
 public:
  using ComparisonFunction =
      std::function<ComparisonResult(const T&, const T&)>;

  explicit FunctionComparator(ComparisonFunction&& function)
      : function_(std::move(function)) {
  }

  ComparisonResult Compare(const T& lhs, const T& rhs) const {
    return function_(lhs, rhs);
  }

 private:
  ComparisonFunction function_;
};

template <typename T>
ComparisonResult CompareContainer(const T& lhs, const T& rhs) {
  auto lhs_iter = lhs.begin();
  auto lhs_end = lhs.end();
  auto rhs_iter = rhs.begin();
  auto rhs_end = rhs.end();

  while (lhs_iter != lhs_end && rhs_iter != rhs_end) {
    ComparisonResult cmp = Compare(*lhs_iter, *rhs_iter);
    if (!Same(cmp)) return cmp;

    ++lhs_iter;
    ++rhs_iter;
  }

  if (rhs_iter != rhs_end) return ComparisonResult::Ascending;
  if (lhs_iter != lhs_end) return ComparisonResult::Descending;
  return ComparisonResult::Same;
}

/** Compares a double and an int64_t. */
ComparisonResult CompareMixedNumber(double double_value, int64_t int64_value);

/** Normalizes a double and then return the raw bits as a uint64_t. */
uint64_t DoubleBits(double d);

/**
 * Compares the bitwise representation of two doubles, but normalizes NaN
 * values. This is similar to what the backend and android clients do, including
 * comparing -0.0 as not equal to 0.0.
 */
bool DoubleBitwiseEquals(double left, double right);

/**
 * Computes a bitwise hash of a double, but normalizes NaN values, suitable for
 * use when using DoubleBitwiseEquals for equality.
 */
size_t DoubleBitwiseHash(double d);

/**
 * A mixin that defines all six relational operators for a type T in terms of a
 * CompareTo() member.
 *
 * @tparam T The type that should get comparison operators.
 */
template <typename T>
class Comparable {
 public:
  friend bool operator==(const T& lhs, const T& rhs) {
    return Same(lhs.CompareTo(rhs));
  }
  friend bool operator!=(const T& lhs, const T& rhs) {
    return !(lhs == rhs);
  }
  friend bool operator<(const T& lhs, const T& rhs) {
    return Ascending(lhs.CompareTo(rhs));
  }
  friend bool operator>(const T& lhs, const T& rhs) {
    return Descending(lhs.CompareTo(rhs));
  }
  friend bool operator<=(const T& lhs, const T& rhs) {
    return !(rhs < lhs);
  }
  friend bool operator>=(const T& lhs, const T& rhs) {
    return !(lhs < rhs);
  }
};

/**
 * Same as `Comparable`, but deliberately not defining `operator==`, which
 * instead is left for the class inheriting from this mixin to implement. This
 * is an optimization that avoids doing an extra comparison when comparing for
 * equality (`Comparable` would have to check for both "less-than" and
 * "greater-than" to determine whether two values are equal).
 */
template <typename T>
class InequalityComparable {
 public:
  friend bool operator!=(const T& lhs, const T& rhs) {
    return !(lhs == rhs);
  }
  friend bool operator<(const T& lhs, const T& rhs) {
    return Ascending(lhs.CompareTo(rhs));
  }
  friend bool operator>(const T& lhs, const T& rhs) {
    return Descending(lhs.CompareTo(rhs));
  }
  friend bool operator<=(const T& lhs, const T& rhs) {
    return !(rhs < lhs);
  }
  friend bool operator>=(const T& lhs, const T& rhs) {
    return !(lhs < rhs);
  }
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_COMPARISON_H_
