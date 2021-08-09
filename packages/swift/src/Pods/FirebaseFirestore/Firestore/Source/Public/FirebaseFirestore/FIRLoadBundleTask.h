/*
 * Copyright 2021 Google LLC
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

NS_ASSUME_NONNULL_BEGIN

/**
 * Represents the state of bundle loading tasks.
 *
 * Both `FIRLoadBundleTaskStateError` and `FIRLoadBundleTaskStateSuccess` are final states: task
 * will be in either aborted or completed state and there will be no more updates after they are
 * reported.
 */
typedef NS_ENUM(NSInteger, FIRLoadBundleTaskState) {

  FIRLoadBundleTaskStateError,

  FIRLoadBundleTaskStateInProgress,

  FIRLoadBundleTaskStateSuccess,

} NS_SWIFT_NAME(LoadBundleTaskState);

/** Represents a progress update or a final state from loading bundles. */
NS_SWIFT_NAME(LoadBundleTaskProgress)
@interface FIRLoadBundleTaskProgress : NSObject

/** How many documents have been loaded. */
@property(readonly, nonatomic) NSInteger documentsLoaded;

/** The total number of documents in the bundle. 0 if the bundle failed to parse. */
@property(readonly, nonatomic) NSInteger totalDocuments;

/** How many bytes have been loaded. */
@property(readonly, nonatomic) NSInteger bytesLoaded;

/** The total number of bytes in the bundle. 0 if the bundle failed to parse. */
@property(readonly, nonatomic) NSInteger totalBytes;

/** The current state of `FIRLoadBundleTask` (`LoadBundleTask` in Swift). */
@property(readonly, nonatomic) FIRLoadBundleTaskState state;

@end

/** A handle associated with registered observers that can be used to remove them. */
typedef NSInteger FIRLoadBundleObserverHandle NS_SWIFT_NAME(LoadBundleObserverHandle);

/**
 * Represents the task of loading a Firestore bundle. Observers can be registered with this task to
 * observe the bundle loading progress, as well as task completion and error events.
 */
NS_SWIFT_NAME(LoadBundleTask)
@interface FIRLoadBundleTask : NSObject

/**
 * Registers an observer to observe the progress updates, completion or error events.
 *
 * @return A handle to the registered observer which can be used to remove the observer once it is
 * no longer needed.
 */
- (FIRLoadBundleObserverHandle)addObserver:(void (^)(FIRLoadBundleTaskProgress *progress))observer
    NS_SWIFT_NAME(addObserver(_:));

/**
 * Removes a registered observer associated with the given handle. If no observer can be found, this
 * will be a no-op.
 */
- (void)removeObserverWithHandle:(FIRLoadBundleObserverHandle)handle
    NS_SWIFT_NAME(removeObserverWith(handle:));

/**
 * Removes all registered observers for this task.
 */
- (void)removeAllObservers NS_SWIFT_NAME(removeAllObservers());

@end

NS_ASSUME_NONNULL_END
