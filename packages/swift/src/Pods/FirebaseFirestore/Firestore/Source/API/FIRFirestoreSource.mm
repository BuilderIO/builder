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

#import "Firestore/Source/API/FIRFirestoreSource+Internal.h"

#include "Firestore/core/src/api/source.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace api {

Source MakeSource(FIRFirestoreSource source) {
  switch (source) {
    case FIRFirestoreSourceDefault:
      return Source::Default;
    case FIRFirestoreSourceServer:
      return Source::Server;
    case FIRFirestoreSourceCache:
      return Source::Cache;
  }

  UNREACHABLE();
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
