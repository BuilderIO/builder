/*
 * Copyright 2021 Google LLC
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

#include "Firestore/core/src/util/byte_stream_apple.h"

#include <algorithm>
#include <string>
#include <utility>

#include "Firestore/core/src/util/string_apple.h"
#include "Firestore/core/src/util/string_util.h"

namespace firebase {
namespace firestore {
namespace util {

StreamReadResult ByteStreamApple::ReadUntil(char delim, size_t max_length) {
  size_t found_at = std::string::npos;
  size_t last_pos = 0;
  while (buffer_.size() < max_length) {
    auto read = ReadToBuffer(max_length - buffer_.size());
    if (read < 0) {
      return ErrorResult();
    }

    found_at = buffer_.find(delim, last_pos);
    last_pos = buffer_.size();
    if (found_at != std::string::npos || read == 0) {
      break;
    }
  }

  // Still not found, or the buffer happens to be of the sized as requested.
  // Either way, return the whole `buffer_` and clear it.
  if (found_at == std::string::npos && buffer_.size() == max_length) {
    return ConsumeBuffer();
  }

  // Either we found the delim, or the buffer is already larger then requested,
  // the result will be a substring here.
  auto end_pos = std::min(max_length, found_at);
  std::string result = buffer_.substr(0, end_pos);
  buffer_.erase(0, end_pos);
  StreamReadResult read_result(std::move(result), eof());
  return read_result;
}

StreamReadResult ByteStreamApple::Read(size_t max_length) {
  // Serve from buffer_
  if (buffer_.size() > max_length) {
    std::string result = buffer_.substr(0, max_length);
    buffer_.erase(0, max_length);
    StreamReadResult read_result(std::move(result), eof());
    return read_result;
  }

  auto read = ReadToBuffer(max_length - buffer_.size());
  if (read < 0) {
    return ErrorResult();
  }

  return ConsumeBuffer();
}

int32_t ByteStreamApple::ReadToBuffer(size_t max_length) {
  std::string result(max_length + 1, '\0');
  auto* data_ptr = reinterpret_cast<uint8_t*>(&result[0]);
  NSInteger read = [input_ read:data_ptr maxLength:max_length];

  if (read > 0) {
    buffer_.append(result.substr(0, static_cast<unsigned long>(read)));
  }

  return static_cast<int32_t>(read);
}

StreamReadResult ByteStreamApple::ConsumeBuffer() {
  // NSInputStream does not have consistent behavior with streamStatus, we
  // perform a "peek" operation here to match with C++ istream implementation,
  // and make the behavior deterministic.
  char peek_result = '\0';
  auto* data_ptr = reinterpret_cast<uint8_t*>(&peek_result);
  NSInteger read = [input_ read:data_ptr maxLength:1];

  bool is_eof = (read == 0);
  StreamReadResult read_result(std::move(buffer_), is_eof);

  buffer_.clear();
  // If peek actually succeeds, append the read char.
  if (read > 0) {
    buffer_.push_back(peek_result);
  }
  return read_result;
}

StreamReadResult ByteStreamApple::ErrorResult() {
  return StreamReadResult(
      Status::FromNSError(input_.streamError),
      input_.streamStatus == NSStreamStatus::NSStreamStatusAtEnd);
}

bool ByteStreamApple::eof() const {
  return buffer_.empty() &&
         input_.streamStatus == NSStreamStatus::NSStreamStatusAtEnd;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
