/*
 * Copyright 2017 Google
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

// Useful string functions and so forth.  This is a grab-bag file.
//
// These functions work fine for UTF-8 strings as long as you can
// consider them to be just byte strings.  For example, due to the
// design of UTF-8 you do not need to worry about accidental matches,
// as long as all your inputs are valid UTF-8 (use \uHHHH, not \xHH or \oOOO).

#ifndef FIRESTORE_CORE_SRC_UTIL_STRING_UTIL_H_
#define FIRESTORE_CORE_SRC_UTIL_STRING_UTIL_H_

#include <string>

#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * Returns the smallest lexicographically larger string of equal or smaller
 * length. Returns an empty string if there is no such successor (if the input
 * is empty or consists entirely of 0xff bytes).
 * Useful for calculating the smallest lexicographically larger string
 * that will not be prefixed by the input string.
 *
 * Examples:
 * "a" -> "b", "aaa" -> "aab", "aa\xff" -> "ab", "\xff" -> "", "" -> ""
 */
std::string PrefixSuccessor(absl::string_view prefix);

/**
 * Returns the immediate lexicographically-following string. This is useful to
 * turn an inclusive range into something that can be used with Bigtable's
 * SetLimitRow():
 *
 *     // Inclusive range [min_element, max_element].
 *     string min_element = ...;
 *     string max_element = ...;
 *
 *     // Equivalent range [range_start, range_end).
 *     string range_start = min_element;
 *     string range_end = ImmediateSuccessor(max_element);
 *
 * WARNING: Returns the input string with a '\0' appended; if you call c_str()
 * on the result, it will compare equal to s.
 *
 * WARNING: Transforms "" -> "\0"; this doesn't account for Bigtable's special
 * treatment of "" as infinity.
 */
std::string ImmediateSuccessor(absl::string_view s);

/**
 * Returns an reference to a static empty string.
 */
const std::string& EmptyString();

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_STRING_UTIL_H_
