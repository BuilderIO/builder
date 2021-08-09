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

#import "Firestore/Source/API/FIRDocumentChange+Internal.h"

#import "Firestore/Source/API/FIRDocumentSnapshot+Internal.h"

#include "Firestore/core/src/api/document_change.h"
#include "Firestore/core/src/util/hard_assert.h"

using firebase::firestore::api::DocumentChange;

NS_ASSUME_NONNULL_BEGIN

namespace {

/**
 * Converts from C++ document change indexes to Objective-C document change
 * indexes. Objective-C's NSNotFound is signed NSIntegerMax, not unsigned -1.
 */
constexpr NSUInteger MakeIndex(size_t index) {
  return index == DocumentChange::npos ? NSNotFound : index;
}

}  // namespace

@implementation FIRDocumentChange {
  DocumentChange _documentChange;
}

- (instancetype)initWithDocumentChange:(DocumentChange &&)documentChange {
  if (self = [super init]) {
    _documentChange = std::move(documentChange);
  }
  return self;
}

- (BOOL)isEqual:(nullable id)other {
  if (other == self) return YES;
  if (![other isKindOfClass:[FIRDocumentChange class]]) return NO;

  FIRDocumentChange *change = (FIRDocumentChange *)other;
  return _documentChange == change->_documentChange;
}

- (NSUInteger)hash {
  return _documentChange.Hash();
}

- (FIRDocumentChangeType)type {
  switch (_documentChange.type()) {
    case DocumentChange::Type::Added:
      return FIRDocumentChangeTypeAdded;
    case DocumentChange::Type::Modified:
      return FIRDocumentChangeTypeModified;
    case DocumentChange::Type::Removed:
      return FIRDocumentChangeTypeRemoved;
  }

  HARD_FAIL("Unknown DocumentChange::Type: %s", _documentChange.type());
}

- (FIRQueryDocumentSnapshot *)document {
  return [[FIRQueryDocumentSnapshot alloc] initWithSnapshot:_documentChange.document()];
}

- (NSUInteger)oldIndex {
  return MakeIndex(_documentChange.old_index());
}

- (NSUInteger)newIndex {
  return MakeIndex(_documentChange.new_index());
}

@end

NS_ASSUME_NONNULL_END
