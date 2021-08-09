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

#include "Firestore/core/src/remote/grpc_nanopb.h"

#include <vector>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "Firestore/core/src/remote/grpc_util.h"
#include "Firestore/core/src/util/status.h"
#include "grpcpp/support/status.h"

namespace firebase {
namespace firestore {
namespace remote {

using nanopb::ByteString;
using nanopb::ByteStringWriter;
using util::Status;

ByteBufferReader::ByteBufferReader(const grpc::ByteBuffer& buffer) {
  std::vector<grpc::Slice> slices;
  grpc::Status status = buffer.Dump(&slices);
  // Conversion may fail if compression is used and gRPC tries to decompress an
  // ill-formed buffer.
  if (!status.ok()) {
    Status error{Error::kErrorInternal,
                 "Trying to convert an invalid grpc::ByteBuffer"};
    error.CausedBy(ConvertStatus(status));
    set_status(error);
    return;
  }

  ByteStringWriter writer;
  writer.Reserve(buffer.Length());
  for (const auto& slice : slices) {
    writer.Append(slice.begin(), slice.size());
  }

  bytes_ = writer.Release();
  stream_ = pb_istream_from_buffer(bytes_.data(), bytes_.size());
}

void ByteBufferReader::Read(const pb_field_t* fields, void* dest_struct) {
  if (!ok()) return;

  if (!pb_decode(&stream_, fields, dest_struct)) {
    Fail(PB_GET_ERROR(&stream_));
  }
}

namespace {

bool AppendToGrpcBuffer(pb_ostream_t* stream,
                        const pb_byte_t* buf,
                        size_t count) {
  auto buffer = static_cast<std::vector<grpc::Slice>*>(stream->state);
  buffer->emplace_back(buf, count);
  return true;
}

}  // namespace

ByteBufferWriter::ByteBufferWriter() {
  stream_.callback = AppendToGrpcBuffer;
  stream_.state = &buffer_;
  stream_.max_size = SIZE_MAX;
}

grpc::ByteBuffer ByteBufferWriter::Release() {
  grpc::ByteBuffer result{buffer_.data(), buffer_.size()};
  buffer_.clear();
  return result;
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
