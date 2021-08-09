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

#import "FirebaseAuth/Sources/User/FIRUserMetadata_Internal.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRUserMetadata

/** @var kCreationDateCodingKey
    @brief The key used to encode the creationDate property for NSSecureCoding.
 */
static NSString *const kCreationDateCodingKey = @"creationDate";

/** @var kLastSignInDateCodingKey
    @brief The key used to encode the lastSignInDate property for NSSecureCoding.
 */
static NSString *const kLastSignInDateCodingKey = @"lastSignInDate";

- (instancetype)initWithCreationDate:(nullable NSDate *)creationDate
                      lastSignInDate:(nullable NSDate *)lastSignInDate {
  self = [super init];
  if (self) {
    _creationDate = [creationDate copy];
    _lastSignInDate = [lastSignInDate copy];
  }
  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSDate *creationDate = [aDecoder decodeObjectOfClass:[NSDate class]
                                                forKey:kCreationDateCodingKey];
  NSDate *lastSignInDate = [aDecoder decodeObjectOfClass:[NSDate class]
                                                  forKey:kLastSignInDateCodingKey];
  return [self initWithCreationDate:creationDate lastSignInDate:lastSignInDate];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_creationDate forKey:kCreationDateCodingKey];
  [aCoder encodeObject:_lastSignInDate forKey:kLastSignInDateCodingKey];
}

@end

NS_ASSUME_NONNULL_END
