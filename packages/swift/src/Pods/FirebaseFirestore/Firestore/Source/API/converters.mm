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

#include "Firestore/Source/API/converters.h"

#include <utility>

#import "FIRGeoPoint.h"
#import "FIRTimestamp.h"

#include "Firestore/Source/API/FIRDocumentReference+Internal.h"
#include "Firestore/core/include/firebase/firestore/geo_point.h"
#include "Firestore/core/include/firebase/firestore/timestamp.h"
#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/model/document_key.h"

NS_ASSUME_NONNULL_BEGIN

namespace firebase {
namespace firestore {
namespace api {

GeoPoint MakeGeoPoint(FIRGeoPoint* geo_point) {
  return GeoPoint(geo_point.latitude, geo_point.longitude);
}

FIRGeoPoint* MakeFIRGeoPoint(const GeoPoint& geo_point) {
  return [[FIRGeoPoint alloc] initWithLatitude:geo_point.latitude()
                                     longitude:geo_point.longitude()];
}

Timestamp MakeTimestamp(FIRTimestamp* timestamp) {
  return Timestamp(timestamp.seconds, timestamp.nanoseconds);
}

Timestamp MakeTimestamp(NSDate* date) {
  FIRTimestamp* timestamp = [FIRTimestamp timestampWithDate:date];
  return MakeTimestamp(timestamp);
}

FIRTimestamp* MakeFIRTimestamp(const Timestamp& timestamp) {
  return [[FIRTimestamp alloc] initWithSeconds:timestamp.seconds()
                                   nanoseconds:timestamp.nanoseconds()];
}

FIRDocumentReference* MakeFIRDocumentReference(const model::DocumentKey& key,
                                               std::shared_ptr<Firestore> firestore) {
  return [[FIRDocumentReference alloc] initWithKey:key firestore:std::move(firestore)];
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase

NS_ASSUME_NONNULL_END
