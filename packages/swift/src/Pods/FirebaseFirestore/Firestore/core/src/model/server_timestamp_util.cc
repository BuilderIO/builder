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

#include "Firestore/core/src/model/server_timestamp_util.h"

#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace model {

using nanopb::Message;

const char kTypeKey[] = "__type__";
const char kLocalWriteTimeKey[] = "__local_write_time__";
const char kPreviousValueKey[] = "__previous_value__";
const char kServerTimestampSentinel[] = "server_timestamp";

Message<google_firestore_v1_Value> EncodeServerTimestamp(
    const Timestamp& local_write_time,
    absl::optional<google_firestore_v1_Value> previous_value) {
  pb_size_t count = previous_value ? 3 : 2;

  Message<google_firestore_v1_Value> result;
  result->which_value_type = google_firestore_v1_Value_map_value_tag;
  result->map_value.fields_count = count;
  result->map_value.fields =
      nanopb::MakeArray<google_firestore_v1_MapValue_FieldsEntry>(count);

  auto* field = result->map_value.fields;
  field->key = nanopb::MakeBytesArray(kTypeKey);
  field->value.which_value_type = google_firestore_v1_Value_string_value_tag;
  field->value.string_value = nanopb::MakeBytesArray(kServerTimestampSentinel);

  ++field;
  field->key = nanopb::MakeBytesArray(kLocalWriteTimeKey);
  field->value.which_value_type = google_firestore_v1_Value_timestamp_value_tag;
  field->value.timestamp_value.seconds = local_write_time.seconds();
  field->value.timestamp_value.nanos = local_write_time.nanoseconds();

  if (previous_value) {
    ++field;
    field->key = nanopb::MakeBytesArray(kPreviousValueKey);
    field->value = *DeepClone(*previous_value).release();
  }

  return result;
}

bool IsServerTimestamp(const google_firestore_v1_Value& value) {
  if (!IsMap(value)) {
    return false;
  }

  if (value.map_value.fields_count > 3) {
    return false;
  }

  for (size_t i = 0; i < value.map_value.fields_count; ++i) {
    const auto& field = value.map_value.fields[i];
    absl::string_view key = nanopb::MakeStringView(field.key);
    if (key == kTypeKey) {
      return field.value.which_value_type ==
                 google_firestore_v1_Value_string_value_tag &&
             nanopb::MakeStringView(field.value.string_value) ==
                 kServerTimestampSentinel;
    }
  }

  return false;
}

google_protobuf_Timestamp GetLocalWriteTime(
    const firebase::firestore::google_firestore_v1_Value& value) {
  for (size_t i = 0; i < value.map_value.fields_count; ++i) {
    const auto& field = value.map_value.fields[i];
    absl::string_view key = nanopb::MakeStringView(field.key);
    if (key == kLocalWriteTimeKey &&
        field.value.which_value_type ==
            google_firestore_v1_Value_timestamp_value_tag) {
      return field.value.timestamp_value;
    }
  }

  HARD_FAIL("LocalWriteTime not found");
}

absl::optional<google_firestore_v1_Value> GetPreviousValue(
    const google_firestore_v1_Value& value) {
  for (size_t i = 0; i < value.map_value.fields_count; ++i) {
    const auto& field = value.map_value.fields[i];
    absl::string_view key = nanopb::MakeStringView(field.key);
    if (key == kPreviousValueKey) {
      if (IsServerTimestamp(field.value)) {
        return GetPreviousValue(field.value);
      } else {
        return field.value;
      }
    }
  }

  return absl::nullopt;
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
