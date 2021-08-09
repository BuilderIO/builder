/*
 * Copyright 2020 Google LLC
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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"

NS_ASSUME_NONNULL_BEGIN

/** The class calculates and caches the specified directory content size and uses add/remove signals
 *  from client the client to keep the size up to date without accessing file system.
 *  This is an internal class designed to be used by `GDTCORFlatFileStorage`.
 *  NOTE: The class is not thread-safe. The client must take care of synchronization.
 */
@interface GDTCORDirectorySizeTracker : NSObject

- (instancetype)init NS_UNAVAILABLE;

/** Initializes the object with a directory path.
 * @param path The directory path to track content size.
 */
- (instancetype)initWithDirectoryPath:(NSString *)path;

/** Returns a cached or calculates (if there is no cached) directory content size.
 * @return The directory content size in bytes calculated based on `NSURLFileSizeKey`.
 */
- (GDTCORStorageSizeBytes)directoryContentSize;

/** The client must call this method or `resetCachedSize` method each time a file or directory is
 * added to the tracked directory.
 *  @param path The path to the added file. If the path is outside the tracked directory then the
 *  @param fileSize The size of the added file.
 * method is no-op.
 */
- (void)fileWasAddedAtPath:(NSString *)path withSize:(GDTCORStorageSizeBytes)fileSize;

/** The client must call this method or `resetCachedSize` method each time a file or directory is
 * removed from the tracked directory.
 *  @param path The path to the removed file. If the path is outside the tracked directory then the
 *  @param fileSize The size of the removed file.
 * method is no-op.
 */
- (void)fileWasRemovedAtPath:(NSString *)path withSize:(GDTCORStorageSizeBytes)fileSize;

/** Invalidates cached directory size. */
- (void)resetCachedSize;

/** Returns URL resource value for `NSURLFileSizeKey` key for the specified URL. */
- (GDTCORStorageSizeBytes)fileSizeAtURL:(NSURL *)fileURL;

@end

NS_ASSUME_NONNULL_END
