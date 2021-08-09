/*
 * Copyright 2017 Google
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

#ifndef FIRESTORE_CORE_SRC_UTIL_LOG_H_
#define FIRESTORE_CORE_SRC_UTIL_LOG_H_

#include <string>

#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace util {

// Levels used when logging messages.
enum LogLevel {
  // Debug Log Level
  kLogLevelDebug,
  // Notice Log Level
  kLogLevelNotice,
  // Warning Log Level
  kLogLevelWarning,
  // Error Log Level
  kLogLevelError,
};

// Log a message if kLogLevelDebug is enabled. Arguments are not evaluated if
// logging is disabled.
//
// @param format A format string suitable for use with `util::StringFormat`
// @param ... C++ variadic arguments that match the format string. Not C
//     varargs.
#define LOG_DEBUG(...)                                         \
  do {                                                         \
    namespace _util = firebase::firestore::util;               \
    if (_util::LogIsLoggable(_util::kLogLevelDebug)) {         \
      std::string _message = _util::StringFormat(__VA_ARGS__); \
      _util::LogMessage(_util::kLogLevelDebug, _message);      \
    }                                                          \
  } while (0)

// Log a message if kLogLevelWarn is enabled (it is by default). Arguments are
// not evaluated if logging is disabled.
//
// @param format A format string suitable for use with `util::StringFormat`
// @param ... C++ variadic arguments that match the format string. Not C
//     varargs.
#define LOG_WARN(...)                                          \
  do {                                                         \
    namespace _util = firebase::firestore::util;               \
    if (_util::LogIsLoggable(_util::kLogLevelWarning)) {       \
      std::string _message = _util::StringFormat(__VA_ARGS__); \
      _util::LogMessage(_util::kLogLevelWarning, _message);    \
    }                                                          \
  } while (0)

// Log a message if kLogLevelError is enabled (it is by default). Arguments are
// not evaluated if logging is disabled.
//
// @param format A format string suitable for use with `util::StringFormat`
// @param ... C++ variadic arguments that match the format string. Not C
//     varargs.
#define LOG_ERROR(...)                                         \
  do {                                                         \
    namespace _util = firebase::firestore::util;               \
    if (_util::LogIsLoggable(_util::kLogLevelError)) {         \
      std::string _message = _util::StringFormat(__VA_ARGS__); \
      _util::LogMessage(_util::kLogLevelError, _message);      \
    }                                                          \
  } while (0)

// Tests to see if the given log level is loggable.
bool LogIsLoggable(LogLevel level);

// Is debug logging enabled?
inline bool LogIsDebugEnabled() {
  return LogIsLoggable(kLogLevelDebug);
}

// All messages at or above the specified log level value are displayed.
void LogSetLevel(LogLevel level);

// Log a message at the given level.
void LogMessage(LogLevel log_level, const std::string& message);

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_LOG_H_
