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

#ifndef FIRESTORE_CORE_SRC_CORE_KEY_FIELD_FILTER_H_
#define FIRESTORE_CORE_SRC_CORE_KEY_FIELD_FILTER_H_

#include <string>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/core/field_filter.h"
#include "Firestore/core/src/nanopb/message.h"

namespace firebase {
namespace firestore {
namespace core {

/**
 * A Filter that matches on key fields (i.e. '__name__').
 */
class KeyFieldFilter : public FieldFilter {
 public:
  /** Creates a new document key filter. Takes ownership of `value`. */
  KeyFieldFilter(const model::FieldPath& field,
                 core::Filter::Operator op,
                 nanopb::SharedMessage<google_firestore_v1_Value> value);

 private:
  class Rep;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_KEY_FIELD_FILTER_H_
