/*
 * Copyright 2017 Google
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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * An immutable object representing a geographical point in Firestore. The point is represented as
 * a latitude/longitude pair.
 *
 * Latitude values are in the range of [-90, 90].
 * Longitude values are in the range of [-180, 180].
 */
NS_SWIFT_NAME(GeoPoint)
@interface FIRGeoPoint : NSObject <NSCopying>

/** :nodoc: */
- (instancetype)init NS_UNAVAILABLE;

/**
 * Creates a `GeoPoint` from the provided latitude and longitude degrees.
 * @param latitude The latitude as number between -90 and 90.
 * @param longitude The longitude as number between -180 and 180.
 */
- (instancetype)initWithLatitude:(double)latitude
                       longitude:(double)longitude NS_DESIGNATED_INITIALIZER;

/**
 * The point's latitude. Must be a value between -90 and 90 (inclusive).
 */
@property(nonatomic, readonly) double latitude;

/**
 * The point's longitude. Must be a value between -180 and 180 (inclusive).
 */
@property(nonatomic, readonly) double longitude;

@end

NS_ASSUME_NONNULL_END
