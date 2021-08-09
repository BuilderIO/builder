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

#ifndef FIRESTORE_CORE_SRC_UTIL_SANITIZERS_H_
#define FIRESTORE_CORE_SRC_UTIL_SANITIZERS_H_

// Clang feature detection compiler extension
#if defined(__has_feature)
#define HAS_FEATURE(FEATURE) __has_feature(FEATURE)
#else
#define HAS_FEATURE(FEATURE) 0
#endif

// Auto-detect the presence of sanitizers. Abseil does not do this yet, and
// instead relies on users to pass e.g. -DADDRESS_SANITIZER on the command-line.

// Clang and GCC 4.8
#if !defined(ADDRESS_SANITIZER)
#if HAS_FEATURE(address_sanitizer) || \
    (defined(__GNUC__) && defined(__SANITIZE_ADDRESS__))
#define ADDRESS_SANITIZER 1
#endif
#endif  // !defined(ADDRESS_SANITIZER)

// Clang-only
#if !defined(MEMORY_SANITIZER)
#if HAS_FEATURE(memory_sanitizer)
#define MEMORY_SANITIZER 1
#endif
#endif  // !defined(MEMORY_SANITIZER)

// Clang and GCC 4.8+
#if !defined(THREAD_SANITIZER)
#if HAS_FEATURE(thread_sanitizer) || \
    (defined(__GNUC__) && defined(__SANITIZE_THREAD__))
#define THREAD_SANITIZER 1
#endif
#endif  // !defined(THREAD_SANITIZER)

// There doesn't appear to be a __has_feature check for ubsan.

#endif  // FIRESTORE_CORE_SRC_UTIL_SANITIZERS_H_
