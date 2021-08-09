/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless Requiredd by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "Firestore/core/src/bundle/bundle_serializer.h"

#include <memory>
#include <vector>

#include "Firestore/core/src/core/bound.h"
#include "Firestore/core/src/core/direction.h"
#include "Firestore/core/src/core/field_filter.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/core/order_by.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/core/target.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/timestamp_internal.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_format.h"
#include "Firestore/core/src/util/string_util.h"
#include "absl/strings/escaping.h"
#include "absl/strings/numbers.h"
#include "absl/time/time.h"

namespace firebase {
namespace firestore {
namespace bundle {
namespace {

using absl::Time;
using core::Bound;
using core::Direction;
using core::FieldFilter;
using core::Filter;
using core::FilterList;
using core::LimitType;
using core::OrderBy;
using core::OrderByList;
using core::Target;
using model::Document;
using model::DocumentKey;
using model::FieldPath;
using model::MutableDocument;
using model::NaNValue;
using model::NullValue;
using model::ObjectValue;
using model::ResourcePath;
using model::SnapshotVersion;
using nanopb::ByteString;
using nanopb::MakeSharedMessage;
using nanopb::Message;
using nanopb::SetRepeatedField;
using nanopb::SharedMessage;
using nlohmann::json;
using util::StatusOr;
using util::StringFormat;

template <typename T>
const std::vector<T>& EmptyVector() {
  static auto* empty = new std::vector<T>;
  return *empty;
}

Timestamp DecodeTimestamp(JsonReader& reader, const json& version) {
  StatusOr<Timestamp> decoded;
  if (version.is_string()) {
    Time time;
    std::string err;
    bool ok = absl::ParseTime(
        absl::RFC3339_full, version.get_ref<const std::string&>(), &time, &err);
    if (ok) {
      decoded = TimestampInternal::FromUntrustedTime(time);
    } else {
      reader.Fail("Parsing timestamp failed with error: " + err);
      return {};
    }
  } else {
    decoded = TimestampInternal::FromUntrustedSecondsAndNanos(
        reader.RequiredInt<int64_t>("seconds", version),
        reader.RequiredInt<int32_t>("nanos", version));
  }

  if (!decoded.ok()) {
    reader.Fail(
        "Failed to decode json into valid protobuf Timestamp with error '%s'",
        decoded.status().error_message());
    return {};
  }
  return decoded.ConsumeValueOrDie();
}

SnapshotVersion DecodeSnapshotVersion(JsonReader& reader, const json& version) {
  return SnapshotVersion(DecodeTimestamp(reader, version));
}

void VerifyStructuredQuery(JsonReader& reader, const json& query) {
  if (!query.is_object()) {
    reader.Fail("'structuredQuery' is not an object as expected.");
    return;
  }
  if (query.contains("select")) {
    reader.Fail(
        "Queries with 'select' statements are not supported in bundles");
    return;
  }
  if (!query.contains("from")) {
    reader.Fail("Query does not have a 'from' collection");
    return;
  }
  if (query.contains("offset")) {
    reader.Fail("Queries with 'offset' are not supported in bundles");
    return;
  }
}

/**
 * Decodes a json object into the given `parent` and `group` reference.
 *
 * Specifically, if the given `from_json` is for a collection group query, its
 * collection id will be decoded into `group`; otherwise, the collection id will
 * be appended to `parent`.
 */
void DecodeCollectionSource(JsonReader& reader,
                            const json& from_json,
                            ResourcePath& parent,
                            std::string& group) {
  const auto& from = from_json.get_ref<const std::vector<json>&>();
  if (from.size() != 1) {
    reader.Fail(
        "Only queries with a single 'from' clause are supported by the SDK");
    return;
  }
  const auto& collection_selector = from.at(0);
  const auto& collection_id =
      reader.RequiredString("collectionId", collection_selector);
  bool all_descendants =
      reader.OptionalBool("allDescendants", collection_selector);

  if (all_descendants) {
    group = collection_id;
  } else {
    parent = parent.Append(collection_id);
  }
}

FieldPath DecodeFieldReference(JsonReader& reader, const json& field) {
  if (!field.is_object()) {
    reader.Fail("'field' should be an json object, but it is not");
    return {};
  }

  const auto& field_path = reader.RequiredString("fieldPath", field);
  auto result = FieldPath::FromServerFormat(field_path);

  if (!result.ok()) {
    reader.set_status(result.status());
    return {};
  } else {
    return result.ConsumeValueOrDie();
  }
}

Filter::Operator DecodeFieldFilterOperator(JsonReader& reader,
                                           const std::string& op) {
  if (op == "LESS_THAN") {
    return Filter::Operator::LessThan;
  } else if (op == "LESS_THAN_OR_EQUAL") {
    return Filter::Operator::LessThanOrEqual;
  } else if (op == "EQUAL") {
    return Filter::Operator::Equal;
  } else if (op == "NOT_EQUAL") {
    return Filter::Operator::NotEqual;
  } else if (op == "GREATER_THAN") {
    return Filter::Operator::GreaterThan;
  } else if (op == "GREATER_THAN_OR_EQUAL") {
    return Filter::Operator::GreaterThanOrEqual;
  } else if (op == "ARRAY_CONTAINS") {
    return Filter::Operator::ArrayContains;
  } else if (op == "IN") {
    return Filter::Operator::In;
  } else if (op == "ARRAY_CONTAINS_ANY") {
    return Filter::Operator::ArrayContainsAny;
  } else if (op == "NOT_IN") {
    return Filter::Operator::NotIn;
  } else {
    reader.Fail("Operator in filter is not valid: " + op);
    // We have to return something.
    return Filter::Operator::Equal;
  }
}

Filter InvalidFilter() {
  // The exact value doesn't matter. Note that there's no way to create the base
  // class `Filter`, so it has to be one of the derived classes.
  return FieldFilter::Create({}, {},
                             MakeSharedMessage(google_firestore_v1_Value{}));
}

Filter DecodeUnaryFilter(JsonReader& reader, const json& filter) {
  FieldPath path =
      DecodeFieldReference(reader, reader.RequiredObject("field", filter));
  std::string op = reader.RequiredString("op", filter);

  // Return early if !ok(), because `FieldFilter::Create` will abort with
  // invalid inputs.
  if (!reader.ok()) {
    return InvalidFilter();
  }

  if (op == "IS_NAN") {
    return FieldFilter::Create(path, Filter::Operator::Equal, NaNValue());
  } else if (op == "IS_NULL") {
    return FieldFilter::Create(path, Filter::Operator::Equal, NullValue());
  } else if (op == "IS_NOT_NAN") {
    return FieldFilter::Create(path, Filter::Operator::NotEqual, NaNValue());
  } else if (op == "IS_NOT_NULL") {
    return FieldFilter::Create(path, Filter::Operator::NotEqual, NullValue());
  }

  reader.Fail("Unexpected unary filter operator: " + op);
  return InvalidFilter();
}

OrderByList DecodeOrderBy(JsonReader& reader, const json& query) {
  OrderByList result;
  std::vector<json> default_order_by;
  for (const auto& order_by :
       reader.OptionalArray("orderBy", query, default_order_by)) {
    FieldPath path =
        DecodeFieldReference(reader, reader.RequiredObject("field", order_by));

    std::string direction_string =
        reader.OptionalString("direction", order_by, "ASCENDING");
    if (direction_string != "DESCENDING" && direction_string != "ASCENDING") {
      reader.Fail("'direction' value is invalid: " + direction_string);
      return {};
    }

    Direction direction = direction_string == "ASCENDING"
                              ? Direction::Ascending
                              : Direction::Descending;

    result = result.push_back(OrderBy(std::move(path), direction));
  }

  return result;
}

int32_t DecodeLimit(JsonReader& reader, const json& query) {
  int32_t limit = Target::kNoLimit;
  if (query.contains("limit")) {
    const auto& limit_object = query.at("limit");
    // "limit" can be encoded as integer or "{"value": integer}".
    if (limit_object.is_number_integer()) {
      return limit_object.get<int32_t>();
    } else if (limit_object.is_object()) {
      if (limit_object.at("value").is_number_integer()) {
        return limit_object.at("value").get<int32_t>();
      }
    }
    reader.Fail("'limit' is not encoded as a valid integer");
    return limit;
  }

  return limit;
}

LimitType DecodeLimitType(JsonReader& reader, const json& query) {
  std::string limit_type = reader.OptionalString("limitType", query, "FIRST");

  if (limit_type == "FIRST") {
    return LimitType::First;
  } else if (limit_type == "LAST") {
    return LimitType::Last;
  } else {
    reader.Fail("'limitType' is not encoded as a recognizable value");
    return LimitType::None;
  }
}

google_type_LatLng DecodeGeoPointValue(JsonReader& reader,
                                       const json& geo_json) {
  google_type_LatLng result{};
  result.latitude = reader.OptionalDouble("latitude", geo_json, 0.0);
  result.longitude = reader.OptionalDouble("longitude", geo_json, 0.0);
  return result;
}

pb_bytes_array_t* DecodeBytesValue(JsonReader& reader,
                                   const std::string& bytes_string) {
  std::string decoded;
  if (!absl::Base64Unescape(bytes_string, &decoded)) {
    reader.Fail("Failed to decode bytesValue string into binary form");
    return {};
  }
  return nanopb::MakeBytesArray(decoded);
}

}  // namespace

// Mark: JsonReader

const std::string& JsonReader::RequiredString(const char* name,
                                              const json& json_object) {
  if (json_object.contains(name)) {
    const json& child = json_object.at(name);
    if (child.is_string()) {
      return child.get_ref<const std::string&>();
    }
  }

  Fail("'%s' is missing or is not a string", name);
  return util::EmptyString();
}

const std::string& JsonReader::OptionalString(
    const char* name,
    const json& json_object,
    const std::string& default_value) {
  if (json_object.contains(name)) {
    const json& child = json_object.at(name);
    if (child.is_string()) {
      return child.get_ref<const std::string&>();
    }
  }

  return default_value;
}

const std::vector<json>& JsonReader::RequiredArray(const char* name,
                                                   const json& json_object) {
  if (json_object.contains(name)) {
    const json& child = json_object.at(name);
    if (child.is_array()) {
      return child.get_ref<const std::vector<json>&>();
    }
  }

  Fail("'%s' is missing or is not an array", name);
  return EmptyVector<json>();
}

const std::vector<json>& JsonReader::OptionalArray(
    const char* name,
    const json& json_object,
    const std::vector<json>& default_value) {
  if (!json_object.contains(name)) {
    return default_value;
  }

  const json& child = json_object.at(name);
  if (child.is_array()) {
    return child.get_ref<const std::vector<json>&>();
  } else {
    Fail("'%s' is not an array", name);
    return EmptyVector<json>();
  }
}

bool JsonReader::OptionalBool(const char* name,
                              const json& json_object,
                              bool default_value) {
  return (json_object.contains(name) && json_object.at(name).is_boolean() &&
          json_object.at(name).get<bool>()) ||
         default_value;
}

const nlohmann::json& JsonReader::RequiredObject(const char* child_name,
                                                 const json& json_object) {
  if (!json_object.contains(child_name)) {
    Fail("Missing child '%s'", child_name);
    return json_object;
  }
  return json_object.at(child_name);
}

double JsonReader::RequiredDouble(const char* name, const json& json_object) {
  if (json_object.contains(name)) {
    double result = DecodeDouble(json_object.at(name));
    if (ok()) {
      return result;
    }
  }

  Fail("'%s' is missing or is not a double", name);
  return 0.0;
}

double JsonReader::OptionalDouble(const char* name,
                                  const json& json_object,
                                  double default_value) {
  if (json_object.contains(name)) {
    double result = DecodeDouble(json_object.at(name));
    if (ok()) {
      return result;
    }
  }

  return default_value;
}

double JsonReader::DecodeDouble(const nlohmann::json& value) {
  if (value.is_number()) {
    return value.get<double>();
  }

  double result = 0;
  if (value.is_string()) {
    const auto& s = value.get_ref<const std::string&>();
    auto ok = absl::SimpleAtod(s, &result);
    if (!ok) {
      Fail("Failed to parse into double: " + s);
    }
  }
  return result;
}

template <typename IntType>
IntType ParseInt(const json& value, JsonReader& reader) {
  if (value.is_number_integer()) {
    return value.get<IntType>();
  }

  IntType result = 0;
  if (value.is_string()) {
    const auto& s = value.get_ref<const std::string&>();
    auto ok = absl::SimpleAtoi<IntType>(s, &result);
    if (!ok) {
      reader.Fail("Failed to parse into integer: " + s);
      return 0;
    }

    return result;
  }

  reader.Fail("Only integer and string can be parsed into int type");
  return 0;
}

template <typename IntType>
IntType JsonReader::RequiredInt(const char* name, const json& json_object) {
  if (!json_object.contains(name)) {
    Fail("'%s' is missing or is not a double", name);
    return 0;
  }

  const json& value = json_object.at(name);
  return ParseInt<IntType>(value, *this);
}

template <typename IntType>
IntType JsonReader::OptionalInt(const char* name,
                                const json& json_object,
                                IntType default_value) {
  if (!json_object.contains(name)) {
    return default_value;
  }

  const json& value = json_object.at(name);
  return ParseInt<IntType>(value, *this);
}

// Mark: BundleSerializer

BundleMetadata BundleSerializer::DecodeBundleMetadata(
    JsonReader& reader, const json& metadata) const {
  return BundleMetadata(
      reader.RequiredString("id", metadata),
      reader.RequiredInt<uint32_t>("version", metadata),
      DecodeSnapshotVersion(reader,
                            reader.RequiredObject("createTime", metadata)),
      reader.OptionalInt<uint32_t>("totalDocuments", metadata, 0),
      reader.OptionalInt<uint64_t>("totalBytes", metadata, 0));
}

NamedQuery BundleSerializer::DecodeNamedQuery(JsonReader& reader,
                                              const json& named_query) const {
  return NamedQuery(
      reader.RequiredString("name", named_query),
      DecodeBundledQuery(reader,
                         reader.RequiredObject("bundledQuery", named_query)),
      DecodeSnapshotVersion(reader,
                            reader.RequiredObject("readTime", named_query)));
}

BundledQuery BundleSerializer::DecodeBundledQuery(
    JsonReader& reader, const nlohmann::json& query) const {
  const json& structured_query =
      reader.RequiredObject("structuredQuery", query);
  VerifyStructuredQuery(reader, structured_query);
  if (!reader.ok()) {
    return {};
  }

  ResourcePath parent =
      DecodeName(reader, reader.RequiredObject("parent", query));
  std::string collection_group_string;
  DecodeCollectionSource(reader, structured_query.at("from"), parent,
                         collection_group_string);
  std::shared_ptr<std::string> collection_group;
  if (!collection_group_string.empty()) {
    collection_group = std::make_shared<std::string>(collection_group_string);
  }

  auto filters = DecodeWhere(reader, structured_query);
  auto order_bys = DecodeOrderBy(reader, structured_query);

  auto start_at_bound = DecodeBound(reader, structured_query, "startAt");
  absl::optional<Bound> start_at;
  if (start_at_bound.position()->values_count > 0) {
    start_at = std::move(start_at_bound);
  }

  auto end_at_bound = DecodeBound(reader, structured_query, "endAt");
  absl::optional<Bound> end_at;
  if (end_at_bound.position()->values_count > 0) {
    end_at = std::move(end_at_bound);
  }

  int32_t limit = DecodeLimit(reader, structured_query);
  LimitType limit_type = DecodeLimitType(reader, query);

  return BundledQuery(Target(std::move(parent), std::move(collection_group),
                             std::move(filters), std::move(order_bys), limit,
                             std::move(start_at), std::move(end_at)),
                      limit_type);
}

ResourcePath BundleSerializer::DecodeName(JsonReader& reader,
                                          const json& document_name) const {
  if (!document_name.is_string()) {
    reader.Fail("Document name is not a string.");
    return {};
  }
  auto path =
      ResourcePath::FromString(document_name.get_ref<const std::string&>());
  if (!rpc_serializer_.IsLocalResourceName(path)) {
    reader.Fail("Resource name is not valid for current instance: " +
                path.CanonicalString());
    return {};
  }
  return path.PopFirst(5);
}

FilterList BundleSerializer::DecodeWhere(JsonReader& reader,
                                         const json& query) const {
  // Absent 'where' is a valid case.
  if (!query.contains("where")) {
    return {};
  }

  const auto& where = query.at("where");
  if (!where.is_object()) {
    reader.Fail("Query's 'where' clause is not a json object.");
    return {};
  }

  FilterList result;
  if (where.contains("compositeFilter")) {
    return DecodeCompositeFilter(reader, where.at("compositeFilter"));
  } else if (where.contains("fieldFilter")) {
    return result.push_back(DecodeFieldFilter(reader, where.at("fieldFilter")));
  } else if (where.contains("unaryFilter")) {
    return result.push_back(DecodeUnaryFilter(reader, where.at("unaryFilter")));
  } else {
    reader.Fail("'where' does not have valid filter");
    return {};
  }
}

Filter BundleSerializer::DecodeFieldFilter(JsonReader& reader,
                                           const json& filter) const {
  FieldPath path =
      DecodeFieldReference(reader, reader.RequiredObject("field", filter));

  const auto& op_string = reader.RequiredString("op", filter);
  auto op = DecodeFieldFilterOperator(reader, op_string);

  Message<google_firestore_v1_Value> value =
      DecodeValue(reader, reader.RequiredObject("value", filter));

  // Return early if !ok(), because `FieldFilter::Create` will abort with
  // invalid inputs.
  if (!reader.ok()) {
    return InvalidFilter();
  }

  return FieldFilter::Create(path, op, std::move(value));
}

FilterList BundleSerializer::DecodeCompositeFilter(JsonReader& reader,
                                                   const json& filter) const {
  if (reader.RequiredString("op", filter) != "AND") {
    reader.Fail("The SDK only supports composite filters of type 'AND'");
    return {};
  }

  auto filters = reader.RequiredArray("filters", filter);
  FilterList result;
  for (const auto& f : filters) {
    result = result.push_back(
        DecodeFieldFilter(reader, reader.RequiredObject("fieldFilter", f)));
    if (!reader.ok()) {
      return {};
    }
  }

  return result;
}

Bound BundleSerializer::DecodeBound(JsonReader& reader,
                                    const json& query,
                                    const char* bound_name) const {
  Bound default_bound = Bound::FromValue(
      MakeSharedMessage<google_firestore_v1_ArrayValue>({}), false);
  if (!query.contains(bound_name)) {
    return default_bound;
  }

  const json& bound_json = reader.RequiredObject(bound_name, query);
  std::vector<json> values = reader.RequiredArray("values", bound_json);
  bool before = reader.OptionalBool("before", bound_json);

  auto positions = MakeSharedMessage<google_firestore_v1_ArrayValue>({});
  SetRepeatedField(
      &positions->values, &positions->values_count, values,
      [&](const json& j) { return *DecodeValue(reader, j).release(); });
  return Bound::FromValue(std::move(positions), before);
}

Message<google_firestore_v1_Value> BundleSerializer::DecodeValue(
    JsonReader& reader, const json& value) const {
  if (!value.is_object()) {
    reader.Fail("'value' is not encoded as JSON object");
    return {};
  }

  Message<google_firestore_v1_Value> result;
  if (value.contains("nullValue")) {
    result->which_value_type = google_firestore_v1_Value_null_value_tag;
    result->null_value = {};
  } else if (value.contains("booleanValue")) {
    result->which_value_type = google_firestore_v1_Value_boolean_value_tag;
    auto val = value.at("booleanValue");
    if (!val.is_boolean()) {
      reader.Fail("'booleanValue' is not encoded as a valid boolean");
      return {};
    }
    result->boolean_value = val.get<bool>();
  } else if (value.contains("integerValue")) {
    result->which_value_type = google_firestore_v1_Value_integer_value_tag;
    result->integer_value = reader.RequiredInt<int64_t>("integerValue", value);
  } else if (value.contains("doubleValue")) {
    result->which_value_type = google_firestore_v1_Value_double_value_tag;
    result->double_value = reader.RequiredDouble("doubleValue", value);
  } else if (value.contains("timestampValue")) {
    auto val = DecodeTimestamp(reader, value.at("timestampValue"));
    result->which_value_type = google_firestore_v1_Value_timestamp_value_tag;
    result->timestamp_value.seconds = val.seconds();
    result->timestamp_value.nanos = val.nanoseconds();
  } else if (value.contains("stringValue")) {
    result->which_value_type = google_firestore_v1_Value_string_value_tag;
    result->string_value =
        nanopb::MakeBytesArray(reader.RequiredString("stringValue", value));
  } else if (value.contains("bytesValue")) {
    result->which_value_type = google_firestore_v1_Value_bytes_value_tag;
    result->bytes_value =
        DecodeBytesValue(reader, reader.RequiredString("bytesValue", value));
  } else if (value.contains("referenceValue")) {
    result->which_value_type = google_firestore_v1_Value_reference_value_tag;
    result->reference_value = DecodeReferenceValue(
        reader, reader.RequiredString("referenceValue", value));
  } else if (value.contains("geoPointValue")) {
    result->which_value_type = google_firestore_v1_Value_geo_point_value_tag;
    result->geo_point_value =
        DecodeGeoPointValue(reader, value.at("geoPointValue"));
  } else if (value.contains("arrayValue")) {
    result->which_value_type = google_firestore_v1_Value_array_value_tag;
    result->array_value =
        *DecodeArrayValue(reader, value.at("arrayValue")).release();
  } else if (value.contains("mapValue")) {
    result->which_value_type = google_firestore_v1_Value_map_value_tag;
    result->map_value = *DecodeMapValue(reader, value.at("mapValue")).release();
  } else {
    reader.Fail("Failed to decode value, no type is recognized");
    return {};
  }
  return result;
}

Message<google_firestore_v1_MapValue> BundleSerializer::DecodeMapValue(
    JsonReader& reader, const json& map_json) const {
  if (!map_json.is_object() || !map_json.contains("fields")) {
    reader.Fail("mapValue is not a valid map");
    return {};
  }
  const auto& fields = map_json.at("fields");
  if (!fields.is_object()) {
    reader.Fail("mapValue's 'field' is not a valid map");
    return {};
  }

  // Fill the map array. Note that we can't use SetRepeatedField here since the
  // JSON map doesn't currently work with SetRepeatedField.
  Message<google_firestore_v1_MapValue> map_value;
  map_value->fields_count = nanopb::CheckedSize(fields.size());
  map_value->fields =
      nanopb::MakeArray<google_firestore_v1_MapValue_FieldsEntry>(
          map_value->fields_count);
  pb_size_t i = 0;
  for (const auto& entry : fields.items()) {
    map_value->fields[i] = {nanopb::MakeBytesArray(entry.key()),
                            *DecodeValue(reader, entry.value()).release()};
    ++i;
  }
  return map_value;
}

Message<google_firestore_v1_ArrayValue> BundleSerializer::DecodeArrayValue(
    JsonReader& reader, const json& array_json) const {
  const auto& values = reader.RequiredArray("values", array_json);

  Message<google_firestore_v1_ArrayValue> array_value;
  SetRepeatedField(
      &array_value->values, &array_value->values_count, values,
      [&](const json& j) { return *DecodeValue(reader, j).release(); });
  return array_value;
}

pb_bytes_array_t* BundleSerializer::DecodeReferenceValue(
    JsonReader& reader, const std::string& ref_string) const {
  if (reader.ok() && !rpc_serializer_.IsLocalDocumentKey(ref_string)) {
    reader.Fail(
        StringFormat("Tried to deserialize an invalid key: %s", ref_string));
  }

  return nanopb::MakeBytesArray(ref_string);
}

BundledDocumentMetadata BundleSerializer::DecodeDocumentMetadata(
    JsonReader& reader, const json& document_metadata) const {
  ResourcePath path =
      DecodeName(reader, reader.RequiredObject("name", document_metadata));
  // Return early if !ok(), `DocumentKey` aborts with invalid inputs.
  if (!reader.ok()) {
    return {};
  }
  DocumentKey key = DocumentKey(path);

  SnapshotVersion read_time = DecodeSnapshotVersion(
      reader, reader.RequiredObject("readTime", document_metadata));

  bool exists = reader.OptionalBool("exists", document_metadata);

  std::vector<std::string> queries;
  std::vector<json> default_queries;
  for (const json& query :
       reader.OptionalArray("queries", document_metadata, default_queries)) {
    if (!query.is_string()) {
      reader.Fail("Query name should be encoded as string");
      return {};
    }

    queries.push_back(query.get<std::string>());
  }

  return BundledDocumentMetadata(std::move(key), read_time, exists,
                                 std::move(queries));
}

BundleDocument BundleSerializer::DecodeDocument(JsonReader& reader,
                                                const json& document) const {
  ResourcePath path =
      DecodeName(reader, reader.RequiredObject("name", document));
  // Return early if !ok(), `DocumentKey` aborts with invalid inputs.
  if (!reader.ok()) {
    return {};
  }
  DocumentKey key = DocumentKey(path);

  SnapshotVersion update_time = DecodeSnapshotVersion(
      reader, reader.RequiredObject("updateTime", document));

  auto map_value = DecodeMapValue(reader, document);

  return BundleDocument(MutableDocument::FoundDocument(
      std::move(key), update_time,
      ObjectValue::FromMapValue(std::move(map_value))));
}

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase
