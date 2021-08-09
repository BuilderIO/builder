/*
 * Copyright 2019 Google
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

#ifndef FIRESTORE_CORE_SRC_CORE_EVENT_LISTENER_H_
#define FIRESTORE_CORE_SRC_CORE_EVENT_LISTENER_H_

#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <utility>

#include "Firestore/core/src/util/executor.h"
#include "Firestore/core/src/util/status_fwd.h"
#include "Firestore/core/src/util/statusor.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace core {

/**
 * A general interface for listening to events internally.
 */
template <typename T>
class EventListener {
 public:
  static std::unique_ptr<EventListener<T>> Create(
      util::StatusOrCallback<T> callback);

  virtual ~EventListener() = default;

  /**
   * OnEvent will be called with the new value or the error if an error
   * occurred.
   *
   * @param maybe_value The value of the event or the error.
   */
  virtual void OnEvent(util::StatusOr<T> maybe_value) = 0;
};

/**
 * A wrapper around another EventListener that dispatches events asynchronously.
 */
template <typename T>
class AsyncEventListener
    : public EventListener<T>,
      public std::enable_shared_from_this<AsyncEventListener<T>> {
 public:
  using DelegateListener = std::unique_ptr<EventListener<T>>;

  AsyncEventListener(const std::shared_ptr<util::Executor>& executor,
                     DelegateListener&& delegate)
      : executor_(executor), delegate_(std::move(delegate)) {
  }

  static std::shared_ptr<AsyncEventListener<T>> Create(
      std::shared_ptr<util::Executor> executor, DelegateListener&& delegate);

  static std::shared_ptr<AsyncEventListener<T>> Create(
      std::shared_ptr<util::Executor> executor, EventListener<T>&& delegate) {
    return Create(executor,
                  absl::make_unique<EventListener>(std::move(delegate)));
  }

  void OnEvent(util::StatusOr<T> maybe_value) override;

  /**
   * Synchronously mutes the listener and raises no further events. This method
   * is thread safe and can be called from any queue.
   */
  void Mute();

 private:
  // PORTING NOTE: Android uses a volatile here but that's not enough in C++.
  //
  // In C++, the user can call `ListenerRegistration::Remove` (which calls
  // `Mute`) and then immediately delete the state backing the listener. Using
  // a mutex here instead of an atomic ensures that `Mute` won't return until
  // it's safe to delete the state backing a listener. In Java this is safe
  // because the state backing the listener is garbage collected so it doesn't
  // matter if the mute is concurrent with a callback.
  //
  // Use a recursive mutex instead of `std::mutex` to avoid deadlock in the case
  // where a user calls `Remove` from within a callback on that listener.
  std::recursive_mutex mutex_;
  bool muted_ = false;
  std::shared_ptr<util::Executor> executor_;
  DelegateListener delegate_;
};

template <typename T>
std::unique_ptr<EventListener<T>> EventListener<T>::Create(
    util::StatusOrCallback<T> callback) {
  class CallbackEventListener : public EventListener<T> {
   public:
    explicit CallbackEventListener(util::StatusOrCallback<T>&& callback)
        : callback_(std::move(callback)) {
    }

    void OnEvent(util::StatusOr<T> maybe_value) override {
      callback_(std::move(maybe_value));
    }

   private:
    util::StatusOrCallback<T> callback_;
  };

  return absl::make_unique<CallbackEventListener>(std::move(callback));
}

template <typename T>
std::shared_ptr<AsyncEventListener<T>> AsyncEventListener<T>::Create(
    std::shared_ptr<util::Executor> executor, DelegateListener&& delegate) {
  return std::make_shared<AsyncEventListener<T>>(executor, std::move(delegate));
}

template <typename T>
void AsyncEventListener<T>::Mute() {
  std::lock_guard<std::recursive_mutex> lock(mutex_);
  muted_ = true;
}

template <typename T>
void AsyncEventListener<T>::OnEvent(util::StatusOr<T> maybe_value) {
  // Retain a strong reference to this. If the EventManager is sending an error
  // it will immediately clear its strong reference to this after posting the
  // event. The strong reference here allows the AsyncEventListener to survive
  // until the executor gets around to calling.
  std::shared_ptr<AsyncEventListener<T>> shared_this = this->shared_from_this();

  executor_->Execute([shared_this, maybe_value]() {
    std::lock_guard<std::recursive_mutex> lock(shared_this->mutex_);
    if (!shared_this->muted_) {
      shared_this->delegate_->OnEvent(std::move(maybe_value));
    }
  });
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_EVENT_LISTENER_H_
