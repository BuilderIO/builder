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

#ifndef FIRESTORE_CORE_SRC_NANOPB_NANOPB_UTIL_H_
#define FIRESTORE_CORE_SRC_NANOPB_NANOPB_UTIL_H_

#include <pb.h>

#include <cstdlib>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/nullability.h"
#include "absl/base/casts.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace nanopb {

/**
 * Static casts the given size_t value down to a nanopb compatible size, after
 * asserting that the value isn't out of range.
 */
pb_size_t CheckedSize(size_t size);

/**
 * Creates a new, null-terminated byte array that's a copy of the bytes in the
 * given buffer. Returns a null instance if the given buffer is null or empty.
 */
pb_bytes_array_t* _Nullable CopyBytesArray(
    const pb_bytes_array_t* _Nullable buffer);

/**
 * Creates a new, null-terminated byte array that's a copy of the given bytes.
 * Returns a null instance if the given size is zero.
 */
pb_bytes_array_t* _Nullable MakeBytesArray(const void* _Nullable data,
                                           size_t size);

/**
 * Creates a new, null-terminated byte array that's a copy of the given bytes.
 * Returns a null instance if the size of the given vector is zero.
 */
inline pb_bytes_array_t* _Nullable MakeBytesArray(
    const std::vector<uint8_t>& bytes) {
  return MakeBytesArray(bytes.data(), bytes.size());
}

/**
 * Creates a string_view of the given nanopb bytes.
 */
absl::string_view MakeStringView(const pb_bytes_array_t* _Nullable str);

/**
 * Creates a string_view of the given nanopb bytes.
 */
absl::string_view MakeStringView(const ByteString& bytes);

inline pb_bytes_array_t* _Nullable MakeBytesArray(const std::string& str) {
  return MakeBytesArray(str.data(), str.size());
}

std::string MakeString(const pb_bytes_array_t* _Nullable str);

/**
 * Copies the backing byte array into a new vector of bytes.
 */
inline std::vector<uint8_t> MakeVector(const ByteString& str) {
  return {str.begin(), str.end()};
}

/**
 * Due to the nanopb implementation, nanopb_boolean could be an integer
 * other than 0 or 1, (such as 2). This leads to undefined behaviour when
 * it's read as a boolean. eg. on at least gcc, the value is treated as
 * both true *and* false. So we'll instead memcpy to an integer (via
 * absl::bit_cast) and compare with 0.
 *
 * Note that it is necessary to pass-by-reference here to get the original
 * value of `nanopb_boolean`.
 */
inline bool SafeReadBoolean(const bool& nanopb_boolean) {
  return absl::bit_cast<int8_t>(nanopb_boolean) != 0;
}

template <typename T>
T* _Nonnull MakeArray(pb_size_t count) {
  return static_cast<T*>(calloc(count, sizeof(T)));
}

template <typename T>
T* _Nonnull ResizeArray(void* _Nonnull ptr, size_t count) {
  return static_cast<T*>(realloc(ptr, CheckedSize(count) * sizeof(T)));
}

/**
 * Initializes a repeated field with a list of values. Applies `converter` to
 * each value before assigning.
 */
template <typename T, typename Iterator, typename Func>
void SetRepeatedField(T* _Nonnull* _Nonnull fields_array,
                      pb_size_t* _Nonnull fields_count,
                      Iterator first,
                      Iterator last,
                      const Func& converter) {
  HARD_ASSERT(fields_array, "fields_array must be non-null");
  HARD_ASSERT(fields_count, "fields_count must be non-null");
  *fields_count = nanopb::CheckedSize(std::distance(first, last));
  *fields_array = nanopb::MakeArray<T>(*fields_count);
  auto* current = *fields_array;
  while (first != last) {
    *current = converter(*first);
    ++current;
    ++first;
  }
}

/**
 * Initializes a repeated field with a list of values. Applies `converter` to
 * each value before assigning.
 */
template <typename T, typename Container, typename Func>
void SetRepeatedField(T* _Nonnull* _Nonnull fields_array,
                      pb_size_t* _Nonnull fields_count,
                      const Container& fields,
                      const Func& converter) {
  return SetRepeatedField(fields_array, fields_count, fields.begin(),
                          fields.end(), converter);
}

/** Initializes a repeated field with a list of values. */
template <typename T, typename Container>
void SetRepeatedField(T* _Nonnull* _Nonnull fields_array,
                      pb_size_t* _Nonnull fields_count,
                      const Container& fields) {
  return SetRepeatedField(fields_array, fields_count, fields,
                          [](const T& val) { return val; });
}

/**
 * Zeroes out the memory of `fields`. This can be used if the contents of fields
 * array were moved to another message that takes on ownership.
 */
template <typename T>
void ReleaseFieldOwnership(T* _Nonnull fields, pb_size_t fields_count) {
  for (pb_size_t i = 0; i < fields_count; ++i) {
    fields[i] = {};
  }
}

#if __OBJC__
inline ByteString MakeByteString(NSData* _Nullable value) {
  if (value == nil) return ByteString();

  auto size = static_cast<size_t>(value.length);
  return ByteString::Take(MakeBytesArray(value.bytes, size));
}

inline NSData* _Nonnull MakeNSData(const ByteString& str) {
  return [[NSData alloc] initWithBytes:str.data() length:str.size()];
}

inline NSData* _Nonnull MakeNSData(const pb_bytes_array_t* _Nullable data) {
  return [[NSData alloc] initWithBytes:data->bytes length:data->size];
}

inline NSData* _Nullable MakeNullableNSData(const ByteString& str) {
  if (str.empty()) return nil;
  return MakeNSData(str);
}
#endif

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_NANOPB_NANOPB_UTIL_H_
