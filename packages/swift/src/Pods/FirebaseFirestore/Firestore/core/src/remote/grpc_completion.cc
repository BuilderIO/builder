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

#include "Firestore/core/src/remote/grpc_completion.h"

#include <memory>
#include <utility>

namespace firebase {
namespace firestore {
namespace remote {

using util::AsyncQueue;

std::shared_ptr<GrpcCompletion> GrpcCompletion::Create(
    Type type,
    const std::shared_ptr<util::AsyncQueue>& worker_queue,
    Callback&& callback) {
  // Construct in two steps to use the private constructor.
  GrpcCompletion partial(type, worker_queue, std::move(callback));
  auto completion = std::make_shared<GrpcCompletion>(std::move(partial));

  // Prepare the `GrpcCompletion` for submission to gRPC.
  //
  // Note: this is done in a separate step because `shared_from_this` cannot be
  // called in a constructor.
  completion->grpc_ownership_ = completion;

  return completion;
}

GrpcCompletion::GrpcCompletion(
    Type type,
    const std::shared_ptr<util::AsyncQueue>& worker_queue,
    Callback&& callback)
    : worker_queue_{worker_queue}, callback_{std::move(callback)}, type_{type} {
}

void GrpcCompletion::Cancel() {
  worker_queue_->VerifyIsCurrentQueue();
  callback_ = {};

  // Does not release grpc_ownership_. If gRPC still holds this completion it
  // must remain valid to avoid a use-after-free once Complete is actually
  // called.
}

void GrpcCompletion::WaitUntilOffQueue() {
  worker_queue_->VerifyIsCurrentQueue();

  EnsureValidFuture();
  off_queue_future_.wait();
}

std::future_status GrpcCompletion::WaitUntilOffQueue(
    std::chrono::milliseconds timeout) {
  worker_queue_->VerifyIsCurrentQueue();

  EnsureValidFuture();
  return off_queue_future_.wait_for(timeout);
}

void GrpcCompletion::EnsureValidFuture() {
  if (!off_queue_future_.valid()) {
    off_queue_future_ = off_queue_.get_future();
  }
}

void GrpcCompletion::Complete(bool ok) {
  // This mechanism allows `GrpcStream` to know when the completion is off the
  // gRPC completion queue (and thus no longer requires the underlying gRPC
  // objects to be valid).
  off_queue_.set_value();

  // The queued operation needs to also retain this completion. It's possible
  // for Complete to fire, shutdown to start, and then have this queued
  // operation run. If this weren't a retain that ordering would have the
  // callback use after free.
  auto shared_this = grpc_ownership_;
  worker_queue_->Enqueue([shared_this, ok] {
    if (shared_this->callback_) {
      shared_this->callback_(ok, shared_this);
    }
  });

  // Having called Complete, gRPC has released its ownership interest in this
  // object. Once the queued operation completes the `GrpcCompletion` will be
  // deleted.
  grpc_ownership_.reset();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
