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

#include "Firestore/core/src/core/transaction.h"

@class FIRFirestore;

namespace core = firebase::firestore::core;

NS_ASSUME_NONNULL_BEGIN

@interface FIRTransaction (Internal)

+ (instancetype)transactionWithInternalTransaction:(std::shared_ptr<core::Transaction>)transaction
                                         firestore:(FIRFirestore *)firestore;

@end

NS_ASSUME_NONNULL_END
