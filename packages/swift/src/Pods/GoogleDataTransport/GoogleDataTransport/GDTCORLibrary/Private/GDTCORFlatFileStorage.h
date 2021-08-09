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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORLifecycle.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageEventSelector.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"

@class GDTCOREvent;
@class GDTCORUploadCoordinator;

NS_ASSUME_NONNULL_BEGIN

/** The event components eventID dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCOREventComponentsEventIDKey;

/** The event components qosTier dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCOREventComponentsQoSTierKey;

/** The event components mappingID dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCOREventComponentsMappingIDKey;

/** The event components expirationDate dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCOREventComponentsExpirationKey;

/** The batch components target dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCORBatchComponentsTargetKey;

/** The batch components batchID dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCORBatchComponentsBatchIDKey;

/** The batch components expiration dictionary key. */
FOUNDATION_EXPORT NSString *const kGDTCORBatchComponentsExpirationKey;

/** The maximum allowed disk space taken by the stored data. */
FOUNDATION_EXPORT const uint64_t kGDTCORFlatFileStorageSizeLimit;

FOUNDATION_EXPORT NSString *const GDTCORFlatFileStorageErrorDomain;

typedef NS_ENUM(NSInteger, GDTCORFlatFileStorageError) {
  GDTCORFlatFileStorageErrorSizeLimitReached = 0
};

/** Manages the storage of events. This class is thread-safe.
 *
 * Event files will be stored as follows:
 * <app cache>/google-sdk-events/<classname>/gdt_event_data/<target>/<eventID>.<qosTier>.<mappingID>
 *
 * Library data will be stored as follows:
 * <app cache>/google-sdk-events/<classname>/gdt_library_data/<libraryDataKey>
 *
 * Batch data will be stored as follows:
 * <app
 * cache>/google-sdk-events/<classname>/gdt_batch_data/<target>.<batchID>/<eventID>.<qosTier>.<mappingID>
 */
@interface GDTCORFlatFileStorage : NSObject <GDTCORStorageProtocol, GDTCORLifecycleProtocol>

/** The queue on which all storage work will occur. */
@property(nonatomic) dispatch_queue_t storageQueue;

/** The upload coordinator instance used by this storage instance. */
@property(nonatomic) GDTCORUploadCoordinator *uploadCoordinator;

/** Creates and/or returns the storage singleton.
 *
 * @return The storage singleton.
 */
+ (instancetype)sharedInstance;

/** Returns the base directory under which all events will be stored.
 *
 * @return The base directory under which all events will be stored.
 */
+ (NSString *)eventDataStoragePath;

/** Returns the base directory under which all library data will be stored.
 *
 * @return The base directory under which all library data will be stored.
 */
+ (NSString *)libraryDataStoragePath;

/** Returns the base directory under which all batch data will be stored.
 *
 * @return The base directory under which all batch data will be stored.
 */
+ (NSString *)batchDataStoragePath;

/** */
+ (NSString *)batchPathForTarget:(GDTCORTarget)target
                         batchID:(NSNumber *)batchID
                  expirationDate:(NSDate *)expirationDate;

/** Returns a constructed storage path based on the given values. This path may not exist.
 *
 * @param target The target, which is necessary to be given a path.
 * @param eventID The eventID.
 * @param qosTier The qosTier.
 * @param expirationDate The expirationDate as a 1970-relative time interval.
 * @param mappingID The mappingID.
 * @return The path representing the combination of the given parameters.
 */
+ (NSString *)pathForTarget:(GDTCORTarget)target
                    eventID:(NSString *)eventID
                    qosTier:(NSNumber *)qosTier
             expirationDate:(NSDate *)expirationDate
                  mappingID:(NSString *)mappingID;

/** Returns extant paths that match all of the given parameters.
 *
 * @param eventIDs The list of eventIDs to look for, or nil for any.
 * @param qosTiers The list of qosTiers to look for, or nil for any.
 * @param mappingIDs The list of mappingIDs to look for, or nil for any.
 * @param onComplete The completion to call once the paths have been discovered.
 */
- (void)pathsForTarget:(GDTCORTarget)target
              eventIDs:(nullable NSSet<NSString *> *)eventIDs
              qosTiers:(nullable NSSet<NSNumber *> *)qosTiers
            mappingIDs:(nullable NSSet<NSString *> *)mappingIDs
            onComplete:(void (^)(NSSet<NSString *> *paths))onComplete;

/** Fetches the current batchID counter value from library storage, increments it, and sets the new
 * value. Returns nil if a batchID was not able to be created for some reason.
 *
 * @param onComplete A block to execute when creating the next batchID is complete.
 */
- (void)nextBatchID:(void (^)(NSNumber *_Nullable batchID))onComplete;

/** Constructs a dictionary of event filename components.
 *
 * @param fileName The event filename to split.
 * @return The dictionary of event component keys to their values.
 */
- (nullable NSDictionary<NSString *, id> *)eventComponentsFromFilename:(NSString *)fileName;

/** Constructs a dictionary of batch filename components.
 *
 * @param fileName The batch folder name to split.
 * @return The dictionary of batch component keys to their values.
 */
- (nullable NSDictionary<NSString *, id> *)batchComponentsFromFilename:(NSString *)fileName;

@end

NS_ASSUME_NONNULL_END
