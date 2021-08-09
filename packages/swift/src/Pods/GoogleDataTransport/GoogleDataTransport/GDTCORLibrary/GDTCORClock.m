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

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"

#import <sys/sysctl.h>

// Using a monotonic clock is necessary because CFAbsoluteTimeGetCurrent(), NSDate, and related all
// are subject to drift. That it to say, multiple consecutive calls do not always result in a
// time that is in the future. Clocks may be adjusted by the user, NTP, or any number of external
// factors. This class attempts to determine the wall-clock time at the time of the event by
// capturing the kernel start and time since boot to determine a wallclock time in UTC.
//
// Timezone offsets at the time of a snapshot are also captured in order to provide local-time
// details. Other classes in this library depend on comparing times at some time in the future to
// a time captured in the past, and this class needs to provide a mechanism to do that.
//
// TL;DR: This class attempts to accomplish two things: 1. Provide accurate event times. 2. Provide
// a monotonic clock mechanism to accurately check if some clock snapshot was before or after
// by using a shared reference point (kernel boot time).
//
// Note: Much of the mach time stuff doesn't work properly in the simulator. So this class can be
// difficult to unit test.

/** Returns the kernel boottime property from sysctl.
 *
 * Inspired by https://stackoverflow.com/a/40497811
 *
 * @return The KERN_BOOTTIME property from sysctl, in nanoseconds.
 */
static int64_t KernelBootTimeInNanoseconds() {
  // Caching the result is not possible because clock drift would not be accounted for.
  struct timeval boottime;
  int mib[2] = {CTL_KERN, KERN_BOOTTIME};
  size_t size = sizeof(boottime);
  int rc = sysctl(mib, 2, &boottime, &size, NULL, 0);
  if (rc != 0) {
    return 0;
  }
  return (int64_t)boottime.tv_sec * NSEC_PER_SEC + (int64_t)boottime.tv_usec * NSEC_PER_USEC;
}

/** Returns value of gettimeofday, in nanoseconds.
 *
 * Inspired by https://stackoverflow.com/a/40497811
 *
 * @return The value of gettimeofday, in nanoseconds.
 */
static int64_t UptimeInNanoseconds() {
  int64_t before_now_nsec;
  int64_t after_now_nsec;
  struct timeval now;

  before_now_nsec = KernelBootTimeInNanoseconds();
  // Addresses a race condition in which the system time has updated, but the boottime has not.
  do {
    gettimeofday(&now, NULL);
    after_now_nsec = KernelBootTimeInNanoseconds();
  } while (after_now_nsec != before_now_nsec);
  return (int64_t)now.tv_sec * NSEC_PER_SEC + (int64_t)now.tv_usec * NSEC_PER_USEC -
         before_now_nsec;
}

// TODO: Consider adding a 'trustedTime' property that can be populated by the response from a BE.
@implementation GDTCORClock

- (instancetype)init {
  self = [super init];
  if (self) {
    _kernelBootTimeNanoseconds = KernelBootTimeInNanoseconds();
    _uptimeNanoseconds = UptimeInNanoseconds();
    _timeMillis =
        (int64_t)((CFAbsoluteTimeGetCurrent() + kCFAbsoluteTimeIntervalSince1970) * NSEC_PER_USEC);
    _timezoneOffsetSeconds = [[NSTimeZone systemTimeZone] secondsFromGMT];
  }
  return self;
}

+ (GDTCORClock *)snapshot {
  return [[GDTCORClock alloc] init];
}

+ (instancetype)clockSnapshotInTheFuture:(uint64_t)millisInTheFuture {
  GDTCORClock *snapshot = [self snapshot];
  snapshot->_timeMillis += millisInTheFuture;
  return snapshot;
}

- (BOOL)isAfter:(GDTCORClock *)otherClock {
  // These clocks are trivially comparable when they share a kernel boot time.
  if (_kernelBootTimeNanoseconds == otherClock->_kernelBootTimeNanoseconds) {
    int64_t timeDiff = (_timeMillis + _timezoneOffsetSeconds) -
                       (otherClock->_timeMillis + otherClock->_timezoneOffsetSeconds);
    return timeDiff > 0;
  } else {
    int64_t kernelBootTimeDiff =
        otherClock->_kernelBootTimeNanoseconds - _kernelBootTimeNanoseconds;
    // This isn't a great solution, but essentially, if the other clock's boot time is 'later', NO
    // is returned. This can be altered by changing the system time and rebooting.
    return kernelBootTimeDiff < 0 ? YES : NO;
  }
}

- (int64_t)uptimeMilliseconds {
  return self.uptimeNanoseconds / NSEC_PER_MSEC;
}

- (NSUInteger)hash {
  return [@(_kernelBootTimeNanoseconds) hash] ^ [@(_uptimeNanoseconds) hash] ^
         [@(_timeMillis) hash] ^ [@(_timezoneOffsetSeconds) hash];
}

- (BOOL)isEqual:(id)object {
  return [self hash] == [object hash];
}

#pragma mark - NSSecureCoding

/** NSKeyedCoder key for timeMillis property. */
static NSString *const kGDTCORClockTimeMillisKey = @"GDTCORClockTimeMillis";

/** NSKeyedCoder key for timezoneOffsetMillis property. */
static NSString *const kGDTCORClockTimezoneOffsetSeconds = @"GDTCORClockTimezoneOffsetSeconds";

/** NSKeyedCoder key for _kernelBootTime ivar. */
static NSString *const kGDTCORClockKernelBootTime = @"GDTCORClockKernelBootTime";

/** NSKeyedCoder key for _uptimeNanoseconds ivar. */
static NSString *const kGDTCORClockUptime = @"GDTCORClockUptime";

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
  self = [super init];
  if (self) {
    // TODO: If the kernelBootTimeNanoseconds is more recent, we need to change the kernel boot time
    // and uptimeMillis ivars
    _timeMillis = [aDecoder decodeInt64ForKey:kGDTCORClockTimeMillisKey];
    _timezoneOffsetSeconds = [aDecoder decodeInt64ForKey:kGDTCORClockTimezoneOffsetSeconds];
    _kernelBootTimeNanoseconds = [aDecoder decodeInt64ForKey:kGDTCORClockKernelBootTime];
    _uptimeNanoseconds = [aDecoder decodeInt64ForKey:kGDTCORClockUptime];
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeInt64:_timeMillis forKey:kGDTCORClockTimeMillisKey];
  [aCoder encodeInt64:_timezoneOffsetSeconds forKey:kGDTCORClockTimezoneOffsetSeconds];
  [aCoder encodeInt64:_kernelBootTimeNanoseconds forKey:kGDTCORClockKernelBootTime];
  [aCoder encodeInt64:_uptimeNanoseconds forKey:kGDTCORClockUptime];
}

#pragma mark - Deprecated properties

- (int64_t)kernelBootTime {
  return self.kernelBootTimeNanoseconds;
}

- (int64_t)uptime {
  return self.uptimeNanoseconds;
}

@end
