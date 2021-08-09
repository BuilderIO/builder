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

#import "GoogleDataTransport/GDTCCTLibrary/Private/GDTCCTUploader.h"

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORPlatform.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORRegistrar.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORConsoleLogger.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREndpoints.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREvent.h"

#import "GoogleDataTransport/GDTCCTLibrary/Private/GDTCCTUploadOperation.h"

NS_ASSUME_NONNULL_BEGIN

@interface GDTCCTUploader () <NSURLSessionDelegate, GDTCCTUploadMetadataProvider>

@property(nonatomic, readonly) NSOperationQueue *uploadOperationQueue;
@property(nonatomic, readonly) dispatch_queue_t uploadQueue;

@property(nonatomic, readonly)
    NSMutableDictionary<NSNumber * /*GDTCORTarget*/, GDTCORClock *> *nextUploadTimeByTarget;

@end

@implementation GDTCCTUploader

static NSURL *_testServerURL = nil;

+ (void)load {
  GDTCCTUploader *uploader = [GDTCCTUploader sharedInstance];
  [[GDTCORRegistrar sharedInstance] registerUploader:uploader target:kGDTCORTargetCCT];
  [[GDTCORRegistrar sharedInstance] registerUploader:uploader target:kGDTCORTargetFLL];
  [[GDTCORRegistrar sharedInstance] registerUploader:uploader target:kGDTCORTargetCSH];
  [[GDTCORRegistrar sharedInstance] registerUploader:uploader target:kGDTCORTargetINT];
}

+ (instancetype)sharedInstance {
  static GDTCCTUploader *sharedInstance;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[GDTCCTUploader alloc] init];
  });
  return sharedInstance;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _uploadQueue = dispatch_queue_create("com.google.GDTCCTUploader", DISPATCH_QUEUE_SERIAL);
    _uploadOperationQueue = [[NSOperationQueue alloc] init];
    _uploadOperationQueue.maxConcurrentOperationCount = 1;
    _nextUploadTimeByTarget = [[NSMutableDictionary alloc] init];
  }
  return self;
}

- (void)uploadTarget:(GDTCORTarget)target withConditions:(GDTCORUploadConditions)conditions {
  // Current GDTCCTUploader expected behaviour:
  // 1. Accept multiple upload request
  // 2. Verify if there are events eligible for upload and start upload for the first suitable
  // target
  // 3. Ignore other requests while an upload is in-progress.

  // TODO: Revisit expected behaviour.
  // Potentially better option:
  // 1. Accept and enqueue all upload requests
  // 2. Notify the client of upload stages
  // 3. Allow the client cancelling upload requests as needed.

  id<GDTCORStoragePromiseProtocol> storage = GDTCORStoragePromiseInstanceForTarget(target);
  if (storage == nil) {
    GDTCORLogError(GDTCORMCEGeneralError,
                   @"Failed to upload target: %ld - could not find corresponding storage instance.",
                   (long)target);
    return;
  }

  GDTCCTUploadOperation *uploadOperation =
      [[GDTCCTUploadOperation alloc] initWithTarget:target
                                         conditions:conditions
                                          uploadURL:[[self class] serverURLForTarget:target]
                                              queue:self.uploadQueue
                                            storage:storage
                                   metadataProvider:self];

  GDTCORLogDebug(@"Upload operation created: %@, target: %@", uploadOperation, @(target));

  __weak __auto_type weakSelf = self;
  __weak GDTCCTUploadOperation *weakOperation = uploadOperation;
  uploadOperation.completionBlock = ^{
    __auto_type strongSelf = weakSelf;
    GDTCCTUploadOperation *strongOperation = weakOperation;
    if (strongSelf == nil || strongOperation == nil) {
      GDTCORLogDebug(@"Internal inconsistency: GDTCCTUploader was deallocated during upload.", nil);
      return;
    }

    GDTCORLogDebug(@"Upload operation finished: %@, uploadAttempted: %@", strongOperation,
                   @(strongOperation.uploadAttempted));

    if (strongOperation.uploadAttempted) {
      // Ignore all upload requests received when the upload was in progress.
      [strongSelf.uploadOperationQueue cancelAllOperations];
    }
  };

  [self.uploadOperationQueue addOperation:uploadOperation];
  GDTCORLogDebug(@"Upload operation scheduled: %@, operation count: %@", uploadOperation,
                 @(self.uploadOperationQueue.operationCount));
}

#pragma mark - URLs

+ (void)setTestServerURL:(NSURL *_Nullable)serverURL {
  _testServerURL = serverURL;
}

+ (NSURL *_Nullable)testServerURL {
  return _testServerURL;
}

+ (nullable NSURL *)serverURLForTarget:(GDTCORTarget)target {
#if !NDEBUG
  if (_testServerURL) {
    return _testServerURL;
  }
#endif  // !NDEBUG

  return [GDTCOREndpoints uploadURLForTarget:target];
}

- (NSString *)FLLAndCSHAndINTAPIKey {
  static NSString *defaultServerKey;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    // These strings should be interleaved to construct the real key.
    const char *p1 = "AzSBG0honD6A-PxV5nBc";
    const char *p2 = "Iay44Iwtu2vV0AOrz1C";
    const char defaultKey[40] = {p1[0],  p2[0],  p1[1],  p2[1],  p1[2],  p2[2],  p1[3],  p2[3],
                                 p1[4],  p2[4],  p1[5],  p2[5],  p1[6],  p2[6],  p1[7],  p2[7],
                                 p1[8],  p2[8],  p1[9],  p2[9],  p1[10], p2[10], p1[11], p2[11],
                                 p1[12], p2[12], p1[13], p2[13], p1[14], p2[14], p1[15], p2[15],
                                 p1[16], p2[16], p1[17], p2[17], p1[18], p2[18], p1[19], '\0'};
    defaultServerKey = [NSString stringWithUTF8String:defaultKey];
  });
  return defaultServerKey;
}

#pragma mark - GDTCCTUploadMetadataProvider

- (nullable GDTCORClock *)nextUploadTimeForTarget:(GDTCORTarget)target {
  @synchronized(self.nextUploadTimeByTarget) {
    return self.nextUploadTimeByTarget[@(target)];
  }
}

- (void)setNextUploadTime:(nullable GDTCORClock *)time forTarget:(GDTCORTarget)target {
  @synchronized(self.nextUploadTimeByTarget) {
    self.nextUploadTimeByTarget[@(target)] = time;
  }
}

- (nullable NSString *)APIKeyForTarget:(GDTCORTarget)target {
  if (target == kGDTCORTargetFLL || target == kGDTCORTargetCSH) {
    return [self FLLAndCSHAndINTAPIKey];
  }

  if (target == kGDTCORTargetINT) {
    return [self FLLAndCSHAndINTAPIKey];
  }

  return nil;
}

#if !NDEBUG

- (BOOL)waitForUploadFinishedWithTimeout:(NSTimeInterval)timeout {
  NSDate *expirationDate = [NSDate dateWithTimeIntervalSinceNow:timeout];
  while ([expirationDate compare:[NSDate date]] == NSOrderedDescending) {
    if (self.uploadOperationQueue.operationCount == 0) {
      return YES;
    } else {
      [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    }
  }

  GDTCORLogDebug(@"Uploader wait for finish timeout exceeded. Operations still in queue: %@",
                 self.uploadOperationQueue.operations);
  return NO;
}

#endif  // !NDEBUG

@end

NS_ASSUME_NONNULL_END
