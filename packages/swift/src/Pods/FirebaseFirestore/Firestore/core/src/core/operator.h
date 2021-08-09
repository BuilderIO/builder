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

#ifndef FIRESTORE_CORE_SRC_CORE_OPERATOR_H_
#define FIRESTORE_CORE_SRC_CORE_OPERATOR_H_

#include "Firestore/core/src/core/filter.h"

namespace firebase {
namespace firestore {
namespace core {

inline bool IsArrayOperator(Filter::Operator op) {
  return op == Filter::Operator::ArrayContains ||
         op == Filter::Operator::ArrayContainsAny;
}

inline bool IsDisjunctiveOperator(Filter::Operator op) {
  return op == Filter::Operator::In ||
         op == Filter::Operator::ArrayContainsAny ||
         op == Filter::Operator::NotIn;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_OPERATOR_H_
