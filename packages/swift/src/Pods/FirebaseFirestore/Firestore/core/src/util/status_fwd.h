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

#ifndef FIRESTORE_CORE_SRC_UTIL_STATUS_FWD_H_
#define FIRESTORE_CORE_SRC_UTIL_STATUS_FWD_H_

#include <functional>

namespace firebase {
namespace firestore {
namespace util {

// Forward declarations for Status classes.

class Status;

using StatusCallback = std::function<void(Status)>;

template <typename T>
class StatusOr;

template <typename T>
using StatusOrCallback = std::function<void(util::StatusOr<T>)>;

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_STATUS_FWD_H_
