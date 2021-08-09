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

#import <Foundation/Foundation.h>

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORUploader.h"

@protocol GDTCORStoragePromiseProtocol;

NS_ASSUME_NONNULL_BEGIN

/// The protocol defines methods to retrieve/update data shared between different upload operations.
@protocol GDTCCTUploadMetadataProvider <NSObject>

/** Returns a GDTCORClock object representing time after which a next upload attempt is allowed for
 * the specified target. Upload is allowed now if `nil`. */
- (nullable GDTCORClock *)nextUploadTimeForTarget:(GDTCORTarget)target;

/** Stores or resets time after which  a next upload attempt is allowed for the specified target. */
- (void)setNextUploadTime:(nullable GDTCORClock *)time forTarget:(GDTCORTarget)target;

/** Returns an API key for the specified target. */
- (nullable NSString *)APIKeyForTarget:(GDTCORTarget)target;

@end

/** Class capable of uploading events to the CCT backend. */
@interface GDTCCTUploadOperation : NSOperation

- (instancetype)init NS_UNAVAILABLE;

/** The designated initializer.
 *  @param target The events target to upload.
 *  @param conditions A set of upload conditions. The conditions affect the set of events to be
 * uploaded, e.g. events with some QoS are not uploaded on a cellular network, etc.
 *  @param uploadURL The backend URL to upload the events.
 *  @param queue A queue to dispatch async upload steps.
 *  @param storage A storage object to fetch events for upload.
 *  @param metadataProvider An object to retrieve/update data shared between different upload
 * operations.
 *  @return An instance of GDTCCTUploadOperation ready to be added to an NSOperationQueue.
 */
- (instancetype)initWithTarget:(GDTCORTarget)target
                    conditions:(GDTCORUploadConditions)conditions
                     uploadURL:(NSURL *)uploadURL
                         queue:(dispatch_queue_t)queue
                       storage:(id<GDTCORStoragePromiseProtocol>)storage
              metadataProvider:(id<GDTCCTUploadMetadataProvider>)metadataProvider
    NS_DESIGNATED_INITIALIZER;

/** YES if a batch upload attempt was performed. NO otherwise. If NO for the finished operation,
 * then  there were no events suitable for upload. */
@property(nonatomic, readonly) BOOL uploadAttempted;

/** The queue on which all CCT uploading will occur. */
@property(nonatomic, readonly) dispatch_queue_t uploaderQueue;

/** The current upload task. */
@property(nullable, nonatomic, readonly) NSURLSessionUploadTask *currentTask;

@end

NS_ASSUME_NONNULL_END
