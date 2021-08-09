/*
 * Copyright 2018 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_ARRAY_SORTED_MAP_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_ARRAY_SORTED_MAP_H_

#include <algorithm>
#include <array>
#include <cassert>
#include <functional>
#include <memory>
#include <utility>
#include <vector>

#include "Firestore/core/src/immutable/keys_view.h"
#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/range.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

/**
 * A bounded-size array that allocates its contents directly in itself. This
 * saves a heap allocation when compared with std::vector (though std::vector
 * can resize itself while FixedArray cannot).
 *
 * Unlike std::array, FixedArray keeps track of its size and grows up to the
 * fixed_size limit. Inserting more elements than fixed_size will trigger an
 * assertion failure.
 *
 * ArraySortedMap does not actually contain its array: it contains a shared_ptr
 * to a FixedArray.
 *
 * @tparam T The type of an element in the array.
 */
template <typename T>
class FixedArray {
 public:
  using size_type = SortedMapBase::size_type;
  using array_type = std::array<T, SortedMapBase::kFixedSize>;
  using iterator = typename array_type::iterator;
  using const_iterator = typename array_type::const_iterator;

  FixedArray() {
  }

  template <typename SourceIterator>
  FixedArray(SourceIterator src_begin, SourceIterator src_end) {
    append(src_begin, src_end);
  }

  /**
   * Appends to this array, copying from the given src_begin up to but not
   * including the src_end.
   */
  template <typename SourceIterator>
  void append(SourceIterator src_begin, SourceIterator src_end) {
    auto appending = static_cast<size_type>(src_end - src_begin);
    auto new_size = size_ + appending;
    HARD_ASSERT(new_size <= SortedMapBase::kFixedSize);

    std::copy(src_begin, src_end, end());
    size_ = new_size;
  }

  /**
   * Appends a single value to the array.
   */
  void append(T&& value) {
    size_type new_size = size_ + 1;
    HARD_ASSERT(new_size <= SortedMapBase::kFixedSize);

    *end() = std::move(value);
    size_ = new_size;
  }

  const_iterator begin() const {
    return contents_.begin();
  }

  const_iterator end() const {
    return begin() + size_;
  }

  size_type size() const {
    return size_;
  }

 private:
  iterator begin() {
    return contents_.begin();
  }

  iterator end() {
    return begin() + size_;
  }

  array_type contents_;
  size_type size_ = 0;
};

/**
 * ArraySortedMap is a value type containing a map. It is immutable, but has
 * methods to efficiently create new maps that are mutations of it.
 */
template <typename K, typename V, typename C = util::Comparator<K>>
class ArraySortedMap : public SortedMapBase {
 public:
  /**
   * The type of the entries stored in the map.
   */
  using value_type = std::pair<K, V>;

  /**
   * The type of the fixed-size array containing entries of value_type.
   */
  using array_type = FixedArray<value_type>;
  using const_iterator = typename array_type::const_iterator;
  using const_key_iterator = util::iterator_first<const_iterator>;

  using array_pointer = std::shared_ptr<const array_type>;

  /**
   * Creates an empty ArraySortedMap.
   */
  explicit ArraySortedMap(const C& comparator = C())
      : array_{EmptyArray()}, comparator_{comparator} {
  }

  /**
   * Creates an ArraySortedMap containing the given entries.
   */
  ArraySortedMap(std::initializer_list<value_type> entries,
                 const C& comparator = C())
      : array_{SortedArray(entries, comparator)}, comparator_{comparator} {
  }

  /** Returns true if the map contains no elements. */
  bool empty() const {
    return size() == 0;
  }

  /** Returns the number of items in this map. */
  size_type size() const {
    return array_->size();
  }

  const C& comparator() const {
    return comparator_;
  }

  /**
   * Creates a new map identical to this one, but with a key-value pair added or
   * updated.
   *
   * @param key The key to insert/update.
   * @param value The value to associate with the key.
   * @return A new dictionary with the added/updated value.
   */
  ArraySortedMap insert(const K& key, const V& value) const {
    const_iterator current_end = end();
    const_iterator pos = lower_bound(key);
    bool replacing_entry = false;

    if (pos != current_end) {
      // lower_bound found an entry where pos->first >= pair.first. Reversing
      // the argument order here tests pair.first < pos->first.
      auto cmp = comparator_.Compare(key, pos->first);
      replacing_entry = cmp == util::ComparisonResult::Same;
      if (replacing_entry && value == pos->second) {
        return *this;
      }
    }

    // Copy the segment before the found position. If not found, this is
    // everything.
    auto copy = std::make_shared<array_type>(begin(), pos);

    // Copy the value to be inserted.
    copy->append({key, value});

    if (replacing_entry) {
      // Skip the thing at pos because it compares the same as the pair above.
      copy->append(pos + 1, current_end);
    } else {
      copy->append(pos, current_end);
    }
    return wrap(copy);
  }

  /**
   * Creates a new map identical to this one, but with a key removed from it.
   *
   * @param key The key to remove.
   * @return A new dictionary without that value.
   */
  ArraySortedMap erase(const K& key) const {
    const_iterator current_end = end();
    const_iterator pos = find(key);
    if (pos == current_end) {
      return *this;
    } else if (size() <= 1) {
      // If the key was found and it's the last entry, removing it would make
      // the result empty.
      return wrap(EmptyArray());
    } else {
      auto copy = std::make_shared<array_type>(begin(), pos);
      copy->append(pos + 1, current_end);
      return wrap(copy);
    }
  }

  bool contains(const K& key) const {
    return find(key) != end();
  }

  /**
   * Finds a value in the map.
   *
   * @param key The key to look up.
   * @return An iterator pointing to the entry containing the key, or end() if
   *     not found.
   */
  const_iterator find(const K& key) const {
    return std::find_if(begin(), end(), [&](const std::pair<K, V>& kv) {
      return util::Same(comparator_.Compare(key, kv.first));
    });
  }

  /**
   * Finds the index of the given key in the map.
   *
   * @param key The key to look up.
   * @return The index of the entry containing the key, or npos if not found.
   */
  size_type find_index(const K& key) const {
    auto found = find(key);
    return found == end() ? npos : static_cast<size_type>(found - begin());
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
    return std::lower_bound(
        begin(), end(), key, [&](const std::pair<K, V>& el, const K& key) {
          return util::Ascending(comparator_.Compare(el.first, key));
        });
  }

  const_iterator min() const {
    return begin();
  }

  const_iterator max() const {
    if (empty()) {
      return end();
    }

    return end() - 1;
  }

  /**
   * Returns an iterator pointing to the first entry in the map. If there are
   * no entries in the map, begin() == end().
   */
  const_iterator begin() const {
    return array_->begin();
  }

  /**
   * Returns an iterator pointing past the last entry in the map.
   */
  const_iterator end() const {
    return array_->end();
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
    return impl::KeysViewIn(*this, start_key, end_key, comparator());
  }

 private:
  static array_pointer EmptyArray() {
    static const array_pointer* kEmptyArray = [] {
      auto array = new array_type();
      return new std::shared_ptr<const array_type>(array);
    }();
    return *kEmptyArray;
  }

  static array_pointer SortedArray(std::initializer_list<value_type> entries,
                                   const C& comparator) {
    std::vector<value_type> sorted{entries.begin(), entries.end()};
    std::sort(
        sorted.begin(), sorted.end(),
        [&comparator](const value_type& lhs, const value_type& rhs) {
          return util::Ascending(comparator.Compare(lhs.first, rhs.first));
        });
    return std::make_shared<const array_type>(sorted.begin(), sorted.end());
  }

  ArraySortedMap(const array_pointer& array, const C& comparator) noexcept
      : array_{array}, comparator_{comparator} {
  }

  ArraySortedMap wrap(const array_pointer& array) const noexcept {
    return ArraySortedMap{array, comparator_};
  }

  array_pointer array_;
  C comparator_;
};

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_ARRAY_SORTED_MAP_H_
