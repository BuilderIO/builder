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

/** This class manages the device clock and produces snapshots of the current time. */
@interface GDTCORClock : NSObject <NSSecureCoding>

/** The wallclock time, UTC, in milliseconds. */
@property(nonatomic, readonly) int64_t timeMillis;

/** The offset from UTC in seconds. */
@property(nonatomic, readonly) int64_t timezoneOffsetSeconds;

/** The kernel boot time when this clock was created in nanoseconds. */
@property(nonatomic, readonly) int64_t kernelBootTimeNanoseconds;

/** The device uptime when this clock was created in nanoseconds. */
@property(nonatomic, readonly) int64_t uptimeNanoseconds;

@property(nonatomic, readonly) int64_t kernelBootTime DEPRECATED_MSG_ATTRIBUTE(
    "Please use `kernelBootTimeNanoseconds` instead");

@property(nonatomic, readonly)
    int64_t uptime DEPRECATED_MSG_ATTRIBUTE("Please use `uptimeNanoseconds` instead");

/** Creates a GDTCORClock object using the current time and offsets.
 *
 * @return A new GDTCORClock object representing the current time state.
 */
+ (instancetype)snapshot;

/** Creates a GDTCORClock object representing a time in the future, relative to now.
 *
 * @param millisInTheFuture The millis in the future from now this clock should represent.
 * @return An instance representing a future time.
 */
+ (instancetype)clockSnapshotInTheFuture:(uint64_t)millisInTheFuture;

/** Compares one clock with another, returns YES if the caller is after the parameter.
 *
 * @return YES if the calling clock's time is after the given clock's time.
 */
- (BOOL)isAfter:(GDTCORClock *)otherClock;

/** Returns value of `uptime` property in milliseconds. */
- (int64_t)uptimeMilliseconds;

@end

NS_ASSUME_NONNULL_END
