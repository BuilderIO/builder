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
#ifndef FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_APPLE_H_
#define FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_APPLE_H_

#if !defined(__OBJC__)
#error "This header only supports Objective-C++."
#endif  // !defined(__OBJC__)

#import <Foundation/Foundation.h>

#include <cstdint>
#include <string>

#include "Firestore/core/src/util/byte_stream.h"

namespace firebase {
namespace firestore {
namespace util {

class ByteStreamApple : public ByteStream {
 public:
  explicit ByteStreamApple(NSInputStream* input) : input_(input) {
    if ([input_ streamStatus] == NSStreamStatusNotOpen) {
      [input_ open];
    }
  }

  StreamReadResult ReadUntil(char delim, size_t max_length) override;
  StreamReadResult Read(size_t max_length) override;

 private:
  StreamReadResult ConsumeBuffer();
  StreamReadResult ErrorResult();
  bool eof() const;
  int32_t ReadToBuffer(size_t max_length);

  NSInputStream* input_ = nullptr;
  std::string buffer_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_BYTE_STREAM_APPLE_H_
