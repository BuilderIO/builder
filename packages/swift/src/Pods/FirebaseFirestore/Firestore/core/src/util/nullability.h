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

#ifndef FIRESTORE_CORE_SRC_UTIL_NULLABILITY_H_
#define FIRESTORE_CORE_SRC_UTIL_NULLABILITY_H_

namespace firebase {
namespace firestore {
namespace util {

// Define NS_ASSUME_NONNULL_BEGIN for straight C++ so that everything gets the
// correct nullability specifier.
#if !defined(NS_ASSUME_NONNULL_BEGIN)
#if __clang__
#define NS_ASSUME_NONNULL_BEGIN _Pragma("clang assume_nonnull begin")
#define NS_ASSUME_NONNULL_END _Pragma("clang assume_nonnull end")

#else  // !__clang__
#define NS_ASSUME_NONNULL_BEGIN
#define NS_ASSUME_NONNULL_END
#define _Nonnull
#define _Nullable

#endif  // __clang__
#endif  // !defined(NS_ASSUME_NONNULL_BEGIN)

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_NULLABILITY_H_
