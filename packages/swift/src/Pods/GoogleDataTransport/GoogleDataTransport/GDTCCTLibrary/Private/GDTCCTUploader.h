/*
 * Copyright 2019 Google
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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORUploader.h"

NS_ASSUME_NONNULL_BEGIN

/** Class capable of uploading events to the CCT backend. */
@interface GDTCCTUploader : NSObject <GDTCORUploader>

/** Creates and/or returns the singleton instance of this class.
 *
 * @return The singleton instance of this class.
 */
+ (instancetype)sharedInstance;

#if !NDEBUG
/** An upload URL used across all targets. For testing only. */
@property(class, nullable, nonatomic) NSURL *testServerURL;

/** Spins runloop until upload finishes or timeout.
 *  @return YES if upload finishes, NO in the case of timeout.
 */
- (BOOL)waitForUploadFinishedWithTimeout:(NSTimeInterval)timeout;

#endif  // !NDEBUG

@end

NS_ASSUME_NONNULL_END
