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
#ifndef FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_H_
#define FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_H_

#include <cstddef>
#include <string>
#include <utility>

#include "Firestore/core/src/util/statusor.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * Represents results from read operations on a `ByteStream`.
 */
class StreamReadResult {
 public:
  StreamReadResult(StatusOr<std::string> result, bool eof)
      : result_(std::move(result)), eof_(eof) {
  }

  /** Returns whether the `ByteStream` instance has reached to the end. */
  bool eof() const {
    return eof_;
  }

  /** Whether the read operation is successful. */
  bool ok() const {
    return result_.ok();
  }

  const Status& status() const {
    return result_.status();
  }

  const std::string& ValueOrDie() const& {
    return result_.ValueOrDie();
  }

  std::string& ValueOrDie() & {
    return result_.ValueOrDie();
  }

  const std::string&& ValueOrDie() const&& {
    return std::move(result_).ValueOrDie();
  }

  std::string&& ValueOrDie() && {
    return std::move(result_).ValueOrDie();
  }

 private:
  StatusOr<std::string> result_;
  bool eof_ = false;
};

/**
 * A class representing byte streams, providing interfaces for stream reading
 * on top of potentially different stream implementations: NSInputStream,
 * istream, etc.
 */
class ByteStream {
 public:
  virtual ~ByteStream() = default;

  /**
   * Reads until either a specified (`delim`) character is encountered, or the
   * `max_length` number of bytes has been read, or the end of stream has been
   * reached.
   *
   * Note in the case when `delim` is encountered, the `delim` character is not
   * read after this operation, and will be the first character for the next
   * read operation.
   */
  virtual StreamReadResult ReadUntil(char delim, size_t max_length) = 0;

  /**
   * Reads until the `max_length` number of bytes has been read, or the end of
   * stream has been reached.
   */
  virtual StreamReadResult Read(size_t max_length) = 0;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_H_
