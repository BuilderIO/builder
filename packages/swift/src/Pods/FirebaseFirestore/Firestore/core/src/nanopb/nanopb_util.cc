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

#include "Firestore/core/src/nanopb/nanopb_util.h"

#include <cstdlib>

#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace nanopb {

pb_size_t CheckedSize(size_t size) {
  HARD_ASSERT(size <= PB_SIZE_MAX,
              "Size exceeds nanopb limits. Too many entries.");
  return static_cast<pb_size_t>(size);
}

pb_bytes_array_t* _Nullable CopyBytesArray(
    const pb_bytes_array_t* _Nullable buffer) {
  if (buffer == nullptr) return nullptr;
  return MakeBytesArray(buffer->bytes, buffer->size);
}

pb_bytes_array_t* _Nullable MakeBytesArray(const void* _Nullable data,
                                           size_t size) {
  if (size == 0) return nullptr;

  pb_size_t pb_size = CheckedSize(size);

  // Allocate one extra byte for the null terminator that's not necessarily
  // there in a string_view. As long as we're making a copy, might as well
  // make a copy that won't overrun when used as a regular C string. This is
  // essentially just to make debugging easier--actual user data can have
  // embedded nulls so we shouldn't be using this as a C string under normal
  // circumstances.
  auto result = static_cast<pb_bytes_array_t*>(
      std::malloc(PB_BYTES_ARRAY_T_ALLOCSIZE(pb_size + 1)));
  result->size = pb_size;
  std::memcpy(result->bytes, data, pb_size);
  result->bytes[pb_size] = '\0';

  return result;
}

std::string MakeString(const pb_bytes_array_t* _Nullable str) {
  if (str == nullptr) return "";

  auto bytes = reinterpret_cast<const char*>(str->bytes);
  auto size = static_cast<size_t>(str->size);
  return std::string{bytes, size};
}

absl::string_view MakeStringView(const pb_bytes_array_t* _Nullable str) {
  if (str == nullptr) return absl::string_view(nullptr, 0);

  auto bytes = reinterpret_cast<const char*>(str->bytes);
  auto size = static_cast<size_t>(str->size);
  return absl::string_view{bytes, size};
}

absl::string_view MakeStringView(const ByteString& bytes) {
  const char* str = reinterpret_cast<const char*>(bytes.data());
  return absl::string_view{str, bytes.size()};
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase
