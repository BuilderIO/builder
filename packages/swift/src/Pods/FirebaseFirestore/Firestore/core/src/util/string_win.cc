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

#include "Firestore/core/src/util/string_win.h"

#if defined(_WIN32)
#include <windows.h>

#include "Firestore/core/src/util/hard_assert.h"
#include "absl/memory/memory.h"
#include "absl/strings/match.h"

namespace firebase {
namespace firestore {
namespace util {

std::wstring Utf8ToNative(absl::string_view input) {
  int input_len = static_cast<int>(input.size());

  // MultiByteToWideChar considers a zero length to be an error, so special case
  // the empty string.
  if (input_len == 0) {
    return L"";
  }

  // The input string_view may contain embedded nulls and isn't necessarily null
  // terminated so we must pass an explicit length to MultiByteToWideChar. This
  // means the result is the number of wchar_t required to hold the result,
  // excluding the null terminator.
  int output_len =
      ::MultiByteToWideChar(CP_UTF8, 0, input.data(), input_len, nullptr, 0);
  if (output_len == 0) {
    DWORD error = ::GetLastError();
    HARD_FAIL("Utf8ToNative failed with code %s: %s", error,
              LastErrorMessage(error));
  }
  HARD_ASSERT(output_len > 0);

  int output_terminated_len = output_len + 1;
  std::wstring output(output_terminated_len, L'\0');
  int result = ::MultiByteToWideChar(CP_UTF8, 0, input.data(), input_len,
                                     &output[0], output_len);
  HARD_ASSERT(result > 0 && result < output_terminated_len &&
              output[output_len] == '\0');

  output.resize(result);
  return output;
}

std::string NativeToUtf8(const std::wstring& input) {
  return NativeToUtf8(input.c_str(), input.size());
}

std::string NativeToUtf8(const wchar_t* input, size_t input_size) {
  int input_len = static_cast<int>(input_size);
  if (input_len == 0) {
    return "";
  }

  // The input buffer may contain embedded nulls and isn't necessarily null
  // terminated so we must pass an explicit length to WideCharToMultiByte. This
  // means the result is the number of char required to hold the result,
  // excluding the null terminator.
  int output_len = ::WideCharToMultiByte(CP_UTF8, 0, input, input_len, nullptr,
                                         0, nullptr, nullptr);
  if (output_len == 0) {
    DWORD error = ::GetLastError();
    HARD_FAIL("NativeToUtf8 failed with code %s: %s", error,
              LastErrorMessage(error));
  }
  HARD_ASSERT(output_len > 0);

  int output_terminated_len = output_len + 1;
  std::string output(output_terminated_len, '\0');
  int result = ::WideCharToMultiByte(CP_UTF8, 0, input, input_len, &output[0],
                                     output_len, nullptr, nullptr);
  HARD_ASSERT(result > 0 && result < output_terminated_len &&
              output[output_len] == '\0');

  output.resize(result);
  return output;
}

std::string LastErrorMessage(DWORD last_error) {
  // Preallocate a buffer sufficiently large to receive any message. Since we're
  // not asking for inserts this is already way too big.
  size_t size = 16 * 1024;
  auto error_text = absl::make_unique<wchar_t[]>(size);

  // output_len excludes the trailing null.
  DWORD output_len = ::FormatMessageW(
      FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, nullptr,
      last_error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), error_text.get(),
      static_cast<DWORD>(size), nullptr);
  if (output_len == 0) {
    DWORD format_error = ::GetLastError();
    return util::StringFormat(
        "error %s; unknown error %s while getting error text", last_error,
        format_error);
  }

  std::string formatted = NativeToUtf8(error_text.get(), output_len);
  if (absl::EndsWith(formatted, "\r\n")) {
    formatted.resize(formatted.size() - 2);
  }
  return formatted;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // defined(_WIN32)
