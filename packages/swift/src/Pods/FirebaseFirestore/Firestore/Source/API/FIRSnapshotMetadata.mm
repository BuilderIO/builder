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

#include <utility>

#import "Firestore/Source/API/FIRSnapshotMetadata+Internal.h"

#include "Firestore/core/src/api/snapshot_metadata.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRSnapshotMetadata {
  api::SnapshotMetadata _metadata;
}

- (instancetype)initWithMetadata:(api::SnapshotMetadata)metadata {
  if (self = [super init]) {
    _metadata = std::move(metadata);
  }
  return self;
}

- (instancetype)initWithPendingWrites:(bool)pendingWrites fromCache:(bool)fromCache {
  api::SnapshotMetadata wrapped(pendingWrites, fromCache);
  return [self initWithMetadata:std::move(wrapped)];
}

// NSObject Methods
- (BOOL)isEqual:(nullable id)other {
  if (other == self) return YES;
  if (![other isKindOfClass:[FIRSnapshotMetadata class]]) return NO;

  FIRSnapshotMetadata *otherMetadata = other;
  return _metadata == otherMetadata->_metadata;
}

- (NSUInteger)hash {
  return _metadata.Hash();
}

- (BOOL)hasPendingWrites {
  return _metadata.pending_writes();
}

- (BOOL)isFromCache {
  return _metadata.from_cache();
}

@end

NS_ASSUME_NONNULL_END
