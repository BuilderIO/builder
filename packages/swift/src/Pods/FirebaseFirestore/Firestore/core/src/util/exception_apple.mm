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

#include "Firestore/core/src/util/exception_apple.h"

#import <Foundation/Foundation.h>

#include <exception>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/string_apple.h"

NS_ASSUME_NONNULL_BEGIN

namespace firebase {
namespace firestore {
namespace util {
namespace {

NSString* ExceptionName(ExceptionType exception) {
  switch (exception) {
    case ExceptionType::AssertionFailure:
      return @"FIRESTORE INTERNAL ASSERTION FAILED";
    case ExceptionType::IllegalState:
      return @"FIRIllegalStateException";
    case ExceptionType::InvalidArgument:
      return @"FIRInvalidArgumentException";
  }
  UNREACHABLE();
}

NSException* MakeException(ExceptionType type, const std::string& message) {
  return [[NSException alloc] initWithName:ExceptionName(type)
                                    reason:MakeNSString(message)
                                  userInfo:nil];
}

}  // namespace

ABSL_ATTRIBUTE_NORETURN void ObjcThrowHandler(ExceptionType type,
                                              const char* file,
                                              const char* func,
                                              int line,
                                              const std::string& message) {
  if (type == ExceptionType::AssertionFailure) {
    [[NSAssertionHandler currentHandler]
        handleFailureInFunction:MakeNSString(func)
                           file:MakeNSString(file)
                     lineNumber:line
                    description:@"%@: %@", ExceptionName(type),
                                MakeNSString(message)];
    std::terminate();
  } else {
    @throw MakeException(type, message);  // NOLINT
  }
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

NS_ASSUME_NONNULL_END
