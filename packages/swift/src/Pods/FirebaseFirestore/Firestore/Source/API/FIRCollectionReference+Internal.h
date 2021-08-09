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

#import "FIRCollectionReference.h"

#include <memory>

#include "Firestore/core/src/api/api_fwd.h"

namespace firebase {
namespace firestore {
namespace model {
class ResourcePath;
}  // namespace model
}  // namespace firestore
}  // namespace firebase

namespace api = firebase::firestore::api;
namespace model = firebase::firestore::model;

NS_ASSUME_NONNULL_BEGIN

/** Internal FIRCollectionReference API we don't want exposed in our public header files. */
@interface FIRCollectionReference (/* Init */)

- (instancetype)initWithReference:(api::CollectionReference &&)reference NS_DESIGNATED_INITIALIZER;

// Mark the super class designated initializer unavailable.
- (instancetype)initWithQuery:(api::Query &&)query NS_UNAVAILABLE;

- (instancetype)initWithPath:(model::ResourcePath)path
                   firestore:(std::shared_ptr<api::Firestore>)firestore;
@end

NS_ASSUME_NONNULL_END
