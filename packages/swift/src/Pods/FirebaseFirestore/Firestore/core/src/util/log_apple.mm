/*
 * Copyright 2017 Google LLC
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

#include "Firestore/core/src/util/log.h"

#if defined(__APPLE__)

#import <Foundation/Foundation.h>

#include <cstdarg>
#include <string>

#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

#include "Firestore/core/src/util/string_apple.h"

namespace firebase {
namespace firestore {
namespace util {

namespace {

const FIRLoggerService kFIRLoggerFirestore = @"[Firebase/Firestore]";

// Translates a C++ LogLevel to the equivalent Objective-C FIRLoggerLevel
FIRLoggerLevel ToFIRLoggerLevel(LogLevel level) {
  switch (level) {
    case kLogLevelDebug:
      return FIRLoggerLevelDebug;
    case kLogLevelNotice:
      return FIRLoggerLevelNotice;
    case kLogLevelWarning:
      return FIRLoggerLevelWarning;
    case kLogLevelError:
      return FIRLoggerLevelError;
    default:
      // Unsupported log level. FIRSetLoggerLevel will deal with it.
      return static_cast<FIRLoggerLevel>(-1);
  }
}

// Actually logs a message via FIRLogger. This must be a C varargs function
// so that we can call FIRLogBasic which takes a `va_list`.
void LogMessageV(LogLevel level, NSString* format, ...) {
  va_list list;
  va_start(list, format);

  FIRLogBasic(ToFIRLoggerLevel(level), kFIRLoggerFirestore, @"I-FST000001",
              format, list);

  va_end(list);
}

}  // namespace

void LogSetLevel(LogLevel level) {
  FIRSetLoggerLevel(ToFIRLoggerLevel(level));
}

// Note that FIRLogger's default level can be changed by persisting a
// debug_mode setting in user defaults. Check for defaults getting in your way
// with:
//
//   defaults read firestore_util_test
//
// You can change it with:
//
//   defaults write firestore_util_test /google/firebase/debug_mode NO

bool LogIsLoggable(LogLevel level) {
  return FIRIsLoggableLevel(ToFIRLoggerLevel(level), false);
}

void LogMessage(LogLevel level, const std::string& message) {
  LogMessageV(level, @"%@", MakeNSString(message));
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // defined(__APPLE__)
