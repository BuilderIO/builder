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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORStorageProtocol.h"
#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORUploader.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORTargets.h"

NS_ASSUME_NONNULL_BEGIN

/** Manages the registration of targets with the transport SDK. */
@interface GDTCORRegistrar : NSObject <GDTCORLifecycleProtocol>

/** Creates and/or returns the singleton instance.
 *
 * @return The singleton instance of this class.
 */
+ (instancetype)sharedInstance;

/** Registers a backend implementation with the GoogleDataTransport infrastructure.
 *
 * @param backend The backend object to register.
 * @param target The target this backend object will be responsible for.
 */
- (void)registerUploader:(id<GDTCORUploader>)backend target:(GDTCORTarget)target;

/** Registers a storage implementation with the GoogleDataTransport infrastructure.
 *
 * @param storage The storage instance to be associated with this uploader and target.
 * @param target The target this backend object will be responsible for.
 */
- (void)registerStorage:(id<GDTCORStorageProtocol>)storage target:(GDTCORTarget)target;

@end

NS_ASSUME_NONNULL_END
