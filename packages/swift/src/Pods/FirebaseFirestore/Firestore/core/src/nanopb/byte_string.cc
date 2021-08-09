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

#include "Firestore/core/src/nanopb/byte_string.h"

#include <cctype>
#include <cstdlib>
#include <cstring>
#include <iomanip>
#include <ostream>
#include <sstream>

#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/range.h"
#include "absl/strings/escaping.h"

namespace firebase {
namespace firestore {
namespace nanopb {

ByteString::ByteString(const pb_bytes_array_t* bytes) {
  if (bytes != nullptr) {
    bytes_ = MakeBytesArray(bytes->bytes, bytes->size);
  }
}

ByteString::ByteString(const void* value, size_t size)
    : bytes_(MakeBytesArray(value, size)) {
}

ByteString::ByteString(absl::string_view value)
    : ByteString(value.data(), value.size()) {
}

ByteString::ByteString(std::initializer_list<uint8_t> value)
    : ByteString(value.begin(), value.size()) {
}

ByteString::ByteString(const ByteString& other)
    : ByteString(other.data(), other.size()) {
}

ByteString::ByteString(ByteString&& other) noexcept {
  bytes_ = other.bytes_;
  other.bytes_ = nullptr;
}

ByteString::~ByteString() {
  std::free(bytes_);
}

ByteString& ByteString::operator=(const ByteString& other) {
  if (bytes_ != other.bytes_) {
    std::free(bytes_);
    bytes_ = MakeBytesArray(other.data(), other.size());
  }
  return *this;
}

ByteString& ByteString::operator=(ByteString&& other) noexcept {
  if (bytes_ != other.bytes_) {
    std::free(bytes_);
    bytes_ = other.bytes_;
    other.bytes_ = nullptr;
  }
  return *this;
}

/* static */ ByteString ByteString::Take(pb_bytes_array_t* bytes) {
  return ByteString{bytes, 0};
}

const uint8_t* ByteString::data() const {
  static const uint8_t kEmpty[] = "";
  return bytes_ ? bytes_->bytes : kEmpty;
}

pb_bytes_array_t* ByteString::release() {
  pb_bytes_array_t* result = bytes_;
  bytes_ = nullptr;
  return result;
}

void swap(ByteString& lhs, ByteString& rhs) noexcept {
  std::swap(lhs.bytes_, rhs.bytes_);
}

util::ComparisonResult ByteString::CompareTo(const ByteString& rhs) const {
  return util::Compare(MakeStringView(*this), MakeStringView(rhs));
}

size_t ByteString::Hash() const {
  return util::Hash(util::make_range(begin(), end()));
}

std::string ByteString::ToString() const {
  return absl::CEscape(MakeStringView(*this));
}

std::ostream& operator<<(std::ostream& out, const ByteString& str) {
  return out << str.ToString();
}

std::string ByteString::ToHexString() const {
  std::string hex = absl::BytesToHexString(MakeStringView(*this));
  return absl::StrCat("<", hex, ">");
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase
