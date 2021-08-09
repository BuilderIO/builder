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

#ifndef FIRESTORE_CORE_SRC_UTIL_ERROR_APPLE_H_
#define FIRESTORE_CORE_SRC_UTIL_ERROR_APPLE_H_

// Everything in this header exists for compatibility with Objective-C.
#if __OBJC__

#import <Foundation/Foundation.h>

#include <functional>
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/strings/string_view.h"

NS_ASSUME_NONNULL_BEGIN

// The Cloud Firestore error domain. Keep in sync with FIRFirestoreErrors.h.
// Exposed here to make it possible to build in CMake without bringing in the
// sources under Firestore/Source.
// clang-format off
// clang-format12 merges the next two lines.
FOUNDATION_EXPORT NSString* const FIRFirestoreErrorDomain
    NS_SWIFT_NAME(FirestoreErrorDomain);
// clang-format on

namespace firebase {
namespace firestore {
namespace util {

// Translates a set of error_code and error_msg to an NSError.
NSError* MakeNSError(Error error_code,
                     const absl::string_view error_msg,
                     NSError* cause = nil);

NSError* MakeNSError(const util::Status& status);

Status MakeStatus(NSError* error);

using VoidErrorBlock = void (^)(NSError* _Nullable error);

util::StatusCallback MakeCallback(VoidErrorBlock _Nullable block);

template <typename T>
using VoidValueErrorBlock = void (^)(T _Nullable value,
                                     NSError* _Nullable error);

template <typename T>
util::StatusOrCallback<T> MakeCallback(VoidValueErrorBlock<T> _Nullable block) {
  if (block) {
    return [block](StatusOr<T> maybe_value) {
      if (maybe_value.ok()) {
        block(std::move(maybe_value).ValueOrDie(), nil);
      } else {
        block(nil, MakeNSError(std::move(maybe_value).status()));
      }
    };
  } else {
    return [](StatusOr<T> maybe_value) { (void)maybe_value; };
  }
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

NS_ASSUME_NONNULL_END

#endif  // __OBJC__

#endif  // FIRESTORE_CORE_SRC_UTIL_ERROR_APPLE_H_
