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

#import "GoogleDataTransport/GDTCCTLibrary/Private/GDTCCTUploadOperation.h"

#if __has_include(<FBLPromises/FBLPromises.h>)
#import <FBLPromises/FBLPromises.h>
#else
#import "FBLPromises.h"
#endif

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORPlatform.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORRegistrar.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"
#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORUploadBatch.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREvent.h"

#import <nanopb/pb.h>
#import <nanopb/pb_decode.h>
#import <nanopb/pb_encode.h>

#import <GoogleUtilities/GULURLSessionDataResponse.h>
#import <GoogleUtilities/NSURLSession+GULPromises.h>
#import "GoogleDataTransport/GDTCCTLibrary/Private/GDTCCTCompressionHelper.h"
#import "GoogleDataTransport/GDTCCTLibrary/Private/GDTCCTNanopbHelpers.h"

#import "GoogleDataTransport/GDTCCTLibrary/Protogen/nanopb/cct.nanopb.h"

NS_ASSUME_NONNULL_BEGIN

#ifdef GDTCOR_VERSION
#define STR(x) STR_EXPAND(x)
#define STR_EXPAND(x) #x
static NSString *const kGDTCCTSupportSDKVersion = @STR(GDTCOR_VERSION);
#else
static NSString *const kGDTCCTSupportSDKVersion = @"UNKNOWN";
#endif  // GDTCOR_VERSION

typedef void (^GDTCCTUploaderURLTaskCompletion)(NSNumber *batchID,
                                                NSSet<GDTCOREvent *> *_Nullable events,
                                                NSData *_Nullable data,
                                                NSURLResponse *_Nullable response,
                                                NSError *_Nullable error);

typedef void (^GDTCCTUploaderEventBatchBlock)(NSNumber *_Nullable batchID,
                                              NSSet<GDTCOREvent *> *_Nullable events);

@interface GDTCCTUploadOperation () <NSURLSessionDelegate>

/// The properties to store parameters passed in the initializer. See the initialized docs for
/// details.
@property(nonatomic, readonly) GDTCORTarget target;
@property(nonatomic, readonly) GDTCORUploadConditions conditions;
@property(nonatomic, readonly) NSURL *uploadURL;
@property(nonatomic, readonly) id<GDTCORStoragePromiseProtocol> storage;
@property(nonatomic, readonly) id<GDTCCTUploadMetadataProvider> metadataProvider;

/** The URL session that will attempt upload. */
@property(nonatomic) NSURLSession *uploaderSession;

/// NSOperation state properties implementation.
@property(nonatomic, readwrite, getter=isExecuting) BOOL executing;
@property(nonatomic, readwrite, getter=isFinished) BOOL finished;

@property(nonatomic, readwrite) BOOL uploadAttempted;

@end

@implementation GDTCCTUploadOperation

- (instancetype)initWithTarget:(GDTCORTarget)target
                    conditions:(GDTCORUploadConditions)conditions
                     uploadURL:(NSURL *)uploadURL
                         queue:(dispatch_queue_t)queue
                       storage:(id<GDTCORStoragePromiseProtocol>)storage
              metadataProvider:(id<GDTCCTUploadMetadataProvider>)metadataProvider {
  self = [super init];
  if (self) {
    _uploaderQueue = queue;
    _target = target;
    _conditions = conditions;
    _uploadURL = uploadURL;
    _storage = storage;
    _metadataProvider = metadataProvider;
  }
  return self;
}

- (NSURLSession *)uploaderSessionCreateIfNeeded {
  if (_uploaderSession == nil) {
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    _uploaderSession = [NSURLSession sessionWithConfiguration:config
                                                     delegate:self
                                                delegateQueue:nil];
  }
  return _uploaderSession;
}

- (void)uploadTarget:(GDTCORTarget)target withConditions:(GDTCORUploadConditions)conditions {
  __block GDTCORBackgroundIdentifier backgroundTaskID = GDTCORBackgroundIdentifierInvalid;

  dispatch_block_t backgroundTaskCompletion = ^{
    // End the background task if there was one.
    if (backgroundTaskID != GDTCORBackgroundIdentifierInvalid) {
      [[GDTCORApplication sharedApplication] endBackgroundTask:backgroundTaskID];
      backgroundTaskID = GDTCORBackgroundIdentifierInvalid;
    }
  };

  backgroundTaskID = [[GDTCORApplication sharedApplication]
      beginBackgroundTaskWithName:@"GDTCCTUploader-upload"
                expirationHandler:^{
                  if (backgroundTaskID != GDTCORBackgroundIdentifierInvalid) {
                    // Cancel the upload and complete delivery.
                    [self.currentTask cancel];

                    // End the background task.
                    backgroundTaskCompletion();
                  }
                }];

  id<GDTCORStoragePromiseProtocol> storage = self.storage;

  // 1. Check if the conditions for the target are suitable.
  [self isReadyToUploadTarget:target conditions:conditions]
      .thenOn(self.uploaderQueue,
              ^id(id result) {
                // 2. Remove previously attempted batches
                return [storage removeAllBatchesForTarget:target deleteEvents:NO];
              })
      .thenOn(self.uploaderQueue,
              ^FBLPromise<NSNumber *> *(id result) {
                // There may be a big amount of events stored, so creating a batch may be an
                // expensive operation.

                // 3. Do a lightweight check if there are any events for the target first to
                // finish early if there are no.
                return [storage hasEventsForTarget:target];
              })
      .validateOn(self.uploaderQueue,
                  ^BOOL(NSNumber *hasEvents) {
                    // Stop operation if there are no events to upload.
                    return hasEvents.boolValue;
                  })
      .thenOn(self.uploaderQueue,
              ^FBLPromise<GDTCORUploadBatch *> *(id result) {
                if (self.isCancelled) {
                  return nil;
                }

                // 4. Fetch events to upload.
                GDTCORStorageEventSelector *eventSelector = [self eventSelectorTarget:target
                                                                       withConditions:conditions];
                return [storage batchWithEventSelector:eventSelector
                                       batchExpiration:[NSDate dateWithTimeIntervalSinceNow:600]];
              })
      .validateOn(self.uploaderQueue,
                  ^BOOL(GDTCORUploadBatch *batch) {
                    // 5. Validate batch.
                    return batch.batchID != nil && batch.events.count > 0;
                  })
      .thenOn(self.uploaderQueue,
              ^FBLPromise *(GDTCORUploadBatch *batch) {
                // A non-empty batch has been created, consider it as an upload attempt.
                self.uploadAttempted = YES;

                // 6. Perform upload URL request.
                return [self sendURLRequestWithBatch:batch target:target storage:storage];
              })
      .thenOn(self.uploaderQueue,
              ^id(id result) {
                // 7. Finish operation.
                [self finishOperation];
                backgroundTaskCompletion();
                return nil;
              })
      .catchOn(self.uploaderQueue, ^(NSError *error) {
        // TODO: Maybe report the error to the client.
        [self finishOperation];
        backgroundTaskCompletion();
      });
}

#pragma mark - Upload implementation details

/** Sends URL request to upload the provided batch and handle the response. */
- (FBLPromise<NSNull *> *)sendURLRequestWithBatch:(GDTCORUploadBatch *)batch
                                           target:(GDTCORTarget)target
                                          storage:(id<GDTCORStoragePromiseProtocol>)storage {
  NSNumber *batchID = batch.batchID;

  // 1. Send URL request.
  return [self sendURLRequestWithBatch:batch target:target]
      .thenOn(
          self.uploaderQueue,
          ^FBLPromise<NSNull *> *(GULURLSessionDataResponse *response) {
            // 2. Parse response and update the next upload time if can.
            [self updateNextUploadTimeWithResponse:response forTarget:target];

            // 3. Cleanup batch.

            // Only retry if one of these codes is returned:
            // 429 - Too many requests;
            // 5xx - Server errors.
            NSInteger statusCode = response.HTTPResponse.statusCode;
            if (statusCode == 429 || (statusCode >= 500 && statusCode < 600)) {
              // Move the events back to the main storage to be uploaded on the next attempt.
              return [storage removeBatchWithID:batchID deleteEvents:NO];
            } else {
              if (statusCode >= 200 && statusCode <= 300) {
                GDTCORLogDebug(@"CCT: batch %@ delivered", batchID);
              } else {
                GDTCORLogDebug(
                    @"CCT: batch %@ was rejected by the server and will be deleted with all events",
                    batchID);
              }

              // The events are either delivered or unrecoverable broken, so remove the batch with
              // events.
              return [storage removeBatchWithID:batch.batchID deleteEvents:YES];
            }
          })
      .recoverOn(self.uploaderQueue, ^id(NSError *error) {
        // In the case of a network error move the events back to the main storage to be uploaded on
        // the next attempt.
        return [storage removeBatchWithID:batchID deleteEvents:NO];
      });
}

/** Composes and sends URL request. */
- (FBLPromise<GULURLSessionDataResponse *> *)sendURLRequestWithBatch:(GDTCORUploadBatch *)batch
                                                              target:(GDTCORTarget)target {
  return [FBLPromise
             onQueue:self.uploaderQueue
                  do:^NSURLRequest * {
                    // 1. Prepare URL request.
                    NSData *requestProtoData = [self constructRequestProtoWithEvents:batch.events];
                    NSData *gzippedData = [GDTCCTCompressionHelper gzippedData:requestProtoData];
                    BOOL usingGzipData =
                        gzippedData != nil && gzippedData.length < requestProtoData.length;
                    NSData *dataToSend = usingGzipData ? gzippedData : requestProtoData;
                    NSURLRequest *request = [self constructRequestWithURL:self.uploadURL
                                                                forTarget:target
                                                                     data:dataToSend];
                    GDTCORLogDebug(@"CTT: request containing %lu events for batch: %@ for target: "
                                   @"%ld created: %@",
                                   (unsigned long)batch.events.count, batch.batchID, (long)target,
                                   request);
                    return request;
                  }]
      .thenOn(self.uploaderQueue,
              ^FBLPromise<GULURLSessionDataResponse *> *(NSURLRequest *request) {
                // 2. Send URL request.
                return
                    [[self uploaderSessionCreateIfNeeded] gul_dataTaskPromiseWithRequest:request];
              })
      .thenOn(self.uploaderQueue,
              ^GULURLSessionDataResponse *(GULURLSessionDataResponse *response) {
                // Invalidate session to release the delegate (which is `self`) to break the retain
                // cycle.
                [self.uploaderSession finishTasksAndInvalidate];
                return response;
              })
      .recoverOn(self.uploaderQueue, ^id(NSError *error) {
        // Invalidate session to release the delegate (which is `self`) to break the retain cycle.
        [self.uploaderSession finishTasksAndInvalidate];
        // Re-throw the error.
        return error;
      });
}

/** Parses server response and update next upload time for the specified target based on it. */
- (void)updateNextUploadTimeWithResponse:(GULURLSessionDataResponse *)response
                               forTarget:(GDTCORTarget)target {
  GDTCORClock *futureUploadTime;
  if (response.HTTPBody) {
    NSError *decodingError;
    gdt_cct_LogResponse logResponse = GDTCCTDecodeLogResponse(response.HTTPBody, &decodingError);
    if (!decodingError && logResponse.has_next_request_wait_millis) {
      GDTCORLogDebug(@"CCT: The backend responded asking to not upload for %lld millis from now.",
                     logResponse.next_request_wait_millis);
      futureUploadTime =
          [GDTCORClock clockSnapshotInTheFuture:logResponse.next_request_wait_millis];
    } else if (decodingError) {
      GDTCORLogDebug(@"There was a response decoding error: %@", decodingError);
    }
    pb_release(gdt_cct_LogResponse_fields, &logResponse);
  }

  // If no futureUploadTime was parsed from the response body, then check
  // [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) header.
  if (!futureUploadTime) {
    NSString *retryAfterHeader = response.HTTPResponse.allHeaderFields[@"Retry-After"];
    if (retryAfterHeader.length > 0) {
      NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
      formatter.numberStyle = NSNumberFormatterDecimalStyle;
      NSNumber *retryAfterSeconds = [formatter numberFromString:retryAfterHeader];
      if (retryAfterSeconds != nil) {
        uint64_t retryAfterMillis = retryAfterSeconds.unsignedIntegerValue * 1000u;
        futureUploadTime = [GDTCORClock clockSnapshotInTheFuture:retryAfterMillis];
      }
    }
  }

  if (!futureUploadTime) {
    GDTCORLogDebug(@"%@", @"CCT: The backend response failed to parse, so the next request "
                          @"won't occur until 15 minutes from now");
    // 15 minutes from now.
    futureUploadTime = [GDTCORClock clockSnapshotInTheFuture:15 * 60 * 1000];
  }

  [self.metadataProvider setNextUploadTime:futureUploadTime forTarget:target];
}

#pragma mark - Private helper methods

/** @return A resolved promise if is ready and a rejected promise if not. */
- (FBLPromise<NSNull *> *)isReadyToUploadTarget:(GDTCORTarget)target
                                     conditions:(GDTCORUploadConditions)conditions {
  FBLPromise<NSNull *> *promise = [FBLPromise pendingPromise];
  if ([self readyToUploadTarget:target conditions:conditions]) {
    [promise fulfill:[NSNull null]];
  } else {
    NSString *reason =
        [NSString stringWithFormat:@"Target %ld is not ready to upload with condition: %ld",
                                   (long)target, (long)conditions];
    [promise reject:[self genericRejectedPromiseErrorWithReason:reason]];
  }
  return promise;
}

// TODO: Move to a separate class/extension/file when needed in other files.
/** Returns an error object with the specified failure reason. */
- (NSError *)genericRejectedPromiseErrorWithReason:(NSString *)reason {
  return [NSError errorWithDomain:@"GDTCCTUploader"
                             code:-1
                         userInfo:@{NSLocalizedFailureReasonErrorKey : reason}];
}

/** Returns if the specified target is ready to be uploaded based on the specified conditions. */
- (BOOL)readyToUploadTarget:(GDTCORTarget)target conditions:(GDTCORUploadConditions)conditions {
  // Not ready to upload with no network connection.
  // TODO: Reconsider using reachability to prevent an upload attempt.
  // See https://developer.apple.com/videos/play/wwdc2019/712/ (49:40) for more details.
  if (conditions & GDTCORUploadConditionNoNetwork) {
    GDTCORLogDebug(@"%@", @"CCT: Not ready to upload without a network connection.");
    return NO;
  }

  // Upload events with no additional conditions if high priority.
  if ((conditions & GDTCORUploadConditionHighPriority) == GDTCORUploadConditionHighPriority) {
    GDTCORLogDebug(@"%@", @"CCT: a high priority event is allowing an upload");
    return YES;
  }

  // Check next upload time for the target.
  BOOL isAfterNextUploadTime = YES;
  GDTCORClock *nextUploadTime = [self.metadataProvider nextUploadTimeForTarget:target];
  if (nextUploadTime) {
    isAfterNextUploadTime = [[GDTCORClock snapshot] isAfter:nextUploadTime];
  }

  if (isAfterNextUploadTime) {
    GDTCORLogDebug(@"CCT: can upload to target %ld because the request wait time has transpired",
                   (long)target);
  } else {
    GDTCORLogDebug(@"CCT: can't upload to target %ld because the backend asked to wait",
                   (long)target);
  }

  return isAfterNextUploadTime;
}

/** Constructs data given an upload package.
 *
 * @param events The events used to construct the request proto bytes.
 * @return Proto bytes representing a gdt_cct_LogRequest object.
 */
- (nonnull NSData *)constructRequestProtoWithEvents:(NSSet<GDTCOREvent *> *)events {
  // Segment the log events by log type.
  NSMutableDictionary<NSString *, NSMutableSet<GDTCOREvent *> *> *logMappingIDToLogSet =
      [[NSMutableDictionary alloc] init];
  [events enumerateObjectsUsingBlock:^(GDTCOREvent *_Nonnull event, BOOL *_Nonnull stop) {
    NSMutableSet *logSet = logMappingIDToLogSet[event.mappingID];
    logSet = logSet ? logSet : [[NSMutableSet alloc] init];
    [logSet addObject:event];
    logMappingIDToLogSet[event.mappingID] = logSet;
  }];

  gdt_cct_BatchedLogRequest batchedLogRequest =
      GDTCCTConstructBatchedLogRequest(logMappingIDToLogSet);

  NSData *data = GDTCCTEncodeBatchedLogRequest(&batchedLogRequest);
  pb_release(gdt_cct_BatchedLogRequest_fields, &batchedLogRequest);
  return data ? data : [[NSData alloc] init];
}

/** Constructs a request to the given URL and target with the specified request body data.
 *
 * @param target The target backend to send the request to.
 * @param data The request body data.
 * @return A new NSURLRequest ready to be sent to FLL.
 */
- (nullable NSURLRequest *)constructRequestWithURL:(NSURL *)URL
                                         forTarget:(GDTCORTarget)target
                                              data:(NSData *)data {
  if (data == nil || data.length == 0) {
    GDTCORLogDebug(@"There was no data to construct a request for target %ld.", (long)target);
    return nil;
  }

  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];
  NSString *targetString;
  switch (target) {
    case kGDTCORTargetCCT:
      targetString = @"cct";
      break;

    case kGDTCORTargetFLL:
      targetString = @"fll";
      break;

    case kGDTCORTargetCSH:
      targetString = @"csh";
      break;
    case kGDTCORTargetINT:
      targetString = @"int";
      break;

    default:
      targetString = @"unknown";
      break;
  }
  NSString *userAgent =
      [NSString stringWithFormat:@"datatransport/%@ %@support/%@ apple/", kGDTCORVersion,
                                 targetString, kGDTCCTSupportSDKVersion];

  [request setValue:[self.metadataProvider APIKeyForTarget:target]
      forHTTPHeaderField:@"X-Goog-Api-Key"];

  if ([GDTCCTCompressionHelper isGzipped:data]) {
    [request setValue:@"gzip" forHTTPHeaderField:@"Content-Encoding"];
  }
  [request setValue:@"application/x-protobuf" forHTTPHeaderField:@"Content-Type"];
  [request setValue:@"gzip" forHTTPHeaderField:@"Accept-Encoding"];
  [request setValue:userAgent forHTTPHeaderField:@"User-Agent"];
  request.HTTPMethod = @"POST";
  [request setHTTPBody:data];
  return request;
}

/** Creates and returns a storage event selector for the specified target and conditions. */
- (GDTCORStorageEventSelector *)eventSelectorTarget:(GDTCORTarget)target
                                     withConditions:(GDTCORUploadConditions)conditions {
  if ((conditions & GDTCORUploadConditionHighPriority) == GDTCORUploadConditionHighPriority) {
    return [GDTCORStorageEventSelector eventSelectorForTarget:target];
  }
  NSMutableSet<NSNumber *> *qosTiers = [[NSMutableSet alloc] init];
  if (conditions & GDTCORUploadConditionWifiData) {
    [qosTiers addObjectsFromArray:@[
      @(GDTCOREventQoSFast), @(GDTCOREventQoSWifiOnly), @(GDTCOREventQosDefault),
      @(GDTCOREventQoSTelemetry), @(GDTCOREventQoSUnknown)
    ]];
  }
  if (conditions & GDTCORUploadConditionMobileData) {
    [qosTiers addObjectsFromArray:@[ @(GDTCOREventQoSFast), @(GDTCOREventQosDefault) ]];
  }

  return [[GDTCORStorageEventSelector alloc] initWithTarget:target
                                                   eventIDs:nil
                                                 mappingIDs:nil
                                                   qosTiers:qosTiers];
}

#pragma mark - NSURLSessionDelegate

- (void)URLSession:(NSURLSession *)session
                          task:(NSURLSessionTask *)task
    willPerformHTTPRedirection:(NSHTTPURLResponse *)response
                    newRequest:(NSURLRequest *)request
             completionHandler:(void (^)(NSURLRequest *_Nullable))completionHandler {
  if (!completionHandler) {
    return;
  }
  if (response.statusCode == 302 || response.statusCode == 301) {
    NSURLRequest *newRequest = [self constructRequestWithURL:request.URL
                                                   forTarget:kGDTCORTargetCCT
                                                        data:task.originalRequest.HTTPBody];
    completionHandler(newRequest);
  } else {
    completionHandler(request);
  }
}

#pragma mark - NSOperation methods

@synthesize executing = _executing;
@synthesize finished = _finished;

- (BOOL)isFinished {
  @synchronized(self) {
    return _finished;
  }
}

- (BOOL)isExecuting {
  @synchronized(self) {
    return _executing;
  }
}

- (BOOL)isAsynchronous {
  return YES;
}

- (void)startOperation {
  @synchronized(self) {
    [self willChangeValueForKey:@"isExecuting"];
    [self willChangeValueForKey:@"isFinished"];
    self->_executing = YES;
    self->_finished = NO;
    [self didChangeValueForKey:@"isExecuting"];
    [self didChangeValueForKey:@"isFinished"];
  }
}

- (void)finishOperation {
  @synchronized(self) {
    [self willChangeValueForKey:@"isExecuting"];
    [self willChangeValueForKey:@"isFinished"];
    self->_executing = NO;
    self->_finished = YES;
    [self didChangeValueForKey:@"isExecuting"];
    [self didChangeValueForKey:@"isFinished"];
  }
}

- (void)main {
  [self startOperation];

  GDTCORLogDebug(@"Upload operation started: %@", self);
  [self uploadTarget:self.target withConditions:self.conditions];
}

- (void)cancel {
  @synchronized(self) {
    [super cancel];

    // If the operation hasn't been started we can set `isFinished = YES` straight away.
    if (!_executing) {
      _executing = NO;
      _finished = YES;
    }
  }
}

@end

NS_ASSUME_NONNULL_END
