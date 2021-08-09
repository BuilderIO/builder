/*
 * Copyright 2021 Google LLC
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

#import <Foundation/Foundation.h>

#include <memory>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/Source/API/FIRDocumentSnapshot+Internal.h"
#include "Firestore/core/src/api/api_fwd.h"

namespace api = firebase::firestore::api;

/**
 * Converts Firestore's internal types to the API types that we expose to the
 * user.
 */
@interface FSTUserDataWriter : NSObject

- (instancetype)init NS_UNAVAILABLE;

- (instancetype)initWithFirestore:(std::shared_ptr<api::Firestore>)firestore
          serverTimestampBehavior:(FIRServerTimestampBehavior)serverTimestampBehavior;

- (id)convertedValue:(const firebase::firestore::google_firestore_v1_Value&)value;

@end
