/*
 * Copyright 2020 Google LLC
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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageEventSelector.h"

@implementation GDTCORStorageEventSelector

+ (instancetype)eventSelectorForTarget:(GDTCORTarget)target {
  return [[self alloc] initWithTarget:target eventIDs:nil mappingIDs:nil qosTiers:nil];
}

- (instancetype)initWithTarget:(GDTCORTarget)target
                      eventIDs:(nullable NSSet<NSString *> *)eventIDs
                    mappingIDs:(nullable NSSet<NSString *> *)mappingIDs
                      qosTiers:(nullable NSSet<NSNumber *> *)qosTiers {
  self = [super init];
  if (self) {
    _selectedTarget = target;
    _selectedEventIDs = eventIDs;
    _selectedMappingIDs = mappingIDs;
    _selectedQosTiers = qosTiers;
  }
  return self;
}

@end
