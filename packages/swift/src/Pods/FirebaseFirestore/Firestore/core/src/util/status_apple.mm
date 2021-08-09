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

#include "Firestore/core/src/util/status.h"

#if defined(__APPLE__)

#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/string_format.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace util {

class UnderlyingNSError : public PlatformError {
 public:
  explicit UnderlyingNSError(NSError* error) : error_(error) {
  }

  static std::unique_ptr<UnderlyingNSError> Create(NSError* error) {
    return absl::make_unique<UnderlyingNSError>(error);
  }

  static NSError* Recover(
      const std::unique_ptr<PlatformError>& platform_error) {
    if (platform_error == nullptr) {
      return nil;
    }

    return static_cast<UnderlyingNSError*>(platform_error.get())->error();
  }

  std::unique_ptr<PlatformError> Copy() override {
    return absl::make_unique<UnderlyingNSError>(error_);
  }

  std::unique_ptr<PlatformError> WrapWith(Error code,
                                          std::string message) override {
    NSError* chain = MakeNSError(code, message, error_);
    return Create(chain);
  }

  NSError* error() const {
    return error_;
  }

 private:
  NSError* error_;
};

namespace {

/**
 * Converts a Firestore-generated NSError to the equivalent status.
 */
Status FromFirestoreNSError(NSError* error) {
  auto error_code = static_cast<int>(error.code);
  HARD_ASSERT(error_code >= Error::kErrorCancelled &&
                  error_code <= Error::kErrorUnauthenticated,
              "Unknown error code");

  auto original = UnderlyingNSError::Create(error);

  return Status(static_cast<Error>(error_code),
                MakeString(error.localizedDescription))
      .WithPlatformError(std::move(original));
}

}  // namespace

Status Status::FromNSError(NSError* error) {
  if (!error) {
    return Status::OK();
  }

  if ([error.domain isEqual:FIRFirestoreErrorDomain]) {
    return FromFirestoreNSError(error);
  }

  auto original = UnderlyingNSError::Create(error);

  while (error) {
    if ([error.domain isEqualToString:NSPOSIXErrorDomain]) {
      auto error_code = static_cast<int>(error.code);
      auto description = MakeString(original->error().localizedDescription);
      return FromErrno(error_code, description)
          .WithPlatformError(std::move(original));
    }

    error = error.userInfo[NSUnderlyingErrorKey];
  }

  auto description = StringFormat("Unknown error: %s", original->error());
  return Status{Error::kErrorUnknown, description}.WithPlatformError(
      std::move(original));
}

NSError* Status::ToNSError() const {
  if (ok()) return nil;
  // Early exit because `state_` is moved.
  if (IsMovedFrom()) return MakeNSError(code(), error_message());

  NSError* error = UnderlyingNSError::Recover(state_->platform_error);
  if (error) return error;

  return MakeNSError(code(), error_message());
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // defined(__APPLE__)
