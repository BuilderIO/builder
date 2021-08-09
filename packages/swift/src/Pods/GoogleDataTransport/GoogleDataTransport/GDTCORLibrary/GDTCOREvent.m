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

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREvent.h"

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORAssert.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORPlatform.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCOREvent_Private.h"

@implementation GDTCOREvent

+ (NSString *)nextEventID {
  // Replace special non-alphanumeric characters to avoid potential conflicts with storage logic.
  return [[NSUUID UUID].UUIDString stringByReplacingOccurrencesOfString:@"-" withString:@""];
}

- (nullable instancetype)initWithMappingID:(NSString *)mappingID target:(GDTCORTarget)target {
  GDTCORAssert(mappingID.length > 0, @"Please give a valid mapping ID");
  GDTCORAssert(target > 0, @"A target cannot be negative or 0");
  if (mappingID.length == 0 || target <= 0) {
    return nil;
  }
  self = [super init];
  if (self) {
    _eventID = [GDTCOREvent nextEventID];
    _mappingID = mappingID;
    _target = target;
    _qosTier = GDTCOREventQosDefault;
    _expirationDate = [NSDate dateWithTimeIntervalSinceNow:604800];  // 7 days.

    GDTCORLogDebug(@"Event %@ created. ID:%@ mappingID: %@ target:%ld", self, _eventID, mappingID,
                   (long)target);
  }

  return self;
}

- (instancetype)copy {
  GDTCOREvent *copy = [[GDTCOREvent alloc] initWithMappingID:_mappingID target:_target];
  copy->_eventID = _eventID;
  copy.dataObject = _dataObject;
  copy.qosTier = _qosTier;
  copy.clockSnapshot = _clockSnapshot;
  copy.customBytes = _customBytes;
  GDTCORLogDebug(@"Copying event %@ to event %@", self, copy);
  return copy;
}

- (NSUInteger)hash {
  // This loses some precision, but it's probably fine.
  NSUInteger eventIDHash = [_eventID hash];
  NSUInteger mappingIDHash = [_mappingID hash];
  NSUInteger timeHash = [_clockSnapshot hash];
  NSInteger serializedBytesHash = [_serializedDataObjectBytes hash];

  return eventIDHash ^ mappingIDHash ^ _target ^ _qosTier ^ timeHash ^ serializedBytesHash;
}

- (BOOL)isEqual:(id)object {
  return [self hash] == [object hash];
}

#pragma mark - Property overrides

- (void)setDataObject:(id<GDTCOREventDataObject>)dataObject {
  // If you're looking here because of a performance issue in -transportBytes slowing the assignment
  // of -dataObject, one way to address this is to add a queue to this class,
  // dispatch_(barrier_ if concurrent)async here, and implement the getter with a dispatch_sync.
  if (dataObject != _dataObject) {
    _dataObject = dataObject;
  }
  self->_serializedDataObjectBytes = [dataObject transportBytes];
}

#pragma mark - NSSecureCoding and NSCoding Protocols

/** NSCoding key for eventID property. */
static NSString *kEventIDKey = @"GDTCOREventEventIDKey";

/** NSCoding key for mappingID property. */
static NSString *kMappingIDKey = @"GDTCOREventMappingIDKey";

/** NSCoding key for target property. */
static NSString *kTargetKey = @"GDTCOREventTargetKey";

/** NSCoding key for qosTier property. */
static NSString *kQoSTierKey = @"GDTCOREventQoSTierKey";

/** NSCoding key for clockSnapshot property. */
static NSString *kClockSnapshotKey = @"GDTCOREventClockSnapshotKey";

/** NSCoding key for expirationDate property. */
static NSString *kExpirationDateKey = @"GDTCOREventExpirationDateKey";

/** NSCoding key for serializedDataObjectBytes property. */
static NSString *kSerializedDataObjectBytes = @"GDTCOREventSerializedDataObjectBytesKey";

/** NSCoding key for customData property. */
static NSString *kCustomDataKey = @"GDTCOREventCustomDataKey";

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (id)initWithCoder:(NSCoder *)aDecoder {
  self = [self init];
  if (self) {
    _mappingID = [aDecoder decodeObjectOfClass:[NSString class] forKey:kMappingIDKey];
    _target = [aDecoder decodeIntegerForKey:kTargetKey];
    _eventID = [aDecoder decodeObjectOfClass:[NSString class] forKey:kEventIDKey]
                   ?: [GDTCOREvent nextEventID];
    _qosTier = [aDecoder decodeIntegerForKey:kQoSTierKey];
    _clockSnapshot = [aDecoder decodeObjectOfClass:[GDTCORClock class] forKey:kClockSnapshotKey];
    _customBytes = [aDecoder decodeObjectOfClass:[NSData class] forKey:kCustomDataKey];
    _expirationDate = [aDecoder decodeObjectOfClass:[NSDate class] forKey:kExpirationDateKey];
    _serializedDataObjectBytes = [aDecoder decodeObjectOfClass:[NSData class]
                                                        forKey:kSerializedDataObjectBytes];
    if (!_serializedDataObjectBytes) {
      return nil;
    }
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_eventID forKey:kEventIDKey];
  [aCoder encodeObject:_mappingID forKey:kMappingIDKey];
  [aCoder encodeInteger:_target forKey:kTargetKey];
  [aCoder encodeInteger:_qosTier forKey:kQoSTierKey];
  [aCoder encodeObject:_clockSnapshot forKey:kClockSnapshotKey];
  [aCoder encodeObject:_customBytes forKey:kCustomDataKey];
  [aCoder encodeObject:_expirationDate forKey:kExpirationDateKey];
  [aCoder encodeObject:self.serializedDataObjectBytes forKey:kSerializedDataObjectBytes];
}

@end
