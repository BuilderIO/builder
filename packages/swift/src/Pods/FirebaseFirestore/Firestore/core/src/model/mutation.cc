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

#include "Firestore/core/src/model/mutation.h"

#include <cstdlib>
#include <ostream>
#include <sstream>
#include <utility>

#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/object_value.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/to_string.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace model {

using nanopb::Message;

std::string MutationResult::ToString() const {
  return absl::StrCat(
      "MutationResult(version=", version_.ToString(),
      ", transform_results=", util::ToString(transform_results_), ")");
}

std::ostream& operator<<(std::ostream& os, const MutationResult& result) {
  return os << result.ToString();
}

bool operator==(const MutationResult& lhs, const MutationResult& rhs) {
  return lhs.version() == rhs.version() &&
         *lhs.transform_results_ == *rhs.transform_results_;
}

void Mutation::ApplyToRemoteDocument(
    MutableDocument& document, const MutationResult& mutation_result) const {
  return rep().ApplyToRemoteDocument(document, mutation_result);
}

void Mutation::ApplyToLocalView(MutableDocument& document,
                                const Timestamp& local_write_time) const {
  return rep().ApplyToLocalView(document, local_write_time);
}

absl::optional<ObjectValue> Mutation::Rep::ExtractTransformBaseValue(
    const Document& document) const {
  absl::optional<ObjectValue> base_object;

  for (const FieldTransform& transform : field_transforms_) {
    auto existing_value = document->field(transform.path());
    auto coerced_value =
        transform.transformation().ComputeBaseValue(existing_value);
    if (coerced_value) {
      if (!base_object) {
        base_object = ObjectValue{};
      }
      base_object->Set(transform.path(), std::move(*coerced_value));
    }
  }

  return base_object;
}

Mutation::Rep::Rep(DocumentKey&& key, Precondition&& precondition)
    : key_(std::move(key)),
      precondition_(std::move(precondition)),
      field_transforms_(std::vector<FieldTransform>()) {
}

Mutation::Rep::Rep(DocumentKey&& key,
                   Precondition&& precondition,
                   std::vector<FieldTransform>&& field_transforms)
    : key_(std::move(key)),
      precondition_(std::move(precondition)),
      field_transforms_(std::move(field_transforms)) {
}

bool Mutation::Rep::Equals(const Mutation::Rep& other) const {
  return type() == other.type() && key_ == other.key_ &&
         precondition_ == other.precondition_ &&
         field_transforms_ == other.field_transforms_;
}

void Mutation::Rep::VerifyKeyMatches(const MutableDocument& document) const {
  HARD_ASSERT(document.key() == key(),
              "Can only apply a mutation to a document with the same key");
}

SnapshotVersion Mutation::Rep::GetPostMutationVersion(
    const MutableDocument& document) {
  if (document.is_found_document()) {
    return document.version();
  } else {
    return SnapshotVersion::None();
  }
}

TransformMap Mutation::Rep::ServerTransformResults(
    const ObjectValue& previous_data,
    const Message<google_firestore_v1_ArrayValue>& server_transform_results)
    const {
  TransformMap transform_results;
  HARD_ASSERT(
      field_transforms_.size() == server_transform_results->values_count,
      "server transform result size (%s) should match field transforms "
      "size (%s)",
      server_transform_results->values_count, field_transforms_.size());

  for (size_t i = 0; i < server_transform_results->values_count; ++i) {
    const FieldTransform& field_transform = field_transforms_[i];
    const TransformOperation& transform = field_transform.transformation();
    const auto& previous_value = previous_data.Get(field_transform.path());
    Message<google_firestore_v1_Value> transformed_value =
        transform.ApplyToRemoteDocument(
            previous_value, DeepClone(server_transform_results->values[i]));
    transform_results[field_transform.path()] = std::move(transformed_value);
  }
  return transform_results;
}

TransformMap Mutation::Rep::LocalTransformResults(
    const ObjectValue& previous_data, const Timestamp& local_write_time) const {
  TransformMap transform_results;
  for (const FieldTransform& field_transform : field_transforms_) {
    const TransformOperation& transform = field_transform.transformation();
    const auto& previous_value = previous_data.Get(field_transform.path());
    Message<google_firestore_v1_Value> transformed_value =
        transform.ApplyToLocalView(previous_value, local_write_time);
    transform_results[field_transform.path()] = std::move(transformed_value);
  }
  return transform_results;
}

bool operator==(const Mutation& lhs, const Mutation& rhs) {
  return lhs.rep_ == nullptr
             ? rhs.rep_ == nullptr
             : (rhs.rep_ != nullptr && lhs.rep_->Equals(*rhs.rep_));
}

size_t Mutation::Rep::Hash() const {
  return util::Hash(type(), key(), precondition(), field_transforms());
}

std::ostream& operator<<(std::ostream& os, const Mutation& mutation) {
  return os << mutation.ToString();
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
