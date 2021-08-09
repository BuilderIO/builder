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

#ifndef FIRESTORE_CORE_SRC_CORE_DIRECTION_H_
#define FIRESTORE_CORE_SRC_CORE_DIRECTION_H_

#include <iosfwd>
#include <string>

#include "Firestore/core/src/util/comparison.h"
#include "absl/base/attributes.h"

namespace firebase {
namespace firestore {
namespace core {

/** Interface used for all query orderings. All Directions are immutable. */
class Direction {
 public:
  ABSL_CONST_INIT static const Direction Ascending;
  ABSL_CONST_INIT static const Direction Descending;

  /**
   * Creates a Direction from a boolean. This is useful only because the
   * public Objective-C API uses it.
   */
  static const Direction& FromDescending(bool descending) {
    return descending ? Descending : Ascending;
  }

  Direction() = default;

  /**
   * Changes the direction of the given ComparisonResult if the direction is
   * Descending.
   */
  util::ComparisonResult ApplyTo(util::ComparisonResult) const;

  int comparison_modifier() const {
    return comparison_modifier_;
  }

  std::string CanonicalId() const;

 private:
  enum {
    AscendingModifier = 1,
    DescendingModifier = -1,
  };

  constexpr explicit Direction(int comparison_modifier)
      : comparison_modifier_(comparison_modifier) {
  }
  int comparison_modifier_ = AscendingModifier;
};

std::ostream& operator<<(std::ostream& os, const Direction& direction);

inline bool operator==(const Direction& lhs, const Direction& rhs) {
  return lhs.comparison_modifier() == rhs.comparison_modifier();
}

inline bool operator!=(const Direction& lhs, const Direction& rhs) {
  return !(lhs == rhs);
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_DIRECTION_H_
