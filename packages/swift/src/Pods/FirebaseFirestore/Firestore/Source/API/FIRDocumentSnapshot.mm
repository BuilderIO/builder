/*
 * Copyright 2017 Google LLC
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

#import "FIRDocumentSnapshot+Internal.h"

#include <utility>
#include <vector>

#include "Firestore/core/src/util/warnings.h"

#import "Firestore/Source/API/FIRDocumentReference+Internal.h"
#import "Firestore/Source/API/FIRFieldPath+Internal.h"
#import "Firestore/Source/API/FIRFirestore+Internal.h"
#import "Firestore/Source/API/FIRGeoPoint+Internal.h"
#import "Firestore/Source/API/FIRSnapshotMetadata+Internal.h"
#import "Firestore/Source/API/FIRTimestamp+Internal.h"
#import "Firestore/Source/API/FSTUserDataWriter.h"
#import "Firestore/Source/API/converters.h"

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/api/document_reference.h"
#include "Firestore/core/src/api/document_snapshot.h"
#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/api/settings.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/remote/serializer.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/string_apple.h"

namespace util = firebase::firestore::util;
using firebase::firestore::google_firestore_v1_Value;
using firebase::firestore::api::DocumentSnapshot;
using firebase::firestore::api::Firestore;
using firebase::firestore::api::MakeFIRGeoPoint;
using firebase::firestore::api::MakeFIRTimestamp;
using firebase::firestore::api::SnapshotMetadata;
using firebase::firestore::model::DatabaseId;
using firebase::firestore::model::Document;
using firebase::firestore::model::DocumentKey;
using firebase::firestore::model::FieldPath;
using firebase::firestore::model::ObjectValue;
using firebase::firestore::remote::Serializer;
using firebase::firestore::nanopb::MakeNSData;
using firebase::firestore::util::MakeString;
using firebase::firestore::util::ThrowInvalidArgument;
using firebase::firestore::google_firestore_v1_Value;

NS_ASSUME_NONNULL_BEGIN

@implementation FIRDocumentSnapshot {
  DocumentSnapshot _snapshot;

  std::unique_ptr<Serializer> _serializer;
  FIRSnapshotMetadata *_cachedMetadata;
}

- (instancetype)initWithSnapshot:(DocumentSnapshot &&)snapshot {
  if (self = [super init]) {
    _snapshot = std::move(snapshot);
    _serializer.reset(new Serializer(_snapshot.firestore()->database_id()));
  }
  return self;
}

- (instancetype)initWithFirestore:(FIRFirestore *)firestore
                      documentKey:(DocumentKey)documentKey
                         document:(const absl::optional<Document> &)document
                         metadata:(SnapshotMetadata)metadata {
  DocumentSnapshot wrapped;
  if (document.has_value()) {
    wrapped =
        DocumentSnapshot::FromDocument(firestore.wrapped, document.value(), std::move(metadata));
  } else {
    wrapped = DocumentSnapshot::FromNoDocument(firestore.wrapped, std::move(documentKey),
                                               std::move(metadata));
  }
  _serializer.reset(new Serializer(firestore.databaseID));
  return [self initWithSnapshot:std::move(wrapped)];
}

- (instancetype)initWithFirestore:(FIRFirestore *)firestore
                      documentKey:(DocumentKey)documentKey
                         document:(const absl::optional<Document> &)document
                        fromCache:(bool)fromCache
                 hasPendingWrites:(bool)hasPendingWrites {
  return [self initWithFirestore:firestore
                     documentKey:std::move(documentKey)
                        document:document
                        metadata:SnapshotMetadata(hasPendingWrites, fromCache)];
}

// NSObject Methods
- (BOOL)isEqual:(nullable id)other {
  if (other == self) return YES;
  // self class could be FIRDocumentSnapshot or subtype. So we compare with base type explicitly.
  if (![other isKindOfClass:[FIRDocumentSnapshot class]]) return NO;

  return _snapshot == static_cast<FIRDocumentSnapshot *>(other)->_snapshot;
}

- (NSUInteger)hash {
  return _snapshot.Hash();
}

@dynamic exists;

- (BOOL)exists {
  return _snapshot.exists();
}

- (const absl::optional<Document> &)internalDocument {
  return _snapshot.internal_document();
}

- (FIRDocumentReference *)reference {
  return [[FIRDocumentReference alloc] initWithReference:_snapshot.CreateReference()];
}

- (NSString *)documentID {
  return util::MakeNSString(_snapshot.document_id());
}

@dynamic metadata;

- (FIRSnapshotMetadata *)metadata {
  if (!_cachedMetadata) {
    _cachedMetadata = [[FIRSnapshotMetadata alloc] initWithMetadata:_snapshot.metadata()];
  }
  return _cachedMetadata;
}

- (nullable NSDictionary<NSString *, id> *)data {
  return [self dataWithServerTimestampBehavior:FIRServerTimestampBehaviorNone];
}

- (nullable NSDictionary<NSString *, id> *)dataWithServerTimestampBehavior:
    (FIRServerTimestampBehavior)serverTimestampBehavior {
  absl::optional<google_firestore_v1_Value> data = _snapshot.GetValue(FieldPath::EmptyPath());
  if (!data) return nil;

  FSTUserDataWriter *dataWriter =
      [[FSTUserDataWriter alloc] initWithFirestore:_snapshot.firestore()
                           serverTimestampBehavior:serverTimestampBehavior];
  return [dataWriter convertedValue:*data];
}

- (nullable id)valueForField:(id)field {
  return [self valueForField:field serverTimestampBehavior:FIRServerTimestampBehaviorNone];
}

- (nullable id)valueForField:(id)field
     serverTimestampBehavior:(FIRServerTimestampBehavior)serverTimestampBehavior {
  FieldPath fieldPath;
  if ([field isKindOfClass:[NSString class]]) {
    fieldPath = FieldPath::FromDotSeparatedString(MakeString(field));
  } else if ([field isKindOfClass:[FIRFieldPath class]]) {
    fieldPath = ((FIRFieldPath *)field).internalValue;
  } else {
    ThrowInvalidArgument("Subscript key must be an NSString or FIRFieldPath.");
  }
  absl::optional<google_firestore_v1_Value> fieldValue = _snapshot.GetValue(fieldPath);
  if (!fieldValue) return nil;
  FSTUserDataWriter *dataWriter =
      [[FSTUserDataWriter alloc] initWithFirestore:_snapshot.firestore()
                           serverTimestampBehavior:serverTimestampBehavior];
  return [dataWriter convertedValue:*fieldValue];
}

- (nullable id)objectForKeyedSubscript:(id)key {
  return [self valueForField:key];
}

@end

@implementation FIRQueryDocumentSnapshot

- (NSDictionary<NSString *, id> *)data {
  NSDictionary<NSString *, id> *data = [super data];
  HARD_ASSERT(data, "Document in a QueryDocumentSnapshot should exist");
  return data;
}

- (NSDictionary<NSString *, id> *)dataWithServerTimestampBehavior:
    (FIRServerTimestampBehavior)serverTimestampBehavior {
  NSDictionary<NSString *, id> *data =
      [super dataWithServerTimestampBehavior:serverTimestampBehavior];
  HARD_ASSERT(data, "Document in a QueryDocumentSnapshot should exist");
  return data;
}

@end

NS_ASSUME_NONNULL_END
