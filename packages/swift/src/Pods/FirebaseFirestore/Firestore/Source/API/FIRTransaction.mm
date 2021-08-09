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

#import "FIRTransaction.h"

#include <memory>
#include <utility>
#include <vector>

#import "Firestore/Source/API/FIRDocumentReference+Internal.h"
#import "Firestore/Source/API/FIRDocumentSnapshot+Internal.h"
#import "Firestore/Source/API/FIRFirestore+Internal.h"
#import "Firestore/Source/API/FIRTransaction+Internal.h"
#import "Firestore/Source/API/FSTUserDataReader.h"

#include "Firestore/core/src/core/transaction.h"
#include "Firestore/core/src/core/user_data.h"
#include "Firestore/core/src/model/document.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"

using firebase::firestore::core::ParsedSetData;
using firebase::firestore::core::ParsedUpdateData;
using firebase::firestore::core::Transaction;
using firebase::firestore::model::Document;
using firebase::firestore::util::MakeNSError;
using firebase::firestore::util::StatusOr;
using firebase::firestore::util::ThrowInvalidArgument;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - FIRTransaction

@interface FIRTransaction ()

- (instancetype)initWithTransaction:(std::shared_ptr<Transaction>)transaction
                          firestore:(FIRFirestore *)firestore NS_DESIGNATED_INITIALIZER;

@property(nonatomic, strong, readonly) FIRFirestore *firestore;
@end

@implementation FIRTransaction (Internal)

+ (instancetype)transactionWithInternalTransaction:(std::shared_ptr<Transaction>)transaction
                                         firestore:(FIRFirestore *)firestore {
  return [[FIRTransaction alloc] initWithTransaction:std::move(transaction) firestore:firestore];
}

@end

@implementation FIRTransaction {
  std::shared_ptr<Transaction> _internalTransaction;
}

- (instancetype)initWithTransaction:(std::shared_ptr<Transaction>)transaction
                          firestore:(FIRFirestore *)firestore {
  self = [super init];
  if (self) {
    _internalTransaction = std::move(transaction);
    _firestore = firestore;
  }
  return self;
}

- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document {
  return [self setData:data forDocument:document merge:NO];
}

- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document
                      merge:(BOOL)merge {
  [self validateReference:document];
  ParsedSetData parsed = merge ? [self.firestore.dataReader parsedMergeData:data fieldMask:nil]
                               : [self.firestore.dataReader parsedSetData:data];
  _internalTransaction->Set(document.key, std::move(parsed));
  return self;
}

- (FIRTransaction *)setData:(NSDictionary<NSString *, id> *)data
                forDocument:(FIRDocumentReference *)document
                mergeFields:(NSArray<id> *)mergeFields {
  [self validateReference:document];
  ParsedSetData parsed = [self.firestore.dataReader parsedMergeData:data fieldMask:mergeFields];
  _internalTransaction->Set(document.key, std::move(parsed));
  return self;
}

- (FIRTransaction *)updateData:(NSDictionary<id, id> *)fields
                   forDocument:(FIRDocumentReference *)document {
  [self validateReference:document];
  ParsedUpdateData parsed = [self.firestore.dataReader parsedUpdateData:fields];
  _internalTransaction->Update(document.key, std::move(parsed));
  return self;
}

- (FIRTransaction *)deleteDocument:(FIRDocumentReference *)document {
  [self validateReference:document];
  _internalTransaction->Delete(document.key);
  return self;
}

- (void)getDocument:(FIRDocumentReference *)document
         completion:(void (^)(FIRDocumentSnapshot *_Nullable document,
                              NSError *_Nullable error))completion {
  [self validateReference:document];
  _internalTransaction->Lookup(
      {document.key},
      [self, document, completion](const StatusOr<std::vector<Document>> &maybe_documents) {
        if (!maybe_documents.ok()) {
          completion(nil, MakeNSError(maybe_documents.status()));
          return;
        }

        const auto &documents = maybe_documents.ValueOrDie();
        HARD_ASSERT(documents.size() == 1, "Mismatch in docs returned from document lookup.");
        const Document &internalDoc = documents.front();
        if (internalDoc->is_found_document()) {
          FIRDocumentSnapshot *doc =
              [[FIRDocumentSnapshot alloc] initWithFirestore:self.firestore
                                                 documentKey:internalDoc->key()
                                                    document:internalDoc
                                                   fromCache:false
                                            hasPendingWrites:false];
          completion(doc, nil);
        } else if (internalDoc->is_no_document()) {
          FIRDocumentSnapshot *doc = [[FIRDocumentSnapshot alloc] initWithFirestore:self.firestore
                                                                        documentKey:document.key
                                                                           document:absl::nullopt
                                                                          fromCache:false
                                                                   hasPendingWrites:false];
          completion(doc, nil);
        } else {
          HARD_FAIL("BatchGetDocumentsRequest returned unexpected document type: %s",
                    internalDoc.ToString());
        }
      });
}

- (FIRDocumentSnapshot *_Nullable)getDocument:(FIRDocumentReference *)document
                                        error:(NSError *__autoreleasing *)error {
  [self validateReference:document];
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  __block FIRDocumentSnapshot *result;
  // We have to explicitly assign the innerError into a local to cause it to retain correctly.
  __block NSError *outerError = nil;
  [self getDocument:document
         completion:^(FIRDocumentSnapshot *_Nullable snapshot, NSError *_Nullable innerError) {
           result = snapshot;
           outerError = innerError;
           dispatch_semaphore_signal(semaphore);
         }];
  dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
  if (error) {
    *error = outerError;
  }
  return result;
}

- (void)validateReference:(FIRDocumentReference *)reference {
  if (reference.firestore != self.firestore) {
    ThrowInvalidArgument("Provided document reference is from a different Cloud Firestore "
                         "instance.");
  }
}

@end

NS_ASSUME_NONNULL_END
