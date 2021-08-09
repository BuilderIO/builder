// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "Firestore/Source/API/FSTUserDataWriter.h"

#import <Firestore/core/src/nanopb/nanopb_util.h>
#import <Firestore/core/src/util/hard_assert.h>
#import <Foundation/Foundation.h>

#include <string>
#include <utility>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/Source/API/FIRDocumentReference+Internal.h"
#include "Firestore/Source/API/converters.h"
#include "Firestore/core/include/firebase/firestore/geo_point.h"
#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/server_timestamp_util.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/string_apple.h"

@class FIRTimestamp;

namespace api = firebase::firestore::api;
namespace util = firebase::firestore::util;
namespace model = firebase::firestore::model;
namespace nanopb = firebase::firestore::nanopb;

using api::MakeFIRDocumentReference;
using api::MakeFIRGeoPoint;
using api::MakeFIRTimestamp;
using firebase::firestore::GeoPoint;
using firebase::firestore::google_firestore_v1_ArrayValue;
using firebase::firestore::google_firestore_v1_MapValue;
using firebase::firestore::google_firestore_v1_Value;
using firebase::firestore::google_protobuf_Timestamp;
using model::DatabaseId;
using model::DocumentKey;
using model::GetLocalWriteTime;
using model::GetPreviousValue;
using model::GetTypeOrder;
using model::TypeOrder;
using nanopb::MakeByteString;
using nanopb::MakeBytesArray;
using nanopb::MakeNSData;
using nanopb::MakeString;
using nanopb::MakeStringView;

NS_ASSUME_NONNULL_BEGIN

@implementation FSTUserDataWriter {
  std::shared_ptr<api::Firestore> _firestore;
  FIRServerTimestampBehavior _serverTimestampBehavior;
}

- (instancetype)initWithFirestore:(std::shared_ptr<api::Firestore>)firestore
          serverTimestampBehavior:(FIRServerTimestampBehavior)serverTimestampBehavior {
  self = [super init];
  if (self) {
    _firestore = std::move(firestore);
    _serverTimestampBehavior = serverTimestampBehavior;
  }
  return self;
}

- (id)convertedValue:(const google_firestore_v1_Value &)value {
  switch (GetTypeOrder(value)) {
    case TypeOrder::kMap:
      return [self convertedObject:value.map_value];
    case TypeOrder::kArray:
      return [self convertedArray:value.array_value];
    case TypeOrder::kReference:
      return [self convertedReference:value];
    case TypeOrder::kTimestamp:
      return [self convertedTimestamp:value.timestamp_value];
    case TypeOrder::kServerTimestamp:
      return [self convertedServerTimestamp:value];
    case TypeOrder::kNull:
      return [NSNull null];
    case TypeOrder::kBoolean:
      return value.boolean_value ? @YES : @NO;
    case TypeOrder::kNumber:
      return value.which_value_type == google_firestore_v1_Value_integer_value_tag
                 ? @(value.integer_value)
                 : @(value.double_value);
    case TypeOrder::kString:
      return util::MakeNSString(MakeStringView(value.string_value));
    case TypeOrder::kBlob:
      return MakeNSData(value.bytes_value);
    case TypeOrder::kGeoPoint:
      return MakeFIRGeoPoint(
          GeoPoint(value.geo_point_value.latitude, value.geo_point_value.longitude));
  }

  UNREACHABLE();
}

- (NSDictionary<NSString *, id> *)convertedObject:(const google_firestore_v1_MapValue &)mapValue {
  NSMutableDictionary *result = [NSMutableDictionary dictionary];
  for (pb_size_t i = 0; i < mapValue.fields_count; ++i) {
    absl::string_view key = MakeStringView(mapValue.fields[i].key);
    const google_firestore_v1_Value &value = mapValue.fields[i].value;
    result[util::MakeNSString(key)] = [self convertedValue:value];
  }
  return result;
}

- (NSArray<id> *)convertedArray:(const google_firestore_v1_ArrayValue &)arrayValue {
  NSMutableArray *result = [NSMutableArray arrayWithCapacity:arrayValue.values_count];
  for (pb_size_t i = 0; i < arrayValue.values_count; ++i) {
    [result addObject:[self convertedValue:arrayValue.values[i]]];
  }
  return result;
}

- (id)convertedServerTimestamp:(const google_firestore_v1_Value &)serverTimestampValue {
  switch (_serverTimestampBehavior) {
    case FIRServerTimestampBehavior::FIRServerTimestampBehaviorNone:
      return [NSNull null];
    case FIRServerTimestampBehavior::FIRServerTimestampBehaviorEstimate:
      return [self convertedTimestamp:GetLocalWriteTime(serverTimestampValue)];
    case FIRServerTimestampBehavior::FIRServerTimestampBehaviorPrevious: {
      auto previous_value = GetPreviousValue(serverTimestampValue);
      return previous_value ? [self convertedValue:*previous_value] : [NSNull null];
    }
  }

  UNREACHABLE();
}

- (FIRTimestamp *)convertedTimestamp:(const google_protobuf_Timestamp &)value {
  return MakeFIRTimestamp(firebase::Timestamp{value.seconds, value.nanos});
}

- (FIRDocumentReference *)convertedReference:(const google_firestore_v1_Value &)value {
  std::string ref = MakeString(value.reference_value);
  DatabaseId databaseID = DatabaseId::FromName(ref);
  DocumentKey key = DocumentKey::FromName(ref);
  if (databaseID != _firestore->database_id()) {
    LOG_WARN("Document reference is for a different database (%s/%s) which "
             "is not supported. It will be treated as a reference within the current database "
             "(%s/%s) instead.",
             databaseID.project_id(), databaseID.database_id(), databaseID.project_id(),
             databaseID.database_id());
  }
  return MakeFIRDocumentReference(key, _firestore);
}

@end

NS_ASSUME_NONNULL_END
