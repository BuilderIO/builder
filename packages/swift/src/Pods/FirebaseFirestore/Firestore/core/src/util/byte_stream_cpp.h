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
#ifndef FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_CPP_H_
#define FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_CPP_H_

#include <istream>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/util/byte_stream.h"

namespace firebase {
namespace firestore {
namespace util {

class ByteStreamCpp : public ByteStream {
 public:
  explicit ByteStreamCpp(std::unique_ptr<std::istream> input)
      : input_(std::move(input)) {
  }

  StreamReadResult ReadUntil(char delim, size_t max_length) override;
  StreamReadResult Read(size_t max_length) override;

 private:
  /**
   * Checks the states of `input_` and returns a `StreamReadResult` based on the
   * states and the given `result` as the read result.
   */
  StreamReadResult ToReadResult(const std::string& result);

  std::unique_ptr<std::istream> input_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_CPP_H_
