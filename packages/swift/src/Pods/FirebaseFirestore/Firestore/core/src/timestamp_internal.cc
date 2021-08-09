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

#include "Firestore/core/src/timestamp_internal.h"

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/statusor.h"

namespace util = firebase::firestore::util;

namespace firebase {

util::StatusOr<Timestamp> TimestampInternal::FromUntrustedTime(
    absl::Time time) {
  // Note `ToUnixSeconds` rounds towards negative infinity, this makes the
  // `nanos` calculated below always non-negative, meeting protobuf's
  // requirement.
  int64_t seconds = absl::ToUnixSeconds(time);
  int32_t nanos = static_cast<int32_t>((time - absl::FromUnixSeconds(seconds)) /
                                       absl::Nanoseconds(1));
  return FromUntrustedSecondsAndNanos(seconds, nanos);
}

util::StatusOr<Timestamp> TimestampInternal::FromUntrustedSecondsAndNanos(
    int64_t seconds, int32_t nanos) {
  // The Timestamp ctor will assert if we provide values outside the valid
  // range. However, since we're decoding, a single corrupt byte could cause
  // this to occur, so we'll verify the ranges before passing them in since we'd
  // rather not abort in these situations.
  if (seconds < Min().seconds()) {
    return util::Status(
        firestore::Error::kErrorInvalidArgument,
        "Invalid message: timestamp beyond the earliest supported date");
  } else if (Max().seconds() < seconds) {
    return util::Status(
        firestore::Error::kErrorInvalidArgument,
        "Invalid message: timestamp beyond the latest supported date");
  } else if (nanos < 0 || nanos > 999999999) {
    return util::Status(
        firestore::Error::kErrorInvalidArgument,
        "Invalid message: timestamp nanos must be between 0 and 999999999");
  }

  return Timestamp(seconds, nanos);
}

size_t TimestampInternal::Hash(const Timestamp& timestamp) {
  return util::Hash(timestamp.seconds(), timestamp.nanoseconds());
}

Timestamp TimestampInternal::Truncate(const Timestamp& timestamp) {
  int32_t truncated_nanos = timestamp.nanoseconds() / 1000 * 1000;
  return Timestamp(timestamp.seconds(), truncated_nanos);
}

}  // namespace firebase
