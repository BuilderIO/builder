/*
 * Copyright 2018 Google
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

#import "Firestore/Source/API/FSTFirestoreComponent.h"

#include <memory>
#include <string>
#include <utility>

#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"
#import "Firestore/Source/API/FIRFirestore+Internal.h"
#import "Interop/Auth/Public/FIRAuthInterop.h"

#include "Firestore/core/include/firebase/firestore/firestore_version.h"
#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/auth/credentials_provider.h"
#include "Firestore/core/src/auth/firebase_credentials_provider_apple.h"
#include "Firestore/core/src/remote/firebase_metadata_provider.h"
#include "Firestore/core/src/remote/firebase_metadata_provider_apple.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/memory/memory.h"

namespace util = firebase::firestore::util;
using firebase::firestore::auth::CredentialsProvider;
using firebase::firestore::auth::FirebaseCredentialsProvider;
using firebase::firestore::remote::FirebaseMetadataProviderApple;
using firebase::firestore::util::AsyncQueue;
using firebase::firestore::util::Executor;
using firebase::firestore::util::ThrowInvalidArgument;

NS_ASSUME_NONNULL_BEGIN

@interface FSTFirestoreComponent () <FIRComponentLifecycleMaintainer, FIRLibrary>
@end

@implementation FSTFirestoreComponent

// Explicitly @synthesize because instances is part of the FSTInstanceProvider protocol.
@synthesize instances = _instances;

#pragma mark - Initialization

- (instancetype)initWithApp:(FIRApp *)app {
  self = [super init];
  if (self) {
    _instances = [[NSMutableDictionary alloc] init];

    HARD_ASSERT(app, "Cannot initialize Firestore with a nil FIRApp.");
    _app = app;
  }
  return self;
}

- (NSString *)keyForDatabase:(NSString *)database {
  return [NSString stringWithFormat:@"%@|%@", self.app.name, database];
}

#pragma mark - FSTInstanceProvider Conformance

- (FIRFirestore *)firestoreForDatabase:(NSString *)database {
  if (!database) {
    ThrowInvalidArgument("Database identifier may not be nil.");
  }

  NSString *projectID = self.app.options.projectID;
  if (!projectID) {
    ThrowInvalidArgument("FIROptions.projectID must be set to a valid project ID.");
  }

  NSString *key = [self keyForDatabase:database];

  // Get the component from the container.
  @synchronized(self.instances) {
    FIRFirestore *firestore = _instances[key];
    if (!firestore) {
      std::string queue_name{"com.google.firebase.firestore"};
      if (!self.app.isDefaultApp) {
        absl::StrAppend(&queue_name, ".", util::MakeString(self.app.name));
      }

      auto executor = Executor::CreateSerial(queue_name.c_str());
      auto workerQueue = AsyncQueue::Create(std::move(executor));

      id<FIRAuthInterop> auth = FIR_COMPONENT(FIRAuthInterop, self.app.container);
      auto credentialsProvider = std::make_shared<FirebaseCredentialsProvider>(self.app, auth);

      auto firebaseMetadataProvider = absl::make_unique<FirebaseMetadataProviderApple>(self.app);

      model::DatabaseId databaseID{util::MakeString(projectID), util::MakeString(database)};
      std::string persistenceKey = util::MakeString(self.app.name);
      firestore = [[FIRFirestore alloc] initWithDatabaseID:std::move(databaseID)
                                            persistenceKey:std::move(persistenceKey)
                                       credentialsProvider:std::move(credentialsProvider)
                                               workerQueue:std::move(workerQueue)
                                  firebaseMetadataProvider:std::move(firebaseMetadataProvider)
                                               firebaseApp:self.app
                                          instanceRegistry:self];
      _instances[key] = firestore;
    }
    return firestore;
  }
}

- (void)removeInstanceWithDatabase:(NSString *)database {
  @synchronized(_instances) {
    NSString *key = [self keyForDatabase:database];
    [_instances removeObjectForKey:key];
  }
}

#pragma mark - FIRComponentLifecycleMaintainer

- (void)appWillBeDeleted:(__unused FIRApp *)app {
  NSDictionary<NSString *, FIRFirestore *> *instances;
  @synchronized(_instances) {
    instances = [_instances copy];
    [_instances removeAllObjects];
  }
  for (NSString *key in instances) {
    [instances[key] terminateInternalWithCompletion:nil];
  }
}

#pragma mark - Object Lifecycle

+ (void)load {
  [FIRApp registerInternalLibrary:(Class<FIRLibrary>)self withName:@"fire-fst"];
}

#pragma mark - Interoperability

+ (NSArray<FIRComponent *> *)componentsToRegister {
  FIRDependency *auth = [FIRDependency dependencyWithProtocol:@protocol(FIRAuthInterop)
                                                   isRequired:NO];
  FIRComponent *firestoreProvider = [FIRComponent
      componentWithProtocol:@protocol(FSTFirestoreMultiDBProvider)
        instantiationTiming:FIRInstantiationTimingLazy
               dependencies:@[ auth ]
              creationBlock:^id _Nullable(FIRComponentContainer *container, BOOL *isCacheable) {
                FSTFirestoreComponent *multiDBComponent =
                    [[FSTFirestoreComponent alloc] initWithApp:container.app];
                *isCacheable = YES;
                return multiDBComponent;
              }];
  return @[ firestoreProvider ];
}

@end

NS_ASSUME_NONNULL_END
