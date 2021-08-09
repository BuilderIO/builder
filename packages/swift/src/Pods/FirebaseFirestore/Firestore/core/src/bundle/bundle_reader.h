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
#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_READER_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_READER_H_

#include <cstdint>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/bundle_serializer.h"
#include "Firestore/core/src/util/byte_stream.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Reads the length-prefixed JSON stream for Bundles.
 *
 * The class takes a bundle stream and presents abstractions to read bundled
 * elements out of the underlying content.
 */
class BundleReader {
 public:
  BundleReader(BundleSerializer serializer,
               std::unique_ptr<util::ByteStream> input);

  /**
   * Returns the metadata element from the bundle.
   *
   * Caches the result when first called, and returns the cached result in the
   * following calls.
   */
  BundleMetadata GetBundleMetadata();

  /**
   * Returns the next element from the bundle. Metadata elements can be accessed
   * by `GetBundleMetadata`, they are not returned from this method.
   *
   * When there is no more element to return, a `nullptr` is returned. Check
   * `reader_status()` to see if it is due to the completion of bundle (status
   * will be `ok()`), or an error.
   */
  std::unique_ptr<BundleElement> GetNextElement();

  /** Returns whether this instance is in good state. */
  const util::Status& reader_status() const {
    return reader_status_;
  }

  /** Sets this instance to a failed state. */
  void Fail(std::string msg) {
    reader_status_.Update(util::Status(Error::kErrorDataLoss, std::move(msg)));
  }

  /** How many bytes have we read from the bundle. */
  int64_t bytes_read() const {
    return bytes_read_;
  }

 private:
  /**
   * Reads from the head of internal buffer, pulls more data from underlying
   * stream until a complete element is found (including the prefixed length and
   * the JSON string).
   *
   * Once a complete element is read, it is dropped from internal buffer.
   *
   * Returns either the bundled element, or null if we have reached the end of
   * the stream.
   */
  std::unique_ptr<BundleElement> ReadNextElement();

  /**
   * Reads the length prefix string from bundle stream. Returns `nullopt` when
   * at the end of stream.
   *
   * The string representing a length prefix is whatever string we have from
   * the `input_` until the next character is a "{" (start of JSON element).
   * So calling this a second time will return an empty string.
   */
  absl::optional<std::string> ReadLengthPrefix();

  /**
   * Reads `required_size` number of chars from stream into internal `buffer_`.
   */
  void ReadJsonToBuffer(size_t required_size);

  /**
   * Decodes internal `buffer_` into a `BundleElement`, returned as a unique_ptr
   * pointing to the element. Returns nullptr if fails.
   *
   * Note this method will leave `buffer_` unchanged.
   */
  std::unique_ptr<BundleElement> DecodeBundleElementFromBuffer();

  BundleSerializer serializer_;
  JsonReader json_reader_;

  // Input stream holding bundle data.
  std::unique_ptr<util::ByteStream> input_;

  // Cached bundle metadata.
  BundleMetadata metadata_;
  bool metadata_loaded_ = false;

  // Internal buffer, cleared every time a complete element is parsed from this.
  std::string buffer_;

  util::Status reader_status_;
  int64_t bytes_read_ = 0;
};

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_READER_H_
