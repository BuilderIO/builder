/*
 * Copyright 2019 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_UTIL_EXCEPTION_H_
#define FIRESTORE_CORE_SRC_UTIL_EXCEPTION_H_

// Routines in this file are used to throw an exception (or crash, depending on
// platform) in response to API usage errors. Exceptions should only be used
// for programmer errors made by consumers of the SDK, e.g. invalid method
// arguments.
//
// These routines avoid conditional compilation in the caller and avoids lint
// warnings around actually throwing exceptions in source. The implementation
// chooses the best way to surface a logic error to the developer.
//
// For recoverable runtime errors, use util::Status, or in pure Objective-C
// code use an NSError** out-parameter.
//
// For internal programming errors, including internal argument checking, use
// HARD_ASSERT or HARD_FAIL().

#include <stdexcept>
#include <string>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/base/attributes.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * An enumeration of logical exception types mapping to common user visible
 * exceptions we might throw in response do some invalid action in an
 * interaction with the Firestore API.
 */
enum class ExceptionType {
  AssertionFailure,
  IllegalState,
  InvalidArgument,
};

using ThrowHandler = void (*)(ExceptionType type,
                              const char* file,
                              const char* func,
                              int line,
                              const std::string& message);

/**
 * Overrides the default exception throw handler.
 *
 * The default essentially just calls std::terminate. While reasonable for C++
 * with exceptions disabled, this isn't optimal for platforms that merely use
 * the C++ core as their implementation and would otherwise be expected to throw
 * a platform specific exception.
 *
 * @param handler A function that will handle the exception. This function is
 *     expected not to return. (If it does, std::terminate() will be called
 *     immediately after it does so.)
 * @return A pointer to the previous failure handler.
 */
ThrowHandler SetThrowHandler(ThrowHandler handler);

ABSL_ATTRIBUTE_NORETURN void Throw(ExceptionType type,
                                   const char* file,
                                   const char* func,
                                   int line,
                                   const std::string& message);

/**
 * Throws an exception indicating that the user passed an invalid argument.
 *
 * Invalid argument is interpreted pretty broadly and can mean that the user
 * made an incompatible chained method call while building up a larger
 * structure, like a query.
 */
template <typename... FA>
ABSL_ATTRIBUTE_NORETURN void ThrowInvalidArgument(const char* format,
                                                  const FA&... args) {
  Throw(ExceptionType::InvalidArgument, nullptr, nullptr, 0,
        StringFormat(format, args...));
}

/**
 * Throws an exception that indicates the user has attempted to use an API
 * that's in an illegal state, usually by violating a precondition of the API
 * call.
 *
 * Good uses of these are things like using a write batch after committing or
 * trying to use Firestore without initializing FIRApp. Builder-style APIs that
 * haven't done anything yet should likely just stick to ThrowInvalidArgument.
 */
template <typename... FA>
ABSL_ATTRIBUTE_NORETURN void ThrowIllegalState(const char* format,
                                               const FA&... args) {
  Throw(ExceptionType::IllegalState, nullptr, nullptr, 0,
        StringFormat(format, args...));
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_EXCEPTION_H_
