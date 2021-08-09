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

#import "FIRQuery.h"

NS_ASSUME_NONNULL_BEGIN

@class FIRDocumentReference;

/**
 * A `FIRCollectionReference` object can be used for adding documents, getting document references,
 * and querying for documents (using the methods inherited from `FIRQuery`).
 */
NS_SWIFT_NAME(CollectionReference)
@interface FIRCollectionReference : FIRQuery

/** :nodoc: */
- (id)init __attribute__((unavailable("FIRCollectionReference cannot be created directly.")));

/** ID of the referenced collection. */
@property(nonatomic, strong, readonly) NSString *collectionID;

/**
 * For subcollections, `parent` returns the containing `FIRDocumentReference`.  For root
 * collections, nil is returned.
 */
@property(nonatomic, strong, nullable, readonly) FIRDocumentReference *parent;

/**
 * A string containing the slash-separated path to this this `FIRCollectionReference` (relative to
 * the root of the database).
 */
@property(nonatomic, strong, readonly) NSString *path;

/**
 * Returns a FIRDocumentReference pointing to a new document with an auto-generated ID.
 *
 * @return A FIRDocumentReference pointing to a new document with an auto-generated ID.
 */
- (FIRDocumentReference *)documentWithAutoID NS_SWIFT_NAME(document());

/**
 * Gets a `FIRDocumentReference` referring to the document at the specified path, relative to this
 * collection's own path.
 *
 * @param documentPath The slash-separated relative path of the document for which to get a
 * `FIRDocumentReference`.
 *
 * @return The `FIRDocumentReference` for the specified document path.
 */
- (FIRDocumentReference *)documentWithPath:(NSString *)documentPath NS_SWIFT_NAME(document(_:));

/**
 * Adds a new document to this collection with the specified data, assigning it a document ID
 * automatically.
 *
 * @param data An `NSDictionary` containing the data for the new document.
 *
 * @return A `FIRDocumentReference` pointing to the newly created document.
 */
- (FIRDocumentReference *)addDocumentWithData:(NSDictionary<NSString *, id> *)data
    NS_SWIFT_NAME(addDocument(data:));

/**
 * Adds a new document to this collection with the specified data, assigning it a document ID
 * automatically.
 *
 * @param data An `NSDictionary` containing the data for the new document.
 * @param completion A block to execute once the document has been successfully written to
 *     the server. This block will not be called while the client is offline, though local
 *     changes will be visible immediately.
 *
 * @return A `FIRDocumentReference` pointing to the newly created document.
 */
// clang-format off
// clang-format breaks the NS_SWIFT_NAME attribute
- (FIRDocumentReference *)addDocumentWithData:(NSDictionary<NSString *, id> *)data
                                   completion:
                                       (nullable void (^)(NSError *_Nullable error))completion
    NS_SWIFT_NAME(addDocument(data:completion:));
// clang-format on

@end

NS_ASSUME_NONNULL_END
