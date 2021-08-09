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

#import "Firestore/Source/API/FIRTimestamp+Internal.h"

NS_ASSUME_NONNULL_BEGIN

static const int kNanosPerSecond = 1000000000;

@implementation FIRTimestamp (Internal)

#pragma mark - Internal public methods

- (NSString *)ISO8601String {
  NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
  formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss";
  formatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
  NSDate *secondsDate = [NSDate dateWithTimeIntervalSince1970:self.seconds];
  NSString *secondsString = [formatter stringFromDate:secondsDate];
  if (secondsString.length != 19) {
    [NSException raise:@"Invalid ISO string" format:@"Invalid ISO string: %@", secondsString];
  }

  NSString *nanosString = [NSString stringWithFormat:@"%09d", self.nanoseconds];
  return [NSString stringWithFormat:@"%@.%@Z", secondsString, nanosString];
}

@end

@implementation FIRTimestamp

#pragma mark - Constructors

+ (instancetype)timestampWithDate:(NSDate *)date {
  double secondsDouble;
  double fraction = modf(date.timeIntervalSince1970, &secondsDouble);
  // GCP Timestamps always have non-negative nanos.
  if (fraction < 0) {
    fraction += 1.0;
    secondsDouble -= 1.0;
  }
  int64_t seconds = (int64_t)secondsDouble;
  int32_t nanos = (int32_t)(fraction * kNanosPerSecond);
  return [[FIRTimestamp alloc] initWithSeconds:seconds nanoseconds:nanos];
}

+ (instancetype)timestampWithSeconds:(int64_t)seconds nanoseconds:(int32_t)nanoseconds {
  return [[FIRTimestamp alloc] initWithSeconds:seconds nanoseconds:nanoseconds];
}

+ (instancetype)timestamp {
  return [FIRTimestamp timestampWithDate:[NSDate date]];
}

- (instancetype)initWithSeconds:(int64_t)seconds nanoseconds:(int32_t)nanoseconds {
  self = [super init];
  if (self) {
    if (nanoseconds < 0) {
      [NSException raise:@"Invalid timestamp"
                  format:@"Timestamp nanoseconds out of range: %d", nanoseconds];
    }
    if (nanoseconds >= 1e9) {
      [NSException raise:@"Invalid timestamp"
                  format:@"Timestamp nanoseconds out of range: %d", nanoseconds];
    }
    // Midnight at the beginning of 1/1/1 is the earliest timestamp supported.
    if (seconds < -62135596800L) {
      [NSException raise:@"Invalid timestamp"
                  format:@"Timestamp seconds out of range: %lld", seconds];
    }
    // This will break in the year 10,000.
    if (seconds >= 253402300800L) {
      [NSException raise:@"Invalid timestamp"
                  format:@"Timestamp seconds out of range: %lld", seconds];
    }

    _seconds = seconds;
    _nanoseconds = nanoseconds;
  }
  return self;
}

#pragma mark - NSObject methods

- (BOOL)isEqual:(id)object {
  if (self == object) {
    return YES;
  }
  if (![object isKindOfClass:[FIRTimestamp class]]) {
    return NO;
  }
  return [self isEqualToTimestamp:(FIRTimestamp *)object];
}

- (NSUInteger)hash {
  return (NSUInteger)((self.seconds >> 32) ^ self.seconds ^ self.nanoseconds);
}

- (NSString *)description {
  return [NSString stringWithFormat:@"<FIRTimestamp: seconds=%lld nanoseconds=%d>", self.seconds,
                                    self.nanoseconds];
}

/** Implements NSCopying without actually copying because timestamps are immutable. */
- (id)copyWithZone:(__unused NSZone *_Nullable)zone {
  return self;
}

#pragma mark - Public methods

- (NSDate *)dateValue {
  NSTimeInterval interval = (NSTimeInterval)self.seconds + ((NSTimeInterval)self.nanoseconds) / 1e9;
  return [NSDate dateWithTimeIntervalSince1970:interval];
}

- (NSComparisonResult)compare:(FIRTimestamp *)other {
  if (self.seconds < other.seconds) {
    return NSOrderedAscending;
  } else if (self.seconds > other.seconds) {
    return NSOrderedDescending;
  }

  if (self.nanoseconds < other.nanoseconds) {
    return NSOrderedAscending;
  } else if (self.nanoseconds > other.nanoseconds) {
    return NSOrderedDescending;
  }
  return NSOrderedSame;
}

#pragma mark - Private methods

- (BOOL)isEqualToTimestamp:(FIRTimestamp *)other {
  return [self compare:other] == NSOrderedSame;
}

@end

NS_ASSUME_NONNULL_END
