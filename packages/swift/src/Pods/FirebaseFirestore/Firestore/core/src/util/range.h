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

#ifndef FIRESTORE_CORE_SRC_UTIL_RANGE_H_
#define FIRESTORE_CORE_SRC_UTIL_RANGE_H_

#include <iterator>
#include <utility>

namespace firebase {
namespace firestore {
namespace util {

/**
 * Adapts a pair of iterators into a range suitable for use with range-based
 * for loops.
 */
template <typename Iterator>
class range {
 public:
  using value_type = typename std::iterator_traits<Iterator>::value_type;
  using iterator = Iterator;
  using const_iterator = Iterator;

  /**
   * Default range which constructs default begin and end pointers. For most
   * implementations where the end pointer is a null pointer or some other
   * default value, this ends up constructing the empty range.
   */
  range() : begin_{}, end_{} {
  }

  /**
   * Creates a half-open range starting from begin up to, but not including end.
   */
  range(iterator&& begin, iterator&& end)
      : begin_{std::move(begin)}, end_{std::move(end)} {
  }

  iterator begin() const {
    return begin_;
  }

  iterator end() const {
    return end_;
  }

 private:
  Iterator begin_;
  Iterator end_;
};

/**
 * Creates ranges with type deduction.
 */
template <typename Iterator>
range<Iterator> make_range(Iterator begin, Iterator end) {
  return range<Iterator>{std::move(begin), std::move(end)};
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_RANGE_H_
