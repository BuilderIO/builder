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

#include "Firestore/core/src/core/direction.h"

#include <ostream>

namespace firebase {
namespace firestore {
namespace core {

const Direction Direction::Ascending(Direction::AscendingModifier);
const Direction Direction::Descending(Direction::DescendingModifier);

std::string Direction::CanonicalId() const {
  return comparison_modifier_ == AscendingModifier ? "asc" : "desc";
}

util::ComparisonResult Direction::ApplyTo(util::ComparisonResult result) const {
  if (comparison_modifier_ == AscendingModifier) {
    return result;
  } else {
    return util::ReverseOrder(result);
  }
}

std::ostream& operator<<(std::ostream& os, const Direction& direction) {
  return os << direction.CanonicalId();
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
