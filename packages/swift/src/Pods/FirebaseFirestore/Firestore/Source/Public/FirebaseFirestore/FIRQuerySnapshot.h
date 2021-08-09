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

@class FIRDocumentChange;
@class FIRQuery;
@class FIRQueryDocumentSnapshot;
@class FIRSnapshotMetadata;

/**
 * A `FIRQuerySnapshot` contains zero or more `FIRDocumentSnapshot` objects. It can be enumerated
 * using "for ... in documentSet.documents" and its size can be inspected with `isEmpty` and
 * `count`.
 */
NS_SWIFT_NAME(QuerySnapshot)
@interface FIRQuerySnapshot : NSObject

/** :nodoc: */
- (id)init __attribute__((unavailable("FIRQuerySnapshot cannot be created directly.")));

/**
 * The query on which you called `getDocuments` or listened to in order to get this
 * `FIRQuerySnapshot`.
 */
@property(nonatomic, strong, readonly) FIRQuery *query;

/** Metadata about this snapshot, concerning its source and if it has local modifications. */
@property(nonatomic, strong, readonly) FIRSnapshotMetadata *metadata;

/** Indicates whether this `FIRQuerySnapshot` is empty (contains no documents). */
@property(nonatomic, readonly, getter=isEmpty) BOOL empty;

/** The count of documents in this `FIRQuerySnapshot`. */
@property(nonatomic, readonly) NSInteger count;

/** An Array of the `FIRDocumentSnapshots` that make up this document set. */
@property(nonatomic, strong, readonly) NSArray<FIRQueryDocumentSnapshot *> *documents;

/**
 * An array of the documents that changed since the last snapshot. If this is the first snapshot,
 * all documents will be in the list as Added changes.
 */
@property(nonatomic, strong, readonly) NSArray<FIRDocumentChange *> *documentChanges;

/**
 * Returns an array of the documents that changed since the last snapshot. If this is the first
 * snapshot, all documents will be in the list as Added changes.
 *
 * @param includeMetadataChanges Whether metadata-only changes (i.e. only
 *     `FIRDocumentSnapshot.metadata` changed) should be included.
 */
- (NSArray<FIRDocumentChange *> *)documentChangesWithIncludeMetadataChanges:
    (BOOL)includeMetadataChanges NS_SWIFT_NAME(documentChanges(includeMetadataChanges:));

@end

NS_ASSUME_NONNULL_END
