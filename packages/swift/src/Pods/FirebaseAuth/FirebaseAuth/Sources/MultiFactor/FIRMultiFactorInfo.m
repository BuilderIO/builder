/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRMultiFactorInfo.h"

#import "FirebaseAuth/Sources/Backend/RPC/Proto/FIRAuthProtoMFAEnrollment.h"

static NSString *kUIDCodingKey = @"uid";

static NSString *kDisplayNameCodingKey = @"displayName";

static NSString *kEnrollmentDateCodingKey = @"enrollmentDate";

static NSString *kFactorIDCodingKey = @"factorID";

@implementation FIRMultiFactorInfo

#pragma mark - Internal

- (instancetype)initWithProto:(FIRAuthProtoMFAEnrollment *)proto {
  self = [super init];

  if (self) {
    _UID = proto.MFAEnrollmentID;
    _displayName = proto.displayName;
    _enrollmentDate = proto.enrolledAt;
  }

  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  self = [self init];
  if (self) {
    _UID = [aDecoder decodeObjectOfClass:[NSString class] forKey:kUIDCodingKey];
    _displayName = [aDecoder decodeObjectOfClass:[NSString class] forKey:kDisplayNameCodingKey];
    _enrollmentDate = [aDecoder decodeObjectOfClass:[NSDate class] forKey:kEnrollmentDateCodingKey];
    _factorID = [aDecoder decodeObjectOfClass:[NSString class] forKey:kFactorIDCodingKey];
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_UID forKey:kUIDCodingKey];
  [aCoder encodeObject:_displayName forKey:kDisplayNameCodingKey];
  [aCoder encodeObject:_enrollmentDate forKey:kEnrollmentDateCodingKey];
  [aCoder encodeObject:_factorID forKey:kFactorIDCodingKey];
}

@end

#endif
