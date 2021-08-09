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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_KEYS_VIEW_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_KEYS_VIEW_H_

#include <utility>

#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/iterator_adaptors.h"
#include "Firestore/core/src/util/range.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

template <typename Iterator>
using KeysRange = util::range<util::iterator_first<Iterator>>;

template <typename Iterator>
KeysRange<Iterator> MakeKeysRange(Iterator begin, Iterator end) {
  auto keys_begin = util::make_iterator_first(begin);
  auto keys_end = util::make_iterator_first(end);
  return util::make_range(keys_begin, keys_end);
}

/**
 * Returns a view of the keys of the given key-value range.
 */
template <typename Range>
auto KeysView(const Range& range) -> KeysRange<decltype(std::begin(range))> {
  return MakeKeysRange(std::begin(range), std::end(range));
}

template <typename Range, typename K>
auto KeysViewFrom(const Range& range, const K& key)
    -> KeysRange<decltype(range.lower_bound(key))> {
  auto keys_begin = util::make_iterator_first(range.lower_bound(key));
  auto keys_end = util::make_iterator_first(std::end(range));
  return util::make_range(keys_begin, keys_end);
}

/**
 * Returns a view of keys of the given key-value range that are greater than or
 * equal to the given start_key and less than the given end_key.
 *
 * If `end_key` is less than or equal to `start_key`, creates empty range.
 */
template <typename Range, typename K, typename C>
auto KeysViewIn(const Range& range,
                const K& start_key,
                const K& end_key,
                const C& comparator)
    -> KeysRange<decltype(range.lower_bound(start_key))> {
  // Forward iterators can't ever reach the end if the end is behind the start:
  // they just keep incrementing until address space runs out. Adjust the range
  // accordingly.
  bool empty_range = !util::Ascending(comparator.Compare(start_key, end_key));
  if (empty_range) {
    return MakeKeysRange(std::end(range), std::end(range));
  }

  auto range_begin = range.lower_bound(start_key);
  auto range_end = range.lower_bound(end_key);
  return MakeKeysRange(std::move(range_begin), std::move(range_end));
}

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_KEYS_VIEW_H_
