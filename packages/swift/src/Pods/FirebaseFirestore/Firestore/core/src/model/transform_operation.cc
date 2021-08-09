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

#include "Firestore/core/src/model/transform_operation.h"

#include <functional>
#include <memory>
#include <ostream>
#include <utility>

#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/model/server_timestamp_util.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/to_string.h"
#include "absl/algorithm/container.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {
namespace model {

using nanopb::Message;
using Type = TransformOperation::Type;

// MARK: - TransformOperation

TransformOperation::TransformOperation(std::shared_ptr<const Rep> rep)
    : rep_(std::move(rep)) {
}

/** Returns whether the two are equal. */
bool operator==(const TransformOperation& lhs, const TransformOperation& rhs) {
  return lhs.rep_ == nullptr
             ? rhs.rep_ == nullptr
             : (rhs.rep_ != nullptr && lhs.rep_->Equals(*rhs.rep_));
}

std::ostream& operator<<(std::ostream& os, const TransformOperation& op) {
  return os << op.ToString();
}

// MARK: - ServerTimestampTransform

static_assert(sizeof(TransformOperation) == sizeof(ServerTimestampTransform),
              "No additional members allowed (everything must go in Rep)");

class ServerTimestampTransform::Rep : public TransformOperation::Rep {
 public:
  Type type() const override {
    return Type::ServerTimestamp;
  }

  Message<google_firestore_v1_Value> ApplyToLocalView(
      const absl::optional<google_firestore_v1_Value>& previous_value,
      const Timestamp& local_write_time) const override {
    return EncodeServerTimestamp(local_write_time, previous_value);
  }

  Message<google_firestore_v1_Value> ApplyToRemoteDocument(
      const absl::optional<google_firestore_v1_Value>&,
      Message<google_firestore_v1_Value> transform_result) const override {
    return transform_result;
  }

  absl::optional<nanopb::Message<google_firestore_v1_Value>> ComputeBaseValue(
      const absl::optional<google_firestore_v1_Value>&) const override {
    // Server timestamps are idempotent and don't require a base value.
    return absl::nullopt;
  }

  bool Equals(const TransformOperation::Rep& other) const override {
    // All ServerTimestampTransform objects are equal.
    return other.type() == Type::ServerTimestamp;
  }

  size_t Hash() const override {
    // An arbitrary number, since all instances are equal.
    return 37;
  }

  std::string ToString() const override {
    return "ServerTimestamp";
  }
};

ServerTimestampTransform::ServerTimestampTransform()
    : TransformOperation(std::make_shared<const Rep>()) {
}

// MARK: - ArrayTransform

static_assert(sizeof(TransformOperation) == sizeof(ArrayTransform),
              "No additional members allowed (everything must go in Rep)");

/**
 * Transforms an array via a union or remove operation (for convenience, we use
 * this class for both Type::ArrayUnion and Type::ArrayRemove).
 */
class ArrayTransform::Rep : public TransformOperation::Rep {
 public:
  Rep(Type type, Message<google_firestore_v1_ArrayValue> elements)
      : type_(type), elements_{std::move(elements)} {
  }

  Type type() const override {
    return type_;
  }

  Message<google_firestore_v1_Value> ApplyToLocalView(
      const absl::optional<google_firestore_v1_Value>& previous_value,
      const Timestamp&) const override {
    return Apply(previous_value);
  }

  Message<google_firestore_v1_Value> ApplyToRemoteDocument(
      const absl::optional<google_firestore_v1_Value>& previous_value,
      Message<google_firestore_v1_Value>) const override {
    // The server just sends null as the transform result for array operations,
    // so we have to calculate a result the same as we do for local
    // applications.
    return Apply(previous_value);
  }

  absl::optional<nanopb::Message<google_firestore_v1_Value>> ComputeBaseValue(
      const absl::optional<google_firestore_v1_Value>&) const override {
    // Array transforms are idempotent and don't require a base value.
    return absl::nullopt;
  }

  google_firestore_v1_ArrayValue elements() const {
    return *elements_;
  }

  bool Equals(const TransformOperation::Rep& other) const override;

  size_t Hash() const override;

  std::string ToString() const override;

 private:
  friend class ArrayTransform;

  /**
   * Inspects the provided value, returning a copy of the internal array if it's
   * of type Array and an empty array if it's nil or any other type of
   * google_firestore_v1_Value.
   */
  Message<google_firestore_v1_ArrayValue> CoercedFieldValueArray(
      const absl::optional<google_firestore_v1_Value>& value) const;

  Message<google_firestore_v1_Value> Apply(
      const absl::optional<google_firestore_v1_Value>& previous_value) const;

  Type type_;
  nanopb::Message<google_firestore_v1_ArrayValue> elements_;
};

namespace {

constexpr bool IsArrayTransform(Type type) {
  return type == Type::ArrayUnion || type == Type::ArrayRemove;
}

}  // namespace

ArrayTransform::ArrayTransform(Type type,
                               Message<google_firestore_v1_ArrayValue> elements)
    : TransformOperation(
          std::make_shared<const Rep>(type, std::move(elements))) {
  HARD_ASSERT(IsArrayTransform(type), "Expected array transform type; got %s",
              type);
}

ArrayTransform::ArrayTransform(const TransformOperation& op)
    : TransformOperation(op) {
  HARD_ASSERT(IsArrayTransform(op.type()),
              "Expected array transform type; got %s", op.type());
}

google_firestore_v1_ArrayValue ArrayTransform::elements() const {
  return *(array_rep().elements_);
}

const ArrayTransform::Rep& ArrayTransform::array_rep() const {
  return static_cast<const ArrayTransform::Rep&>(rep());
}

bool ArrayTransform::Rep::Equals(const TransformOperation::Rep& other) const {
  if (other.type() != type()) {
    return false;
  }
  auto& other_rep = static_cast<const ArrayTransform::Rep&>(other);
  if (other_rep.elements_->values_count != elements_->values_count) {
    return false;
  }
  for (pb_size_t i = 0; i < elements_->values_count; i++) {
    if (other_rep.elements_->values[i] != elements_->values[i]) {
      return false;
    }
  }
  return true;
}

size_t ArrayTransform::Rep::Hash() const {
  size_t result = 37;
  result = 31 * result + (type() == Type::ArrayUnion ? 1231 : 1237);
  for (size_t i = 0; i < elements_->values_count; i++) {
    result = 31 * result +
             std::hash<std::string>()(CanonicalId(elements_->values[i]));
  }
  return result;
}

std::string ArrayTransform::Rep::ToString() const {
  const char* name = type_ == Type::ArrayUnion ? "ArrayUnion" : "ArrayRemove";
  return absl::StrCat(name, "(", CanonicalId(*elements_), ")");
}

Message<google_firestore_v1_ArrayValue>
ArrayTransform::Rep::CoercedFieldValueArray(
    const absl::optional<google_firestore_v1_Value>& value) const {
  if (IsArray(value)) {
    return DeepClone(value->array_value);
  } else {
    // coerce to empty array.
    return {};
  }
}

Message<google_firestore_v1_Value> ArrayTransform::Rep::Apply(
    const absl::optional<google_firestore_v1_Value>& previous_value) const {
  Message<google_firestore_v1_ArrayValue> array_value =
      CoercedFieldValueArray(previous_value);
  if (type_ == Type::ArrayUnion) {
    // Gather the list of elements that have to be added.
    std::vector<Message<google_firestore_v1_Value>> new_elements;
    for (pb_size_t i = 0; i < elements_->values_count; ++i) {
      const google_firestore_v1_Value& new_element = elements_->values[i];
      if (!Contains(*array_value, new_element) &&
          !std::any_of(new_elements.begin(), new_elements.end(),
                       [&](const Message<google_firestore_v1_Value>& value) {
                         return *value == new_element;
                       })) {
        new_elements.push_back(DeepClone(new_element));
      }
    }

    // Append the elements to the end of the list
    size_t new_size = array_value->values_count + new_elements.size();
    array_value->values = nanopb::ResizeArray<google_firestore_v1_Value>(
        array_value->values, new_size);
    for (auto& element : new_elements) {
      array_value->values[array_value->values_count] = *element.release();
      ++array_value->values_count;
    }
  } else {
    HARD_ASSERT(type_ == Type::ArrayRemove);
    pb_size_t new_index = 0;
    for (pb_size_t old_index = 0; old_index < array_value->values_count;
         ++old_index) {
      if (Contains(*elements_, array_value->values[old_index])) {
        nanopb::FreeFieldsArray(&array_value->values[old_index]);
      } else {
        array_value->values[new_index] = array_value->values[old_index];
        ++new_index;
      }
    }
    array_value->values_count = new_index;
  }

  Message<google_firestore_v1_Value> result;
  result->which_value_type = google_firestore_v1_Value_array_value_tag;
  result->array_value = *array_value.release();
  return result;
}

// MARK: - NumericIncrementTransform

static_assert(sizeof(TransformOperation) == sizeof(NumericIncrementTransform),
              "No additional members allowed (everything must go in Rep)");

class NumericIncrementTransform::Rep : public TransformOperation::Rep {
 public:
  explicit Rep(Message<google_firestore_v1_Value> operand)
      : operand_(std::move(operand)) {
  }

  Type type() const override {
    return Type::Increment;
  }

  Message<google_firestore_v1_Value> ApplyToLocalView(
      const absl::optional<google_firestore_v1_Value>& previous_value,
      const Timestamp& local_write_time) const override;

  Message<google_firestore_v1_Value> ApplyToRemoteDocument(
      const absl::optional<google_firestore_v1_Value>&,
      Message<google_firestore_v1_Value> transform_result) const override {
    return transform_result;
  }

  absl::optional<nanopb::Message<google_firestore_v1_Value>> ComputeBaseValue(
      const absl::optional<google_firestore_v1_Value>& previous_value)
      const override;

  double OperandAsDouble() const;

  bool Equals(const TransformOperation::Rep& other) const override;

  size_t Hash() const override {
    return std::hash<std::string>()(CanonicalId(*operand_));
  }

  std::string ToString() const override {
    return absl::StrCat("NumericIncrement(", operand_->ToString(), ")");
  }

 private:
  friend class NumericIncrementTransform;

  Message<google_firestore_v1_Value> operand_{};
};

NumericIncrementTransform::NumericIncrementTransform(
    Message<google_firestore_v1_Value> operand)
    : TransformOperation(std::make_shared<Rep>(std::move(operand))) {
  HARD_ASSERT(IsNumber(this->operand()));
}

NumericIncrementTransform::NumericIncrementTransform(
    const TransformOperation& op)
    : TransformOperation(op) {
  HARD_ASSERT(op.type() == Type::Increment, "Expected increment type; got %s",
              op.type());
}

const google_firestore_v1_Value& NumericIncrementTransform::operand() const {
  return *static_cast<const Rep&>(rep()).operand_;
}

namespace {

/**
 * Implements saturating integer addition. Overflows are resolved to
 * LONG_MAX/LONG_MIN.
 */
int64_t SafeIncrement(int64_t x, int64_t y) {
  if (x > 0 && y > LONG_MAX - x) {
    return LONG_MAX;
  }

  if (x < 0 && y < LONG_MIN - x) {
    return LONG_MIN;
  }

  return x + y;
}

}  // namespace

double NumericIncrementTransform::Rep::OperandAsDouble() const {
  if (IsDouble(*operand_)) {
    return operand_->double_value;
  } else if (IsInteger(*operand_)) {
    return static_cast<double>(operand_->integer_value);
  } else {
    HARD_FAIL("Expected 'operand' to be of numeric type, but was %s (type %s)",
              CanonicalId(*operand_), GetTypeOrder(*operand_));
  }
}

Message<google_firestore_v1_Value>
NumericIncrementTransform::Rep::ApplyToLocalView(
    const absl::optional<google_firestore_v1_Value>& previous_value,
    const Timestamp& /* local_write_time */) const {
  auto base_value = ComputeBaseValue(previous_value);
  Message<google_firestore_v1_Value> result;

  // Return an integer value only if the previous value and the operand is an
  // integer.
  if (IsInteger(**base_value) && IsInteger(*operand_)) {
    result->which_value_type = google_firestore_v1_Value_integer_value_tag;
    result->integer_value =
        SafeIncrement((*base_value)->integer_value, operand_->integer_value);
  } else if (IsInteger(**base_value)) {
    result->which_value_type = google_firestore_v1_Value_double_value_tag;
    result->double_value = (*base_value)->integer_value + OperandAsDouble();
  } else {
    HARD_ASSERT(IsDouble(**base_value), "'base_value' is not of numeric type");
    result->which_value_type = google_firestore_v1_Value_double_value_tag;
    result->double_value = (*base_value)->double_value + OperandAsDouble();
  }

  return result;
}

absl::optional<Message<google_firestore_v1_Value>>
NumericIncrementTransform::Rep::ComputeBaseValue(
    const absl::optional<google_firestore_v1_Value>& previous_value) const {
  if (IsNumber(previous_value)) {
    return DeepClone(*previous_value);
  }

  Message<google_firestore_v1_Value> zero_value;
  zero_value->which_value_type = google_firestore_v1_Value_integer_value_tag;
  zero_value->integer_value = 0;
  return zero_value;
}

bool NumericIncrementTransform::Rep::Equals(
    const TransformOperation::Rep& other) const {
  if (other.type() != type()) {
    return false;
  }

  return *operand_ ==
         *static_cast<const NumericIncrementTransform::Rep&>(other).operand_;
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
