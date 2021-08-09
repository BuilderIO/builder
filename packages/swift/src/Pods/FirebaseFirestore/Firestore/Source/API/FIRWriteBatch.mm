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

#import "Firestore/Source/API/FIRWriteBatch+Internal.h"

#import "Firestore/Source/API/FIRDocumentReference+Internal.h"
#import "Firestore/Source/API/FSTUserDataReader.h"

#include "Firestore/core/src/api/write_batch.h"
#include "Firestore/core/src/core/user_data.h"
#include "Firestore/core/src/util/delayed_constructor.h"
#include "Firestore/core/src/util/error_apple.h"

namespace util = firebase::firestore::util;
using firebase::firestore::core::ParsedSetData;
using firebase::firestore::core::ParsedUpdateData;

NS_ASSUME_NONNULL_BEGIN

#pragma mark - FIRWriteBatch

@interface FIRWriteBatch ()

- (instancetype)initWithDataReader:(FSTUserDataReader *)dataReader
                        writeBatch:(api::WriteBatch &&)writeBatch NS_DESIGNATED_INITIALIZER;

@property(nonatomic, strong, readonly) FSTUserDataReader *dataReader;

@end

@implementation FIRWriteBatch (Internal)

+ (instancetype)writeBatchWithDataReader:(FSTUserDataReader *)dataReader
                              writeBatch:(api::WriteBatch &&)writeBatch {
  return [[FIRWriteBatch alloc] initWithDataReader:dataReader writeBatch:std::move(writeBatch)];
}

@end

@implementation FIRWriteBatch {
  util::DelayedConstructor<api::WriteBatch> _writeBatch;
}

- (instancetype)initWithDataReader:(FSTUserDataReader *)dataReader
                        writeBatch:(api::WriteBatch &&)writeBatch {
  self = [super init];
  if (self) {
    _dataReader = dataReader;
    _writeBatch.Init(std::move(writeBatch));
  }
  return self;
}

- (FIRWriteBatch *)setData:(NSDictionary<NSString *, id> *)data
               forDocument:(FIRDocumentReference *)document {
  return [self setData:data forDocument:document merge:NO];
}

- (FIRWriteBatch *)setData:(NSDictionary<NSString *, id> *)data
               forDocument:(FIRDocumentReference *)document
                     merge:(BOOL)merge {
  ParsedSetData parsed = merge ? [self.dataReader parsedMergeData:data fieldMask:nil]
                               : [self.dataReader parsedSetData:data];
  _writeBatch->SetData(document.internalReference, std::move(parsed));

  return self;
}

- (FIRWriteBatch *)setData:(NSDictionary<NSString *, id> *)data
               forDocument:(FIRDocumentReference *)document
               mergeFields:(NSArray<id> *)mergeFields {
  ParsedSetData parsed = [self.dataReader parsedMergeData:data fieldMask:mergeFields];
  _writeBatch->SetData(document.internalReference, std::move(parsed));

  return self;
}

- (FIRWriteBatch *)updateData:(NSDictionary<id, id> *)fields
                  forDocument:(FIRDocumentReference *)document {
  ParsedUpdateData parsed = [self.dataReader parsedUpdateData:fields];
  _writeBatch->UpdateData(document.internalReference, std::move(parsed));

  return self;
}

- (FIRWriteBatch *)deleteDocument:(FIRDocumentReference *)document {
  _writeBatch->DeleteData(document.internalReference);

  return self;
}

- (void)commit {
  [self commitWithCompletion:nil];
}

- (void)commitWithCompletion:(nullable void (^)(NSError *_Nullable error))completion {
  _writeBatch->Commit(util::MakeCallback(completion));
}

@end

NS_ASSUME_NONNULL_END
