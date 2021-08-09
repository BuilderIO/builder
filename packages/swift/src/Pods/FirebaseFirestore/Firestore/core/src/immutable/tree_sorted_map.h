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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_TREE_SORTED_MAP_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_TREE_SORTED_MAP_H_

#include <algorithm>
#include <cassert>
#include <functional>
#include <memory>
#include <utility>

#include "Firestore/core/src/immutable/keys_view.h"
#include "Firestore/core/src/immutable/llrb_node.h"
#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/compressed_member.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

/**
 * TreeSortedMap is a value type containing a map. It is immutable, but has
 * methods to efficiently create new maps that are mutations of it.
 */
template <typename K, typename V, typename C = util::Comparator<K>>
class TreeSortedMap : public SortedMapBase, private util::CompressedMember<C> {
  using ComparatorMember = util::CompressedMember<C>;

 public:
  /**
   * The type of the entries stored in the map.
   */
  using value_type = std::pair<K, V>;

  /**
   * The type of the node containing entries of value_type.
   */
  using node_type = LlrbNode<K, V>;
  using const_iterator = typename node_type::const_iterator;
  using const_key_iterator = util::iterator_first<const_iterator>;

  /**
   * Creates an empty TreeSortedMap.
   */
  explicit TreeSortedMap(const C& comparator = {})
      : ComparatorMember{comparator} {
  }

  /**
   * Creates a TreeSortedMap from a range of pairs to insert.
   */
  template <typename Range>
  static TreeSortedMap Create(const Range& range, const C& comparator) {
    node_type node;
    for (auto&& element : range) {
      node = node.insert(element.first, element.second, comparator);
    }
    return TreeSortedMap{std::move(node), comparator};
  }

  /** Returns true if the map contains no elements. */
  bool empty() const {
    return root_.empty();
  }

  /** Returns the number of items in this map. */
  size_type size() const {
    return root_.size();
  }

  const node_type& root() const {
    return root_;
  }

  const C& comparator() const {
    return ComparatorMember::get();
  }

  /**
   * Creates a new map identical to this one, but with a key-value pair added or
   * updated.
   *
   * @param key The key to insert/update.
   * @param value The value to associate with the key.
   * @return A new dictionary with the added/updated value.
   */
  TreeSortedMap insert(const K& key, const V& value) const {
    const C& comparator = this->comparator();
    return TreeSortedMap{root_.insert(key, value, comparator), comparator};
  }

  /**
   * Creates a new map identical to this one, but with a key removed from it.
   *
   * @param key The key to remove.
   * @return A new map without that value.
   */
  TreeSortedMap erase(const K& key) const {
    const C& comparator = this->comparator();
    return TreeSortedMap{root_.erase(key, comparator), comparator};
  }

  bool contains(const K& key) const {
    // Inline the tree traversal here to avoid building up the stack required
    // to construct a full iterator.
    const C& comparator = this->comparator();
    const node_type* node = &root();
    while (!node->empty()) {
      util::ComparisonResult cmp = comparator.Compare(key, node->key());
      if (cmp == util::ComparisonResult::Same) {
        return true;
      } else if (cmp == util::ComparisonResult::Ascending) {
        node = &node->left();
      } else {
        node = &node->right();
      }
    }
    return false;
  }

  /**
   * Finds a value in the map.
   *
   * @param key The key to look up.
   * @return An iterator pointing to the entry containing the key, or end() if
   *     not found.
   */
  const_iterator find(const K& key) const {
    const_iterator found = lower_bound(key);
    if (!found.is_end() &&
        util::Same(this->comparator().Compare(key, found->first))) {
      return found;
    } else {
      return end();
    }
  }

  /**
   * Finds the index of the given key in the map.
   *
   * @param key The key to look up.
   * @return The index of the entry containing the key, or npos if not found.
   */
  size_type find_index(const K& key) const {
    const C& comparator = this->comparator();

    size_type pruned_nodes = 0;
    const node_type* node = &root_;
    while (!node->empty()) {
      util::ComparisonResult cmp = comparator.Compare(key, node->key());
      if (cmp == util::ComparisonResult::Same) {
        return pruned_nodes + node->left().size();

      } else if (cmp == util::ComparisonResult::Ascending) {
        node = &node->left();

      } else if (cmp == util::ComparisonResult::Descending) {
        pruned_nodes += node->left().size() + 1;
        node = &node->right();
      }
    }
    return npos;
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
    return const_iterator::LowerBound(&root_, key, this->comparator());
  }

  const_iterator min() const {
    return begin();
  }

  const_iterator max() const {
    if (empty()) {
      return end();
    }

    const node_type& max_node = root_.max();
    typename const_iterator::stack_type stack;
    stack.push(&max_node);
    return const_iterator{std::move(stack)};
  }

  /**
   * Returns a forward iterator pointing to the first entry in the map. If there
   * are no entries in the map, begin() == end().
   *
   * See LlrbNodeIterator for details
   */
  const_iterator begin() const {
    return const_iterator::Begin(&root_);
  }

  /**
   * Returns an iterator pointing past the last entry in the map.
   */
  const_iterator end() const {
    return const_iterator::End();
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted.
   */
  const util::range<const_key_iterator> keys() const {
    return KeysView(*this);
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted that are greater than or equal to the given key.
   */
  const util::range<const_key_iterator> keys_from(const K& key) const {
    return KeysViewFrom(*this, key);
  }

  /**
   * Returns a view of this SortedMap containing just the keys that have been
   * inserted that are greater than or equal to the given start_key and less
   * than the given end_key.
   */
  const util::range<const_key_iterator> keys_in(const K& start_key,
                                                const K& end_key) const {
    return impl::KeysViewIn(*this, start_key, end_key, this->comparator());
  }

 private:
  TreeSortedMap(node_type&& root, const C& comparator) noexcept
      : ComparatorMember{comparator}, root_{std::move(root)} {
  }

  TreeSortedMap Wrap(node_type&& root) noexcept {
    return TreeSortedMap{std::move(root), this->comparator()};
  }

  node_type root_;
};

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_TREE_SORTED_MAP_H_
