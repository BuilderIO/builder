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

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORFlatFileStorage+Promises.h"

#if __has_include(<FBLPromises/FBLPromises.h>)
#import <FBLPromises/FBLPromises.h>
#else
#import "FBLPromises.h"
#endif

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORUploadBatch.h"

@implementation GDTCORFlatFileStorage (Promises)

- (FBLPromise<NSSet<NSNumber *> *> *)batchIDsForTarget:(GDTCORTarget)target {
  return [FBLPromise onQueue:self.storageQueue
        wrapObjectCompletion:^(FBLPromiseObjectCompletion _Nonnull handler) {
          [self batchIDsForTarget:target onComplete:handler];
        }];
}

- (FBLPromise<NSNull *> *)removeBatchWithID:(NSNumber *)batchID deleteEvents:(BOOL)deleteEvents {
  return [FBLPromise onQueue:self.storageQueue
              wrapCompletion:^(FBLPromiseCompletion _Nonnull handler) {
                [self removeBatchWithID:batchID deleteEvents:deleteEvents onComplete:handler];
              }];
}

- (FBLPromise<NSNull *> *)removeBatchesWithIDs:(NSSet<NSNumber *> *)batchIDs
                                  deleteEvents:(BOOL)deleteEvents {
  NSMutableArray<FBLPromise *> *removeBatchPromises =
      [NSMutableArray arrayWithCapacity:batchIDs.count];
  for (NSNumber *batchID in batchIDs) {
    [removeBatchPromises addObject:[self removeBatchWithID:batchID deleteEvents:deleteEvents]];
  }

  return [FBLPromise onQueue:self.storageQueue all:[removeBatchPromises copy]].thenOn(
      self.storageQueue, ^id(id result) {
        return [FBLPromise resolvedWith:[NSNull null]];
      });
}

- (FBLPromise<NSNull *> *)removeAllBatchesForTarget:(GDTCORTarget)target
                                       deleteEvents:(BOOL)deleteEvents {
  return
      [self batchIDsForTarget:target].thenOn(self.storageQueue, ^id(NSSet<NSNumber *> *batchIDs) {
        if (batchIDs.count == 0) {
          return [FBLPromise resolvedWith:[NSNull null]];
        } else {
          return [self removeBatchesWithIDs:batchIDs deleteEvents:NO];
        }
      });
}

- (FBLPromise<NSNumber *> *)hasEventsForTarget:(GDTCORTarget)target {
  return [FBLPromise onQueue:self.storageQueue
          wrapBoolCompletion:^(FBLPromiseBoolCompletion _Nonnull handler) {
            [self hasEventsForTarget:target onComplete:handler];
          }];
}

- (FBLPromise<GDTCORUploadBatch *> *)batchWithEventSelector:
                                         (GDTCORStorageEventSelector *)eventSelector
                                            batchExpiration:(NSDate *)expiration {
  return [FBLPromise
      onQueue:self.storageQueue
        async:^(FBLPromiseFulfillBlock _Nonnull fulfill, FBLPromiseRejectBlock _Nonnull reject) {
          [self batchWithEventSelector:eventSelector
                       batchExpiration:expiration
                            onComplete:^(NSNumber *_Nullable newBatchID,
                                         NSSet<GDTCOREvent *> *_Nullable batchEvents) {
                              if (newBatchID == nil || batchEvents == nil) {
                                reject([self genericRejectedPromiseErrorWithReason:
                                                 @"There are no events for the selector."]);
                              } else {
                                fulfill([[GDTCORUploadBatch alloc] initWithBatchID:newBatchID
                                                                            events:batchEvents]);
                              }
                            }];
        }];
}

// TODO: Move to a separate class/extension when needed in more places.
- (NSError *)genericRejectedPromiseErrorWithReason:(NSString *)reason {
  return [NSError errorWithDomain:@"GDTCORFlatFileStorage"
                             code:-1
                         userInfo:@{NSLocalizedFailureReasonErrorKey : reason}];
}

@end
