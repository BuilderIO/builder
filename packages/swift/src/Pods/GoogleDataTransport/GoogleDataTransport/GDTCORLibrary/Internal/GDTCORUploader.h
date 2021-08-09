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
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORClock.h"
#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCORTargets.h"

NS_ASSUME_NONNULL_BEGIN

/** Options that define a set of upload conditions. This is used to help minimize end user data
 * consumption impact.
 */
typedef NS_OPTIONS(NSInteger, GDTCORUploadConditions) {

  /** An upload shouldn't be attempted, because there's no network. */
  GDTCORUploadConditionNoNetwork = 1 << 0,

  /** An upload would likely use mobile data. */
  GDTCORUploadConditionMobileData = 1 << 1,

  /** An upload would likely use wifi data. */
  GDTCORUploadConditionWifiData = 1 << 2,

  /** An upload uses some sort of network connection, but it's unclear which. */
  GDTCORUploadConditionUnclearConnection = 1 << 3,

  /** A high priority event has occurred. */
  GDTCORUploadConditionHighPriority = 1 << 4,
};

/** This protocol defines the common interface for uploader implementations. */
@protocol GDTCORUploader <NSObject, GDTCORLifecycleProtocol>

@required

/** Uploads events to the backend using this specific backend's chosen format.
 *
 * @param conditions The conditions that the upload attempt is likely to occur under.
 */
- (void)uploadTarget:(GDTCORTarget)target withConditions:(GDTCORUploadConditions)conditions;

@end

NS_ASSUME_NONNULL_END
