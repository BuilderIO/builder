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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_APPEND_ONLY_LIST_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_APPEND_ONLY_LIST_H_

#include <algorithm>
#include <iterator>
#include <memory>
#include <utility>
#include <vector>

#include "absl/algorithm/container.h"
#include "absl/base/attributes.h"

namespace firebase {
namespace firestore {
namespace immutable {

/**
 * An immutable list, optimized for appending.
 *
 * Each `push_back` creates a new instance and does not modify any that come
 * before. If `push_back` is called on the last such instance, it will share
 * the backing vector with the prior instance (though the prior instance will
 * not perceive any change).
 *
 * This "chaining" behavior is what makes AppendOnlyList efficient, but it only
 * applies when applied to the last link in the chain. When applied any instance
 * that is not at the end, most operations will copy instead of chaining.
 *
 * Iterators over an AppendOnlyList are never invalidated.
 */
template <typename T>
class AppendOnlyList {
 public:
  using iterator = const T*;
  using const_iterator = const T*;
  using value_type = T;

  AppendOnlyList() = default;

  AppendOnlyList(std::initializer_list<T> initializer_list)
      : contents_(std::make_shared<std::vector<T>>(initializer_list)),
        size_(initializer_list.size()) {
  }

  /**
   * Returns a new AppendOnlyList that has reserved the given capacity in its
   * backing vector, without actually lengthening the chain.
   *
   * This has a similar effect to std::vector::reserve, except that *this is
   * not actually modified. Successive `push_back` operations until `size()`
   * is equal to `capacity` are guaranteed to be O(1).
   *
   * Note that if this instance is not the end of the chain, then this forces
   * a copy.
   */
  ABSL_MUST_USE_RESULT AppendOnlyList reserve(size_t capacity) const {
    if (capacity <= size_) {
      return *this;
    }

    // Create a the underlying vector with capacity reserved, but return the
    // result with the current size. Reserving does not actually append anything
    // to the underlying vector so size() shouldn't change.
    std::shared_ptr<std::vector<T>> new_contents = PrepareForAppend(capacity);
    return AppendOnlyList(std::move(new_contents), size_);
  }

  /**
   * Creates a new AppendOnlyList with the given value appended to the end.
   *
   * Each `push_back` creates a new instance and appears not to modify any that
   * come. If `push_back` is called on the last instance in a chain, it will
   * share the backing vector with the prior instance.
   *
   * If `push_back` is called when this instance isn't the last instance in the
   * chain, it will make a copy of all preceding elements in the chain and
   * return a new chain suitable for further chained `push_back` operations.
   */
  ABSL_MUST_USE_RESULT AppendOnlyList push_back(const T& value) const {
    size_t new_size = size_ + 1;
    std::shared_ptr<std::vector<T>> new_contents = PrepareForAppend(new_size);

    new_contents->push_back(value);
    return AppendOnlyList(std::move(new_contents), new_size);
  }

  /**
   * Creates a new AppendOnlyList with the given value appended to the end.
   *
   * @see `push_back(const T&)` for detailed discussion.
   */
  ABSL_MUST_USE_RESULT AppendOnlyList push_back(T&& value) const {
    size_t new_size = size_ + 1;
    std::shared_ptr<std::vector<T>> new_contents = PrepareForAppend(new_size);

    new_contents->push_back(std::move(value));
    return AppendOnlyList(std::move(new_contents), new_size);
  }

  /**
   * Creates a new AppendOnlyList constructing a new value appended to the end.
   *
   * @see `push_back(const T&)` for detailed discussion.
   */
  template <typename... Args>
  ABSL_MUST_USE_RESULT AppendOnlyList emplace_back(Args&&... args) const {
    size_t new_size = size_ + 1;
    std::shared_ptr<std::vector<T>> new_contents = PrepareForAppend(new_size);

    new_contents->emplace_back(std::forward<Args>(args)...);
    return AppendOnlyList(std::move(new_contents), new_size);
  }

  /**
   * Creates a new AppendOnlyList with the final link in the chain removed.
   *
   * Note that the element isn't actually removed from the backing vector and
   * it still constitutes the end of the chain. This means that any `push_back`
   * on the resulting AppendOnlyList will result in a full copy.
   *
   * Calling pop_back() on an empty AppendOnlyList returns an empty
   * AppendOnlyList.
   */
  ABSL_MUST_USE_RESULT AppendOnlyList pop_back() const {
    if (size_ <= 1) {
      return AppendOnlyList(nullptr, 0);
    }

    return AppendOnlyList(contents_, size_ - 1);
  }

  size_t size() const {
    return size_;
  }

  size_t capacity() const {
    return contents_ ? contents_->capacity() : 0;
  }

  bool empty() const {
    return size_ == 0;
  }

  /**
   * Returns an iterator to the beginning of the list. Iterators are never
   * invalidated (so long as the container itself is valid).
   */
  const_iterator begin() const {
    if (size_ == 0) {
      return nullptr;
    } else {
      return contents_->data();
    }
  }

  /**
   * Returns an iterator that points to one past the end of the list. Iterators
   * are never invalidated (so long as the container itself is valid).
   */
  const_iterator end() const {
    if (size_ == 0) {
      return nullptr;
    } else {
      return contents_->data() + size_;
    }
  }

  /**
   * Returns the first element of the list. Only valid when the list is not
   * empty.
   */
  const T& front() const {
    return *begin();
  }

  /**
   * Returns the last element of the list. Only valid when the list is not
   * empty.
   */
  const T& back() const {
    return *(end() - 1);
  }

  const T& operator[](size_t pos) const {
    return (*contents_)[pos];
  }

  friend bool operator==(const AppendOnlyList& lhs, const AppendOnlyList& rhs) {
    return absl::c_equal(lhs, rhs);
  }

  friend bool operator!=(const AppendOnlyList& lhs, const AppendOnlyList& rhs) {
    return !(lhs == rhs);
  }

 private:
  AppendOnlyList(std::shared_ptr<std::vector<T>> contents, size_t size)
      : contents_(std::move(contents)), size_(size) {
  }

  std::shared_ptr<std::vector<T>> PrepareForAppend(size_t new_size) const {
    if (contents_ && size_ == contents_->size() &&
        new_size <= contents_->capacity()) {
      // If there's an existing vector, this instance points to the end, and
      // can already accommodate what's required, there's nothing to do.
      return contents_;
    }

    size_t min_capacity = new_size;
    if (contents_) {
      // if contents_->capacity() * 2 overflows, min_capacity will be larger.
      min_capacity = std::max(min_capacity, contents_->capacity() * 2);
    }

    // min_capacity will be larger than the existing contents of this list so
    // reserve that capacity copying in the current values. Copying from this
    // and then reserving would cause two allocations, the first for exactly
    // the current size and then another for min_capacity.
    auto new_contents = std::make_shared<std::vector<T>>();
    new_contents->reserve(min_capacity);
    new_contents->insert(new_contents->begin(), begin(), end());
    return new_contents;
  }

  // A shared vector. Sequential push_back operations will share the vector. May
  // be nullptr when size_ == 0, but is not required to be null.
  std::shared_ptr<std::vector<T>> contents_;

  // size_ is not shared.
  size_t size_ = 0;
};

}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_APPEND_ONLY_LIST_H_
