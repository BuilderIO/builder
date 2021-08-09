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

#include "Firestore/core/src/core/filter.h"

#include <ostream>

namespace firebase {
namespace firestore {
namespace core {

bool operator==(const Filter& lhs, const Filter& rhs) {
  return lhs.rep_ == nullptr
             ? rhs.rep_ == nullptr
             : (rhs.rep_ != nullptr && lhs.rep_->Equals(*rhs.rep_));
}

std::ostream& operator<<(std::ostream& os, const Filter& filter) {
  return os << filter.ToString();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
