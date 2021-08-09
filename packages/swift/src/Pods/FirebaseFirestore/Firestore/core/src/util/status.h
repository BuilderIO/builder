/*
 * Copyright 2015, 2018 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_UTIL_STATUS_H_
#define FIRESTORE_CORE_SRC_UTIL_STATUS_H_

#if _WIN32
#include <windows.h>
#endif

#include <functional>
#include <iosfwd>
#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "absl/base/attributes.h"
#include "absl/strings/string_view.h"

#if __OBJC__
@class NSError;
#endif

namespace firebase {
namespace firestore {
namespace util {

class PlatformError;

/// Denotes success or failure of a call.
class ABSL_MUST_USE_RESULT Status {
 public:
  /// Create a success status.
  Status() = default;

  /// \brief Create a status with the specified error code and msg as a
  /// human-readable string containing more detailed information.
  Status(Error code, std::string msg);

  /// Copy the specified status.
  Status(const Status& s);
  Status& operator=(const Status& s);

  /// Move the specified status.
  Status(Status&& s) noexcept;
  Status& operator=(Status&& s) noexcept;

  static Status OK() {
    return Status();
  }

  /// Creates a status object from the given errno error code and message.
  static Status FromErrno(int errno_code, absl::string_view msg);

#if defined(_WIN32)
  static Status FromLastError(DWORD error, absl::string_view message);
#endif  // defined(_WIN32)

#if defined(__OBJC__)
  static Status FromNSError(NSError* error);

  NSError* ToNSError() const;
#endif  // defined(__OBJC__)

  /// Creates a status object with the given cause's code, and a message
  /// combining the given error message with the cause's error message.
  static Status FromCause(std::string message, const Status& cause);

  /// Returns true iff the status indicates success.
  bool ok() const {
    return state_ == nullptr;
  }

  Error code() const {
    return ok() ? Error::kErrorOk
                : (IsMovedFrom() ? Error::kErrorInternal : state_->code);
  }

  const std::string& error_message() const {
    return ok() ? empty_string()
                : (IsMovedFrom() ? moved_from_message() : state_->msg);
  }

  bool operator==(const Status& x) const;
  bool operator!=(const Status& x) const;

  /// \brief If `ok()`, stores `new_status` into `*this`.  If `!ok()`,
  /// preserves the current status, but may augment with additional
  /// information about `new_status`.
  ///
  /// Convenient way of keeping track of the first error encountered.
  /// Instead of:
  ///   `if (overall_status.ok()) overall_status = new_status`
  /// Use:
  ///   `overall_status.Update(new_status);`
  void Update(const Status& new_status);

  /// \brief Adds the message in the given cause to this Status.
  ///
  /// \return *this
  Status& CausedBy(const Status& cause);

  Status& WithPlatformError(std::unique_ptr<PlatformError> error);

  /// \brief Return a string representation of this status suitable for
  /// printing. Returns the string `"OK"` for success.
  std::string ToString() const;
  friend std::ostream& operator<<(std::ostream& out, const Status& status);

  // Ignores any errors. This method does nothing except potentially suppress
  // complaints from any tools that are checking that errors are not dropped on
  // the floor.
  void IgnoreError() const;

 private:
  static const std::string& empty_string();
  static const std::string& moved_from_message();

  struct State {
    State() = default;
    State(const State& other);
    State(Error code, std::string&& msg);

    struct Deleter {
      void operator()(const State* ptr) const;
    };
    // A `unique_ptr` with a custom deleter. If the pointer's value has been set
    // to a special value (0x01) to indicate it is moved, invoking the custom
    // deleter will be a no-op.
    using StatePtr = std::unique_ptr<State, Deleter>;

    static State* MovedFromIndicator() {
      return reinterpret_cast<State*>(0x01);
    }

    template <typename... Args>
    static StatePtr MakePtr(Args&&... args) {
      return StatePtr(new State(std::forward<Args>(args)...));
    }

    Error code;
    std::string msg;

    // An additional platform-specific error representation that was used to
    // generate this Status. The PlatformError does not meaningfully contribute
    // to the identity of this Status: it exists to allow tunneling e.g.
    // NSError* to Status and back to NSError* losslessly.
    std::unique_ptr<PlatformError> platform_error;
  };

  // Asserts if `state_` is a valid pointer, should be used at all places where
  // it is used as a pointer, instead of using `state_`.
  bool IsMovedFrom() const {
    return state_.get() == State::MovedFromIndicator();
  }

  // OK status has a `nullptr` `state_`. If this instance is moved, state_ has
  // the value of `State::MovedFromIndicator()`. Otherwise `state_` points to
  // a `State` structure containing the error code and message(s).
  State::StatePtr state_;

  // Tags this instance as `moved-from`.
  void SetMovedFrom();

  void SlowCopyFrom(const State* src);
};

class PlatformError {
 public:
  virtual ~PlatformError() = default;

  virtual std::unique_ptr<PlatformError> Copy() = 0;

  /**
   * Creates a new PlatformError with the given code and message, whose cause is
   * this PlatformError.
   */
  virtual std::unique_ptr<PlatformError> WrapWith(Error code,
                                                  std::string message) = 0;
};

inline Status::Status(const Status& s)
    : state_{s.state_ == nullptr ? State::StatePtr{}
                                 : State::MakePtr(*s.state_)} {
}

inline Status::State::State(const State& other)
    : code(other.code),
      msg(other.msg),
      platform_error((other.platform_error == nullptr)
                         ? nullptr
                         : other.platform_error->Copy()) {
}

inline Status::State::State(Error code, std::string&& msg)
    : code(code), msg(std::move(msg)) {
}

inline Status& Status::operator=(const Status& s) {
  // The following condition catches both aliasing (when this == &s),
  // and the common case where both s and *this are ok.
  if (state_ != s.state_) {
    SlowCopyFrom(s.state_.get());
  }
  return *this;
}

inline Status::Status(Status&& s) noexcept : state_(std::move(s.state_)) {
  s.SetMovedFrom();
}

inline Status& Status::operator=(Status&& s) noexcept {
  // Moving into self is a no-op.
  if (this != &s) {
    state_ = std::move(s.state_);
    s.SetMovedFrom();
  }
  return *this;
}

inline bool Status::operator==(const Status& x) const {
  return (this->state_ == x.state_) || (ToString() == x.ToString());
}

inline bool Status::operator!=(const Status& x) const {
  return !(*this == x);
}

typedef std::function<void(Status)> StatusCallback;

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_STATUS_H_
