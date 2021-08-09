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

#include "Firestore/core/src/util/error_apple.h"

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/string_apple.h"

// NB: This is also declared in
// FirebaseFirestore/Firestore/Source/Public/FIRFirestoreErrors.h
// NOLINTNEXTLINE: public constant
FOUNDATION_EXPORT NSString* const FIRFirestoreErrorDomain =
    @"FIRFirestoreErrorDomain";

namespace firebase {
namespace firestore {
namespace util {

// Translates a set of error_code and error_msg to an NSError.
NSError* MakeNSError(Error error_code,
                     absl::string_view error_msg,
                     NSError* cause) {
  if (error_code == Error::kErrorOk) {
    return nil;
  }

  NSMutableDictionary<NSString*, id>* user_info =
      [NSMutableDictionary dictionary];
  user_info[NSLocalizedDescriptionKey] = MakeNSString(error_msg);
  if (cause) {
    user_info[NSUnderlyingErrorKey] = cause;
  }

  return [NSError errorWithDomain:FIRFirestoreErrorDomain
                             code:static_cast<NSInteger>(error_code)
                         userInfo:user_info];
}

NSError* MakeNSError(const util::Status& status) {
  return status.ToNSError();
}

util::StatusCallback MakeCallback(VoidErrorBlock _Nullable block) {
  if (block) {
    return [block](Status status) { block(MakeNSError(status)); };
  } else {
    return [](Status status) { (void)status; };
  }
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
