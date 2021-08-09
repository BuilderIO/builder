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

#include "Firestore/core/src/remote/grpc_util.h"

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"

namespace firebase {
namespace firestore {
namespace remote {

using util::Status;

Status ConvertStatus(const grpc::Status& from) {
  if (from.ok()) {
    return Status::OK();
  }

  grpc::StatusCode error_code = from.error_code();
  // Both `grpc::Status` and Firestore's `util::Status` use canonical error
  // codes for Google APIs. The canonical codes define integer values, so this
  // conversion should be safe.
  // See
  // https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
  HARD_ASSERT(error_code >= grpc::StatusCode::CANCELLED &&
                  error_code <= grpc::StatusCode::UNAUTHENTICATED,
              "Unknown gRPC error code: %s", error_code);

  return {static_cast<Error>(error_code), from.error_message()};
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
