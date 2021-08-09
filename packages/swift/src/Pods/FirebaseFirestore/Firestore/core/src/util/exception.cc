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

#include "Firestore/core/src/util/exception.h"

#include <exception>
#include <stdexcept>

#include "Firestore/core/src/util/firestore_exceptions.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace util {
namespace {

const char* ExceptionName(ExceptionType exception) {
  switch (exception) {
    case ExceptionType::AssertionFailure:
      return "FIRESTORE INTERNAL ASSERTION FAILED";
    case ExceptionType::IllegalState:
      return "Illegal state";
    case ExceptionType::InvalidArgument:
      return "Invalid argument";
  }
  UNREACHABLE();
}

ABSL_ATTRIBUTE_NORETURN void DefaultThrowHandler(ExceptionType type,
                                                 const char* file,
                                                 const char* func,
                                                 int line,
                                                 const std::string& message) {
  std::string what = absl::StrCat(ExceptionName(type), ": ");
  if (file && func) {
    absl::StrAppend(&what, file, "(", line, ") ", func, ": ");
  }
  absl::StrAppend(&what, message);

  // Always log the error -- it helps if there are any issues with the exception
  // propagation mechanism and also makes sure the exception makes it into the
  // log regardless of how it's handled.
  LOG_ERROR("%s", what);

#if ABSL_HAVE_EXCEPTIONS
  switch (type) {
    case ExceptionType::AssertionFailure:
      throw FirestoreInternalError(what);
    case ExceptionType::IllegalState:
      // Omit descriptive text since the type already encodes the kind of error.
      throw std::logic_error(message);
    case ExceptionType::InvalidArgument:
      // Omit descriptive text since the type already encodes the kind of error.
      throw std::invalid_argument(message);
  }
#else
  std::terminate();
#endif

  UNREACHABLE();
}

ThrowHandler throw_handler = DefaultThrowHandler;

}  // namespace

ThrowHandler SetThrowHandler(ThrowHandler handler) {
  ThrowHandler previous = throw_handler;
  throw_handler = handler;
  return previous;
}

ABSL_ATTRIBUTE_NORETURN void Throw(ExceptionType exception,
                                   const char* file,
                                   const char* func,
                                   int line,
                                   const std::string& message) {
  throw_handler(exception, file, func, line, message);

  // It's expected that the throw handler above does not return. If it does,
  // just terminate.
  std::terminate();
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
