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

#ifndef FIRESTORE_CORE_SRC_REMOTE_GRPC_CALL_H_
#define FIRESTORE_CORE_SRC_REMOTE_GRPC_CALL_H_

#include <map>

#include "Firestore/core/src/util/status_fwd.h"
#include "grpcpp/client_context.h"
#include "grpcpp/support/string_ref.h"

namespace firebase {
namespace firestore {
namespace remote {

/**
 * Contains operations common to all wrappers over gRPC calls. A wrapper is
 * presumed to:
 * - wrap an asynchronous gRPC call/stream;
 * - provide some notification mechanism (such as observers or callbacks).
 */
class GrpcCall {
 public:
  using Metadata = std::multimap<grpc::string_ref, grpc::string_ref>;

  virtual ~GrpcCall() = default;

  /**
   * Returns the metadata received from the server.
   *
   * Can only be called after the first response has been received from the
   * server.
   */
  virtual Metadata GetResponseHeaders() const = 0;

  /**
   * Finishes the call gracefully. Doesn't produce a notification to any
   * callbacks or observers.
   */
  virtual void FinishImmediately() = 0;

  /** Finishes the call with an error, notifying any callbacks and observers. */
  virtual void FinishAndNotify(const util::Status& status) = 0;

  /** For tests only */
  virtual grpc::ClientContext* context() = 0;
};

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_GRPC_CALL_H_
