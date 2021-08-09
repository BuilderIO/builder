/*
 * Copyright 2017 Google
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

#include "Firestore/core/src/util/secure_random.h"

#include "Firestore/core/src/util/config.h"

#if HAVE_ARC4RANDOM

#include <stdlib.h>

namespace firebase {
namespace firestore {
namespace util {

SecureRandom::result_type SecureRandom::operator()() {
  return arc4random();
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // HAVE_ARC4RANDOM
