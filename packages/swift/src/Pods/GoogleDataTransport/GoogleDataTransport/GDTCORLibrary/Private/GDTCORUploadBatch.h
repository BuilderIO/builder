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

@class GDTCOREvent;

NS_ASSUME_NONNULL_BEGIN

/// A data object representing a batch of events scheduled for upload.
@interface GDTCORUploadBatch : NSObject

/// An ID used to identify the batch in the storage.
@property(nonatomic, readonly) NSNumber *batchID;

/// The collection of the events in the batch.
@property(nonatomic, readonly) NSSet<GDTCOREvent *> *events;

/// The default initializer. See also docs for the corresponding properties.
- (instancetype)initWithBatchID:(NSNumber *)batchID events:(NSSet<GDTCOREvent *> *)events;

@end

NS_ASSUME_NONNULL_END
