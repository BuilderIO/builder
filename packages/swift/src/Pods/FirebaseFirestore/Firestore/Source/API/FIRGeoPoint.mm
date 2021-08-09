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

#import "Firestore/Source/API/FIRGeoPoint+Internal.h"

#include "Firestore/core/include/firebase/firestore/geo_point.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/exception.h"

using firebase::firestore::util::ThrowInvalidArgument;
using firebase::firestore::util::DoubleBitwiseEquals;
using firebase::firestore::util::DoubleBitwiseHash;
using firebase::firestore::util::WrapCompare;

NS_ASSUME_NONNULL_BEGIN

@implementation FIRGeoPoint

- (instancetype)initWithLatitude:(double)latitude longitude:(double)longitude {
  if (self = [super init]) {
    if (latitude < -90 || latitude > 90 || !isfinite(latitude)) {
      ThrowInvalidArgument("GeoPoint requires a latitude value in the range of [-90, 90], "
                           "but was %s",
                           latitude);
    }
    if (longitude < -180 || longitude > 180 || !isfinite(longitude)) {
      ThrowInvalidArgument("GeoPoint requires a longitude value in the range of [-180, 180], "
                           "but was %s",
                           longitude);
    }

    _latitude = latitude;
    _longitude = longitude;
  }
  return self;
}

#pragma mark - NSObject methods

- (NSString *)description {
  return [NSString stringWithFormat:@"<FIRGeoPoint: (%f, %f)>", self.latitude, self.longitude];
}

- (BOOL)isEqual:(id)other {
  if (self == other) {
    return YES;
  }
  if (![other isKindOfClass:[FIRGeoPoint class]]) {
    return NO;
  }
  FIRGeoPoint *otherGeoPoint = (FIRGeoPoint *)other;
  return DoubleBitwiseEquals(self.latitude, otherGeoPoint.latitude) &&
         DoubleBitwiseEquals(self.longitude, otherGeoPoint.longitude);
}

- (NSUInteger)hash {
  return 31 * DoubleBitwiseHash(self.latitude) + DoubleBitwiseHash(self.longitude);
}

/** Implements NSCopying without actually copying because geopoints are immutable. */
- (id)copyWithZone:(__unused NSZone *_Nullable)zone {
  return self;
}

@end

@implementation FIRGeoPoint (Internal)

- (NSComparisonResult)compare:(FIRGeoPoint *)other {
  NSComparisonResult result = WrapCompare<double>(self.latitude, other.latitude);
  if (result != NSOrderedSame) {
    return result;
  } else {
    return WrapCompare<double>(self.longitude, other.longitude);
  }
}

@end

NS_ASSUME_NONNULL_END
