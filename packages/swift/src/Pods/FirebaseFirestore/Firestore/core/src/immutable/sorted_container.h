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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_CONTAINER_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_CONTAINER_H_

#include <cstdint>

namespace firebase {
namespace firestore {
namespace immutable {

/**
 * A base class for implementing immutable sorted containers, containing types
 * and constants that don't depend upon the template parameters to the main
 * class.
 *
 * Note that this exists as a base class rather than as just a namespace in
 * order to make it possible for users of the SortedMap classes to avoid needing
 * to declare storage for each instantiation of the template.
 */
class SortedContainer {
 public:
  /**
   * The type of size() methods on immutable collections. Note:
   *   * This is not size_t specifically to save space in the TreeSortedMap
   *     implementation.
   *   * This remains unsigned for straightforward casting to size_t.
   */
  using size_type = uint32_t;

  /**
   * A sentinel return value that indicates not found. Functionally similar to
   * std::string::npos.
   */
  static constexpr size_type npos = static_cast<size_type>(-1);
};

/**
 * A base class for implementing sorted maps, containing types and constants
 * that don't depend upon the template parameters to the main class.
 *
 * Note that this exists as a base class rather than as just a namespace in
 * order to make it possible for users of the SortedMap classes to avoid needing
 * to declare storage for each instantiation of the template.
 */
class SortedMapBase : public SortedContainer {
 public:
  /**
   * The maximum size of an ArraySortedMap.
   *
   * This is the size threshold where we use a tree backed sorted map instead of
   * an array backed sorted map. This is a more or less arbitrary chosen value,
   * that was chosen to be large enough to fit most of object kind of Firebase
   * data, but small enough to not notice degradation in performance for
   * inserting and lookups. Feel free to empirically determine this constant,
   * but don't expect much gain in real world performance.
   */
  static constexpr size_type kFixedSize = 25;
};

}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_SORTED_CONTAINER_H_
