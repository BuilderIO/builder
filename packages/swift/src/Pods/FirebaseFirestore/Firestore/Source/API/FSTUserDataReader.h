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

#include <vector>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/nanopb/message.h"

@class FIRTimestamp;

namespace core = firebase::firestore::core;
namespace model = firebase::firestore::model;
namespace nanopb = firebase::firestore::nanopb;

NS_ASSUME_NONNULL_BEGIN

/**
 * An internal representation of FIRDocumentReference, representing a key in a specific database.
 * This is necessary because keys assume a database from context (usually the current one).
 * FSTDocumentKeyReference binds a key to a specific databaseID.
 *
 * TODO(b/64160088): Make DocumentKey aware of the specific databaseID it is tied to.
 */
@interface FSTDocumentKeyReference : NSObject

- (instancetype)init NS_UNAVAILABLE;

- (instancetype)initWithKey:(model::DocumentKey)key
                 databaseID:(model::DatabaseId)databaseID NS_DESIGNATED_INITIALIZER;

- (const model::DocumentKey &)key;

@property(nonatomic, assign, readonly) const model::DatabaseId &databaseID;

@end

/**
 * An interface that allows arbitrary pre-converting of user data.
 *
 * Returns the converted value (can return back the input to act as a no-op).
 */
typedef id _Nullable (^FSTPreConverterBlock)(id _Nullable);

/**
 * Helper for parsing raw user input (provided via the API) into internal model classes.
 */
@interface FSTUserDataReader : NSObject

- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithDatabaseID:(model::DatabaseId)databaseID
                      preConverter:(FSTPreConverterBlock)preConverter NS_DESIGNATED_INITIALIZER;

/** Parse document data from a non-merge setData call.*/
- (core::ParsedSetData)parsedSetData:(id)input;

/** Parse document data from a setData call with `merge:YES`. */
- (core::ParsedSetData)parsedMergeData:(id)input fieldMask:(nullable NSArray<id> *)fieldMask;

/** Parse update data from an updateData call. */
- (core::ParsedUpdateData)parsedUpdateData:(id)input;

/** Parse a "query value" (e.g. value in a where filter or a value in a cursor bound). */
- (nanopb::Message<firebase::firestore::google_firestore_v1_Value>)parsedQueryValue:(id)input;

/**
 * Parse a "query value" (e.g. value in a where filter or a value in a cursor bound).
 *
 * @param allowArrays Whether the query value is an array that may directly contain additional
 * arrays (e.g.) the operand of an `in` query).
 */
- (nanopb::Message<firebase::firestore::google_firestore_v1_Value>)parsedQueryValue:(id)input
                                                                        allowArrays:
                                                                            (bool)allowArrays;

@end

NS_ASSUME_NONNULL_END
