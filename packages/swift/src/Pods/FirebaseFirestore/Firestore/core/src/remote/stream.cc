/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/remote/stream.h"

#include <chrono>  // NOLINT(build/c++11)
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/model/mutation.h"
#include "Firestore/core/src/remote/datastore.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace remote {
namespace {

using auth::CredentialsProvider;
using auth::Token;
using util::AsyncQueue;
using util::LogIsDebugEnabled;
using util::Status;
using util::StatusOr;
using util::StringFormat;
using util::TimerId;

/**
 * Initial backoff time after an error.
 * Set to 1s according to https://cloud.google.com/apis/design/errors.
 */
const double kBackoffFactor = 1.5;
const AsyncQueue::Milliseconds kBackoffInitialDelay{std::chrono::seconds(1)};
const AsyncQueue::Milliseconds kBackoffMaxDelay{std::chrono::seconds(60)};
/** The time a stream stays open after it is marked idle. */
const AsyncQueue::Milliseconds kIdleTimeout{std::chrono::seconds(60)};

}  // namespace

Stream::Stream(const std::shared_ptr<AsyncQueue>& worker_queue,
               std::shared_ptr<CredentialsProvider> credentials_provider,
               GrpcConnection* grpc_connection,
               TimerId backoff_timer_id,
               TimerId idle_timer_id)
    : backoff_{worker_queue, backoff_timer_id, kBackoffFactor,
               kBackoffInitialDelay, kBackoffMaxDelay},
      credentials_provider_{std::move(credentials_provider)},
      worker_queue_{worker_queue},
      grpc_connection_{grpc_connection},
      idle_timer_id_{idle_timer_id} {
}

// Check state

bool Stream::IsOpen() const {
  EnsureOnQueue();
  return state_ == State::Open;
}

bool Stream::IsStarted() const {
  EnsureOnQueue();
  return state_ == State::Starting || state_ == State::Backoff || IsOpen();
}

// Starting

void Stream::Start() {
  EnsureOnQueue();

  if (state_ == State::Error) {
    BackoffAndTryRestarting();
    return;
  }

  LOG_DEBUG("%s start", GetDebugDescription());

  HARD_ASSERT(state_ == State::Initial, "Already started");
  state_ = State::Starting;

  RequestCredentials();
}

void Stream::RequestCredentials() {
  EnsureOnQueue();

  // Auth may outlive the stream, so make sure it doesn't try to access a
  // deleted object.
  std::weak_ptr<Stream> weak_this{shared_from_this()};
  int initial_close_count = close_count_;
  credentials_provider_->GetToken([weak_this, initial_close_count](
                                      const StatusOr<Token>& maybe_token) {
    auto strong_this = weak_this.lock();
    if (!strong_this) {
      return;
    }

    strong_this->worker_queue_->EnqueueRelaxed([maybe_token, weak_this,
                                                initial_close_count] {
      auto strong_this = weak_this.lock();
      // Streams can be stopped while waiting for authorization, so need
      // to check the close count.
      if (!strong_this || strong_this->close_count_ != initial_close_count) {
        return;
      }
      strong_this->ResumeStartWithCredentials(maybe_token);
    });
  });
}

void Stream::ResumeStartWithCredentials(const StatusOr<Token>& maybe_token) {
  EnsureOnQueue();

  HARD_ASSERT(state_ == State::Starting,
              "State should still be 'Starting' (was %s)", state_);

  if (!maybe_token.ok()) {
    OnStreamFinish(maybe_token.status());
    return;
  }

  grpc_stream_ = CreateGrpcStream(grpc_connection_, maybe_token.ValueOrDie());
  grpc_stream_->Start();
}

void Stream::OnStreamStart() {
  EnsureOnQueue();

  state_ = State::Open;
  NotifyStreamOpen();
}

// Backoff

void Stream::BackoffAndTryRestarting() {
  EnsureOnQueue();

  LOG_DEBUG("%s backoff", GetDebugDescription());

  HARD_ASSERT(state_ == State::Error,
              "Should only perform backoff in an error case");

  state_ = State::Backoff;
  backoff_.BackoffAndRun([this] {
    HARD_ASSERT(state_ == State::Backoff,
                "Backoff elapsed but state is now: %s", state_);

    state_ = State::Initial;
    Start();
    HARD_ASSERT(IsStarted(), "Stream should have started.");
  });
}

void Stream::InhibitBackoff() {
  EnsureOnQueue();

  HARD_ASSERT(!IsStarted(),
              "Can only cancel backoff in a stopped state (was %s)", state_);

  // Clear the error condition.
  state_ = State::Initial;
  backoff_.Reset();
}

// Idleness

void Stream::MarkIdle() {
  EnsureOnQueue();

  if (IsOpen() && !idleness_timer_) {
    idleness_timer_ = worker_queue_->EnqueueAfterDelay(
        kIdleTimeout, idle_timer_id_, [this] { Stop(); });
  }
}

void Stream::CancelIdleCheck() {
  EnsureOnQueue();
  idleness_timer_.Cancel();
}

// Read/write

void Stream::OnStreamRead(const grpc::ByteBuffer& message) {
  EnsureOnQueue();

  HARD_ASSERT(IsStarted(), "OnStreamRead called for a stopped stream.");

  if (LogIsDebugEnabled()) {
    LOG_DEBUG("%s headers (allowlisted): %s", GetDebugDescription(),
              Datastore::GetAllowlistedHeadersAsString(
                  grpc_stream_->GetResponseHeaders()));
  }

  Status read_status = NotifyStreamResponse(message);
  if (!read_status.ok()) {
    grpc_stream_->FinishImmediately();
    // Don't expect gRPC to produce status -- since the error happened on the
    // client, we have all the information we need.
    OnStreamFinish(read_status);
    return;
  }
}

// Stopping

void Stream::Stop() {
  EnsureOnQueue();
  LOG_DEBUG("%s stop", GetDebugDescription());

  Close(Status::OK());
}

void Stream::Close(const Status& status) {
  // This function ensures that both graceful stop and stop due to error go
  // through the same sequence of steps. While it leads to more conditional
  // logic, the benefit is reducing the chance of divergence across the two
  // cases.

  EnsureOnQueue();
  bool graceful_stop = status.ok();

  // Step 1 (both): check current state.
  if (graceful_stop && !IsStarted()) {
    // Graceful stop is idempotent.
    return;
  }
  HARD_ASSERT(IsStarted(), "Trying to close a non-started stream");

  // Step 2 (both): cancel any outstanding timers (they're guaranteed not to
  // execute).
  CancelIdleCheck();
  backoff_.Cancel();

  // Step 3 (both): increment close count, which invalidates long-lived
  // callbacks, guaranteeing they won't execute against a new instance of the
  // stream or when the stream has been destroyed.
  ++close_count_;

  // Step 4 (both): make small adjustments (to backoff/etc.) based on the
  // status.
  if (graceful_stop) {
    // If this is an intentional close, ensure we don't delay our next
    // connection attempt.
    backoff_.Reset();
  } else {
    HandleErrorStatus(status);
  }

  // Step 5 (graceful stop only): give subclasses a chance to send final
  // messages.
  if (graceful_stop && grpc_stream_) {
    // If the stream is in the auth stage, gRPC stream might not have been
    // created yet.
    LOG_DEBUG("%s Finishing gRPC stream", GetDebugDescription());
    TearDown(grpc_stream_.get());
  }
  // Step 6 (both): destroy the underlying stream.
  grpc_stream_.reset();

  // Step 7 (both): update the state machine and notify the listener.
  // State must be updated before calling the delegate.
  state_ = graceful_stop ? State::Initial : State::Error;
  NotifyStreamClose(status);
}

void Stream::HandleErrorStatus(const Status& status) {
  if (status.code() == Error::kErrorResourceExhausted) {
    LOG_DEBUG(
        "%s Using maximum backoff delay to prevent overloading the backend.",
        GetDebugDescription());
    backoff_.ResetToMax();
  } else if (status.code() == Error::kErrorUnauthenticated) {
    // "unauthenticated" error means the token was rejected. Try force
    // refreshing it in case it just expired.
    credentials_provider_->InvalidateToken();
  }
}

void Stream::OnStreamFinish(const Status& status) {
  EnsureOnQueue();

  if (!status.ok()) {
    LOG_WARN("%s Stream error: '%s'", GetDebugDescription(), status.ToString());
  } else {
    LOG_DEBUG("%s Stream closing: '%s'", GetDebugDescription(),
              status.ToString());
  }

  Close(status);
}

// Protected helpers

void Stream::EnsureOnQueue() const {
  worker_queue_->VerifyIsCurrentQueue();
}

void Stream::Write(grpc::ByteBuffer&& message) {
  EnsureOnQueue();

  HARD_ASSERT(IsOpen(), "Cannot write when the stream is not open.");

  CancelIdleCheck();
  grpc_stream_->Write(std::move(message));
}

std::string Stream::GetDebugDescription() const {
  EnsureOnQueue();
  return StringFormat("%s (%s)", GetDebugName(), this);
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
