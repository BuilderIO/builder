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

#include "Firestore/core/src/model/object_value.h"

#include <algorithm>
#include <map>
#include <set>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/nanopb/fields_array.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/hashing.h"
#include "absl/types/span.h"

namespace firebase {
namespace firestore {
namespace model {

namespace {

using nanopb::CheckedSize;
using nanopb::FreeFieldsArray;
using nanopb::FreeNanopbMessage;
using nanopb::MakeArray;
using nanopb::MakeBytesArray;
using nanopb::MakeString;
using nanopb::MakeStringView;
using nanopb::Message;
using nanopb::ReleaseFieldOwnership;
using nanopb::SetRepeatedField;

struct MapEntryKeyCompare {
  bool operator()(const google_firestore_v1_MapValue_FieldsEntry& entry,
                  absl::string_view segment) const {
    return nanopb::MakeStringView(entry.key) < segment;
  }
  bool operator()(absl::string_view segment,
                  const google_firestore_v1_MapValue_FieldsEntry& entry) const {
    return segment < nanopb::MakeStringView(entry.key);
  }
};

/**
 * Finds an entry by key in the provided map value. Returns `nullptr` if the
 * entry does not exist.
 */
google_firestore_v1_MapValue_FieldsEntry* FindEntry(
    const google_firestore_v1_Value& value, absl::string_view segment) {
  if (!IsMap(value)) {
    return nullptr;
  }
  const google_firestore_v1_MapValue& map_value = value.map_value;

  // MapValues in iOS are always stored in sorted order.
  auto found = std::equal_range(map_value.fields,
                                map_value.fields + map_value.fields_count,
                                segment, MapEntryKeyCompare());

  if (found.first == found.second) {
    return nullptr;
  }

  return found.first;
}

size_t CalculateSizeOfUnion(
    const google_firestore_v1_MapValue& map_value,
    const std::map<std::string, Message<google_firestore_v1_Value>>& upserts,
    const std::set<std::string>& deletes) {
  // Compute the size of the map after applying all mutations. The final size is
  // the number of existing entries, plus the number of new entries
  // minus the number of deleted entries.
  return upserts.size() +
         std::count_if(
             map_value.fields, map_value.fields + map_value.fields_count,
             [&](const google_firestore_v1_MapValue_FieldsEntry& entry) {
               std::string field = MakeString(entry.key);
               // Don't count if entry is deleted or if it is a replacement
               // rather than an insert.
               return deletes.find(field) == deletes.end() &&
                      upserts.find(field) == upserts.end();
             });
}

/**
 * Modifies `parent_map` by adding, replacing or deleting the specified
 * entries.
 */
void ApplyChanges(
    google_firestore_v1_MapValue* parent,
    std::map<std::string, Message<google_firestore_v1_Value>> upserts,
    std::set<std::string> deletes) {
  // TODO(mrschmidt): Consider using `absl::btree_map` and `absl::btree_set` for
  // potentially better performance.
  auto source_count = parent->fields_count;
  auto* source_fields = parent->fields;

  size_t target_count = CalculateSizeOfUnion(*parent, upserts, deletes);
  auto* target_fields = MakeArray<google_firestore_v1_MapValue_FieldsEntry>(
      CheckedSize(target_count));

  auto delete_it = deletes.begin();
  auto upsert_it = upserts.begin();

  // Merge the existing data with the deletes and updates
  pb_size_t source_index = 0, target_index = 0;
  while (target_index < target_count) {
    auto& target_entry = target_fields[target_index];

    if (source_index < source_count) {
      auto& source_entry = source_fields[source_index];
      std::string source_key = MakeString(source_entry.key);

      // Check if the source key is deleted
      if (delete_it != deletes.end() && *delete_it == source_key) {
        FreeFieldsArray(&source_entry);

        ++delete_it;
        ++source_index;
        continue;
      }

      // Check if the source key is updated by the next upsert
      if (upsert_it != upserts.end() && upsert_it->first == source_key) {
        FreeFieldsArray(&source_entry.value);

        target_entry.key = source_entry.key;
        target_entry.value = *(upsert_it->second.release());
        SortFields(target_entry.value);

        ++upsert_it;
        ++source_index;
        ++target_index;
        continue;
      }

      // Check if the source key comes before the next upsert
      if (upsert_it == upserts.end() || upsert_it->first > source_key) {
        target_entry = source_entry;

        ++source_index;
        ++target_index;
        continue;
      }
    }

    // Otherwise, insert the next upsert.
    target_entry.key = MakeBytesArray(upsert_it->first);
    target_entry.value = *(upsert_it->second.release());
    SortFields(target_entry.value);

    ++upsert_it;
    ++target_index;
  }

  // Delete any remaining fields in the original map. This only includes fields
  // that were deleted.
  for (; source_index < source_count; ++source_index) {
    FreeFieldsArray(&source_fields[source_index]);
  }

  free(parent->fields);
  parent->fields = target_fields;
  parent->fields_count = CheckedSize(target_count);
}

}  // namespace

ObjectValue::ObjectValue() {
  value_->which_value_type = google_firestore_v1_Value_map_value_tag;
  value_->map_value = {};
}

ObjectValue::ObjectValue(Message<google_firestore_v1_Value> value)
    : value_(std::move(value)) {
  HARD_ASSERT(value_ && IsMap(*value_),
              "ObjectValues should be backed by a MapValue");
  SortFields(*value_);
}

ObjectValue::ObjectValue(const ObjectValue& other)
    : value_(DeepClone(*other.value_)) {
}

ObjectValue ObjectValue::FromMapValue(
    Message<google_firestore_v1_MapValue> map_value) {
  Message<google_firestore_v1_Value> value;
  value->which_value_type = google_firestore_v1_Value_map_value_tag;
  value->map_value = *map_value.release();
  return ObjectValue{std::move(value)};
}

ObjectValue ObjectValue::FromFieldsEntry(
    google_firestore_v1_Document_FieldsEntry* fields_entry, pb_size_t count) {
  Message<google_firestore_v1_Value> value;
  value->which_value_type = google_firestore_v1_Value_map_value_tag;
  SetRepeatedField(
      &value->map_value.fields, &value->map_value.fields_count,
      absl::Span<google_firestore_v1_Document_FieldsEntry>(fields_entry, count),
      [](const google_firestore_v1_Document_FieldsEntry& entry) {
        return google_firestore_v1_MapValue_FieldsEntry{entry.key, entry.value};
      });
  // Prevent double-freeing of the document's fields. The fields are now owned
  // by ObjectValue.
  ReleaseFieldOwnership(fields_entry, count);
  return ObjectValue{std::move(value)};
}

FieldMask ObjectValue::ToFieldMask() const {
  return ExtractFieldMask(value_->map_value);
}

FieldMask ObjectValue::ExtractFieldMask(
    const google_firestore_v1_MapValue& value) const {
  std::set<FieldPath> fields;

  for (size_t i = 0; i < value.fields_count; ++i) {
    const google_firestore_v1_MapValue_FieldsEntry& entry = value.fields[i];
    FieldPath current_path{MakeString(entry.key)};

    if (!IsMap(entry.value)) {
      fields.insert(std::move(current_path));
      continue;
    }

    // Recursively extract the nested map
    FieldMask nested_mask = ExtractFieldMask(entry.value.map_value);
    if (nested_mask.begin() == nested_mask.end()) {
      // Preserve the empty map by adding it to the FieldMask
      fields.insert(std::move(current_path));
    } else {
      for (const FieldPath& nested_path : nested_mask) {
        fields.insert(current_path.Append(nested_path));
      }
    }
  }

  return FieldMask(std::move(fields));
}

absl::optional<google_firestore_v1_Value> ObjectValue::Get(
    const FieldPath& path) const {
  if (path.empty()) {
    return *value_;
  }

  google_firestore_v1_Value nested_value = *value_;
  for (const std::string& segment : path) {
    google_firestore_v1_MapValue_FieldsEntry* entry =
        FindEntry(nested_value, segment);
    if (!entry) return absl::nullopt;
    nested_value = entry->value;
  }
  return nested_value;
}

google_firestore_v1_Value ObjectValue::Get() const {
  return *value_;
}

void ObjectValue::Set(const FieldPath& path,
                      Message<google_firestore_v1_Value> value) {
  HARD_ASSERT(!path.empty(), "Cannot set field for empty path on ObjectValue");

  google_firestore_v1_MapValue* parent_map = ParentMap(path.PopLast());

  std::map<std::string, Message<google_firestore_v1_Value>> upserts;
  upserts[path.last_segment()] = std::move(value);

  ApplyChanges(parent_map, std::move(upserts), /*deletes=*/{});
}

void ObjectValue::SetAll(TransformMap data) {
  FieldPath parent;

  std::map<std::string, Message<google_firestore_v1_Value>> upserts;
  std::set<std::string> deletes;

  for (auto& it : data) {
    const FieldPath& path = it.first;
    absl::optional<Message<google_firestore_v1_Value>> value =
        std::move(it.second);

    if (!parent.IsImmediateParentOf(path)) {
      // Insert the accumulated changes at this parent location
      google_firestore_v1_MapValue* parent_map = ParentMap(parent);
      ApplyChanges(parent_map, std::move(upserts), std::move(deletes));
      upserts.clear();
      deletes.clear();
      parent = path.PopLast();
    }

    if (value) {
      upserts[path.last_segment()] = std::move(*value);
    } else {
      deletes.insert(path.last_segment());
    }
  }

  google_firestore_v1_MapValue* parent_map = ParentMap(parent);
  ApplyChanges(parent_map, std::move(upserts), std::move(deletes));
}

void ObjectValue::Delete(const FieldPath& path) {
  HARD_ASSERT(!path.empty(), "Cannot delete field with empty path");

  google_firestore_v1_Value* nested_value = value_.get();
  for (const std::string& segment : path.PopLast()) {
    auto* entry = FindEntry(*nested_value, segment);
    // If the entry is not found, exit early. There is nothing to delete.
    if (!entry) return;
    nested_value = &entry->value;
  }

  // We can only delete a leaf entry if its parent is a map.
  if (IsMap(*nested_value)) {
    std::set<std::string> deletes{path.last_segment()};
    ApplyChanges(&nested_value->map_value, /*upserts=*/{}, deletes);
  }
}

std::string ObjectValue::ToString() const {
  return CanonicalId(*value_);
}

size_t ObjectValue::Hash() const {
  return util::Hash(CanonicalId(*value_));
}

google_firestore_v1_MapValue* ObjectValue::ParentMap(const FieldPath& path) {
  google_firestore_v1_Value* parent = value_.get();

  // Find a or create a parent map entry for `path`.
  for (const std::string& segment : path) {
    google_firestore_v1_MapValue_FieldsEntry* entry =
        FindEntry(*parent, segment);

    if (entry) {
      if (entry->value.which_value_type !=
          google_firestore_v1_Value_map_value_tag) {
        // Since the element is not a map value, free all existing data and
        // change it to a map type.
        FreeFieldsArray(&entry->value);
        entry->value.which_value_type = google_firestore_v1_Value_map_value_tag;
        entry->value.map_value = {};
      }

      parent = &entry->value;
    } else {
      // Create a new map value for the current segment.
      Message<google_firestore_v1_Value> new_entry;
      new_entry->which_value_type = google_firestore_v1_Value_map_value_tag;
      new_entry->map_value = {};

      std::map<std::string, Message<google_firestore_v1_Value>> upserts;
      upserts[segment] = std::move(new_entry);
      ApplyChanges(&parent->map_value, std::move(upserts), /*deletes=*/{});

      parent = &(FindEntry(*parent, segment)->value);
    }
  }

  return &parent->map_value;
}

}  // namespace model
}  // namespace firestore
}  // namespace firebase
