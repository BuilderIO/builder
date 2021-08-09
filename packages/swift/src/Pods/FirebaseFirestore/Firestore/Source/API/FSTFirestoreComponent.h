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

#import <Foundation/Foundation.h>

#import "Firestore/Source/API/FIRFirestore+Internal.h"

@class FIRApp;
@class FIRFirestore;

NS_ASSUME_NONNULL_BEGIN

/// Provides and creates instances of Firestore based on a specific key. Used in the interop
/// registration process to keep track of instances for `FIRApp` instances.
@protocol FSTFirestoreMultiDBProvider

/// Cached instances of Firestore objects.
@property(nonatomic, strong) NSMutableDictionary<NSString *, FIRFirestore *> *instances;

/// Default method for retrieving a Firestore instance, or creating one if it doesn't exist.
- (FIRFirestore *)firestoreForDatabase:(NSString *)database;

@end

/// A concrete implementation for FSTInstanceProvider to create Firestore instances and register
/// with Core's component system.
@interface FSTFirestoreComponent
    : NSObject <FSTFirestoreInstanceRegistry, FSTFirestoreMultiDBProvider>

/// The FIRApp that instances will be set up with.
@property(nonatomic, weak, readonly) FIRApp *app;

/// Cached instances of Firestore objects.
@property(nonatomic, strong) NSMutableDictionary<NSString *, FIRFirestore *> *instances;

/// Default method for retrieving a Firestore instance, or creating one if it doesn't exist.
- (FIRFirestore *)firestoreForDatabase:(NSString *)database;

- (void)removeInstanceWithDatabase:(NSString *)database;

/// Default initializer.
- (instancetype)initWithApp:(FIRApp *)app NS_DESIGNATED_INITIALIZER;

- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
