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

#import "FIRDocumentSnapshot.h"

#include <memory>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/model/model_fwd.h"

@class FIRFirestore;

namespace api = firebase::firestore::api;
namespace model = firebase::firestore::model;

NS_ASSUME_NONNULL_BEGIN

@interface FIRDocumentSnapshot (/* Init */)

- (instancetype)initWithSnapshot:(api::DocumentSnapshot &&)snapshot NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithFirestore:(FIRFirestore *)firestore
                      documentKey:(model::DocumentKey)documentKey
                         document:(const absl::optional<model::Document> &)document
                         metadata:(api::SnapshotMetadata)metadata;

- (instancetype)initWithFirestore:(FIRFirestore *)firestore
                      documentKey:(model::DocumentKey)documentKey
                         document:(const absl::optional<model::Document> &)document
                        fromCache:(bool)fromCache
                 hasPendingWrites:(bool)hasPendingWrites;

@end

/** Internal FIRDocumentSnapshot API we don't want exposed in our public header files. */
@interface FIRDocumentSnapshot (Internal)

- (const absl::optional<model::Document> &)internalDocument;

@end

NS_ASSUME_NONNULL_END
