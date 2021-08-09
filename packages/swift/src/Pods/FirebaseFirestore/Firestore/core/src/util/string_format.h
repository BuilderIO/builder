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

#ifndef FIRESTORE_CORE_SRC_UTIL_STRING_FORMAT_H_
#define FIRESTORE_CORE_SRC_UTIL_STRING_FORMAT_H_

#include <initializer_list>
#include <string>
#include <utility>

#include "Firestore/core/src/objc/objc_type_traits.h"
#include "Firestore/core/src/util/string_apple.h"
#include "Firestore/core/src/util/type_traits.h"
#include "absl/base/attributes.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

namespace internal {

std::string StringFormatPieces(const char* format,
                               std::initializer_list<absl::string_view> pieces);

/**
 * Explicit ranking for formatting choices. Only useful as an implementation
 * detail of `FormatArg`.
 */
template <int I>
struct FormatChoice : FormatChoice<I + 1> {};

template <>
struct FormatChoice<5> {};

}  // namespace internal

/**
 * Acts as the main value parameter to StringFormat and related functions.
 *
 * Chooses a conversion to a text form in this order:
 *   * If the value is exactly of `bool` type (without implicit conversions)
 *     the text will be "true" or "false".
 *   * If the value is of type `const char*`, the text will be the value
 *     interpreted as a C string. To show the address of a single char or to
 *     show the `const char*` as an address, cast to `void*`.
 *   * If the value is any other pointer type, the text will be the hexadecimal
 *     formatting of the value as an unsigned integer.
 *   * Otherwise the value is interpreted as anything absl::AlphaNum accepts.
 */
class FormatArg : public absl::AlphaNum {
 public:
  template <typename T>
  FormatArg(T&& value)  // NOLINT(runtime/explicit)
      : FormatArg{std::forward<T>(value), internal::FormatChoice<0>{}} {
  }

 private:
  /**
   * Creates a FormatArg from a boolean value, representing the string
   * "true" or "false".
   *
   * This overload only applies if the type of the argument is exactly `bool`.
   * No implicit conversions to bool are accepted.
   */
  template <typename T,
            typename = typename std::enable_if<std::is_same<bool, T>{}>::type>
  FormatArg(T bool_value, internal::FormatChoice<0>)
      : AlphaNum{bool_value ? "true" : "false"} {
  }

#if __OBJC__
  /**
   * Creates a FormatArg from any pointer to an object derived from NSObject.
   */
  template <
      typename T,
      typename = typename std::enable_if<objc::is_objc_pointer<T>{}>::type>
  FormatArg(T object, internal::FormatChoice<1>)
      : AlphaNum{MakeStringView([object description])} {
  }

  /**
   * Creates a FormatArg from any Objective-C Class type. Objective-C Class
   * types are a special struct that aren't of a type derived from NSObject.
   */
  FormatArg(Class object, internal::FormatChoice<1>)
      : AlphaNum{MakeStringView(NSStringFromClass(object))} {
  }
#endif

  /**
   * Creates a FormatArg from a character string literal. This is
   * handled specially to avoid ambiguity with generic pointers, which are
   * handled differently.
   */
  FormatArg(std::nullptr_t, internal::FormatChoice<2>) : AlphaNum{"null"} {
  }

  /**
   * Creates a FormatArg from a character string literal. This is
   * handled specially to avoid ambiguity with generic pointers, which are
   * handled differently.
   */
  FormatArg(const char* string_value, internal::FormatChoice<3>)
      : AlphaNum{string_value == nullptr ? "null" : string_value} {
  }

  /**
   * Creates a FormatArg from an arbitrary pointer, represented as a
   * hexadecimal integer literal.
   */
  template <typename T>
  FormatArg(T* pointer_value, internal::FormatChoice<4>)
      : AlphaNum{absl::Hex{reinterpret_cast<uintptr_t>(pointer_value)}} {
  }

  /**
   * As a final fallback, creates a FormatArg from any type of value that
   * absl::AlphaNum accepts.
   */
  template <typename T>
  FormatArg(T&& value, internal::FormatChoice<5>)
      : AlphaNum{std::forward<T>(value)} {
  }
};

/**
 * Formats a string using a simplified printf-like formatting mechanism that
 * does not rely on C varargs.
 *
 * The following format specifiers are recognized:
 *   * "%%" - A literal "%"
 *   * "%s" - The next parameter is copied through
 *
 * Note:
 *   * If you pass fewer arguments than the format requires, StringFormat will
 *     insert "<missing>".
 *   * If you pass more arguments than the format requires, any excess arguments
 *     are ignored.
 *   * If you use an invalid format specifier, StringFormat will insert
 *     <invalid>.
 */
template <typename... FA>
std::string StringFormat(const char* format, const FA&... args) {
  return internal::StringFormatPieces(
      format, {static_cast<const FormatArg&>(args).Piece()...});
}

inline std::string StringFormat() {
  return {};
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_STRING_FORMAT_H_
