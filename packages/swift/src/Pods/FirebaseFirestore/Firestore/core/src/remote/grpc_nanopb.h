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

#ifndef FIRESTORE_CORE_SRC_REMOTE_GRPC_NANOPB_H_
#define FIRESTORE_CORE_SRC_REMOTE_GRPC_NANOPB_H_

#include <pb.h>
#include <pb_decode.h>

#include <vector>

#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "grpcpp/support/byte_buffer.h"

namespace firebase {
namespace firestore {
namespace remote {

/** A `Reader` that reads from the given `grpc::ByteBuffer`. */
class ByteBufferReader : public nanopb::Reader {
 public:
  /**
   * Copies the given `buffer` and associates the resulting stream with this
   * `ByteBufferReader`.
   */
  // TODO(varconst): avoid copying the buffer.
  explicit ByteBufferReader(const grpc::ByteBuffer& buffer);

  void Read(const pb_field_t* fields, void* dest_struct) override;

 private:
  nanopb::ByteString bytes_;
  pb_istream_t stream_{};
};

/** A `Writer` that writes into a `grpc::ByteBuffer`. */
class ByteBufferWriter : public nanopb::Writer {
 public:
  ByteBufferWriter();

  grpc::ByteBuffer Release();

 private:
  std::vector<grpc::Slice> buffer_;
};

/**
 * Serializes the given `message` into a `grpc::ByteBuffer`.
 *
 * The lifetime of the return value is entirely independent of the `message`.
 */
template <typename T>
grpc::ByteBuffer MakeByteBuffer(const nanopb::Message<T>& message) {
  ByteBufferWriter writer;
  writer.Write(message.fields(), message.get());
  return writer.Release();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_GRPC_NANOPB_H_
