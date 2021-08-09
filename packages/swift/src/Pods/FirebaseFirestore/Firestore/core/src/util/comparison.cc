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

#include "Firestore/core/src/util/comparison.h"

#include <algorithm>
#include <cmath>
#include <cstring>
#include <limits>

#include "absl/base/casts.h"

namespace firebase {
namespace firestore {
namespace util {

using std::isnan;

ComparisonResult Comparator<absl::string_view>::Compare(
    absl::string_view left, absl::string_view right) const {
  return ComparisonResultFromInt(left.compare(right));
}

ComparisonResult Comparator<std::string>::Compare(
    const std::string& left, const std::string& right) const {
  return ComparisonResultFromInt(left.compare(right));
}

ComparisonResult Comparator<double>::Compare(double left, double right) const {
  // NaN sorts equal to itself and before any other number.
  if (left < right) {
    return ComparisonResult::Ascending;
  } else if (left > right) {
    return ComparisonResult::Descending;
  } else if (left == right) {
    return ComparisonResult::Same;
  } else {
    // One or both left and right is NaN.
    if (!isnan(right)) {
      // Only left is NaN.
      return ComparisonResult::Ascending;
    } else if (!isnan(left)) {
      // Only right is NaN.
      return ComparisonResult::Descending;
    } else {
      // Both are NaN.
      return ComparisonResult::Same;
    }
  }
}

static constexpr double INT64_MIN_VALUE_AS_DOUBLE =
    static_cast<double>(std::numeric_limits<int64_t>::min());

static constexpr double INT64_MAX_VALUE_AS_DOUBLE =
    static_cast<double>(std::numeric_limits<int64_t>::max());

ComparisonResult CompareMixedNumber(double double_value, int64_t int64_value) {
  // LLONG_MIN has an exact representation as double, so to check for a value
  // outside the range representable by long, we have to check for strictly less
  // than LLONG_MIN. Note that this also handles negative infinity.
  if (double_value < INT64_MIN_VALUE_AS_DOUBLE) {
    return ComparisonResult::Ascending;
  }

  // LLONG_MAX has no exact representation as double (casting as we've done
  // makes 2^63, which is larger than LLONG_MAX), so consider any value greater
  // than or equal to the threshold to be out of range. This also handles
  // positive infinity.
  if (double_value >= INT64_MAX_VALUE_AS_DOUBLE) {
    return ComparisonResult::Descending;
  }

  // In Firestore NaN is defined to compare before all other numbers.
  if (isnan(double_value)) {
    return ComparisonResult::Ascending;
  }

  auto double_as_int64 = static_cast<int64_t>(double_value);
  ComparisonResult cmp = Compare<int64_t>(double_as_int64, int64_value);
  if (cmp != ComparisonResult::Same) {
    return cmp;
  }

  // At this point the long representations are equal but this could be due to
  // rounding.
  auto int64_as_double = static_cast<double>(int64_value);
  return Compare<double>(double_value, int64_as_double);
}

/** Helper to normalize a double and then return the raw bits as a uint64_t. */
uint64_t DoubleBits(double d) {
  if (isnan(d)) {
    d = NAN;
  }

  return absl::bit_cast<uint64_t>(d);
}

bool DoubleBitwiseEquals(double left, double right) {
  return DoubleBits(left) == DoubleBits(right);
}

size_t DoubleBitwiseHash(double d) {
  uint64_t bits = DoubleBits(d);
  // Note that x ^ (x >> 32) works fine for both 32 and 64 bit definitions of
  // size_t
  return static_cast<size_t>(bits) ^ static_cast<size_t>(bits >> 32);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
