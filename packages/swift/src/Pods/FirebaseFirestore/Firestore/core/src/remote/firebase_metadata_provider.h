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

#ifndef FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_H_
#define FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_H_

#include <string>

#include "grpcpp/client_context.h"

namespace firebase {
namespace firestore {
namespace remote {

/**
 * Wraps the platform-dependent functionality associated with Firebase platform
 * logging.
 */
class FirebaseMetadataProvider {
 public:
  static const char kXFirebaseClientHeader[];
  static const char kXFirebaseClientLogTypeHeader[];
  static const char kXFirebaseGmpIdHeader[];

  virtual ~FirebaseMetadataProvider() = default;

  /**
   * Updates the given `context` with Firebase platform logging headers which
   * will be sent along with the default headers to the backend.
   */
  virtual void UpdateMetadata(grpc::ClientContext& context) = 0;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_FIREBASE_METADATA_PROVIDER_H_
