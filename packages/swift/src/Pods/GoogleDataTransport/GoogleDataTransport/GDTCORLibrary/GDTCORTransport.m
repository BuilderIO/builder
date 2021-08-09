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

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORTransport.h"
#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORTransport_Private.h"

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORAssert.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREvent.h"

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORTransformer.h"

@implementation GDTCORTransport

- (nullable instancetype)initWithMappingID:(NSString *)mappingID
                              transformers:
                                  (nullable NSArray<id<GDTCOREventTransformer>> *)transformers
                                    target:(GDTCORTarget)target {
  GDTCORAssert(mappingID.length > 0, @"A mapping ID cannot be nil or empty");
  GDTCORAssert(target > 0, @"A target cannot be negative or 0");
  if (mappingID == nil || mappingID.length == 0 || target <= 0) {
    return nil;
  }
  self = [super init];
  if (self) {
    _mappingID = mappingID;
    _transformers = transformers;
    _target = target;
    _transformerInstance = [GDTCORTransformer sharedInstance];
  }
  GDTCORLogDebug(@"Transport object created. mappingID:%@ transformers:%@ target:%ld", mappingID,
                 transformers, (long)target);
  return self;
}

- (void)sendTelemetryEvent:(GDTCOREvent *)event
                onComplete:
                    (void (^_Nullable)(BOOL wasWritten, NSError *_Nullable error))completion {
  event.qosTier = GDTCOREventQoSTelemetry;
  [self sendEvent:event onComplete:completion];
}

- (void)sendDataEvent:(GDTCOREvent *)event
           onComplete:(void (^_Nullable)(BOOL wasWritten, NSError *_Nullable error))completion {
  GDTCORAssert(event.qosTier != GDTCOREventQoSTelemetry, @"Use -sendTelemetryEvent, please.");
  [self sendEvent:event onComplete:completion];
}

- (void)sendTelemetryEvent:(GDTCOREvent *)event {
  [self sendTelemetryEvent:event onComplete:nil];
}

- (void)sendDataEvent:(GDTCOREvent *)event {
  [self sendDataEvent:event onComplete:nil];
}

- (GDTCOREvent *)eventForTransport {
  return [[GDTCOREvent alloc] initWithMappingID:_mappingID target:_target];
}

#pragma mark - Private helper methods

/** Sends the given event through the transport pipeline.
 *
 * @param event The event to send.
 * @param completion A block that will be called when the event has been written or dropped.
 */
- (void)sendEvent:(GDTCOREvent *)event
       onComplete:(void (^_Nullable)(BOOL wasWritten, NSError *_Nullable error))completion {
  // TODO: Determine if sending an event before registration is allowed.
  GDTCORAssert(event, @"You can't send a nil event");
  GDTCOREvent *copiedEvent = [event copy];
  copiedEvent.clockSnapshot = [GDTCORClock snapshot];
  [self.transformerInstance transformEvent:copiedEvent
                          withTransformers:_transformers
                                onComplete:completion];
}

@end
