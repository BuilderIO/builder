/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/core/target_id_generator.h"

#include "Firestore/core/src/util/hard_assert.h"

using firebase::firestore::model::TargetId;

namespace firebase {
namespace firestore {
namespace core {

TargetIdGenerator::TargetIdGenerator(TargetIdGeneratorId generator_id,
                                     TargetId seed)
    : generator_id_(generator_id) {
  seek(seed);
}

void TargetIdGenerator::seek(TargetId target_id) {
  const TargetId generator = static_cast<TargetId>(generator_id_);
  HARD_ASSERT((target_id & generator) == generator,
              "Cannot supply target ID from different generator ID");
  next_id_ = target_id;
}

TargetId TargetIdGenerator::NextId() {
  int next_id = next_id_;
  next_id_ += 1 << kReservedBits;
  return next_id;
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
