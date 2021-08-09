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

#import "FIRSnapshotMetadata.h"

#import <Foundation/Foundation.h>

#include "Firestore/core/src/api/snapshot_metadata.h"

namespace api = firebase::firestore::api;

NS_ASSUME_NONNULL_BEGIN

@interface FIRSnapshotMetadata (/* Init */)

- (instancetype)initWithMetadata:(api::SnapshotMetadata)metadata NS_DESIGNATED_INITIALIZER;

- (instancetype)initWithPendingWrites:(bool)pendingWrites fromCache:(bool)fromCache;

@end

NS_ASSUME_NONNULL_END
