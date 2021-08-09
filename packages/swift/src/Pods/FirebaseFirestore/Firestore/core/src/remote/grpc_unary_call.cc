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

#include "Firestore/core/src/remote/grpc_unary_call.h"

#include <utility>

#include "Firestore/core/src/remote/grpc_connection.h"
#include "Firestore/core/src/remote/grpc_util.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/statusor.h"

namespace firebase {
namespace firestore {
namespace remote {

using util::AsyncQueue;
using util::Status;
using Type = GrpcCompletion::Type;

GrpcUnaryCall::GrpcUnaryCall(
    std::unique_ptr<grpc::ClientContext> context,
    std::unique_ptr<grpc::GenericClientAsyncResponseReader> call,
    const std::shared_ptr<util::AsyncQueue>& worker_queue,
    GrpcConnection* grpc_connection,
    const grpc::ByteBuffer& request)
    : context_{std::move(context)},
      call_{std::move(call)},
      request_{request},
      worker_queue_{worker_queue},
      grpc_connection_{grpc_connection} {
  grpc_connection_->Register(this);
}

GrpcUnaryCall::~GrpcUnaryCall() {
  HARD_ASSERT(!finish_completion_,
              "GrpcUnaryCall is being destroyed without proper shutdown");
  MaybeUnregister();
}

void GrpcUnaryCall::Start(Callback&& callback) {
  callback_ = std::move(callback);
  call_->StartCall();

  // For lifetime details, see `GrpcCompletion` class comment.
  finish_completion_ = GrpcCompletion::Create(
      Type::Finish, worker_queue_,
      [this](bool /*ignored_ok*/,
             const std::shared_ptr<GrpcCompletion>& completion) {
        // Ignoring ok, status should contain all the relevant information.
        finish_completion_.reset();
        Shutdown();

        auto callback = std::move(callback_);
        if (completion->status()->ok()) {
          callback(*completion->message());
        } else {
          callback(ConvertStatus(*completion->status()));
        }
        // This `GrpcUnaryCall`'s lifetime might have been ended by the
        // callback.
      });

  call_->Finish(finish_completion_->message(), finish_completion_->status(),
                finish_completion_.get());
}

void GrpcUnaryCall::FinishImmediately() {
  Shutdown();
}

void GrpcUnaryCall::FinishAndNotify(const util::Status& status) {
  Shutdown();

  auto callback = std::move(callback_);
  callback(status);
}

void GrpcUnaryCall::Shutdown() {
  MaybeUnregister();
  if (!finish_completion_) {
    // Nothing to cancel.
    return;
  }

  context_->TryCancel();

  finish_completion_->Cancel();
  // This function blocks.
  finish_completion_->WaitUntilOffQueue();
  finish_completion_.reset();
}

void GrpcUnaryCall::MaybeUnregister() {
  if (grpc_connection_) {
    grpc_connection_->Unregister(this);
    grpc_connection_ = nullptr;
  }
}

GrpcCall::Metadata GrpcUnaryCall::GetResponseHeaders() const {
  return context_->GetServerInitialMetadata();
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
