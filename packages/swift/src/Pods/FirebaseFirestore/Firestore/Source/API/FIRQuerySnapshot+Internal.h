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

#import "FIRQuerySnapshot.h"

#include <memory>

#include "Firestore/core/src/api/api_fwd.h"
#include "Firestore/core/src/core/core_fwd.h"

@class FIRFirestore;
@class FIRSnapshotMetadata;

namespace api = firebase::firestore::api;
namespace core = firebase::firestore::core;

NS_ASSUME_NONNULL_BEGIN

/** Internal FIRQuerySnapshot API we don't want exposed in our public header files. */
@interface FIRQuerySnapshot (/* Init */)

- (instancetype)initWithSnapshot:(api::QuerySnapshot &&)snapshot NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithFirestore:(std::shared_ptr<api::Firestore>)firestore
                    originalQuery:(core::Query)query
                         snapshot:(core::ViewSnapshot &&)snapshot
                         metadata:(api::SnapshotMetadata)metadata;

@end

NS_ASSUME_NONNULL_END
