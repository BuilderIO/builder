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

#import "FirebaseAuth/Sources/Backend/RPC/Proto/FIRAuthProtoMFAEnrollment.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthProtoMFAEnrollment

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  self = [super init];
  if (self) {
    if (dictionary[@"phoneInfo"]) {
      _MFAValue = dictionary[@"phoneInfo"];
    }
    _MFAEnrollmentID = dictionary[@"mfaEnrollmentId"];
    _displayName = dictionary[@"displayName"];
    if ([dictionary[@"enrolledAt"] isKindOfClass:[NSString class]]) {
      NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
      [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZ"];
      NSDate *date = [dateFormatter dateFromString:dictionary[@"enrolledAt"]];
      _enrolledAt = date;
    }
  }
  return self;
}

@end

NS_ASSUME_NONNULL_END
