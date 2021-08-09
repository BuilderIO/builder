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

#import "FIRDocumentReference+Internal.h"

#include <memory>
#include <utility>

#import "FIRFirestoreErrors.h"
#import "Firestore/Source/API/FIRCollectionReference+Internal.h"
#import "Firestore/Source/API/FIRDocumentReference+Internal.h"
#import "Firestore/Source/API/FIRDocumentSnapshot+Internal.h"
#import "Firestore/Source/API/FIRFirestore+Internal.h"
#import "Firestore/Source/API/FIRFirestoreSource+Internal.h"
#import "Firestore/Source/API/FIRListenerRegistration+Internal.h"
#import "Firestore/Source/API/FSTUserDataReader.h"

#include "Firestore/core/src/api/collection_reference.h"
#include "Firestore/core/src/api/document_reference.h"
#include "Firestore/core/src/api/document_snapshot.h"
#include "Firestore/core/src/api/source.h"
#include "Firestore/core/src/core/event_listener.h"
#include "Firestore/core/src/core/listen_options.h"
#include "Firestore/core/src/core/user_data.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_apple.h"

namespace util = firebase::firestore::util;
using firebase::firestore::api::CollectionReference;
using firebase::firestore::api::DocumentReference;
using firebase::firestore::api::DocumentSnapshot;
using firebase::firestore::api::DocumentSnapshotListener;
using firebase::firestore::api::Firestore;
using firebase::firestore::api::ListenerRegistration;
using firebase::firestore::api::Source;
using firebase::firestore::api::MakeSource;
using firebase::firestore::core::EventListener;
using firebase::firestore::core::ListenOptions;
using firebase::firestore::core::ParsedSetData;
using firebase::firestore::core::ParsedUpdateData;
using firebase::firestore::model::DocumentKey;
using firebase::firestore::model::ResourcePath;
using firebase::firestore::util::StatusOr;
using firebase::firestore::util::StatusOrCallback;
using firebase::firestore::util::ThrowInvalidArgument;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - FIRDocumentReference

@implementation FIRDocumentReference {
  DocumentReference _documentReference;
}

- (instancetype)initWithReference:(DocumentReference &&)reference {
  if (self = [super init]) {
    _documentReference = std::move(reference);
  }
  return self;
}

- (instancetype)initWithPath:(ResourcePath)path firestore:(std::shared_ptr<Firestore>)firestore {
  if (path.size() % 2 != 0) {
    ThrowInvalidArgument("Invalid document reference. Document references must have an even "
                         "number of segments, but %s has %s",
                         path.CanonicalString(), path.size());
  }
  return [self initWithKey:DocumentKey{std::move(path)} firestore:firestore];
}

- (instancetype)initWithKey:(DocumentKey)key firestore:(std::shared_ptr<Firestore>)firestore {
  DocumentReference delegate{std::move(key), firestore};
  return [self initWithReference:std::move(delegate)];
}

#pragma mark - NSObject Methods

- (BOOL)isEqual:(nullable id)other {
  if (other == self) return YES;
  if (![[other class] isEqual:[self class]]) return NO;

  return _documentReference == static_cast<FIRDocumentReference *>(other)->_documentReference;
}

- (NSUInteger)hash {
  return _documentReference.Hash();
}

#pragma mark - Public Methods

@dynamic firestore;

- (FIRFirestore *)firestore {
  return [FIRFirestore recoverFromFirestore:_documentReference.firestore()];
}

- (NSString *)documentID {
  return util::MakeNSString(_documentReference.document_id());
}

- (FIRCollectionReference *)parent {
  return [[FIRCollectionReference alloc] initWithReference:_documentReference.Parent()];
}

- (NSString *)path {
  return util::MakeNSString(_documentReference.Path());
}

- (FIRCollectionReference *)collectionWithPath:(NSString *)collectionPath {
  if (!collectionPath) {
    ThrowInvalidArgument("Collection path cannot be nil.");
  }
  if (!collectionPath.length) {
    ThrowInvalidArgument("Collection path cannot be empty.");
  }

  CollectionReference child =
      _documentReference.GetCollectionReference(util::MakeString(collectionPath));
  return [[FIRCollectionReference alloc] initWithReference:std::move(child)];
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData {
  [self setData:documentData merge:NO completion:nil];
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData merge:(BOOL)merge {
  [self setData:documentData merge:merge completion:nil];
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData
    mergeFields:(NSArray<id> *)mergeFields {
  [self setData:documentData mergeFields:mergeFields completion:nil];
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData
     completion:(nullable void (^)(NSError *_Nullable error))completion {
  [self setData:documentData merge:NO completion:completion];
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData
          merge:(BOOL)merge
     completion:(nullable void (^)(NSError *_Nullable error))completion {
  auto dataReader = self.firestore.dataReader;
  ParsedSetData parsed = merge ? [dataReader parsedMergeData:documentData fieldMask:nil]
                               : [dataReader parsedSetData:documentData];
  _documentReference.SetData(std::move(parsed), util::MakeCallback(completion));
}

- (void)setData:(NSDictionary<NSString *, id> *)documentData
    mergeFields:(NSArray<id> *)mergeFields
     completion:(nullable void (^)(NSError *_Nullable error))completion {
  ParsedSetData parsed = [self.firestore.dataReader parsedMergeData:documentData
                                                          fieldMask:mergeFields];
  _documentReference.SetData(std::move(parsed), util::MakeCallback(completion));
}

- (void)updateData:(NSDictionary<id, id> *)fields {
  [self updateData:fields completion:nil];
}

- (void)updateData:(NSDictionary<id, id> *)fields
        completion:(nullable void (^)(NSError *_Nullable error))completion {
  ParsedUpdateData parsed = [self.firestore.dataReader parsedUpdateData:fields];
  _documentReference.UpdateData(std::move(parsed), util::MakeCallback(completion));
}

- (void)deleteDocument {
  [self deleteDocumentWithCompletion:nil];
}

- (void)deleteDocumentWithCompletion:(nullable void (^)(NSError *_Nullable error))completion {
  _documentReference.DeleteDocument(util::MakeCallback(completion));
}

- (void)getDocumentWithCompletion:(FIRDocumentSnapshotBlock)completion {
  _documentReference.GetDocument(Source::Default, [self wrapDocumentSnapshotBlock:completion]);
}

- (void)getDocumentWithSource:(FIRFirestoreSource)source
                   completion:(FIRDocumentSnapshotBlock)completion {
  _documentReference.GetDocument(MakeSource(source), [self wrapDocumentSnapshotBlock:completion]);
}

- (id<FIRListenerRegistration>)addSnapshotListener:(FIRDocumentSnapshotBlock)listener {
  return [self addSnapshotListenerWithIncludeMetadataChanges:NO listener:listener];
}

- (id<FIRListenerRegistration>)
    addSnapshotListenerWithIncludeMetadataChanges:(BOOL)includeMetadataChanges
                                         listener:(FIRDocumentSnapshotBlock)listener {
  ListenOptions options = ListenOptions::FromIncludeMetadataChanges(includeMetadataChanges);
  return [self addSnapshotListenerInternalWithOptions:options listener:listener];
}

- (id<FIRListenerRegistration>)addSnapshotListenerInternalWithOptions:(ListenOptions)internalOptions
                                                             listener:(FIRDocumentSnapshotBlock)
                                                                          listener {
  std::unique_ptr<ListenerRegistration> result = _documentReference.AddSnapshotListener(
      std::move(internalOptions), [self wrapDocumentSnapshotBlock:listener]);
  return [[FSTListenerRegistration alloc] initWithRegistration:std::move(result)];
}

- (DocumentSnapshotListener)wrapDocumentSnapshotBlock:(FIRDocumentSnapshotBlock)block {
  class Converter : public EventListener<DocumentSnapshot> {
   public:
    explicit Converter(FIRDocumentSnapshotBlock block) : block_(block) {
    }

    void OnEvent(StatusOr<DocumentSnapshot> maybe_snapshot) override {
      if (maybe_snapshot.ok()) {
        FIRDocumentSnapshot *result =
            [[FIRDocumentSnapshot alloc] initWithSnapshot:std::move(maybe_snapshot).ValueOrDie()];
        block_(result, nil);
      } else {
        block_(nil, util::MakeNSError(maybe_snapshot.status()));
      }
    }

   private:
    FIRDocumentSnapshotBlock block_;
  };
  return absl::make_unique<Converter>(block);
}

@end

#pragma mark - FIRDocumentReference (Internal)

@implementation FIRDocumentReference (Internal)

- (const api::DocumentReference &)internalReference {
  return _documentReference;
}

- (const DocumentKey &)key {
  return _documentReference.key();
}

@end

NS_ASSUME_NONNULL_END
