/*
 * Copyright 2015, 2018 Google
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

#include "Firestore/core/src/util/status.h"

#include <ostream>
#include <utility>

#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {

Status::Status(Error code, std::string msg) {
  HARD_ASSERT(code != Error::kErrorOk);
  state_ = State::MakePtr(code, std::move(msg));
}

Status Status::FromCause(std::string message, const Status& cause) {
  if (cause.ok()) {
    return cause;
  }

  return Status(cause.code(), std::move(message)).CausedBy(cause);
}

void Status::Update(const Status& new_status) {
  if (ok()) {
    *this = new_status;
  }
}

Status& Status::CausedBy(const Status& cause) {
  if (cause.ok() || this == &cause || cause.IsMovedFrom()) {
    return *this;
  }

  if (ok() || IsMovedFrom()) {
    *this = cause;
    return *this;
  }

  std::string new_message = error_message();
  absl::StrAppend(&state_->msg, ": ", cause.error_message());

  // If this Status has no accompanying PlatformError but the cause does, create
  // a PlatformError for this Status ahead of time to preserve the causal chain
  // that Status doesn't otherwise support.
  if (state_->platform_error == nullptr &&
      cause.state_->platform_error != nullptr) {
    state_->platform_error =
        cause.state_->platform_error->WrapWith(code(), error_message());
  }

  return *this;
}

Status& Status::WithPlatformError(std::unique_ptr<PlatformError> error) {
  HARD_ASSERT(!ok(), "Platform errors should not be applied to Status::OK()");
  if (IsMovedFrom()) {
    std::string message = moved_from_message();
    state_ = State::MakePtr(Error::kErrorInternal, std::move(message));
  }
  state_->platform_error = std::move(error);
  return *this;
}

void Status::State::Deleter::operator()(const State* ptr) const {
  if (ptr != State::MovedFromIndicator()) {
    delete ptr;
  }
}

void Status::SetMovedFrom() {
  // Set pointer value to `0x1` as the pointer is no longer useful.
  state_ = State::StatePtr{State::MovedFromIndicator()};
}

void Status::SlowCopyFrom(const State* src) {
  if (src == nullptr) {
    state_ = nullptr;
  } else {
    state_ = State::MakePtr(*src);
  }
}

const std::string& Status::empty_string() {
  static std::string* empty = new std::string;
  return *empty;
}

const std::string& Status::moved_from_message() {
  static std::string* message = new std::string("Status accessed after move.");
  return *message;
}

std::string Status::ToString() const {
  if (state_ == nullptr) {
    return "OK";
  } else {
    std::string result;
    switch (code()) {
      case Error::kErrorCancelled:
        result = "Cancelled";
        break;
      case Error::kErrorUnknown:
        result = "Unknown";
        break;
      case Error::kErrorInvalidArgument:
        result = "Invalid argument";
        break;
      case Error::kErrorDeadlineExceeded:
        result = "Deadline exceeded";
        break;
      case Error::kErrorNotFound:
        result = "Not found";
        break;
      case Error::kErrorAlreadyExists:
        result = "Already exists";
        break;
      case Error::kErrorPermissionDenied:
        result = "Permission denied";
        break;
      case Error::kErrorUnauthenticated:
        result = "Unauthenticated";
        break;
      case Error::kErrorResourceExhausted:
        result = "Resource exhausted";
        break;
      case Error::kErrorFailedPrecondition:
        result = "Failed precondition";
        break;
      case Error::kErrorAborted:
        result = "Aborted";
        break;
      case Error::kErrorOutOfRange:
        result = "Out of range";
        break;
      case Error::kErrorUnimplemented:
        result = "Unimplemented";
        break;
      case Error::kErrorInternal:
        result = "Internal";
        break;
      case Error::kErrorUnavailable:
        result = "Unavailable";
        break;
      case Error::kErrorDataLoss:
        result = "Data loss";
        break;
      default:
        result = StringFormat("Unknown code(%s)", code());
        break;
    }
    result += ": ";
    result += IsMovedFrom() ? moved_from_message() : state_->msg;
    return result;
  }
}

std::ostream& operator<<(std::ostream& out, const Status& status) {
  out << status.ToString();
  return out;
}

void Status::IgnoreError() const {
  // no-op
}

std::string StatusCheckOpHelperOutOfLine(const Status& v, const char* msg) {
  HARD_ASSERT(!v.ok());
  std::string r("Non-OK-status: ");
  r += msg;
  r += " status: ";
  r += v.ToString();
  return r;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
