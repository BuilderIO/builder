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

#ifndef FIRESTORE_CORE_SRC_UTIL_DELAYED_CONSTRUCTOR_H_
#define FIRESTORE_CORE_SRC_UTIL_DELAYED_CONSTRUCTOR_H_

#include <type_traits>
#include <utility>

namespace firebase {
namespace firestore {
namespace util {

// DelayedConstructor<T> is a wrapper around an object of type T that
//
//   * stores the object of type T inline inside DelayedConstructor<T>;
//   * initially does not call T's constructor, leaving storage uninitialized;
//   * calls the constructor when you call Init();
//   * provides access to the object of type T like a pointer via ->, *, and
//     get(); and
//   * calls T's destructor as usual.
//
// This is useful for embedding objects of type T inside Objective-C objects
// when T has no default constructor.
//
// Objective-C separates allocation from initialization which is different from
// the way C++ does it. A C++ object embedded in an Objective-C object is
// normally default constructed then assigned a value later. This doesn't work
// for classes that have no default constructor.
//
// DelayedConstructor does not count or otherwise check that Init is only
// called once. For best results call Init() from the Objective-C class's
// designated initializer.
//
// Note that DelayedConstructor makes no guarantees about the state of the
// storage backing it before Init() is called. However, Objective-C objects are
// zero filled during allocation, so as a member of an Objective-C object, the
// default state will be zero-filled.
//
// Normally this doesn't matter, but DelayedConstructor unconditionally invokes
// T's destructor, even if you don't call Init(). This may cause problems in
// Objective-C classes where the initializer is designed to return an instance
// other than self. It's best to avoid such instance switching techniques in
// combination with DelayedConstructor, but it is possible: either ensure that
// T's destructor handles the zero-filled case correctly, or call Init() before
// switching instances.
template <typename T>
class DelayedConstructor {
 public:
  typedef T element_type;

  DelayedConstructor() = default;

  /**
   * Forwards arguments to the T's constructor: calls T(args...).
   *
   * This overload is disabled when it might collide with copy/move.
   */
  template <typename... Ts,
            typename std::enable_if<
                !std::is_same<void(typename std::decay<Ts>::type...),
                              void(DelayedConstructor)>::value,
                int>::type = 0>
  void Init(Ts&&... args) {
    new (&space_.value) T(std::forward<Ts>(args)...);
  }

  /**
   * Forwards copy and move construction for T.
   */
  void Init(const T& x) {
    new (&space_.value) T(x);
  }
  void Init(T&& x) {
    new (&space_.value) T(std::move(x));
  }

  // No copying.
  DelayedConstructor(const DelayedConstructor&) = delete;
  DelayedConstructor& operator=(const DelayedConstructor&) = delete;

  // Pretend to be a smart pointer to T.
  T& operator*() {
    return *get();
  }
  T* operator->() {
    return get();
  }
  T* get() {
    return &space_.value;
  }
  const T& operator*() const {
    return *get();
  }
  const T* operator->() const {
    return get();
  }
  const T* get() const {
    return &space_.value;
  }

 private:
  union Space {
    /** Default constructor does nothing. */
    Space() {
    }
    ~Space() {
      value.~T();
    }
    char empty;
    T value;
  } space_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_DELAYED_CONSTRUCTOR_H_
