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

#import "FIRFirestore.h"

#include <memory>
#include <string>

#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/auth/credentials_provider.h"
#include "Firestore/core/src/util/async_queue.h"

@class FIRApp;
@class FSTFirestoreClient;
@class FSTUserDataReader;

namespace firebase {
namespace firestore {
namespace remote {
class FirebaseMetadataProvider;
}  // namespace remote
}  // namespace firestore
}  // namespace firebase

namespace api = firebase::firestore::api;
namespace auth = firebase::firestore::auth;
namespace model = firebase::firestore::model;
namespace remote = firebase::firestore::remote;
namespace util = firebase::firestore::util;

NS_ASSUME_NONNULL_BEGIN

/** Provides a registry management interface for FIRFirestore instances. */
@protocol FSTFirestoreInstanceRegistry

/** Removes the FIRFirestore instance with given database name from registry. */
- (void)removeInstanceWithDatabase:(NSString *)database;

@end

@interface FIRFirestore (/* Init */)

/**
 * Initializes a Firestore object with all the required parameters directly. This exists so that
 * tests can create FIRFirestore objects without needing FIRApp.
 */
- (instancetype)initWithDatabaseID:(model::DatabaseId)databaseID
                    persistenceKey:(std::string)persistenceKey
               credentialsProvider:(std::shared_ptr<auth::CredentialsProvider>)credentialsProvider
                       workerQueue:(std::shared_ptr<util::AsyncQueue>)workerQueue
          firebaseMetadataProvider:
              (std::unique_ptr<remote::FirebaseMetadataProvider>)firebaseMetadataProvider
                       firebaseApp:(FIRApp *)app
                  instanceRegistry:(nullable id<FSTFirestoreInstanceRegistry>)registry;
@end

/** Internal FIRFirestore API we don't want exposed in our public header files. */
@interface FIRFirestore (Internal)

+ (FIRFirestore *)recoverFromFirestore:(std::shared_ptr<api::Firestore>)firestore;

- (void)terminateInternalWithCompletion:(nullable void (^)(NSError *_Nullable error))completion;

- (const std::shared_ptr<util::AsyncQueue> &)workerQueue;

@property(nonatomic, assign, readonly) std::shared_ptr<api::Firestore> wrapped;

@property(nonatomic, assign, readonly) const model::DatabaseId &databaseID;
@property(nonatomic, strong, readonly) FSTUserDataReader *dataReader;

@end

NS_ASSUME_NONNULL_END
