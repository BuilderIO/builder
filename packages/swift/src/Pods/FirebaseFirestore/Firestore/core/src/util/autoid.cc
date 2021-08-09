/*
 * Copyright 2017 Google LLC
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

#include "Firestore/core/src/util/autoid.h"

#include <random>
#include <string>

#include "Firestore/core/src/util/secure_random.h"

namespace firebase {
namespace firestore {
namespace util {
namespace {

const int kAutoIdLength = 20;
const char kAutoIdAlphabet[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

SecureRandom& GetSharedRandom() {
  static auto* shared_random = new SecureRandom();
  return *shared_random;
}

}  // namespace

std::string CreateAutoId() {
  std::string auto_id;
  auto_id.reserve(kAutoIdLength);

  // -2 here because:
  //   * sizeof(kAutoIdAlphabet) includes the trailing null terminator
  //   * uniform_int_distribution is inclusive on both sizes
  std::uniform_int_distribution<int> letters(0, sizeof(kAutoIdAlphabet) - 2);

  SecureRandom& shared_random = GetSharedRandom();
  for (int i = 0; i < kAutoIdLength; i++) {
    int rand_index = letters(shared_random);
    auto_id.append(1, kAutoIdAlphabet[rand_index]);
  }
  return auto_id;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
