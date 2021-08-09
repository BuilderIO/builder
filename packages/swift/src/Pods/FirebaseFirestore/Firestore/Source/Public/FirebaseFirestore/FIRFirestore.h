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

#import <Foundation/Foundation.h>

#import "FIRListenerRegistration.h"

@class FIRApp;
@class FIRCollectionReference;
@class FIRDocumentReference;
@class FIRFirestoreSettings;
@class FIRLoadBundleTask;
@class FIRLoadBundleTaskProgress;
@class FIRQuery;
@class FIRTransaction;
@class FIRWriteBatch;

NS_ASSUME_NONNULL_BEGIN

/**
 * `FIRFirestore` represents a Firestore Database and is the entry point for all Firestore
 * operations.
 */
NS_SWIFT_NAME(Firestore)
@interface FIRFirestore : NSObject

#pragma mark - Initializing
/** :nodoc: */
- (instancetype)init __attribute__((unavailable("Use a static constructor method.")));

/**
 * Creates, caches, and returns a `FIRFirestore` using the default `FIRApp`. Each subsequent
 * invocation returns the same `FIRFirestore` object.
 *
 * @return The `FIRFirestore` instance.
 */
+ (instancetype)firestore NS_SWIFT_NAME(firestore());

/**
 * Creates, caches, and returns a `FIRFirestore` object for the specified _app_. Each subsequent
 * invocation returns the same `FIRFirestore` object.
 *
 * @param app The `FIRApp` instance to use for authentication and as a source of the Google Cloud
 * Project ID for your Firestore Database. If you want the default instance, you should explicitly
 * set it to `[FIRApp defaultApp]`.
 *
 * @return The `FIRFirestore` instance.
 */
+ (instancetype)firestoreForApp:(FIRApp *)app NS_SWIFT_NAME(firestore(app:));

/**
 * Custom settings used to configure this `FIRFirestore` object.
 */
@property(nonatomic, copy) FIRFirestoreSettings *settings;

/**
 * The Firebase App associated with this Firestore instance.
 */
@property(strong, nonatomic, readonly) FIRApp *app;

#pragma mark - Collections and Documents

/**
 * Gets a `FIRCollectionReference` referring to the collection at the specified path within the
 * database.
 *
 * @param collectionPath The slash-separated path of the collection for which to get a
 * `FIRCollectionReference`.
 *
 * @return The `FIRCollectionReference` at the specified _collectionPath_.
 */
- (FIRCollectionReference *)collectionWithPath:(NSString *)collectionPath
    NS_SWIFT_NAME(collection(_:));

/**
 * Gets a `FIRDocumentReference` referring to the document at the specified path within the
 * database.
 *
 * @param documentPath The slash-separated path of the document for which to get a
 * `FIRDocumentReference`.
 *
 * @return The `FIRDocumentReference` for the specified _documentPath_.
 */
- (FIRDocumentReference *)documentWithPath:(NSString *)documentPath NS_SWIFT_NAME(document(_:));

#pragma mark - Collection Group Queries

/**
 * Creates and returns a new `Query` that includes all documents in the database that are contained
 * in a collection or subcollection with the given collectionID.
 *
 * @param collectionID Identifies the collections to query over. Every collection or subcollection
 *     with this ID as the last segment of its path will be included. Cannot contain a slash.
 * @return The created `Query`.
 */
- (FIRQuery *)collectionGroupWithID:(NSString *)collectionID NS_SWIFT_NAME(collectionGroup(_:));

#pragma mark - Transactions and Write Batches

/**
 * Executes the given updateBlock and then attempts to commit the changes applied within an atomic
 * transaction.
 *
 * The maximum number of writes allowed in a single transaction is 500, but note that each usage of
 * `FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
 * `FieldValue.increment()` inside a transaction counts as an additional write.
 *
 * In the updateBlock, a set of reads and writes can be performed atomically using the
 * `FIRTransaction` object passed to the block. After the updateBlock is run, Firestore will attempt
 * to apply the changes to the server. If any of the data read has been modified outside of this
 * transaction since being read, then the transaction will be retried by executing the updateBlock
 * again. If the transaction still fails after 5 retries, then the transaction will fail.
 *
 * Since the updateBlock may be executed multiple times, it should avoiding doing anything that
 * would cause side effects.
 *
 * Any value maybe be returned from the updateBlock. If the transaction is successfully committed,
 * then the completion block will be passed that value. The updateBlock also has an `NSError` out
 * parameter. If this is set, then the transaction will not attempt to commit, and the given error
 * will be passed to the completion block.
 *
 * The `FIRTransaction` object passed to the updateBlock contains methods for accessing documents
 * and collections. Unlike other firestore access, data accessed with the transaction will not
 * reflect local changes that have not been committed. For this reason, it is required that all
 * reads are performed before any writes. Transactions must be performed while online. Otherwise,
 * reads will fail, the final commit will fail, and the completion block will return an error.
 *
 * @param updateBlock The block to execute within the transaction context.
 * @param completion The block to call with the result or error of the transaction. This
 *     block will run even if the client is offline, unless the process is killed.
 */
- (void)runTransactionWithBlock:(id _Nullable (^)(FIRTransaction *, NSError **))updateBlock
                     completion:(void (^)(id _Nullable result, NSError *_Nullable error))completion;

/**
 * Creates a write batch, used for performing multiple writes as a single
 * atomic operation.
 *
 * The maximum number of writes allowed in a single batch is 500, but note that each usage of
 * `FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or
 * `FieldValue.increment()` inside a batch counts as an additional write.

 * Unlike transactions, write batches are persisted offline and therefore are preferable when you
 * don't need to condition your writes on read data.
 */
- (FIRWriteBatch *)batch;

#pragma mark - Logging

/** Enables or disables logging from the Firestore client. */
+ (void)enableLogging:(BOOL)logging;

#pragma mark - Network

/**
 * Configures Firestore to connect to an emulated host instead of the default remote backend. After
 * Firestore has been used (i.e. a document reference has been instantiated), this value cannot be
 * changed.
 */
- (void)useEmulatorWithHost:(NSString *)host port:(NSInteger)port;

/**
 * Re-enables usage of the network by this Firestore instance after a prior call to
 * `disableNetworkWithCompletion`. Completion block, if provided, will be called once network uasge
 * has been enabled.
 */
- (void)enableNetworkWithCompletion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Disables usage of the network by this Firestore instance. It can be re-enabled by via
 * `enableNetworkWithCompletion`. While the network is disabled, any snapshot listeners or get calls
 * will return results from cache and any write operations will be queued until the network is
 * restored. The completion block, if provided, will be called once network usage has been disabled.
 */
- (void)disableNetworkWithCompletion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Clears the persistent storage. This includes pending writes and cached documents.
 *
 * Must be called while the firestore instance is not started (after the app is shutdown or when
 * the app is first initialized). On startup, this method must be called before other methods
 * (other than `FIRFirestore.settings`). If the firestore instance is still running, the function
 * will complete with an error code of `FailedPrecondition`.
 *
 * Note: `clearPersistence(completion:)` is primarily intended to help write reliable tests that
 * use Firestore. It uses the most efficient mechanism possible for dropping existing data but
 * does not attempt to securely overwrite or otherwise make cached data unrecoverable. For
 * applications that are sensitive to the disclosure of cache data in between user sessions we
 * strongly recommend not to enable persistence in the first place.
 */
- (void)clearPersistenceWithCompletion:(nullable void (^)(NSError *_Nullable error))completion;

/**
 * Waits until all currently pending writes for the active user have been acknowledged by the
 * backend.
 *
 * The completion block is called immediately without error if there are no outstanding writes.
 * Otherwise, the completion block is called when all previously issued writes (including those
 * written in a previous app session) have been acknowledged by the backend. The completion
 * block does not wait for writes that were added after the method is called. If you
 * wish to wait for additional writes, you have to call `waitForPendingWritesWithCompletion`
 * again.
 *
 * Any outstanding `waitForPendingWritesWithCompletion` completion blocks are called with an
 * error during user change.
 */
- (void)waitForPendingWritesWithCompletion:(void (^)(NSError *_Nullable error))completion;

/**
 * Attaches a listener for a snapshots-in-sync event. The snapshots-in-sync event indicates that all
 * listeners affected by a given change have fired, even if a single server-generated change affects
 * multiple listeners.
 *
 * NOTE: The snapshots-in-sync event only indicates that listeners are in sync with each other, but
 * does not relate to whether those snapshots are in sync with the server. Use SnapshotMetadata in
 * the individual listeners to determine if a snapshot is from the cache or the server.
 *
 * @param listener A callback to be called every time all snapshot listeners are in sync with each
 * other.
 * @return A FIRListenerRegistration object that can be used to remove the listener.
 */
- (id<FIRListenerRegistration>)addSnapshotsInSyncListener:(void (^)(void))listener
    NS_SWIFT_NAME(addSnapshotsInSyncListener(_:));

#pragma mark - Terminating

/**
 * Terminates this `FIRFirestore` instance.
 *
 * After calling `terminate` only the `clearPersistence` method may be used. Any other method will
 * throw an error.
 *
 * To restart after termination, simply create a new instance of FIRFirestore with `firestore` or
 * `firestoreForApp` methods.
 *
 * Termination does not cancel any pending writes and any tasks that are awaiting a response from
 * the server will not be resolved. The next time you start this instance, it will resume attempting
 * to send these writes to the server.
 *
 * Note: Under normal circumstances, calling this method is not required. This method is useful only
 * when you want to force this instance to release all of its resources or in combination with
 * `clearPersistence` to ensure that all local state is destroyed between test runs.
 *
 * @param completion A block to execute once everything has been terminated.
 */
- (void)terminateWithCompletion:(nullable void (^)(NSError *_Nullable error))completion
    NS_SWIFT_NAME(terminate(completion:));

#pragma mark - Bundles

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param bundleData Data from the bundle to be loaded.
 * @return A `FIRLoadBundleTask` (`LoadBundleTask` in Swift) which allows registered observers
 * to receive progress updates and completion or error events.
 */
- (FIRLoadBundleTask *)loadBundle:(NSData *)bundleData NS_SWIFT_NAME(loadBundle(_:));

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param bundleData Data from the bundle to be loaded.
 * @param completion A block to execute when loading is in a final state. The `error` parameter
 * will be set if the block is invoked due to an error. If observers are registered to the
 * `FIRLoadBundleTask`, this block will be called after all observers are notified.
 * @return A `FIRLoadBundleTask` (`LoadBundleTask` in Swift) which allows registered observers
 * to receive progress updates and completion or error events.
 */
- (FIRLoadBundleTask *)loadBundle:(NSData *)bundleData
                       completion:(nullable void (^)(FIRLoadBundleTaskProgress *_Nullable progress,
                                                     NSError *_Nullable error))completion
    NS_SWIFT_NAME(loadBundle(_:completion:));

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param bundleStream An input stream from which the bundle can be read.
 * @return A `FIRLoadBundleTask` (`LoadBundleTask` in Swift) which allows registered observers
 * to receive progress updates and completion or error events.
 */
- (FIRLoadBundleTask *)loadBundleStream:(NSInputStream *)bundleStream
    NS_SWIFT_NAME(loadBundle(_:));

/**
 * Loads a Firestore bundle into the local cache.
 *
 * @param bundleStream An input stream from which the bundle can be read.
 * @param completion A block to execute when the loading is in a final state. The `error` parameter
 * of the block will be set if it is due to an error. If observers are registered to the returning
 * `FIRLoadBundleTask`, this block will be called after all observers are notified.
 * @return A `FIRLoadBundleTask` (`LoadBundleTask` in Swift), which allow registering observers
 * to receive progress updates, and completion or error events.
 */
- (FIRLoadBundleTask *)loadBundleStream:(NSInputStream *)bundleStream
                             completion:
                                 (nullable void (^)(FIRLoadBundleTaskProgress *_Nullable progress,
                                                    NSError *_Nullable error))completion
    NS_SWIFT_NAME(loadBundle(_:completion:));

/**
 * Reads a `FIRQuery` (`Query` in Swift) from the local cache, identified by the given name.
 *
 * Named queries are packaged into bundles on the server side (along with the resulting documents)
 * and loaded into local cache using `loadBundle`. Once in the local cache, you can use this method
 * to extract a query by name.
 *
 * @param completion A block to execute with the query read from the local cache. If no query can be
 * found, its parameter will be `nil`.
 */
- (void)getQueryNamed:(NSString *)name
           completion:(void (^)(FIRQuery *_Nullable query))completion
    NS_SWIFT_NAME(getQuery(named:completion:));

@end

NS_ASSUME_NONNULL_END
