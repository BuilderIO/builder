/*
 * Copyright 2019 Google
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

#ifndef FIRESTORE_CORE_SRC_UTIL_EQUALITY_H_
#define FIRESTORE_CORE_SRC_UTIL_EQUALITY_H_

#include <memory>
#include <utility>

namespace firebase {
namespace firestore {
namespace util {

/**
 * Checks if the values pointed to by two C++ pointers are equal. Two null
 * pointers are also considered equal.
 */
template <typename T>
bool Equals(const T& lhs, const T& rhs) {
  return lhs == nullptr ? rhs == nullptr : rhs != nullptr && *lhs == *rhs;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_EQUALITY_H_
