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

#ifndef FIRESTORE_CORE_SRC_UTIL_STRING_WIN_H_
#define FIRESTORE_CORE_SRC_UTIL_STRING_WIN_H_

#if defined(_WIN32)
#include <windows.h>

#include <string>

#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * Converts a UTF-8-encoded string to the equivalent wide character form,
 * suitable for use with Windows path-related functions.
 */
std::wstring Utf8ToNative(absl::string_view input);

/**
 * Converts a UTF-16-encoded filename to the equivalent in UTF-8, suitable for
 * use in log messages or other non-path-related functions.
 */
std::string NativeToUtf8(const std::wstring& input);
std::string NativeToUtf8(const wchar_t* input, size_t length);

/**
 * Formats the given system error code from GetLastError() to a UTF-8 encoded
 * string.
 */
std::string LastErrorMessage(DWORD last_error);

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // defined(_WIN32)
#endif  // FIRESTORE_CORE_SRC_UTIL_STRING_WIN_H_
