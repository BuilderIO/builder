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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_ITERATOR_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_ITERATOR_H_

#include <iterator>
#include <stack>
#include <utility>

#include "Firestore/core/src/util/comparison.h"
#include "Firestore/core/src/util/hard_assert.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

/**
 * A forward iterator for traversing LlrbNodes. LlrbNodes represent the nodes
 * in a tree implementing a sorted map so iterating with LlrbNodeIterator is
 * an in-order traversal of the map.
 *
 * ## Complexity
 *
 * LlrbNode is an immutable tree, where mutations create new trees without
 * invalidating any of the old instances. This means the tree cannot contain
 * parent pointers and thus this iterator implementation must keep an explicit
 * stack.
 *
 * For an underlying tree of size `n`:
 *
 *   * LlrbNodeIterator uses `O(lg(n))` memory for its stack, and
 *   * incrementing an iterator is an `O(lg(n))` operation.
 *
 * ## Invalidation and Comparison
 *
 * LlrbNodeIterators compare based on the identity of the nodes themselves,
 * not based on the values of the keys in the nodes. When adding and removing
 * the same key and iterator obtained before and after will not compare equal.
 *
 * LlrbNodeIterators are not invalidated in any conventional sense because
 * mutations of the underlying tree create new trees. Together this means that
 * any given version of the tree can be iterated over from the same iterator
 * repeatedly, but a "mutable view" of the tree kept by replacing the pointer
 * to the root is effectively invalidated on each mutation.
 *
 * Note: LlrbNodeIterator does not extend the lifetime of its underlying tree.
 */
template <typename N>
class LlrbNodeIterator {
 public:
  using node_type = N;
  using key_type = typename node_type::first_type;

  using stack_type = std::stack<const node_type*>;

  using iterator_category = std::forward_iterator_tag;
  using value_type = typename node_type::value_type;

  using pointer = typename node_type::value_type const*;
  using reference = typename node_type::value_type const&;
  using difference_type = std::ptrdiff_t;

  explicit LlrbNodeIterator(stack_type&& stack) : stack_(std::move(stack)) {
  }

  /**
   * Constructs an iterator starting at the first node in the iteration
   * sequence of the tree represented by the given root node (i.e. it points at
   * the left-most node).
   */
  static LlrbNodeIterator Begin(const node_type* root) {
    stack_type stack;
    AccumulateLeft(root, &stack);
    return LlrbNodeIterator{std::move(stack)};
  }

  /**
   * Constructs an iterator pointing at the end of the iteration sequence of the
   * tree pointed to by the given node (i.e. one past the right-most node)
   */
  static LlrbNodeIterator End() {
    return LlrbNodeIterator{stack_type{}};
  }

  // Default constructor to conform to the requirements of ForwardIterator
  LlrbNodeIterator() {
  }

  /**
   * Constructs an iterator pointing to the first node whose key is not less
   * than the given key. If the key is in the tree then the lower bound will be
   * the node containing the key. If the key is not in the tree, the lower bound
   * will the first node greater than the key. If all nodes in the tree are less
   * than the given key, returns an equivalent to `End()`.
   */
  template <typename C>
  static LlrbNodeIterator LowerBound(const node_type* root,
                                     const key_type& key,
                                     const C& comparator) {
    stack_type stack;

    const node_type* node = root;
    while (!node->empty()) {
      util::ComparisonResult cmp = comparator.Compare(key, node->key());
      if (cmp == util::ComparisonResult::Same) {
        // Found exactly what we're looking for so we're done.
        stack.push(node);
        return LlrbNodeIterator{std::move(stack)};

      } else if (cmp == util::ComparisonResult::Ascending) {
        // key < node.key (for the forward direction)
        stack.push(node);
        node = &node->left();
      } else {
        // key > node.key (for the forward direction). Don't put this in the
        // stack because we don't need to revisit it in the iteration order.
        node = &node->right();
      }
    }

    return LlrbNodeIterator{std::move(stack)};
  }

  /**
   * Returns true if this iterator points at the end of the iteration sequence.
   */
  bool is_end() const {
    return stack_.empty();
  }

  /**
   * Returns the address of the entry in the node that this iterator points to.
   * This can only be called if `end()` is false.
   */
  pointer get() const {
    HARD_ASSERT(!is_end());
    return &(stack_.top()->entry());
  }

  reference operator*() const {
    return *get();
  }

  pointer operator->() const {
    return get();
  }

  LlrbNodeIterator& operator++() {
    HARD_ASSERT(!is_end());

    // Pop the stack, moving the currently pointed to node to the parent.
    const node_type* node = stack_.top();
    stack_.pop();

    // If the popped node has a right subtree that has to precede the parent in
    // the iteration order so push those on.
    node = &node->right();
    AccumulateLeft(node, &stack_);

    return *this;
  }

  LlrbNodeIterator operator++(int /*unused*/) {
    LlrbNodeIterator result = *this;
    ++*this;
    return result;
  }

  friend bool operator==(const LlrbNodeIterator& a, const LlrbNodeIterator& b) {
    if (a.is_end()) {
      return b.is_end();
    } else if (b.is_end()) {
      return false;
    } else {
      const key_type& left_key = a.get()->first;
      const key_type& right_key = b.get()->first;
      return left_key == right_key;
    }
  }

  bool operator!=(const LlrbNodeIterator& b) const {
    return !(*this == b);
  }

 private:
  static void AccumulateLeft(const node_type* node, stack_type* stack) {
    for (; !node->empty(); node = &node->left()) {
      stack->push(node);
    }
  }

  stack_type stack_;
};

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_ITERATOR_H_
