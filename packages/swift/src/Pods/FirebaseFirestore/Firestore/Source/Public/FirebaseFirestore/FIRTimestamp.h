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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * A Timestamp represents a point in time independent of any time zone or calendar, represented as
 * seconds and fractions of seconds at nanosecond resolution in UTC Epoch time. It is encoded using
 * the Proleptic Gregorian Calendar which extends the Gregorian calendar backwards to year one. It
 * is encoded assuming all minutes are 60 seconds long, i.e. leap seconds are "smeared" so that no
 * leap second table is needed for interpretation. Range is from 0001-01-01T00:00:00Z to
 * 9999-12-31T23:59:59.999999999Z. By restricting to that range, we ensure that we can convert to
 * and from  RFC 3339 date strings.
 *
 * @see https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto for the
 * reference timestamp definition.
 */
NS_SWIFT_NAME(Timestamp)
@interface FIRTimestamp : NSObject <NSCopying>

/** :nodoc: */
- (instancetype)init NS_UNAVAILABLE;

/**
 * Creates a new timestamp.
 *
 * @param seconds the number of seconds since epoch.
 * @param nanoseconds the number of nanoseconds after the seconds.
 */
- (instancetype)initWithSeconds:(int64_t)seconds
                    nanoseconds:(int32_t)nanoseconds NS_DESIGNATED_INITIALIZER;

/**
 * Creates a new timestamp.
 *
 * @param seconds the number of seconds since epoch.
 * @param nanoseconds the number of nanoseconds after the seconds.
 */
+ (instancetype)timestampWithSeconds:(int64_t)seconds nanoseconds:(int32_t)nanoseconds;

/** Creates a new timestamp from the given date. */
+ (instancetype)timestampWithDate:(NSDate *)date;

/** Creates a new timestamp with the current date / time. */
+ (instancetype)timestamp;

/** Returns a new NSDate corresponding to this timestamp. This may lose precision. */
- (NSDate *)dateValue;

/**
 * Returns the result of comparing the receiver with another timestamp.
 * @param other the other timestamp to compare.
 * @return NSOrderedAscending if `other` is chronologically following self,
 *     NSOrderedDescending if `other` is chronologically preceding self,
 *     NSOrderedSame otherwise.
 */
- (NSComparisonResult)compare:(FIRTimestamp *)other;

/**
 * Represents seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z.
 * Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.
 */
@property(nonatomic, assign, readonly) int64_t seconds;

/**
 * Non-negative fractions of a second at nanosecond resolution. Negative second values with
 * fractions must still have non-negative nanos values that count forward in time.
 * Must be from 0 to 999,999,999 inclusive.
 */
@property(nonatomic, assign, readonly) int32_t nanoseconds;

@end

NS_ASSUME_NONNULL_END
