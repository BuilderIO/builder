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

#import "FIRFirestoreSource.h"
#import "FIRListenerRegistration.h"

@class FIRCollectionReference;
@class FIRDocumentSnapshot;
@class FIRFirestore;

NS_ASSUME_NONNULL_BEGIN

/**
 * A block type used to handle snapshot updates.
 */
typedef void (^FIRDocumentSnapshotBlock)(FIRDocumentSnapshot *_Nullable snapshot,
                                         NSError *_Nullable error);

/**
 * A `FIRDocumentReference` refers to a document location in a Firestore database and can be
 * used to write, read, or listen to the location. The document at the referenced location
 * may or may not exist. A `FIRDocumentReference` can also be used to create a
 * `FIRCollectionReference` to a subcollection.
 */
NS_SWIFT_NAME(DocumentReference)
@interface FIRDocumentReference : NSObject

/** :nodoc: */
- (instancetype)init
    __attribute__((unavailable("FIRDocumentReference cannot be created directly.")));

/** The ID of the document referred to. */
@property(nonatomic, strong, readonly) NSString *documentID;

/** A reference to the collection to which this `DocumentReference` belongs. */
@property(nonatomic, strong, readonly) FIRCollectionReference *parent;

/** The `FIRFirestore` for the Firestore database (useful for performing transactions, etc.). */
@property(nonatomic, strong, readonly) FIRFirestore *firestore;

/**
 * A string representing the path of the referenced document (relative to the root of the
 * database).
 */
@property(nonatomic, strong, readonly) NSString *path;

/**
 * Gets a `FIRCollectionReference` referring to the collection at the specified
 * path, relative to this document.
 *
 * @param collectionPath The slash-separated relative path of the collection for which to get a
 * `FIRCollectionReference`.
 *
 * @return The `FIRCollectionReference` at the specified _collectionPath_.
 */
- (FIRCollectionReference *)collectionWithPath:(NSString *)collectionPath
    NS_SWIFT_NAME(collection(_:));

#pragma mark - Writing Data

/**
 * Writes to the document referred to by `FIRDocumentReference`. If the document doesn't yet exist,
 * this method creates it and then sets the data. If the document exists, this method overwrites
 * the document data with the new values.
 *
 * @param documentData An `NSDictionary` that contains the fields and data to write to the
 * document.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData;

/**
 * Writes to the document referred to by this DocumentReference. If the document does not yet
 * exist, it will be created. If you pass `merge:YES`, the provided data will be merged into
 * any existing document.
 *
 * @param documentData An `NSDictionary` that contains the fields and data to write to the
 * document.
 * @param merge Whether to merge the provided data into any existing document.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData merge:(BOOL)merge;

/**
 * Writes to the document referred to by `document` and only replace the fields
 * specified under `mergeFields`. Any field that is not specified in `mergeFields`
 * is ignored and remains untouched. If the document doesn't yet exist,
 * this method creates it and then sets the data.
 *
 * It is an error to include a field in `mergeFields` that does not have a corresponding
 * value in the `data` dictionary.
 *
 * @param documentData An `NSDictionary` containing the fields that make up the document
 * to be written.
 * @param mergeFields An `NSArray` that contains a list of `NSString` or `FIRFieldPath` elements
 *     specifying which fields to merge. Fields can contain dots to reference nested fields within
 *     the document.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData mergeFields:(NSArray<id> *)mergeFields;

/**
 * Overwrites the document referred to by this `FIRDocumentReference`. If no document exists, it
 * is created. If a document already exists, it is overwritten.
 *
 * @param documentData An `NSDictionary` containing the fields that make up the document
 *     to be written.
 * @param completion A block to execute once the document has been successfully written to the
 *     server. This block will not be called while the client is offline, though local
 *     changes will be visible immediately.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData
     completion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Writes to the document referred to by this DocumentReference. If the document does not yet
 * exist, it will be created. If you pass `merge:YES`, the provided data will be merged into
 * any existing document.
 *
 * @param documentData An `NSDictionary` containing the fields that make up the document
 * to be written.
 * @param merge Whether to merge the provided data into any existing document.
 * @param completion A block to execute once the document has been successfully written to the
 *     server. This block will not be called while the client is offline, though local
 *     changes will be visible immediately.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData
          merge:(BOOL)merge
     completion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Writes to the document referred to by `document` and only replace the fields
 * specified under `mergeFields`. Any field that is not specified in `mergeFields`
 * is ignored and remains untouched. If the document doesn't yet exist,
 * this method creates it and then sets the data.
 *
 * It is an error to include a field in `mergeFields` that does not have a corresponding
 * value in the `data` dictionary.
 *
 * @param documentData An `NSDictionary` containing the fields that make up the document
 * to be written.
 * @param mergeFields An `NSArray` that contains a list of `NSString` or `FIRFieldPath` elements
 *     specifying which fields to merge. Fields can contain dots to reference nested fields within
 *     the document.
 * @param completion A block to execute once the document has been successfully written to the
 *     server. This block will not be called while the client is offline, though local
 *     changes will be visible immediately.
 */
- (void)setData:(NSDictionary<NSString *, id> *)documentData
    mergeFields:(NSArray<id> *)mergeFields
     completion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Updates fields in the document referred to by this `FIRDocumentReference`.
 * If the document does not exist, the update fails (specify a completion block to be notified).
 *
 * @param fields An `NSDictionary` containing the fields (expressed as an `NSString` or
 *     `FIRFieldPath`) and values with which to update the document.
 */
- (void)updateData:(NSDictionary<id, id> *)fields;

/**
 * Updates fields in the document referred to by this `FIRDocumentReference`. If the document
 * does not exist, the update fails and the specified completion block receives an error.
 *
 * @param fields An `NSDictionary` containing the fields (expressed as an `NSString` or
 *     `FIRFieldPath`) and values with which to update the document.
 * @param completion A block to execute when the update is complete. If the update is successful the
 *     error parameter will be nil, otherwise it will give an indication of how the update failed.
 *     This block will only execute when the client is online and the commit has completed against
 *     the server. The completion handler will not be called when the device is offline, though
 *     local changes will be visible immediately.
 */
- (void)updateData:(NSDictionary<id, id> *)fields
        completion:(nullable void (^)(NSError *_Nullable error))completion;

// NOTE: this is named 'deleteDocument' because 'delete' is a keyword in Objective-C++.
/** Deletes the document referred to by this `FIRDocumentReference`. */
// clang-format off
- (void)deleteDocument NS_SWIFT_NAME(delete());
// clang-format on

/**
 * Deletes the document referred to by this `FIRDocumentReference`.
 *
 * @param completion A block to execute once the document has been successfully written to the
 *     server. This block will not be called while the client is offline, though local
 *     changes will be visible immediately.
 */
// clang-format off
- (void)deleteDocumentWithCompletion:(nullable void (^)(NSError *_Nullable error))completion
    NS_SWIFT_NAME(delete(completion:));
// clang-format on

#pragma mark - Retrieving Data

/**
 * Reads the document referenced by this `FIRDocumentReference`.
 *
 * This method attempts to provide up-to-date data when possible by waiting for
 * data from the server, but it may return cached data or fail if you are
 * offline and the server cannot be reached. See the
 * `getDocument(source:completion:)` method to change this behavior.
 *
 * @param completion a block to execute once the document has been successfully read.
 */
- (void)getDocumentWithCompletion:(FIRDocumentSnapshotBlock)completion
    NS_SWIFT_NAME(getDocument(completion:));

/**
 * Reads the document referenced by this `FIRDocumentReference`.
 *
 * @param source indicates whether the results should be fetched from the cache
 *     only (`Source.cache`), the server only (`Source.server`), or to attempt
 *     the server and fall back to the cache (`Source.default`).
 * @param completion a block to execute once the document has been successfully read.
 */
// clang-format off
- (void)getDocumentWithSource:(FIRFirestoreSource)source
                   completion:(FIRDocumentSnapshotBlock)completion
    NS_SWIFT_NAME(getDocument(source:completion:));
// clang-format on

/**
 * Attaches a listener for DocumentSnapshot events.
 *
 * @param listener The listener to attach.
 *
 * @return A FIRListenerRegistration that can be used to remove this listener.
 */
- (id<FIRListenerRegistration>)addSnapshotListener:(FIRDocumentSnapshotBlock)listener
    NS_SWIFT_NAME(addSnapshotListener(_:));

/**
 * Attaches a listener for DocumentSnapshot events.
 *
 * @param includeMetadataChanges Whether metadata-only changes (i.e. only
 *     `FIRDocumentSnapshot.metadata` changed) should trigger snapshot events.
 * @param listener The listener to attach.
 *
 * @return A FIRListenerRegistration that can be used to remove this listener.
 */
// clang-format off
- (id<FIRListenerRegistration>)
addSnapshotListenerWithIncludeMetadataChanges:(BOOL)includeMetadataChanges
                                     listener:(FIRDocumentSnapshotBlock)listener
    NS_SWIFT_NAME(addSnapshotListener(includeMetadataChanges:listener:));
// clang-format on

@end

NS_ASSUME_NONNULL_END
