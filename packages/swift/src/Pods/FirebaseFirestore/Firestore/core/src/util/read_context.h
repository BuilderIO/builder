/*
 * Copyright 2021 Google LLC
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
#ifndef FIRESTORE_CORE_SRC_UTIL_READ_CONTEXT_H_
#define FIRESTORE_CORE_SRC_UTIL_READ_CONTEXT_H_

#include <string>
#include <utility>

#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace util {

/**
 * Maintains whether any errors occurred between single reads within a larger
 * read chain. The pattern is to pass the `ReadContext` as the first argument to
 * any `Read` function that might fail, and for the function to exit early if
 * the given context is failed already.
 */
class ReadContext {
 public:
  bool ok() const {
    return status_.ok();
  }

  const util::Status& status() const {
    return status_;
  }

  void set_status(util::Status status) {
    status_ = std::move(status);
  }

  /**
   * Ensures this `ReadContext`'s status is `!ok()`.
   *
   * If this `ReadContext`'s status is already `!ok()`, then this may augment
   * the description, but will otherwise leave it alone. Otherwise, this
   * `ReadContext`'s status will be set to `Error::kErrorDataLoss` with the
   * specified description.
   */
  void Fail(std::string description) {
    status_.Update(util::Status(Error::kErrorDataLoss, std::move(description)));
  }

  template <typename... FA>
  void Fail(const char* format, const FA&... args) {
    Fail(StringFormat(format, args...));
  }

 private:
  util::Status status_ = util::Status::OK();
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_READ_CONTEXT_H_
