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

#import <Foundation/Foundation.h>

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORLifecycle.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORRegistrar.h"

@class GDTCORClock;

NS_ASSUME_NONNULL_BEGIN

/** This class connects storage and uploader implementations, providing events to an uploader
 * and informing the storage what events were successfully uploaded or not.
 */
@interface GDTCORUploadCoordinator : NSObject <GDTCORLifecycleProtocol>

/** The queue on which all upload coordination will occur. Also used by a dispatch timer. */
/** Creates and/or returrns the singleton.
 *
 * @return The singleton instance of this class.
 */
+ (instancetype)sharedInstance;

/** The queue on which all upload coordination will occur. */
@property(nonatomic, readonly) dispatch_queue_t coordinationQueue;

/** A timer that will causes regular checks for events to upload. */
@property(nonatomic, readonly, nullable) dispatch_source_t timer;

/** The interval the timer will fire. */
@property(nonatomic, readonly) uint64_t timerInterval;

/** Some leeway given to libdispatch for the timer interval event. */
@property(nonatomic, readonly) uint64_t timerLeeway;

/** The registrar object the coordinator will use. Generally used for testing. */
@property(nonatomic) GDTCORRegistrar *registrar;

/** Forces the backend specified by the target to upload the provided set of events. This should
 * only ever happen when the QoS tier of an event requires it.
 *
 * @param target The target that should force an upload.
 */
- (void)forceUploadForTarget:(GDTCORTarget)target;

/** Starts the upload timer. */
- (void)startTimer;

/** Stops the upload timer from running. */
- (void)stopTimer;

@end

NS_ASSUME_NONNULL_END
