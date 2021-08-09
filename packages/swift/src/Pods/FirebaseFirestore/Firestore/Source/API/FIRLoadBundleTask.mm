/*
 * Copyright 2021 Google LLC
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

#import "FIRLoadBundleTask.h"

#include <memory>

#import "Firestore/Source/API/FIRLoadBundleTask+Internal.h"

#include "Firestore/core/src/api/load_bundle_task.h"
#include "Firestore/core/src/util/exception.h"

NS_ASSUME_NONNULL_BEGIN

namespace {

using firebase::firestore::util::ThrowInvalidArgument;

}  // namespace

@implementation FIRLoadBundleTaskProgress {
}

- (instancetype)initWithInternal:(api::LoadBundleTaskProgress)progress {
  if (self = [super init]) {
    _bytesLoaded = progress.bytes_loaded();
    _documentsLoaded = progress.documents_loaded();
    _totalBytes = progress.total_bytes();
    _totalDocuments = progress.total_documents();

    switch (progress.state()) {
      case api::LoadBundleTaskState::kInProgress:
        _state = FIRLoadBundleTaskStateInProgress;
        break;
      case api::LoadBundleTaskState::kSuccess:
        _state = FIRLoadBundleTaskStateSuccess;
        break;
      case api::LoadBundleTaskState::kError:
        _state = FIRLoadBundleTaskStateError;
        break;
    }
  }
  return self;
}

- (BOOL)isEqual:(id)other {
  if (self == other) {
    return YES;
  } else if (![other isKindOfClass:[FIRLoadBundleTaskProgress class]]) {
    return NO;
  }

  FIRLoadBundleTaskProgress *otherProgress = (FIRLoadBundleTaskProgress *)other;
  return self.documentsLoaded == otherProgress.documentsLoaded &&
         self.totalDocuments == otherProgress.totalDocuments &&
         self.bytesLoaded == otherProgress.bytesLoaded &&
         self.totalBytes == otherProgress.totalBytes && self.state == otherProgress.state;
}

@end

@implementation FIRLoadBundleTask {
  std::shared_ptr<api::LoadBundleTask> _task;
}

- (instancetype)initWithTask:(std::shared_ptr<api::LoadBundleTask>)task {
  if (self = [super init]) {
    _task = std::move(task);
  }
  return self;
}

- (FIRLoadBundleObserverHandle)addObserver:(void (^)(FIRLoadBundleTaskProgress *progress))observer {
  if (!observer) {
    ThrowInvalidArgument("Handler cannot be nil");
  }

  api::LoadBundleTask::ProgressObserver core_observer =
      [observer](api::LoadBundleTaskProgress internal_progress) {
        observer([[FIRLoadBundleTaskProgress alloc] initWithInternal:internal_progress]);
      };
  return _task->Observe(std::move(core_observer));
}

- (void)removeObserverWithHandle:(FIRLoadBundleObserverHandle)handle {
  _task->RemoveObserver(handle);
}

- (void)removeAllObservers {
  _task->RemoveAllObservers();
}

@end

NS_ASSUME_NONNULL_END
