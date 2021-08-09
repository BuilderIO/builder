/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/nanopb/pretty_printing.h"

#include <sstream>

#include "Firestore/core/src/nanopb/byte_string.h"

namespace firebase {
namespace firestore {
namespace nanopb {
namespace internal {

std::string Indent(int level, int indent_width) {
  return std::string(level * indent_width, ' ');
}

std::string ToString(pb_bytes_array_t* value) {
  return absl::StrCat("\"", nanopb::ByteString(value).ToString(), "\"");
}

std::string ToString(bool value) {
  return value ? std::string{"true"} : std::string{"false"};
}

// Overloads for float and double exist to minimize the use of `stringstream`,
// which isn't necessary for other scalars.
std::string ToString(float value) {
  // `std::to_string` doesn't allow changing width and precision for floating
  // point values, leading to output inconsistent with "official" proto
  // libraries.
  // TODO(varconst): raise the precision.
  // The Objective-C protobuf library would use higher precision. E.g., it would
  // output 1.79769313486232e+308 in case where this implementation would only
  // output 1.79769e+308 (tested in XCode 11, iOS simulator).
  std::ostringstream stream;
  stream << value;
  return stream.str();
}

std::string ToString(double value) {
  // See comment on the `float` overload.
  std::ostringstream stream;
  stream << value;
  return stream.str();
}

}  // namespace internal

std::string PrintHeader(int indent_level,
                        absl::string_view message_name,
                        const void* message_ptr) {
  if (indent_level == 0) {
    auto p = absl::Hex{reinterpret_cast<uintptr_t>(message_ptr)};
    return absl::StrCat("<", message_name, " 0x", p, ">: {\n");
  } else {
    return "{\n";
  }
}

std::string PrintTail(int indent_level) {
  return internal::Indent(indent_level) + '}';
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase
