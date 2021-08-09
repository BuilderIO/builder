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

@class FIRDocumentReference;
@class FIRDocumentSnapshot;

/**
 * `FIRTransaction` provides methods to read and write data within a transaction.
 *
 * @see FIRFirestore#transaction:completion:
 */
NS_SWIFT_NAME(Transaction)
@interface FIRTransaction : NSObject

/** :nodoc: */
- (id)init __attribute__((unavailable("FIRTransaction cannot be created directly.")));

/**
 * Writes to the document referred to by `document`. If the document doesn't yet exist,
 * this method creates it and then sets the data. If the document exists, this method overwrites
 * the document data with the new values.
 *
 * @param data An `NSDictionary` that contains the fields and data to write to the document.
 * @param document A reference to the document whose data should be overwritten.
 * @return This `FIRTransaction` instance. Used for chaining method calls.
 */
// clang-format off
- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document
    NS_SWIFT_NAME(setData(_:forDocument:));
// clang-format on

/**
 * Writes to the document referred to by `document`. If the document doesn't yet exist,
 * this method creates it and then sets the data. If you pass `merge:YES`, the provided data will be
 * merged into any existing document.
 *
 * @param data An `NSDictionary` that contains the fields and data to write to the document.
 * @param document A reference to the document whose data should be overwritten.
 * @param merge Whether to merge the provided data into any existing document.
 * @return This `FIRTransaction` instance. Used for chaining method calls.
 */
// clang-format off
- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document
                      merge:(BOOL)merge
    NS_SWIFT_NAME(setData(_:forDocument:merge:));
// clang-format on

/**
 * Writes to the document referred to by `document` and only replace the fields
 * specified under `mergeFields`. Any field that is not specified in `mergeFields`
 * is ignored and remains untouched. If the document doesn't yet exist,
 * this method creates it and then sets the data.
 *
 * It is an error to include a field in `mergeFields` that does not have a corresponding
 * value in the `data` dictionary.
 *
 * @param data An `NSDictionary` containing the fields that make up the document
 * to be written.
 * @param document A reference to the document whose data should be overwritten.
 * @param mergeFields An `NSArray` that contains a list of `NSString` or `FIRFieldPath` elements
 *     specifying which fields to merge. Fields can contain dots to reference nested fields within
 *     the document.
 * @return This `FIRTransaction` instance. Used for chaining method calls.
 */
// clang-format off
- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document
                mergeFields:(NSArray<id> *)mergeFields
    NS_SWIFT_NAME(setData(_:forDocument:mergeFields:));
// clang-format on

/**
 * Updates fields in the document referred to by `document`.
 * If the document does not exist, the transaction will fail.
 *
 * @param fields An `NSDictionary` containing the fields (expressed as an `NSString` or
 * `FIRFieldPath`) and values with which to update the document.
 * @param document A reference to the document whose data should be updated.
 * @return This `FIRTransaction` instance. Used for chaining method calls.
 */
// clang-format off
- (FIRTransaction *)updateData:(NSDictionary<id, id> *)fields
                   forDocument:(FIRDocumentReference *)document
    NS_SWIFT_NAME(updateData(_:forDocument:));
// clang-format on

/**
 * Deletes the document referred to by `document`.
 *
 * @param document A reference to the document that should be deleted.
 * @return This `FIRTransaction` instance. Used for chaining method calls.
 */
- (FIRTransaction *)deleteDocument:(FIRDocumentReference *)document
    NS_SWIFT_NAME(deleteDocument(_:));

/**
 * Reads the document referenced by `document`.
 *
 * @param document A reference to the document to be read.
 * @param error An out parameter to capture an error, if one occurred.
 */
- (FIRDocumentSnapshot *_Nullable)getDocument:(FIRDocumentReference *)document
                                        error:(NSError *__autoreleasing *)error
    NS_SWIFT_NAME(getDocument(_:));

@end

NS_ASSUME_NONNULL_END
