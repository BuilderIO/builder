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

#include "Firestore/core/src/util/string_apple.h"

#if defined(__APPLE__)

#include <string>

#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace util {

std::string MakeString(CFStringRef str) {
  CFIndex num_chars = CFStringGetLength(str);
  if (num_chars == 0) {
    return {};
  }

  // In the first pass figure the size required. The size does not include the
  // null terminator.
  CFRange range{0, num_chars};
  CFIndex num_bytes = 0;
  CFIndex converted = CFStringGetBytes(str, range, kCFStringEncodingUTF8, 0u,
                                       false, nullptr, 0, &num_bytes);
  HARD_ASSERT(converted == num_chars);

  std::string result(static_cast<size_t>(num_bytes), '\0');
  auto buffer = reinterpret_cast<UInt8*>(&result[0]);
  converted = CFStringGetBytes(str, range, kCFStringEncodingUTF8, 0u, false,
                               buffer, num_bytes, nullptr);
  HARD_ASSERT(converted == num_chars);

  return result;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // defined(__APPLE__)
