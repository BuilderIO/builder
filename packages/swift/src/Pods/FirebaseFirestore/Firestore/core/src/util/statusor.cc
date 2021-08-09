/*
 * Copyright 2017, 2018 Google
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

#include "Firestore/core/src/util/statusor.h"

#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace util {
namespace internal_statusor {

void Helper::HandleInvalidStatusCtorArg(Status* status) {
  const char* kMessage =
      "An OK status is not a valid constructor argument to StatusOr<T>";
  HARD_FAIL("%s", kMessage);
  // Fall back to Internal for non-debug builds
  *status = Status(Error::kErrorInternal, kMessage);
}

void Helper::Crash(const Status& status) {
  HARD_FAIL("Attempting to fetch value instead of handling error %s",
            status.ToString());
}

}  // namespace internal_statusor
}  // namespace util
}  // namespace firestore
}  // namespace firebase
