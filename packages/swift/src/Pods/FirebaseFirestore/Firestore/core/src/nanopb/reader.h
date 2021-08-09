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

#ifndef FIRESTORE_CORE_SRC_NANOPB_READER_H_
#define FIRESTORE_CORE_SRC_NANOPB_READER_H_

#include <pb.h>
#include <pb_decode.h>

#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/util/read_context.h"
#include "Firestore/core/src/util/status.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace nanopb {

/**
 * An interface that:
 * - maintains a `ReadContext` across the reads;
 * - can read byte representations from the associated stream into a given
 *   Nanopb proto.
 *
 * Derived classes define what kinds of streams can be associated with the
 * `Reader`.
 */
class Reader {
 public:
  virtual ~Reader() = default;

  /**
   * Reads a Nanopb proto from the stream associated with this `Reader`.
   *
   * This essentially wraps calls to Nanopb's `pb_decode()` method. This is the
   * primary way of decoding messages.
   *
   * Note that this allocates memory. You must call
   * `nanopb::FreeNanopbMessage()` (which essentially wraps `pb_release()`) on
   * the `dest_struct` in order to avoid memory leaks. (This also implies code
   * that uses this is not exception safe.)
   */
  // TODO(rsgowman): At the moment we rely on the caller to manually free
  // dest_struct via nanopb::FreeNanopbMessage(). We might instead see if we can
  // register allocated messages, track them, and free them ourselves. This may
  // be especially relevant if we start to use nanopb messages as the underlying
  // data within the model objects.
  virtual void Read(const pb_field_t fields[], void* dest_struct) = 0;

  bool ok() const {
    return context_.ok();
  }

  const util::Status& status() const {
    return context_.status();
  }

  void set_status(util::Status status) {
    context_.set_status(std::move(status));
  }

  util::ReadContext* context() {
    return &context_;
  }

  const util::ReadContext* context() const {
    return &context_;
  }

  void Fail(std::string description) {
    context_.Fail(std::move(description));
  }

 private:
  util::ReadContext context_;
};

/**
 * Docs TODO(rsgowman). But currently, this just wraps the underlying nanopb
 * pb_istream_t.
 */
class StringReader : public Reader {
 public:
  /**
   * Creates an instance that isn't associated with any bytes. It can be used
   * for error propagation.
   * TODO(varconst): only use `ReadContext` for error propagation.
   */
  StringReader() = default;

  /**
   * Creates an input stream that reads from the specified bytes. Note that
   * this reference must remain valid for the lifetime of this `StringReader`.
   *
   * (This is roughly equivalent to the Nanopb function
   * `pb_istream_from_buffer()`)
   *
   * @param bytes where the input should be deserialized from.
   */
  explicit StringReader(const nanopb::ByteString& bytes);
  explicit StringReader(const std::vector<uint8_t>& bytes);
  StringReader(const uint8_t* bytes, size_t size);

  /**
   * Creates an input stream from bytes backing the string_view. Note that
   * the backing buffer must remain valid for the lifetime of this
   * `StringReader`.
   *
   * (This is roughly equivalent to the Nanopb function
   * `pb_istream_from_buffer()`)
   */
  explicit StringReader(absl::string_view);

  void Read(const pb_field_t fields[], void* dest_struct) override;

 private:
  /**
   * Takes that a shallow copy of the given `stream`. (Non-null pointers within
   * this struct must remain valid for the lifetime of this `StringReader`.)
   */
  explicit StringReader(pb_istream_t stream) : stream_(stream) {
  }

  pb_istream_t stream_{};
};

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_NANOPB_READER_H_
