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

#ifndef FIRESTORE_CORE_SRC_NANOPB_PRETTY_PRINTING_H_
#define FIRESTORE_CORE_SRC_NANOPB_PRETTY_PRINTING_H_

#include <pb.h>

#include <string>

#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace nanopb {

namespace internal {

// Creates a string of spaces corresponding to the given indentation level.
std::string Indent(int level, int indent_width = 2);

std::string ToString(pb_bytes_array_t* value);
std::string ToString(bool value);
std::string ToString(float value);
std::string ToString(double value);

template <typename T>
std::string ToString(const T& value) {
  return std::to_string(value);
}

}  // namespace internal

// Prints a nested message by delegating to its `ToString` member function.
//
// If the nested message is empty, then:
// - if `always_print` is false, an empty string is returned.
// - if `always_print` is true, a string containing field name and empty braces
//   is returned.
template <typename T>
std::string PrintMessageField(absl::string_view name,
                              const T& value,
                              int indent_level,
                              bool always_print) {
  auto contents = value.ToString(indent_level);
  if (contents.empty()) {
    if (!always_print) {
      return "";
    } else {
      return absl::StrCat(internal::Indent(indent_level), name, "{\n",
                          internal::Indent(indent_level), "}\n");
    }
  }

  return absl::StrCat(internal::Indent(indent_level), name, contents, "\n");
}

// Prints a primitive type field.
//
// If the field has its default value (e.g., zero), then:
// - if `always_print` is false, an empty string is returned.
// - if `always_print` is true, a string representing the default value is
//   returned.
template <typename T>
std::string PrintPrimitiveField(absl::string_view name,
                                T value,
                                int indent_level,
                                bool always_print) {
  if (value == T{} && !always_print) {
    return "";
  }
  return absl::StrCat(internal::Indent(indent_level), name,
                      internal::ToString(value), "\n");
}

// Prints an enum type field by delegating to a `EnumToString` free function.
//
// If the enum has its default value, zero), then:
// - if `always_print` is false, an empty string is returned.
// - if `always_print` is true, a string representing the default value is
//   returned.
template <typename T>
std::string PrintEnumField(absl::string_view name,
                           T value,
                           int indent_level,
                           bool always_print) {
  if (value == T{} && !always_print) {
    return "";
  }

  return absl::StrCat(internal::Indent(indent_level), name, EnumToString(value),
                      "\n");
}

// Begins output for a message.
//
// For a non-root message (determined by `indent_level`), this is just an
// opening brace. For the root message, `message_name` and the address of the
// object are additionally printed (e.g., "<Foo 0x12345678>: {").
std::string PrintHeader(int indent_level,
                        absl::string_view message_name,
                        const void* message_ptr);

// Ends output for a message.
//
// This just outputs a closing brace.
std::string PrintTail(int indent_level);

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_NANOPB_PRETTY_PRINTING_H_
