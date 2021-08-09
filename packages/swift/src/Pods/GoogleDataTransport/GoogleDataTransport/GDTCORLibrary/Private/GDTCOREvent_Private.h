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

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"

NS_ASSUME_NONNULL_BEGIN

@interface GDTCOREvent ()

/** The unique ID of the event. This property is for testing only. */
@property(nonatomic, readwrite) NSString *eventID;

/** Generates a unique event ID. */
+ (NSString *)nextEventID;

@end

NS_ASSUME_NONNULL_END
