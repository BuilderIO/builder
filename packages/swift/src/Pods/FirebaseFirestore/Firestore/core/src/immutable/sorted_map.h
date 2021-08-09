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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_H_

#include <utility>

#include "Firestore/core/src/immutable/array_sorted_map.h"
#include "Firestore/core/src/immutable/keys_view.h"
#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/immutable/sorted_map_iterator.h"
#include "Firestore/core/src/immutable/tree_sorted_map.h"
#include "Firestore/core/src/util/comparison.h"
#include "absl/base/attributes.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace immutable {

/**
 * SortedMap is a value type containing a map. It is immutable, but
 * has methods to efficiently create new maps that are mutations of it.
 */
template <typename K, typename V, typename C = util::Comparator<K>>
class SortedMap : public SortedMapBase {
 public:
  using key_type = K;
  using mapped_type = V;
  /** The type of the entries stored in the map. */
  using value_type = std::pair<K, V>;
  using array_type = impl::ArraySortedMap<K, V, C>;
  using tree_type = impl::TreeSortedMap<K, V, C>;

  using const_iterator = impl::SortedMapIterator<
      value_type,
      typename impl::FixedArray<value_type>::const_iterator,
      typename impl::LlrbNode<K, V>::const_iterator>;

  using const_key_iterator = util::iterator_first<const_iterator>;

  /**
   * Creates an empty SortedMap.
   */
  explicit SortedMap(const C& comparator = {})
      : SortedMap{array_type{comparator}} {
  }

  /**
   * Creates an SortedMap containing the given entries.
   */
  SortedMap(std::initializer_list<value_type> entries,
            const C& comparator = {}) {
    if (entries.size() <= kFixedSize) {
      tag_ = Tag::Array;
      new (&array_) array_type{entries, comparator};
    } else {
      new (&tree_) tree_type{tree_type::Create(entries, comparator)};
    }
  }

  SortedMap(const SortedMap& other) : tag_{other.tag_} {
    switch (tag_) {
      case Tag::Array:
        new (&array_) array_type{other.array_};
        break;
      case Tag::Tree:
        new (&tree_) tree_type{other.tree_};
        break;
    }
  }

  SortedMap(SortedMap&& other) noexcept : tag_{other.tag_} {
    switch (tag_) {
      case Tag::Array:
        new (&array_) array_type{std::move(other.array_)};
        break;
      case Tag::Tree:
        new (&tree_) tree_type{std::move(other.tree_)};
        break;
    }
  }

  ~SortedMap() {
    switch (tag_) {
      case Tag::Array:
        array_.~ArraySortedMap();
        break;
      case Tag::Tree:
        tree_.~TreeSortedMap();
        break;
    }
  }

  SortedMap& operator=(const SortedMap& other) {
    if (tag_ == other.tag_) {
      switch (tag_) {
        case Tag::Array:
          array_ = other.array_;
          break;
        case Tag::Tree:
          tree_ = other.tree_;
          break;
      }
    } else {
      this->~SortedMap();
      new (this) SortedMap{other};
    }
    return *this;
  }

  SortedMap& operator=(SortedMap&& other) noexcept {
    if (tag_ == other.tag_) {
      switch (tag_) {
        case Tag::Array:
          array_ = std::move(other.array_);
          break;
        case Tag::Tree:
          tree_ = std::move(other.tree_);
          break;
      }
    } else {
      this->~SortedMap();
      new (this) SortedMap{std::move(other)};
    }
    return *this;
  }

  /** Returns true if the map contains no elements. */
  bool empty() const {
    switch (tag_) {
      case Tag::Array:
        return array_.empty();
      case Tag::Tree:
        return tree_.empty();
    }
    UNREACHABLE();
  }

  /** Returns the number of items in this map. */
  size_type size() const {
    switch (tag_) {
      case Tag::Array:
        return array_.size();
      case Tag::Tree:
        return tree_.size();
    }
    UNREACHABLE();
  }

  const C& comparator() const {
    switch (tag_) {
      case Tag::Array:
        return array_.comparator();
      case Tag::Tree:
        return tree_.comparator();
    }
    UNREACHABLE();
  }

  /**
   * Creates a new map identical to this one, but with a key-value pair added or
   * updated.
   *
   * @param key The key to insert/update.
   * @param value The value to associate with the key.
   * @return A new dictionary with the added/updated value.
   */
  ABSL_MUST_USE_RESULT SortedMap insert(const K& key, const V& value) const {
    switch (tag_) {
      case Tag::Array:
        if (array_.size() >= kFixedSize) {
          // Strictly speaking this conversion is more eager than it needs to
          // be since we could be replacing an existing key. However, the
          // benefit of using the array for small maps doesn't really depend on
          // exactly where this cut-off happens and just unconditionally
          // converting if the next insertion could overflow keeps things
          // simpler.
          tree_type tree = tree_type::Create(array_, comparator());
          return SortedMap{tree.insert(key, value)};
        } else {
          return SortedMap{array_.insert(key, value)};
        }
      case Tag::Tree:
        return SortedMap{tree_.insert(key, value)};
    }
    UNREACHABLE();
  }

  /**
   * Creates a new map identical to this one, but with a key removed from it.
   *
   * @param key The key to remove.
   * @return A new map without that value.
   */
  ABSL_MUST_USE_RESULT SortedMap erase(const K& key) const {
    switch (tag_) {
      case Tag::Array:
        return SortedMap{array_.erase(key)};
      case Tag::Tree:
        tree_type result = tree_.erase(key);
        if (result.empty()) {
          // Flip back to the array representation for empty arrays.
          return SortedMap{comparator()};
        }
        return SortedMap{std::move(result)};
    }
    UNREACHABLE();
  }

  bool contains(const K& key) const {
    switch (tag_) {
      case Tag::Array:
        return array_.contains(key);
      case Tag::Tree:
        return tree_.contains(key);
    }
    UNREACHABLE();
  }

  /**
   * Finds a value in the map.
   *
   * @param key The key to look up.
   * @return An iterator pointing to the entry containing the key, or end() if
   *     not found.
   */
  const_iterator find(const K& key) const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator(array_.find(key));
      case Tag::Tree:
        return const_iterator{tree_.find(key)};
    }
    UNREACHABLE();
  }

  /**
   * Finds the index of the given key in the map.
   *
   * @param key The key to look up.
   * @return The index of the entry containing the key, or npos if not found.
   */
  size_type find_index(const K& key) const {
    switch (tag_) {
      case Tag::Array:
        return array_.find_index(key);
      case Tag::Tree:
        return tree_.find_index(key);
    }
    UNREACHABLE();
  }

  absl::optional<V> get(const K& key) const {
    auto found = find(key);
    if (found != end()) {
      return found->second;
    } else {
      return absl::nullopt;
    }
  }

  /**
   * Finds the first entry in the map containing a key greater than or equal
   * to the given key.
   *
   * @param key The key to look up.
   * @return An iterator pointing to the entry containing the key or the next
   *     largest key. Can return end() if all keys in the map are less than the
   *     requested key.
   */
  const_iterator lower_bound(const K& key) const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator(array_.lower_bound(key));
      case Tag::Tree:
        return const_iterator{tree_.lower_bound(key)};
    }
    UNREACHABLE();
  }

  const_iterator min() const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator(array_.min());
      case Tag::Tree:
        return const_iterator{tree_.min()};
    }
    UNREACHABLE();
  }

  const_iterator max() const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator(array_.max());
      case Tag::Tree:
        return const_iterator{tree_.max()};
    }
    UNREACHABLE();
  }

  /**
   * Returns an iterator pointing to the first entry in the map. If there are
   * no entries in the map, begin() == end().
   */
  const_iterator begin() const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator{array_.begin()};
      case Tag::Tree:
        return const_iterator{tree_.begin()};
    }
    UNREACHABLE();
  }

  /**
   * Returns an iterator pointing past the last entry in the map.
   */
  const_iterator end() const {
    switch (tag_) {
      case Tag::Array:
        return const_iterator{array_.end()};
      case Tag::Tree:
        return const_iterator{tree_.end()};
    }
    UNREACHABLE();
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted.
   */
  const util::range<const_key_iterator> keys() const {
    return impl::KeysView(*this);
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted that are greater than or equal to the given key.
   */
  const util::range<const_key_iterator> keys_from(const K& key) const {
    return impl::KeysViewFrom(*this, key);
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted that are greater than or equal to the given start_key and less
   * than the given end_key.
   */
  const util::range<const_key_iterator> keys_in(const K& start_key,
                                                const K& end_key) const {
    return impl::KeysViewIn(*this, start_key, end_key, comparator());
  }

 private:
  explicit SortedMap(array_type&& array)
      : tag_{Tag::Array}, array_{std::move(array)} {
  }

  explicit SortedMap(tree_type&& tree)
      : tag_{Tag::Tree}, tree_{std::move(tree)} {
  }

  enum class Tag {
    Array,
    Tree,
  };

  Tag tag_;
  union {
    array_type array_;
    tree_type tree_;
  };
};

}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_MAP_H_
