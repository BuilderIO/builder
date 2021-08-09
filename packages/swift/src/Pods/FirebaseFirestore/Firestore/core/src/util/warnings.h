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

#ifndef FIRESTORE_CORE_SRC_UTIL_WARNINGS_H_
#define FIRESTORE_CORE_SRC_UTIL_WARNINGS_H_

/**
 * Macros for suppressing various warnings. Use like this:
 *
 * SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN()
 * #include "header/that/has/warnings.h"
 * SUPPRESS_END()
 *
 * SUPPRESS_DEPRECATED_DECLARATIONS_BEGIN()
 * #include "header/that/uses/deprecated/stuff.h"
 * SUPPRESS_END()
 *
 * SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN()
 * SUPPRESS_DEPRECATED_DECLARATIONS_BEGIN()
 * #include "something/awful.h"
 * SUPPRESS_END()
 * SUPPRESS_END()
 */

// Define some primitives used by the 'public' macros below.

#if defined(__clang__) || defined(__GNUC__)
#define SUPPRESS_BEGIN_UNIMPLEMENTED_() _Pragma("GCC diagnostic push")

#define SUPPRESS_BEGIN_(name) _Pragma("GCC diagnostic push") _Pragma(name)

#define SUPPRESS_END() _Pragma("GCC diagnostic pop")

#elif defined(_MSC_VER)
#define SUPPRESS_BEGIN_UNIMPLEMENTED_() __pragma(warning(push))

#define SUPPRESS_BEGIN_(name) \
  __pragma(warning(push)) __pragma(warning(disable : name))

#define SUPPRESS_END() __pragma(warning(pop))

#else
#define SUPPRESS_BEGIN_UNIMPLEMENTED_()
#define SUPPRESS_END()
#endif

// 'Public' macros.

// Ignore -Wcomma warnings in Clang
#if defined(__clang__)
#define SUPPRESS_COMMA_WARNINGS_BEGIN() \
  SUPPRESS_BEGIN_("GCC diagnostic ignored \"-Wcomma\"")
#else
#define SUPPRESS_COMMA_WARNINGS_BEGIN() SUPPRESS_BEGIN_UNIMPLEMENTED_()
#endif

// Ignore -Wdocumentation warnings in Clang
#if defined(__clang__)
#define SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN() \
  SUPPRESS_BEGIN_("GCC diagnostic ignored \"-Wdocumentation\"")
#else
#define SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN() SUPPRESS_BEGIN_UNIMPLEMENTED_()
#endif

// Ignore the use of deprecated declarations.
#if defined(__clang__) || defined(__GNUC__)
#define SUPPRESS_DEPRECATED_DECLARATIONS_BEGIN() \
  SUPPRESS_BEGIN_("GCC diagnostic ignored \"-Wdeprecated-declarations\"")
#elif defined(_MSC_VER)
// MSVC compiler warnings can be found here: (Look at the navbar on the left
// and select the appropriate range):
// https://docs.microsoft.com/en-us/cpp/error-messages/compiler-warnings/compiler-warnings-by-compiler-version?view=vs-2017
#define SUPPRESS_DEPRECATED_DECLARATIONS_BEGIN() SUPPRESS_BEGIN_(4995)
#else
#define SUPPRESS_DEPRECATED_DECLARATIONS_BEGIN() SUPPRESS_BEGIN_UNIMPLEMENTED_()
#endif

#endif  // FIRESTORE_CORE_SRC_UTIL_WARNINGS_H_
