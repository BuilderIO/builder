/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/nanopb/writer.h"

#include <algorithm>
#include <utility>

#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace nanopb {
namespace {

constexpr size_t kMinBufferSize = 4;

bool AppendToBytesArray(pb_ostream_t* stream,
                        const pb_byte_t* buf,
                        size_t count) {
  auto writer = static_cast<ByteStringWriter*>(stream->state);
  writer->Append(buf, count);
  return true;
}

}  // namespace

void Writer::Write(const pb_field_t fields[], const void* src_struct) {
  if (!pb_encode(&stream_, fields, src_struct)) {
    HARD_FAIL(PB_GET_ERROR(&stream_));
  }
}

ByteStringWriter::ByteStringWriter() {
  stream_.callback = AppendToBytesArray;
  stream_.state = this;
  stream_.max_size = SIZE_MAX;
}

ByteStringWriter::~ByteStringWriter() {
  std::free(buffer_);
}

void ByteStringWriter::Append(const void* data, size_t size) {
  if (size == 0) return;

  pb_size_t pb_size = CheckedSize(size);
  size_t current_size = this->size();
  size_t min_capacity = current_size + pb_size;
  HARD_ASSERT(min_capacity >= current_size);  // Avoid overflow

  Reserve(min_capacity);
  uint8_t* pos = this->pos();
  std::memcpy(pos, data, size);
  buffer_->size += pb_size;
}

void ByteStringWriter::Reserve(size_t min_capacity) {
  // Bump the min_capacity up so that an explicit Reserve will trigger an
  // allocation, making pos() guaranteed to be valid.
  min_capacity = std::max(min_capacity, kMinBufferSize);
  if (min_capacity <= capacity_) return;

  // If capacity * 2 overflows, min_capacity will be larger.
  size_t desired = std::max(capacity_ * 2, min_capacity);

  if (buffer_) {
    buffer_ = static_cast<pb_bytes_array_t*>(
        std::realloc(buffer_, PB_BYTES_ARRAY_T_ALLOCSIZE(desired)));
  } else {
    // initialize on the first allocation.
    buffer_ = static_cast<pb_bytes_array_t*>(
        std::calloc(1, PB_BYTES_ARRAY_T_ALLOCSIZE(desired)));
  }

  capacity_ = desired;
}

void ByteStringWriter::SetSize(size_t size) {
  HARD_ASSERT(buffer_ != nullptr &&
              size <= capacity_);  // Should have reserved.
  buffer_->size = CheckedSize(size);
}

ByteString ByteStringWriter::Release() {
  pb_bytes_array_t* pending = buffer_;
  buffer_ = nullptr;
  capacity_ = 0;
  return ByteString::Take(pending);
}

namespace {

bool AppendToString(pb_ostream_t* stream, const pb_byte_t* buf, size_t count) {
  auto str = static_cast<std::string*>(stream->state);
  str->insert(str->end(), buf, buf + count);
  return true;
}

}  // namespace

StringWriter::StringWriter() {
  stream_.callback = AppendToString;
  stream_.state = &buffer_;
  stream_.max_size = SIZE_MAX;
}

std::string StringWriter::Release() {
  return std::move(buffer_);
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase
