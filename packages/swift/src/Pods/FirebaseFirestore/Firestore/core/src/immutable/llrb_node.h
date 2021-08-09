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

#ifndef FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_H_
#define FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_H_

#include <memory>
#include <utility>

#include "Firestore/core/src/immutable/llrb_node_iterator.h"
#include "Firestore/core/src/immutable/sorted_container.h"
#include "Firestore/core/src/util/comparison.h"

namespace firebase {
namespace firestore {
namespace immutable {
namespace impl {

/**
 * A Color of a tree node in a red-black tree.
 */
enum Color : unsigned int {
  Black,
  Red,
};

/**
 * LlrbNode is a node in a TreeSortedMap.
 */
template <typename K, typename V>
class LlrbNode : public SortedMapBase {
 public:
  using first_type = K;
  using second_type = V;

  /**
   * The type of the entries stored in the map.
   */
  using value_type = std::pair<K, V>;
  using const_iterator = LlrbNodeIterator<LlrbNode<K, V>>;

  /**
   * Constructs an empty node.
   */
  LlrbNode() : LlrbNode{EmptyRep()} {
  }

  /** Returns true if this is an empty node--a leaf node in the tree. */
  bool empty() const {
    return size() == 0;
  }

  /** Returns the number of elements at this node or beneath it in the tree. */
  size_type size() const {
    return rep_->size_;
  }

  /** Returns true if this node is red (as opposed to black). */
  bool red() const {
    return static_cast<bool>(rep_->color_);
  }

  const value_type& entry() const {
    return rep_->entry_;
  }
  const K& key() const {
    return entry().first;
  }
  const V& value() const {
    return entry().second;
  }
  Color color() const {
    return static_cast<Color>(rep_->color_);
  }
  const LlrbNode& left() const {
    return rep_->left_;
  }
  const LlrbNode& right() const {
    return rep_->right_;
  }

  /** Returns a tree node with the given key-value pair set/updated. */
  template <typename Comparator>
  LlrbNode insert(const K& key,
                  const V& value,
                  const Comparator& comparator) const;

  template <typename Comparator>
  LlrbNode erase(const K& key, const Comparator& comparator) const;

  const LlrbNode& min() const {
    const LlrbNode* node = this;
    while (!node->left().empty()) {
      node = &node->left();
    }
    return *node;
  }

  const LlrbNode& max() const {
    const LlrbNode* node = this;
    while (!node->right().empty()) {
      node = &node->right();
    }
    return *node;
  }

 private:
  struct Rep {
    Rep(value_type&& entry,
        size_type color,
        size_type size,
        LlrbNode left,
        LlrbNode right)
        : entry_{std::move(entry)},
          color_{color},
          size_{size},
          left_{std::move(left)},
          right_{std::move(right)} {
    }

    Rep(value_type&& entry, size_type color, LlrbNode left, LlrbNode right)
        : entry_{std::move(entry)},
          color_{color},
          size_{left.size() + 1 + right.size()},
          left_{std::move(left)},
          right_{std::move(right)} {
    }

    value_type entry_;

    // Store the color in the high bit of the size to save memory.
    size_type color_ : 1;
    size_type size_ : 31;

    LlrbNode left_;
    LlrbNode right_;
  };

  explicit LlrbNode(Rep rep) : rep_{std::make_shared<Rep>(std::move(rep))} {
  }

  explicit LlrbNode(const std::shared_ptr<Rep>& rep) : rep_{rep} {
  }

  explicit LlrbNode(std::shared_ptr<Rep>&& rep) : rep_{std::move(rep)} {
  }

  /**
   * Returns a shared Empty node, to cut down on allocations in the base case.
   */
  static const std::shared_ptr<Rep>& EmptyRep() {
    static const std::shared_ptr<Rep>* empty_rep = [] {
      auto rep = new Rep{std::pair<K, V>{}, Color::Black,
                         /* size= */ 0u, LlrbNode{nullptr}, LlrbNode{nullptr}};
      auto empty = new std::shared_ptr<Rep>{rep};

      // Set up the empty Rep such that you can traverse infinitely down left
      // and right links.
      (*empty)->left_.rep_ = *empty;
      (*empty)->right_.rep_ = *empty;
      return empty;
    }();
    return *empty_rep;
  }

  /**
   * Creates a new copy of this node, duplicating the Rep but without
   * duplicating the left_ and right_ children.
   */
  LlrbNode Clone() const {
    return LlrbNode{*rep_};
  }

  void set_size(size_type size) {
    rep_->size_ = size;
  }

  void set_entry(const value_type& entry) {
    rep_->entry_ = entry;
  }
  void set_entry(value_type&& entry) {
    rep_->entry_ = std::move(entry);
  }
  void set_value(const V& value) {
    rep_->entry_.second = value;
  }
  void set_color(size_type color) {
    rep_->color_ = color;
  }
  void set_left(const LlrbNode& left) {
    rep_->left_ = left;
  }
  void set_left(LlrbNode&& left) {
    rep_->left_ = std::move(left);
  }
  void set_right(const LlrbNode& right) {
    rep_->right_ = right;
  }
  void set_right(LlrbNode&& right) {
    rep_->right_ = std::move(right);
  }

  template <typename Comparator>
  LlrbNode InnerInsert(const K& key,
                       const V& value,
                       const Comparator& comparator) const;

  template <typename Comparator>
  LlrbNode InnerErase(const K& key, const Comparator& comparator) const;

  void FixUp();
  void FixRootColor();

  void RotateLeft();
  void RotateRight();
  void FlipColor();

  void RemoveMin();
  void MoveRedLeft();
  void MoveRedRight();

  size_type OppositeColor() const noexcept {
    return rep_->color_ == Color::Red ? Color::Black : Color::Red;
  }

  std::shared_ptr<Rep> rep_;
};

template <typename K, typename V>
template <typename Comparator>
LlrbNode<K, V> LlrbNode<K, V>::insert(const K& key,
                                      const V& value,
                                      const Comparator& comparator) const {
  LlrbNode root = InnerInsert(key, value, comparator);
  root.FixRootColor();
  return root;
}

template <typename K, typename V>
template <typename Comparator>
LlrbNode<K, V> LlrbNode<K, V>::InnerInsert(const K& key,
                                           const V& value,
                                           const Comparator& comparator) const {
  if (empty()) {
    return LlrbNode{Rep{{key, value}, Color::Red, LlrbNode{}, LlrbNode{}}};
  }

  // Inserting is going to result in a copy but we can save some allocations by
  // creating the copy once and fixing that up, rather than copying and
  // re-copying the result.
  LlrbNode result = Clone();

  const K& this_key = this->key();
  util::ComparisonResult cmp = comparator.Compare(this_key, key);
  if (cmp == util::ComparisonResult::Descending) {
    result.set_left(result.left().InnerInsert(key, value, comparator));
    result.FixUp();

  } else if (cmp == util::ComparisonResult::Ascending) {
    result.set_right(result.right().InnerInsert(key, value, comparator));
    result.FixUp();

  } else {
    // keys are equal so update the value.
    result.set_value(value);
  }
  return result;
}

template <typename K, typename V>
template <typename Comparator>
LlrbNode<K, V> LlrbNode<K, V>::erase(const K& key,
                                     const Comparator& comparator) const {
  LlrbNode root = InnerErase(key, comparator);
  root.FixRootColor();
  return root;
}

template <typename K, typename V>
template <typename Comparator>
LlrbNode<K, V> LlrbNode<K, V>::InnerErase(const K& key,
                                          const Comparator& comparator) const {
  if (empty()) {
    // Empty node already frozen
    return LlrbNode{};
  }

  LlrbNode n = Clone();

  if (util::Ascending(comparator.Compare(key, n.key()))) {
    if (!n.left().empty() && !n.left().red() && !n.left().left().red()) {
      n.MoveRedLeft();
    }
    n.set_left(n.left().InnerErase(key, comparator));

  } else {
    if (n.left().red()) {
      n.RotateRight();
    }

    if (!n.right().empty() && !n.right().red() && !n.right().left().red()) {
      n.MoveRedRight();
    }

    if (util::Same(comparator.Compare(key, n.key()))) {
      if (n.right().empty()) {
        return LlrbNode{};

      } else {
        // Move the minimum node from the right subtree in place of this node.
        LlrbNode smallest = n.right().min();
        LlrbNode new_right = n.right().Clone();
        new_right.RemoveMin();

        n.set_entry(smallest.entry());
        n.set_right(std::move(new_right));
      }
    } else {
      n.set_right(n.right().InnerErase(key, comparator));
    }
  }
  n.FixUp();
  return n;
}

template <typename K, typename V>
void LlrbNode<K, V>::FixUp() {
  set_size(left().size() + 1 + right().size());

  if (right().red() && !left().red()) {
    RotateLeft();
  }
  if (left().red() && left().left().red()) {
    RotateRight();
  }
  if (left().red() && right().red()) {
    FlipColor();
  }
}

/**
 * Fixes the root node so its color is always black.
 *
 * This change is safe because a red `root` must be a new root:
 *   * If the key is not found, InnerErase returns an existing root, but
 *     existing roots will already be black (by the invariant).
 *   * If the key is found, InnerErase returns a new root, which is safe to
 *     modify.
 */
template <typename K, typename V>
void LlrbNode<K, V>::FixRootColor() {
  if (red()) {
    rep_->color_ = Color::Black;
  }
}

template <typename K, typename V>
void LlrbNode<K, V>::RemoveMin() {
  // If the left node is empty then the right node must be empty (because the
  // tree is left-leaning) and this node must be the minimum.
  if (left().empty()) {
    *this = LlrbNode{};
    return;
  }

  if (!left().red() && !left().left().red()) {
    MoveRedLeft();
  }

  LlrbNode new_left = left().Clone();
  new_left.RemoveMin();
  set_left(std::move(new_left));
  FixUp();
}

template <typename K, typename V>
void LlrbNode<K, V>::MoveRedLeft() {
  FlipColor();
  if (right().left().red()) {
    LlrbNode new_right = right().Clone();
    new_right.RotateRight();
    set_right(std::move(new_right));
    RotateLeft();
    FlipColor();
  }
}

template <typename K, typename V>
void LlrbNode<K, V>::MoveRedRight() {
  FlipColor();
  if (left().left().red()) {
    RotateRight();
    FlipColor();
  }
}

/* Rotates left:
 *
 *      X              R
 *    /   \          /   \
 *   L     R   =>   X    RR
 *        / \      / \
 *       RL RR     L RL
 */
template <typename K, typename V>
void LlrbNode<K, V>::RotateLeft() {
  LlrbNode new_left{
      Rep{std::move(rep_->entry_), Color::Red, left(), right().left()}};

  // size_ and color remain unchanged after a rotation.
  set_entry(right().entry());
  set_left(std::move(new_left));
  set_right(right().right());
}

/* Rotates right:
 *
 *      X              L
 *    /   \          /   \
 *   L     R   =>   LL    X
 *  / \                  / \
 * LL LR                LR R
 */
template <typename K, typename V>
void LlrbNode<K, V>::RotateRight() {
  LlrbNode new_right{
      Rep{std::move(rep_->entry_), Color::Red, left().right(), right()}};

  // size_ remains unchanged after a rotation. Preserve color too.
  set_entry(left().entry());
  set_left(left().left());
  set_right(std::move(new_right));
}

template <typename K, typename V>
void LlrbNode<K, V>::FlipColor() {
  LlrbNode new_left = left().Clone();
  new_left.set_color(left().OppositeColor());

  LlrbNode new_right = right().Clone();
  new_right.set_color(right().OppositeColor());

  // Preserve contents_ and size_
  set_color(OppositeColor());
  set_left(std::move(new_left));
  set_right(std::move(new_right));
}

}  // namespace impl
}  // namespace immutable
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_IMMUTABLE_LLRB_NODE_H_
