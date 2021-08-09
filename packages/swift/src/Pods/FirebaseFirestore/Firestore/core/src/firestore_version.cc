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

#include "Firestore/core/include/firebase/firestore/firestore_version.h"

#ifndef FIRFirestore_VERSION
#error \
    "FIRFirestore_VERSION is not defined: add -DFIRFirestore_VERSION=... to the build invocation"  // NOLINT(whitespace/line_length)
#endif

namespace firebase {
namespace firestore {

// The following two macros supply the incantation so that the C
// preprocessor does not try to parse the version as a floating
// point number. See
// https://www.guyrutenberg.com/2008/12/20/expanding-macros-into-string-constants-in-c/
#define STR(x) STR_EXPAND(x)
#define STR_EXPAND(x) #x

const char* const kFirestoreVersionString = STR(FIRFirestore_VERSION);

}  // namespace firestore
}  // namespace firebase
