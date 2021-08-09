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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_ITERATOR_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_ITERATOR_H_

#include <utility>

#include "Firestore/core/src/immutable/array_sorted_map.h"
#include "Firestore/core/src/immutable/tree_sorted_map.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

template <typename V, typename ArrayIter, typename TreeIter>
class SortedMapIterator {
 public:
  using iterator_category = std::forward_iterator_tag;
  using value_type = V;
  using pointer = const value_type*;
  using reference = const value_type&;
  using difference_type = std::ptrdiff_t;

 public:
  // Default constructor to conform to the requirements of ForwardIterator
  SortedMapIterator() : tag_{Tag::Array}, array_iter_{} {
  }

  explicit SortedMapIterator(ArrayIter&& delegate)
      : tag_{Tag::Array}, array_iter_{std::move(delegate)} {
  }

  explicit SortedMapIterator(TreeIter&& delegate)
      : tag_{Tag::Tree}, tree_iter_{std::move(delegate)} {
  }

  SortedMapIterator(const SortedMapIterator& other) : tag_(other.tag_) {
    switch (tag_) {
      case Tag::Array:
        new (&array_iter_) ArrayIter{other.array_iter_};
        break;
      case Tag::Tree:
        new (&tree_iter_) TreeIter{other.tree_iter_};
        break;
    }
  }

  SortedMapIterator(SortedMapIterator&& other) noexcept : tag_(other.tag_) {
    switch (tag_) {
      case Tag::Array:
        new (&array_iter_) ArrayIter{std::move(other.array_iter_)};
        break;
      case Tag::Tree:
        new (&tree_iter_) TreeIter{std::move(other.tree_iter_)};
        break;
    }
  }

  ~SortedMapIterator() {
    switch (tag_) {
      case Tag::Array:
        array_iter_.~ArrayIter();
        break;
      case Tag::Tree:
        tree_iter_.~TreeIter();
        break;
    }
  }

  SortedMapIterator& operator=(const SortedMapIterator& other) {
    if (tag_ == other.tag_) {
      switch (tag_) {
        case Tag::Array:
          array_iter_ = other.array_iter_;
          break;
        case Tag::Tree:
          tree_iter_ = other.tree_iter_;
          break;
      }
    } else {
      this->~SortedMapIterator();
      new (this) SortedMapIterator(other);
    }
    return *this;
  }

  SortedMapIterator& operator=(SortedMapIterator&& other) noexcept {
    if (tag_ == other.tag_) {
      switch (tag_) {
        case Tag::Array:
          array_iter_ = std::move(other.array_iter_);
          break;
        case Tag::Tree:
          tree_iter_ = std::move(other.tree_iter_);
          break;
      }
    } else {
      this->~SortedMapIterator();
      new (this) SortedMapIterator(std::move(other));
    }
    return *this;
  }

  pointer get() const {
    switch (tag_) {
      case Tag::Array:
        // std::array::iterator is not guaranteed to be a bare pointer but will
        // be a RandomAccessIterator which does have operator*().
        return &*array_iter_;
      case Tag::Tree:
        return tree_iter_.get();
    }
    UNREACHABLE();
  }

  reference operator*() const {
    return *get();
  }

  pointer operator->() const {
    return get();
  }

  SortedMapIterator& operator++() {
    switch (tag_) {
      case Tag::Array:
        ++array_iter_;
        break;
      case Tag::Tree:
        ++tree_iter_;
        break;
    }
    return *this;
  }

  SortedMapIterator operator++(int /*unused*/) {
    SortedMapIterator result = *this;
    ++*this;
    return result;
  }

  friend bool operator==(const SortedMapIterator& a,
                         const SortedMapIterator& b) {
    if (a.tag_ != b.tag_) {
      return false;
    }

    switch (a.tag_) {
      case Tag::Array:
        return a.array_iter_ == b.array_iter_;
      case Tag::Tree:
        return a.tree_iter_ == b.tree_iter_;
    }
    UNREACHABLE();
  }

  bool operator!=(const SortedMapIterator& b) const {
    return !(*this == b);
  }

 private:
  enum class Tag {
    Array,
    Tree,
  };

  Tag tag_;
  union {
    ArrayIter array_iter_;
    TreeIter tree_iter_;
  };
};

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_ITERATOR_H_
