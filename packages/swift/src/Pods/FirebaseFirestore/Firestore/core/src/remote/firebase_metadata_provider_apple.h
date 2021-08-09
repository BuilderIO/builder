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

#ifndef FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_APPLE_H_
#define FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_APPLE_H_

#if !defined(__OBJC__)
#error "This header only supports Objective-C++."
#endif  // !defined(__OBJC__)

#import <Foundation/Foundation.h>

#include <string>

#include "Firestore/core/src/remote/firebase_metadata_provider.h"

NS_ASSUME_NONNULL_BEGIN

@class FIRApp;

namespace firebase {
namespace firestore {
namespace remote {

class FirebaseMetadataProviderApple : public FirebaseMetadataProvider {
 public:
  explicit FirebaseMetadataProviderApple(FIRApp* app);

  void UpdateMetadata(grpc::ClientContext& context) override;

 private:
  FIRApp* app_;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

NS_ASSUME_NONNULL_END

#endif  // FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_APPLE_H_
