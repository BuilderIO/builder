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

#ifndef FIRESTORE_CORE_SRC_NANOPB_MESSAGE_H_
#define FIRESTORE_CORE_SRC_NANOPB_MESSAGE_H_

#include <memory>
#include <string>
#include <utility>

#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/fields_array.h"
#include "Firestore/core/src/nanopb/reader.h"
#include "Firestore/core/src/nanopb/writer.h"
#include "grpcpp/support/byte_buffer.h"

namespace firebase {
namespace firestore {
namespace nanopb {

/**
 * Free the dynamically-allocated memory within a Nanopb-generated message.
 *
 * This essentially wraps calls to Nanopb's `pb_release()` function.
 */
void FreeNanopbMessage(const pb_field_t* fields, void* dest_struct);

template <typename T>
class Message;

/**
 * A unique-ownership RAII wrapper for Nanopb-generated message types.
 *
 * Nanopb-generated message types (from now on, "Nanopb protos") are plain
 * C structs that contain some dynamically-allocated memory and should be
 * deallocated by calling `pb_release`; `Message` implements a simple RAII
 * wrapper that does just that. For simplicity, `Message` implements unique
 * ownership model. It provides a pointer-like access to the underlying Nanopb
 * proto.
 *
 * Note that moving *isn't* a particularly cheap operation in the general case.
 * Even without doing deep copies, Nanopb protos contain *a lot* of member
 * variables (at the time of writing, the largest `sizeof` of a Nanopb proto was
 * 248).
 */
template <typename T>
class Message {
 public:
  /**
   * Creates a valid `Message` that wraps a value-constructed ("zeroed out")
   * Nanopb proto. The created object can then be filled by using the
   * pointer-like access.
   */
  Message() = default;

  /**
   * Creates a `Message` object that wraps `proto`. Takes ownership of `proto`.
   */
  explicit Message(const T& proto) : owns_proto_(true), proto_(proto) {
  }

  /**
   * Attempts to parse a Nanopb message from the given `reader`. If the reader
   * contains ill-formed bytes, returns a default-constructed `Message`; check
   * the status on `reader` to see whether parsing was successful.
   */
  static Message TryParse(Reader* reader);

  ~Message() {
    Free();
  }

  /** `Message` models unique ownership. */
  Message(const Message&) = delete;
  Message& operator=(const Message&) = delete;

  /**
   * A moved-from `Message` is in an invalid state that is *not* equivalent to
   * its default-constructed state. Calling `get()` on a moved-from `Message`
   * returns a null pointer; attempting to "dereference" a moved-from `Message`
   * results in undefined behavior.
   */
  Message(Message&& other) noexcept
      : owns_proto_{other.owns_proto_}, proto_{other.proto_} {
    other.owns_proto_ = false;
  }

  Message& operator=(Message&& other) noexcept {
    Free();

    owns_proto_ = other.owns_proto_;
    proto_ = other.proto_;
    other.owns_proto_ = false;

    return *this;
  }

  T* release() {
    auto result = get();
    owns_proto_ = false;
    return result;
  }

  /**
   * Returns a pointer to the underlying Nanopb proto or null if the `Message`
   * is moved-from.
   */
  T* get() {
    return owns_proto_ ? &proto_ : nullptr;
  }

  /**
   * Returns a pointer to the underlying Nanopb proto or null if the `Message`
   * is moved-from.
   */
  const T* get() const {
    return owns_proto_ ? &proto_ : nullptr;
  }

  /**
   * Returns a reference to the underlying Nanopb proto; if the `Message` is
   * moved-from, the behavior is undefined.
   *
   * For performance reasons, prefer assigning to individual fields to
   * reassigning the whole Nanopb proto.
   */
  T& operator*() {
    return *get();
  }

  /**
   * Returns a reference to the underlying Nanopb proto; if the `Message` is
   * moved-from, the behavior is undefined.
   */
  const T& operator*() const {
    return *get();
  }

  T* operator->() {
    return get();
  }

  const T* operator->() const {
    return get();
  }

  /**
   * Returns a pointer to the Nanopb-generated array that describes the fields
   * of the Nanopb proto; the array is required to call most Nanopb functions.
   *
   * Note that this is essentially a property of the type, but cannot be made
   * a template parameter for various technical reasons.
   */
  static const pb_field_t* fields() {
    return FieldsArray<T>();
  }

  /** Creates a pretty-printed description of the proto for debugging. */
  std::string ToString() const {
    return proto_.ToString();
  }

  /**
   * Returns false if the Message is not associated with a valid proto (for
   * example, if it has been moved from).
   */
  constexpr explicit operator bool() const noexcept {
    return owns_proto_;
  }

 private:
  // Important: this function does *not* modify `owns_proto_`.
  void Free() {
    if (owns_proto_) {
      FreeNanopbMessage(fields(), &proto_);
    }
  }

  bool owns_proto_ = true;
  // The Nanopb-proto is value-initialized (zeroed out) to make sure that any
  // member variables that aren't written to are in a valid state.
  T proto_{};
};

template <typename T>
Message<T> MakeMessage(const T& proto) {
  return Message<T>(proto);
}

/**
 * A wrapper of Message objects that facilitates shared ownership of Protobuf
 * data.
 */
// TODO(mrschmidt): Add a template <typename const T> specialization
template <typename T>
class SharedMessage {
 public:
  /** Creates a `SharedMessage` object that wraps `proto`. */
  SharedMessage(Message<T> message)  // NOLINT
      : message_{std::make_shared<Message<T>>(*message.release())} {
  }

  /**
   * Returns a pointer to the underlying Nanopb proto.
   */
  T* get() {
    return message_->get();
  }

  /**
   * Returns a pointer to the underlying Nanopb proto.
   */
  const T* get() const {
    return message_->get();
  }

  /**
   * Returns a reference to the underlying Nanopb proto.
   */
  T& operator*() {
    return *get();
  }

  /**
   * Returns a reference to the underlying Nanopb proto.
   */
  const T& operator*() const {
    return *get();
  }

  T* operator->() {
    return get();
  }

  const T* operator->() const {
    return get();
  }

 private:
  std::shared_ptr<Message<T>> message_;
};

template <typename T>
SharedMessage<T> MakeSharedMessage(const T& proto) {
  return SharedMessage<T>(Message<T>(proto));
}

template <typename T>
Message<T> Message<T>::TryParse(Reader* reader) {
  Message<T> result;
  reader->Read(result.fields(), result.get());

  if (!reader->ok()) {
    // In the event reading a Nanopb proto fails, Nanopb calls `pb_release` on
    // the partially-filled message; let go of ownership to make sure double
    // deletion doesn't occur.
    result.release();
    // Guarantee that a partially-filled message is never returned.
    return Message<T>{};
  }

  return result;
}

/**
 * Serializes the given `message` into a `ByteString`.
 *
 * The lifetime of the return value is entirely independent of the `message`.
 */
template <typename T>
ByteString MakeByteString(const Message<T>& message) {
  ByteStringWriter writer;
  writer.Write(message.fields(), message.get());
  return writer.Release();
}

/**
 * Serializes the given `message` into a `std::string`.
 *
 * The lifetime of the return value is entirely independent of the `message`.
 */
template <typename T>
std::string MakeStdString(const Message<T>& message) {
  StringWriter writer;
  writer.Write(message.fields(), message.get());
  return writer.Release();
}

/** Free the dynamically-allocated memory for the fields array of type T. */
template <typename T>
void FreeFieldsArray(T* message) {
  FreeNanopbMessage(FieldsArray<T>(), message);
}

}  // namespace nanopb
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_NANOPB_MESSAGE_H_
