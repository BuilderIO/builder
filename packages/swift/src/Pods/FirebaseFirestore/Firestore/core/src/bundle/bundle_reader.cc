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

#include "Firestore/core/src/bundle/bundle_reader.h"

#include <algorithm>

#include "absl/memory/memory.h"
#include "absl/strings/numbers.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace bundle {

using nlohmann::json;
using util::ByteStream;
using util::StreamReadResult;

namespace {

json Parse(absl::string_view s) {
  return json::parse(s.begin(), s.end(), /*callback=*/nullptr,
                     /*allow_exceptions=*/false);
}

}  // namespace

BundleReader::BundleReader(BundleSerializer serializer,
                           std::unique_ptr<ByteStream> input)
    : serializer_(std::move(serializer)), input_(std::move(input)) {
}

BundleMetadata BundleReader::GetBundleMetadata() {
  if (metadata_loaded_) {
    return metadata_;
  }

  std::unique_ptr<BundleElement> element = ReadNextElement();
  if (!element || element->element_type() != BundleElement::Type::Metadata) {
    Fail("Failed to get bundle metadata");
    return {};
  }

  metadata_loaded_ = true;
  metadata_ = static_cast<BundleMetadata&>(*element);
  return metadata_;
}

std::unique_ptr<BundleElement> BundleReader::GetNextElement() {
  // Makes sure metadata is read before proceeding. The metadata element is the
  // first element in the bundle stream.
  GetBundleMetadata();
  return ReadNextElement();
}

std::unique_ptr<BundleElement> BundleReader::ReadNextElement() {
  auto length_prefix = ReadLengthPrefix();
  if (!length_prefix.has_value()) {
    return nullptr;
  }

  size_t prefix_value = 0;
  auto ok = absl::SimpleAtoi<size_t>(length_prefix.value(), &prefix_value);
  if (!ok) {
    Fail("Prefix string is not a valid number");
    return nullptr;
  }

  buffer_.clear();
  ReadJsonToBuffer(prefix_value);
  if (!reader_status_.ok()) {
    return nullptr;
  }

  // metadata's size does not count in `bytes_read_`.
  if (metadata_loaded_) {
    bytes_read_ += length_prefix.value().size() + buffer_.size();
  }
  auto result = DecodeBundleElementFromBuffer();
  reader_status_.Update(json_reader_.status());

  return result;
}

absl::optional<std::string> BundleReader::ReadLengthPrefix() {
  // length string of size 16 indicates an element about 1PB, which is
  // impossible for valid bundles.
  StreamReadResult result = input_->ReadUntil('{', 16);
  if (!result.ok()) {
    reader_status_.Update(result.status());
    return absl::nullopt;
  }

  // Underlying stream is closed, and there happens to be no more data to
  // process.
  if (result.eof() && result.ValueOrDie().empty()) {
    return absl::nullopt;
  }

  return absl::make_optional(std::move(result).ValueOrDie());
}

void BundleReader::ReadJsonToBuffer(size_t required_size) {
  if (!reader_status_.ok()) {
    return;
  }
  while (buffer_.size() < required_size) {
    // Read at most 1024 bytes every time, to avoid allocating a huge buffer
    // when corruption leads to large `required_size`.
    auto size = std::min<size_t>(1024ul, required_size - buffer_.size());
    StreamReadResult result = input_->Read(size);
    if (!result.ok()) {
      reader_status_.Update(result.status());
      return;
    }
    bool eof = result.eof();
    buffer_.append(std::move(result).ValueOrDie());
    if (eof) {
      break;
    }
  }

  if (buffer_.size() < required_size) {
    Fail("Available input string is smaller than what length prefix indicates");
  }
}

std::unique_ptr<BundleElement> BundleReader::DecodeBundleElementFromBuffer() {
  auto json_object = Parse(buffer_);
  if (json_object.is_discarded()) {
    Fail("Failed to parse string into json");
    return nullptr;
  }

  if (json_object.contains("metadata")) {
    return absl::make_unique<BundleMetadata>(serializer_.DecodeBundleMetadata(
        json_reader_, json_object.at("metadata")));
  } else if (json_object.contains("namedQuery")) {
    auto q = serializer_.DecodeNamedQuery(json_reader_,
                                          json_object.at("namedQuery"));
    return absl::make_unique<NamedQuery>(std::move(q));
  } else if (json_object.contains("documentMetadata")) {
    return absl::make_unique<BundledDocumentMetadata>(
        serializer_.DecodeDocumentMetadata(json_reader_,
                                           json_object.at("documentMetadata")));
  } else if (json_object.contains("document")) {
    return absl::make_unique<BundleDocument>(
        serializer_.DecodeDocument(json_reader_, json_object.at("document")));
  } else {
    Fail("Unrecognized BundleElement");
    return nullptr;
  }
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase
