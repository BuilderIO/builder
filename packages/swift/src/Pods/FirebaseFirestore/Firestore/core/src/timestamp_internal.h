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

#ifndef FIRESTORE_CORE_SRC_TIMESTAMP_INTERNAL_H_
#define FIRESTORE_CORE_SRC_TIMESTAMP_INTERNAL_H_

#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/time/time.h"

namespace firebase {

/**
 * Details about the Timestamp class which are useful internally, but we don't
 * want to expose publicly.
 */
class TimestampInternal {
 public:
  /**
   * Represents the maximum allowable time that the Timestamp class handles,
   * specifically 9999-12-31T23:59:59.999999999Z.
   */
  static firebase::Timestamp Max() {
    return {253402300800L - 1, 999999999};
  }

  /**
   * Represents the minimum allowable time that the Timestamp class handles,
   * specifically 0001-01-01T00:00:00Z.
   */
  static firebase::Timestamp Min() {
    return {-62135596800L, 0};
  }

  static firestore::util::StatusOr<firebase::Timestamp> FromUntrustedTime(
      absl::Time time);
  static firestore::util::StatusOr<firebase::Timestamp>
  FromUntrustedSecondsAndNanos(int64_t seconds, int32_t nanos);

  static size_t Hash(const Timestamp& timestamp);

  /**
   * Truncates the input timestamp to microsecond precision to match backend
   * behavior.
   */
  static Timestamp Truncate(const Timestamp& timestamp);
};

}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_TIMESTAMP_INTERNAL_H_
