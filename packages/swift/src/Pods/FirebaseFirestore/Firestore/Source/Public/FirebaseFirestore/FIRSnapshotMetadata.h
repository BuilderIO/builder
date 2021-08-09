/*
 * Copyright 2017 Google
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

/** Metadata about a snapshot, describing the state of the snapshot. */
NS_SWIFT_NAME(SnapshotMetadata)
@interface FIRSnapshotMetadata : NSObject

/** :nodoc: */
- (instancetype)init NS_UNAVAILABLE;

/**
 * Returns YES if the snapshot contains the result of local writes (e.g. set() or update() calls)
 * that have not yet been committed to the backend. If your listener has opted into metadata updates
 * (via `includeMetadataChanges:YES`) you will receive another snapshot with `hasPendingWrites`
 * equal to NO once the writes have been committed to the backend.
 */
@property(nonatomic, assign, readonly, getter=hasPendingWrites) BOOL pendingWrites;

/**
 * Returns YES if the snapshot was created from cached data rather than guaranteed up-to-date server
 * data. If your listener has opted into metadata updates (via `includeMetadataChanges:YES`) you
 * will receive another snapshot with `isFromCache` equal to NO once the client has received
 * up-to-date data from the backend.
 */
@property(nonatomic, assign, readonly, getter=isFromCache) BOOL fromCache;

@end

NS_ASSUME_NONNULL_END
