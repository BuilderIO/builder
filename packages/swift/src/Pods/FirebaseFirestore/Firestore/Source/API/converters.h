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

#ifndef FIRESTORE_SOURCE_API_CONVERTERS_H_
#define FIRESTORE_SOURCE_API_CONVERTERS_H_

#if !defined(__OBJC__)
#error "This header only supports Objective-C++"
#endif  // !defined(__OBJC__)

#import <Foundation/Foundation.h>

#include <memory>

@class FIRGeoPoint;
@class FIRTimestamp;
@class FIRDocumentReference;

NS_ASSUME_NONNULL_BEGIN

namespace firebase {

class Timestamp;

namespace firestore {

class GeoPoint;

namespace model {
class DocumentKey;
}

namespace api {

class Firestore;

/** Converts a user-supplied FIRGeoPoint to the equivalent C++ GeoPoint. */
GeoPoint MakeGeoPoint(FIRGeoPoint* geo_point);

/** Converts a C++ GeoPoint to the equivalent Objective-C FIRGeoPoint. */
FIRGeoPoint* MakeFIRGeoPoint(const GeoPoint& geo_point);

/** Converts a user-supplied FIRTimestamp to the equivalent C++ Timestamp. */
Timestamp MakeTimestamp(FIRTimestamp* timestamp);
Timestamp MakeTimestamp(NSDate* date);

FIRTimestamp* MakeFIRTimestamp(const Timestamp& timestamp);

FIRDocumentReference* MakeFIRDocumentReference(const model::DocumentKey& document_key,
                                               std::shared_ptr<Firestore> firestore);

}  // namespace api
}  // namespace firestore
}  // namespace firebase

NS_ASSUME_NONNULL_END

#endif  // FIRESTORE_SOURCE_API_CONVERTERS_H_
