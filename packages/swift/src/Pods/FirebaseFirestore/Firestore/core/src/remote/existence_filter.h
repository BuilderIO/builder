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

#ifndef FIRESTORE_CORE_SRC_REMOTE_EXISTENCE_FILTER_H_
#define FIRESTORE_CORE_SRC_REMOTE_EXISTENCE_FILTER_H_

namespace firebase {
namespace firestore {
namespace remote {

class ExistenceFilter {
 public:
  ExistenceFilter() = default;
  explicit ExistenceFilter(int count) : count_{count} {
  }

  int count() const {
    return count_;
  }

 private:
  int count_ = 0;
};

inline bool operator==(const ExistenceFilter& lhs, const ExistenceFilter& rhs) {
  return lhs.count() == rhs.count();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_EXISTENCE_FILTER_H_
