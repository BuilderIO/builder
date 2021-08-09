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

#import "GoogleDataTransport/GDTCORLibrary/Private/GDTCORTransformer.h"

@protocol GDTCORApplicationProtocol;

NS_ASSUME_NONNULL_BEGIN

@interface GDTCORTransformer ()

/** The queue on which all work will occur. */
@property(nonatomic) dispatch_queue_t eventWritingQueue;

/** The application instance that is used to begin/end background tasks.  */
@property(nonatomic, readonly) id<GDTCORApplicationProtocol> application;

/** The internal initializer. Should be used in tests only to create an instance with a
 * particular(fake) application instance. */
- (instancetype)initWithApplication:(id<GDTCORApplicationProtocol>)application;

@end

NS_ASSUME_NONNULL_END
