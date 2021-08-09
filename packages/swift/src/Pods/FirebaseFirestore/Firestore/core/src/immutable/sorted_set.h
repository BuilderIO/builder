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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_SET_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_SET_H_

#include <algorithm>
#include <utility>

#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/immutable/sorted_map.h"
#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/empty.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"
#include "absl/base/attributes.h"

namespace firebase {
namespace firestore {
namespace immutable {

template <typename K, typename C = util::Comparator<K>>
class SortedSet : public SortedContainer {
 public:
  using map_type = SortedMap<K, util::Empty, C>;

  using size_type = typename map_type::size_type;
  using value_type = K;

  using const_iterator = typename map_type::const_key_iterator;

  explicit SortedSet(const C& comparator = C()) : map_{comparator} {
  }

  explicit SortedSet(const map_type& map) : map_{map} {
  }

  explicit SortedSet(map_type&& map) : map_{std::move(map)} {
  }

  SortedSet(std::initializer_list<value_type> entries, const C& comparator = {})
      : map_{comparator} {
    for (auto&& value : entries) {
      map_ = map_.insert(value, {});
    }
  }

  bool empty() const {
    return map_.empty();
  }

  size_type size() const {
    return map_.size();
  }

  const C& comparator() const {
    return map_.comparator();
  }

  ABSL_MUST_USE_RESULT SortedSet insert(const K& key) const {
    return SortedSet{map_.insert(key, {})};
  }

  ABSL_MUST_USE_RESULT SortedSet union_with(const SortedSet& other) const {
    const SortedSet* result_ptr = this;
    const SortedSet* other_ptr = &other;

    // Make sure `result_ptr` always points to the larger one of the two sets.
    if (result_ptr->size() < other_ptr->size()) {
      result_ptr = other_ptr;
      other_ptr = this;
    }

    auto result = *result_ptr;
    for (const auto& k : *other_ptr) {
      result = result.insert(k);
    }
    return result;
  }

  ABSL_MUST_USE_RESULT SortedSet erase(const K& key) const {
    return SortedSet{map_.erase(key)};
  }

  bool contains(const K& key) const {
    return map_.contains(key);
  }

  const_iterator find(const K& key) const {
    return const_iterator{map_.find(key)};
  }

  size_type find_index(const K& key) const {
    return map_.find_index(key);
  }

  const_iterator min() const {
    return const_iterator{map_.min()};
  }

  const_iterator max() const {
    return const_iterator{map_.max()};
  }

  const_iterator begin() const {
    return const_iterator{map_.begin()};
  }

  const_iterator end() const {
    return const_iterator{map_.end()};
  }

  /**
   * Returns a view of this SortedSet containing just the keys that have been
   * inserted that are greater than or equal to the given key.
   */
  const util::range<const_iterator> values_from(const K& key) const {
    return map_.keys_from(key);
  }

  /**
   * Returns a view of this SortedSet containing just the keys that have been
   * inserted that are greater than or equal to the given start_key and less
   * than the given end_key.
   */
  const util::range<const_iterator> values_in(const K& start_key,
                                              const K& end_key) const {
    return map_.keys_in(start_key, end_key);
  }

  friend bool operator==(const SortedSet& lhs, const SortedSet& rhs) {
    if (lhs.size() != rhs.size()) {
      return false;
    }
    return std::equal(lhs.begin(), lhs.end(), rhs.begin());
  }

  friend bool operator!=(const SortedSet& lhs, const SortedSet& rhs) {
    return !(lhs == rhs);
  }

 private:
  map_type map_;
};

}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_SET_H_
