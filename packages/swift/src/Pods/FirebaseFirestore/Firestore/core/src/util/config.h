/*
 * Copyright 2018 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_UTIL_CONFIG_H_
#define FIRESTORE_CORE_SRC_UTIL_CONFIG_H_

// This header provides static definitions of platform configuration values for
// build systems that cannot auto-detect their current configuration. This
// includes both CocoaPods and Swift Package Manager.
//
// CMake builds are not handled here. See `config_detected.h.in` for the
// template used by CMake when detecting the availability of platform features.

#if defined(__has_include)
#if __has_include("Firestore/core/src/util/config_detected.h")
#define FIRESTORE_HAVE_CONFIG_DETECTED_H 1
#endif
#endif  // defined(__has_include)

#if defined(FIRESTORE_HAVE_CONFIG_DETECTED_H)
// If FIRESTORE_HAVE_CONFIG_DETECTED_H is defined, assume the configuration is
// correct. You can define FIRESTORE_HAVE_CONFIG_DETECTED_H=0 to configure the
// correct HAVE_ values via the compiler command-line.
#if FIRESTORE_HAVE_CONFIG_DETECTED_H
#include "Firestore/core/src/util/config_detected.h"
#endif

#elif __APPLE__ && (SWIFT_PACKAGE || COCOAPODS)
// Swift Package Manager does not support configure-time feature testing and
// does not support source transformations of any kind so we can't cheat by
// running a sed command to generate config.h before building.
//
// Handle CocoaPods the same way since the settings are the same.
#define HAVE_ARC4RANDOM 1
#define HAVE_LIBDISPATCH 1

#elif __linux__ && SWIFT_PACKAGE
#define HAVE_OPENSSL_RAND_H 1

#else
#error "Unknown build configuration"
#endif  // FIRESTORE_HAVE_CONFIG_DETECTED_H

#endif  // FIRESTORE_CORE_SRC_UTIL_CONFIG_H_
