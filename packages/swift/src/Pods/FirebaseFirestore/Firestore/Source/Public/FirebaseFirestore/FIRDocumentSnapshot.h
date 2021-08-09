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

@class FIRDocumentReference;
@class FIRSnapshotMetadata;

NS_ASSUME_NONNULL_BEGIN

/**
 * Controls the return value for server timestamps that have not yet been set to
 * their final value.
 */
typedef NS_ENUM(NSInteger, FIRServerTimestampBehavior) {
  /**
   * Return `NSNull` for `FieldValue.serverTimestamp()` fields that have not yet
   * been set to their final value.
   */
  FIRServerTimestampBehaviorNone,

  /**
   * Return a local estimates for `FieldValue.serverTimestamp()`
   * fields that have not yet been set to their final value. This estimate will
   * likely differ from the final value and may cause these pending values to
   * change once the server result becomes available.
   */
  FIRServerTimestampBehaviorEstimate,

  /**
   * Return the previous value for `FieldValue.serverTimestamp()` fields that
   * have not yet been set to their final value.
   */
  FIRServerTimestampBehaviorPrevious
} NS_SWIFT_NAME(ServerTimestampBehavior);

/**
 * A `FIRDocumentSnapshot` contains data read from a document in your Firestore database. The data
 * can be extracted with the `data` property or by using subscript syntax to access a specific
 * field.
 *
 * For a `FIRDocumentSnapshot` that points to a non-existing document, any data access will return
 * `nil`. You can use the `exists` property to explicitly verify a documents existence.
 */
NS_SWIFT_NAME(DocumentSnapshot)
@interface FIRDocumentSnapshot : NSObject

/** :nodoc: */
- (instancetype)init
    __attribute__((unavailable("FIRDocumentSnapshot cannot be created directly.")));

/** True if the document exists. */
@property(nonatomic, assign, readonly) BOOL exists;

/** A `FIRDocumentReference` to the document location. */
@property(nonatomic, strong, readonly) FIRDocumentReference *reference;

/** The ID of the document for which this `FIRDocumentSnapshot` contains data. */
@property(nonatomic, copy, readonly) NSString *documentID;

/** Metadata about this snapshot concerning its source and if it has local modifications. */
@property(nonatomic, strong, readonly) FIRSnapshotMetadata *metadata;

/**
 * Retrieves all fields in the document as an `NSDictionary`. Returns `nil` if the document doesn't
 * exist.
 *
 * Server-provided timestamps that have not yet been set to their final value will be returned as
 * `NSNull`. You can use `dataWithServerTimestampBehavior()` to configure this behavior.
 *
 * @return An `NSDictionary` containing all fields in the document or `nil` if the document doesn't
 *     exist.
 */
- (nullable NSDictionary<NSString *, id> *)data;

/**
 * Retrieves all fields in the document as a `Dictionary`. Returns `nil` if the document doesn't
 * exist.
 *
 * @param serverTimestampBehavior Configures how server timestamps that have not yet been set to
 *     their final value are returned from the snapshot.
 * @return A `Dictionary` containing all fields in the document or `nil` if the document doesn't
 *     exist.
 */
- (nullable NSDictionary<NSString *, id> *)dataWithServerTimestampBehavior:
    (FIRServerTimestampBehavior)serverTimestampBehavior;

/**
 * Retrieves a specific field from the document. Returns `nil` if the document or the field doesn't
 * exist.
 *
 * The timestamps that have not yet been set to their final value will be returned as `NSNull`. The
 * can use `get(_:serverTimestampBehavior:)` to configure this behavior.
 *
 * @param field The field to retrieve.
 * @return The value contained in the field or `nil` if the document or field doesn't exist.
 */
- (nullable id)valueForField:(id)field NS_SWIFT_NAME(get(_:));

/**
 * Retrieves a specific field from the document. Returns `nil` if the document or the field doesn't
 * exist.
 *
 * The timestamps that have not yet been set to their final value will be returned as `NSNull`. The
 * can use `get(_:serverTimestampBehavior:)` to configure this behavior.
 *
 * @param field The field to retrieve.
 * @param serverTimestampBehavior Configures how server timestamps that have not yet been set to
 *     their final value are returned from the snapshot.
 * @return The value contained in the field or `nil` if the document or field doesn't exist.
 */
// clang-format off
- (nullable id)valueForField:(id)field
     serverTimestampBehavior:(FIRServerTimestampBehavior)serverTimestampBehavior
               NS_SWIFT_NAME(get(_:serverTimestampBehavior:));
// clang-format on

/**
 * Retrieves a specific field from the document.
 *
 * @param key The field to retrieve.
 *
 * @return The value contained in the field or `nil` if the document or field doesn't exist.
 */
- (nullable id)objectForKeyedSubscript:(id)key;

@end

/**
 * A `FIRQueryDocumentSnapshot` contains data read from a document in your Firestore database as
 * part of a query. The document is guaranteed to exist and its data can be extracted with the
 * `data` property or by using subscript syntax to access a specific field.
 *
 * A `FIRQueryDocumentSnapshot` offers the same API surface as a `FIRDocumentSnapshot`. As
 * deleted documents are not returned from queries, its `exists` property will always be true and
 * `data:` will never return `nil`.
 */
NS_SWIFT_NAME(QueryDocumentSnapshot)
@interface FIRQueryDocumentSnapshot : FIRDocumentSnapshot

/** :nodoc: */
- (instancetype)init
    __attribute__((unavailable("FIRQueryDocumentSnapshot cannot be created directly.")));

/**
 * Retrieves all fields in the document as an `NSDictionary`.
 *
 * Server-provided timestamps that have not yet been set to their final value will be returned as
 * `NSNull`. You can use `dataWithServerTimestampBehavior()` to configure this behavior.
 *
 * @return An `NSDictionary` containing all fields in the document.
 */
- (NSDictionary<NSString *, id> *)data;

/**
 * Retrieves all fields in the document as a `Dictionary`.
 *
 * @param serverTimestampBehavior Configures how server timestamps that have not yet been set to
 *     their final value are returned from the snapshot.
 * @return A `Dictionary` containing all fields in the document.
 */
- (NSDictionary<NSString *, id> *)dataWithServerTimestampBehavior:
    (FIRServerTimestampBehavior)serverTimestampBehavior;

@end

NS_ASSUME_NONNULL_END
