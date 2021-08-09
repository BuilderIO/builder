/*
 * Copyright 2020 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_UTIL_DEFER_H_
#define FIRESTORE_CORE_SRC_UTIL_DEFER_H_

#include <functional>
#include <utility>

namespace firebase {
namespace firestore {
namespace util {

/**
 * Creates a deferred action object that will execute the given `action` when
 * the `Defer` object is destroyed at the close of the lexical scope containing
 * it. You must declare a local variable of type `Defer` for it to have any
 * useful effect; otherwise the `Defer` is destroyed at the end of the
 * statement, which is equivalent to just directly running the `action`.
 *
 * `Defer` is useful for performing ad-hoc RAII-style actions, without having
 * to create the wrapper class. For example:
 *
 *     FILE* file = fopen(filename, "rb");
 *     Defer cleanup([&] {
 *       if (file) {
 *         fclose(file);
 *       }
 *     });
 */
class Defer {
  // TODO(C++17): Make Action a template argument and use CTAD in the callers.
 public:
  using Action = std::function<void()>;

  /**
   * Constructs a `Defer` object.
   *
   * @param action a callable object; usually a lambda. Even if exceptions are
   *     enabled, when `action` is invoked it must not throw. This is similar
   *     to the restriction that exists on destructors generally.
   */
  explicit Defer(Action&& action) : action_(std::move(action)) {
  }

  ~Defer() {
    action_();
  }

  // Defer can be neither copied nor moved.
  Defer(const Defer&) = delete;
  Defer& operator=(const Defer&) = delete;

 private:
  Action action_;
};

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_DEFER_H_
