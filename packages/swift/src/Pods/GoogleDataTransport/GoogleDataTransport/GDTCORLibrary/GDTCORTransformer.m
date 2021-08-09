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

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORTransformer.h"
#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORTransformer_Private.h"

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORAssert.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORLifecycle.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREvent.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREventTransformer.h"

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCOREvent_Private.h"
#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORRegistrar_Private.h"

@implementation GDTCORTransformer

+ (instancetype)sharedInstance {
  static GDTCORTransformer *eventTransformer;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    eventTransformer = [[self alloc] init];
  });
  return eventTransformer;
}

- (instancetype)init {
  return [self initWithApplication:[GDTCORApplication sharedApplication]];
}

- (instancetype)initWithApplication:(id<GDTCORApplicationProtocol>)application {
  self = [super init];
  if (self) {
    _eventWritingQueue =
        dispatch_queue_create("com.google.GDTCORTransformer", DISPATCH_QUEUE_SERIAL);
    _application = application;
  }
  return self;
}

- (void)transformEvent:(GDTCOREvent *)event
      withTransformers:(NSArray<id<GDTCOREventTransformer>> *)transformers
            onComplete:(void (^_Nullable)(BOOL wasWritten, NSError *_Nullable error))completion {
  GDTCORAssert(event, @"You can't write a nil event");

  __block GDTCORBackgroundIdentifier bgID = GDTCORBackgroundIdentifierInvalid;
  __auto_type __weak weakApplication = self.application;
  bgID = [self.application beginBackgroundTaskWithName:@"GDTTransformer"
                                     expirationHandler:^{
                                       [weakApplication endBackgroundTask:bgID];
                                       bgID = GDTCORBackgroundIdentifierInvalid;
                                     }];

  __auto_type completionWrapper = ^(BOOL wasWritten, NSError *_Nullable error) {
    if (completion) {
      completion(wasWritten, error);
    }

    // The work is done, cancel the background task if it's valid.
    [weakApplication endBackgroundTask:bgID];
    bgID = GDTCORBackgroundIdentifierInvalid;
  };

  dispatch_async(_eventWritingQueue, ^{
    GDTCOREvent *transformedEvent = event;
    for (id<GDTCOREventTransformer> transformer in transformers) {
      if ([transformer respondsToSelector:@selector(transformGDTEvent:)]) {
        GDTCORLogDebug(@"Applying a transformer to event %@", event);
        transformedEvent = [transformer transformGDTEvent:event];
        if (!transformedEvent) {
          completionWrapper(NO, nil);
          return;
        }
      } else {
        GDTCORLogError(GDTCORMCETransformerDoesntImplementTransform,
                       @"Transformer doesn't implement transformGDTEvent: %@", transformer);
        completionWrapper(NO, nil);
        return;
      }
    }

    id<GDTCORStorageProtocol> storage =
        [GDTCORRegistrar sharedInstance].targetToStorage[@(event.target)];

    [storage storeEvent:transformedEvent onComplete:completionWrapper];
  });
}

#pragma mark - GDTCORLifecycleProtocol

- (void)appWillTerminate:(GDTCORApplication *)application {
  // Flush the queue immediately.
  dispatch_sync(_eventWritingQueue, ^{
                });
}

@end
