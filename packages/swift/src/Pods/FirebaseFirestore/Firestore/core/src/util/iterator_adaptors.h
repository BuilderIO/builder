/*
 * Copyright 2005, 2018 Google
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

// Provides some iterator adaptors and views.

#ifndef FIRESTORE_CORE_SRC_UTIL_ITERATOR_ADAPTORS_H_
#define FIRESTORE_CORE_SRC_UTIL_ITERATOR_ADAPTORS_H_

#include <iterator>
#include <memory>
#include <type_traits>

#include "absl/base/port.h"
#include "absl/meta/type_traits.h"

namespace firebase {
namespace firestore {
namespace util {

namespace internal {

// value == true if Iter prohibits modification of its pointees.
template <typename Iter>
struct IsConstIter
    : std::is_const<typename std::remove_reference<
          typename std::iterator_traits<Iter>::reference>::type> {};

template <bool Cond, typename T>
struct AddConstIf : std::conditional<Cond, const T, T> {};

// SynthIterTraits propagates the constness of the 'BaseIter' iterator
// type to its own exported 'pointer' and 'reference' typedefs.
template <typename BaseIter, typename Val>
struct SynthIterTraits : std::iterator_traits<BaseIter> {
 private:
  static constexpr bool kIterConst = IsConstIter<BaseIter>::value;

 public:
  using value_type = typename std::remove_cv<Val>::type;
  using pointer = typename AddConstIf<kIterConst, Val>::type*;
  using reference = typename AddConstIf<kIterConst, Val>::type&;
};

// PointeeSynthIterTraits is similar to SynthIterTraits, but the 'Ptr'
// parameter is a pointer-like type, and value_type is the pointee.
template <typename BaseIter, typename Ptr>
struct PointeeSynthIterTraits : std::iterator_traits<BaseIter> {
 private:
  static constexpr bool kIterConst = IsConstIter<BaseIter>::value;

 public:
  using value_type = typename std::pointer_traits<Ptr>::element_type;
  using pointer = typename AddConstIf<kIterConst, value_type>::type*;
  using reference = typename AddConstIf<kIterConst, value_type>::type&;
};

// CRTP base class for generating iterator adaptors.
// 'Sub' is the derived type, and 'Policy' encodes
// all of the behavior for the adaptor.
// Policy requirements:
//   - type 'underlying_iterator': the underlying iterator type.
//   - type 'adapted_traits': the traits of the adaptor.
//   - static 'Extract(underlying_iterator)': convert iterator to reference.
//
template <typename Sub, typename Policy>
class IteratorAdaptorBase {
 private:
  // Everything needed from the Policy type is expressed in this section.
  using Iterator = typename Policy::underlying_iterator;
  using OutTraits = typename Policy::adapted_traits;
  static typename OutTraits::reference Extract(const Iterator& it) {
    return Policy::Extract(it);
  }

 public:
  using iterator_category = typename OutTraits::iterator_category;
  using value_type = typename OutTraits::value_type;
  using pointer = typename OutTraits::pointer;
  using reference = typename OutTraits::reference;
  using difference_type = typename OutTraits::difference_type;

  IteratorAdaptorBase() : it_() {
  }
  // NOLINTNEXTLINE(runtime/explicit)
  IteratorAdaptorBase(Iterator it) : it_(it) {
  }

  Sub& sub() {
    return static_cast<Sub&>(*this);
  }
  const Sub& sub() const {
    return static_cast<const Sub&>(*this);
  }

  const Iterator& base() const {
    return it_;
  }

  reference get() const {
    return Extract(base());
  }
  reference operator*() const {
    return get();
  }
  pointer operator->() const {
    return &get();
  }
  reference operator[](difference_type d) const {
    return *(sub() + d);
  }

  Sub& operator++() {
    ++it_;
    return sub();
  }
  Sub& operator--() {
    --it_;
    return sub();
  }
  Sub operator++(int /*unused*/) {
    return it_++;
  }
  Sub operator--(int /*unused*/) {
    return it_--;
  }

  Sub& operator+=(difference_type d) {
    it_ += d;
    return sub();
  }
  Sub& operator-=(difference_type d) {
    it_ -= d;
    return sub();
  }

  bool operator==(Sub b) const {
    return base() == b.base();
  }
  bool operator!=(Sub b) const {
    return base() != b.base();
  }
  // These shouldn't be necessary, as implicit conversion from 'Iterator'
  // should be enough to make such comparisons work.
  bool operator==(Iterator b) const {
    return *this == Sub(b);
  }
  bool operator!=(Iterator b) const {
    return *this != Sub(b);
  }

  friend Sub operator+(Sub it, difference_type d) {
    return it.base() + d;
  }
  friend Sub operator+(difference_type d, Sub it) {
    return it + d;
  }
  friend Sub operator-(Sub it, difference_type d) {
    return it.base() - d;
  }
  friend difference_type operator-(Sub a, Sub b) {
    return a.base() - b.base();
  }

  friend bool operator<(Sub a, Sub b) {
    return a.base() < b.base();
  }
  friend bool operator>(Sub a, Sub b) {
    return a.base() > b.base();
  }
  friend bool operator<=(Sub a, Sub b) {
    return a.base() <= b.base();
  }
  friend bool operator>=(Sub a, Sub b) {
    return a.base() >= b.base();
  }

 private:
  Iterator it_;
};

template <typename It>
struct FirstPolicy {
  using underlying_iterator = It;
  using adapted_traits =
      SynthIterTraits<underlying_iterator,
                      typename std::iterator_traits<
                          underlying_iterator>::value_type::first_type>;
  static typename adapted_traits::reference Extract(
      const underlying_iterator& it) {
    return it->first;
  }
};

template <typename It>
struct SecondPolicy {
  using underlying_iterator = It;
  using adapted_traits =
      SynthIterTraits<underlying_iterator,
                      typename std::iterator_traits<
                          underlying_iterator>::value_type::second_type>;
  static typename adapted_traits::reference Extract(
      const underlying_iterator& it) {
    return it->second;
  }
};

template <typename It>
struct SecondPtrPolicy {
  using underlying_iterator = It;
  using adapted_traits =
      PointeeSynthIterTraits<underlying_iterator,
                             typename std::iterator_traits<
                                 underlying_iterator>::value_type::second_type>;
  static typename adapted_traits::reference Extract(
      const underlying_iterator& it) {
    return *it->second;
  }
};

template <typename It>
struct PtrPolicy {
  using underlying_iterator = It;
  using adapted_traits = PointeeSynthIterTraits<
      underlying_iterator,
      typename std::iterator_traits<underlying_iterator>::value_type>;
  static typename adapted_traits::reference Extract(
      const underlying_iterator& it) {
    return **it;
  }
};

}  // namespace internal

// In both iterator adaptors, iterator_first<> and iterator_second<>,
// we build a new iterator based on a parameterized iterator type, "It".
// The value type, "Val" is determined by "It::value_type::first" or
// "It::value_type::second", respectively.

// iterator_first<> adapts an iterator to return the first value of a pair.
// It is equivalent to calling it->first on every value.
// Example:
//
// hash_map<string, int> values;
// values["foo"] = 1;
// values["bar"] = 2;
// for (iterator_first<hash_map<string, int>::iterator> x = values.begin();
//      x != values.end(); ++x) {
//   printf("%s", x->c_str());
// }
template <typename It>
struct iterator_first
    : internal::IteratorAdaptorBase<iterator_first<It>,
                                    internal::FirstPolicy<It>> {
  using Base = internal::IteratorAdaptorBase<iterator_first<It>,
                                             internal::FirstPolicy<It>>;
  iterator_first() {
  }
  iterator_first(It it)  // NOLINT(runtime/explicit)
      : Base(it) {
  }
  template <typename It2>
  iterator_first(iterator_first<It2> o)  // NOLINT(runtime/explicit)
      : Base(o.base()) {
  }
};

template <typename It>
iterator_first<It> make_iterator_first(It it) {
  return iterator_first<It>(it);
}

// iterator_second<> adapts an iterator to return the second value of a pair.
// It is equivalent to calling it->second on every value.
// Example:
//
// hash_map<string, int> values;
// values["foo"] = 1;
// values["bar"] = 2;
// for (iterator_second<hash_map<string, int>::iterator> x = values.begin();
//      x != values.end(); ++x) {
//   int v = *x;
//   printf("%d", v);
// }
template <typename It>
struct iterator_second
    : internal::IteratorAdaptorBase<iterator_second<It>,
                                    internal::SecondPolicy<It>> {
  using Base = internal::IteratorAdaptorBase<iterator_second<It>,
                                             internal::SecondPolicy<It>>;
  iterator_second() {
  }
  iterator_second(It it)  // NOLINT(runtime/explicit)
      : Base(it) {
  }
  template <typename It2>
  iterator_second(iterator_second<It2> o)  // NOLINT(runtime/explicit)
      : Base(o.base()) {
  }
};

template <typename It>
iterator_second<It> make_iterator_second(It it) {
  return iterator_second<It>(it);
}

// iterator_second_ptr<> adapts an iterator to return the dereferenced second
// value of a pair.
// It is equivalent to calling *it->second on every value.
// The same result can be achieved by composition
// iterator_ptr<iterator_second<> >
// Can be used with maps where values are regular pointers or pointers wrapped
// into linked_ptr. This iterator adaptor can be used by classes to give their
// clients access to some of their internal data without exposing too much of
// it.
//
// Example:
// class MyClass {
//  public:
//   MyClass(const string& s);
//   string DebugString() const;
// };
// typedef hash_map<string, linked_ptr<MyClass> > MyMap;
// typedef iterator_second_ptr<MyMap::iterator> MyMapValuesIterator;
// MyMap values;
// values["foo"].reset(new MyClass("foo"));
// values["bar"].reset(new MyClass("bar"));
// for (MyMapValuesIterator it = values.begin(); it != values.end(); ++it) {
//   printf("%s", it->DebugString().c_str());
// }
template <typename It>
struct iterator_second_ptr
    : internal::IteratorAdaptorBase<iterator_second_ptr<It>,
                                    internal::SecondPtrPolicy<It>> {
  using Base = internal::IteratorAdaptorBase<iterator_second_ptr<It>,
                                             internal::SecondPtrPolicy<It>>;
  iterator_second_ptr() {
  }
  iterator_second_ptr(It it)  // NOLINT(runtime/explicit)
      : Base(it) {
  }
  template <typename It2>
  iterator_second_ptr(iterator_second_ptr<It2> o)  // NOLINT(runtime/explicit)
      : Base(o.base()) {
  }
};

template <typename It>
iterator_second_ptr<It> make_iterator_second_ptr(It it) {
  return iterator_second_ptr<It>(it);
}

// iterator_ptr<> adapts an iterator to return the dereferenced value.
// With this adaptor you can write *it instead of **it, or it->something instead
// of (*it)->something.
// Can be used with vectors and lists where values are regular pointers
// or pointers wrapped into linked_ptr. This iterator adaptor can be used by
// classes to give their clients access to some of their internal data without
// exposing too much of it.
//
// Example:
// class MyClass {
//  public:
//   MyClass(const string& s);
//   string DebugString() const;
// };
// typedef vector<linked_ptr<MyClass> > MyVector;
// typedef iterator_ptr<MyVector::iterator> DereferencingIterator;
// MyVector values;
// values.push_back(make_linked_ptr(new MyClass("foo")));
// values.push_back(make_linked_ptr(new MyClass("bar")));
// for (DereferencingIterator it = values.begin(); it != values.end(); ++it) {
//   printf("%s", it->DebugString().c_str());
// }
//
// Without iterator_ptr you would have to do (*it)->DebugString()
template <typename It, typename Ptr /* ignored */ = void>
struct iterator_ptr : internal::IteratorAdaptorBase<iterator_ptr<It, Ptr>,
                                                    internal::PtrPolicy<It>> {
  using Base = internal::IteratorAdaptorBase<iterator_ptr<It, Ptr>,
                                             internal::PtrPolicy<It>>;
  iterator_ptr() {
  }
  iterator_ptr(It it)  // NOLINT(runtime/explicit)
      : Base(it) {
  }
  template <typename It2>
  iterator_ptr(iterator_ptr<It2> o)  // NOLINT(runtime/explicit)
      : Base(o.base()) {
  }
};

template <typename It>
iterator_ptr<It> make_iterator_ptr(It it) {
  return iterator_ptr<It>(it);
}

namespace internal {

// Template that uses SFINAE to inspect Container abilities:
// . Set has_size_type true, iff T::size_type is defined
// . Define size_type as T::size_type if defined, or size_t otherwise
template <typename C>
struct container_traits {
 private:
  // Test for availability of C::size_type.
  template <typename U, typename = void>
  struct test_size_type : std::false_type {};
  template <typename U>
  struct test_size_type<U, absl::void_t<typename U::size_type>>
      : std::true_type {};

  // Conditional provisioning of a size_type which defaults to size_t.
  template <bool Cond, typename U = void>
  struct size_type_def {
    using type = typename U::size_type;
  };
  template <typename U>
  struct size_type_def<false, U> {
    using type = size_t;
  };

 public:
  // Determine whether C::size_type is available.
  static const bool has_size_type = test_size_type<C>::value;

  // Provide size_type as either C::size_type if available, or as size_t.
  using size_type = typename size_type_def<has_size_type, C>::type;
};

template <typename C>
struct IterGenerator {
  using container_type = C;
  using iterator = typename C::iterator;
  using const_iterator = typename C::const_iterator;

  static iterator begin(container_type& c) {  // NOLINT(runtime/references)
    return c.begin();
  }
  static iterator end(container_type& c) {  // NOLINT(runtime/references)
    return c.end();
  }
  static const_iterator begin(const container_type& c) {
    return c.begin();
  }
  static const_iterator end(const container_type& c) {
    return c.end();
  }
};

template <typename SubIterGenerator>
struct ReversingIterGeneratorAdaptor {
  using container_type = typename SubIterGenerator::container_type;
  using iterator = std::reverse_iterator<typename SubIterGenerator::iterator>;
  using const_iterator =
      std::reverse_iterator<typename SubIterGenerator::const_iterator>;

  static iterator begin(container_type& c) {  // NOLINT(runtime/references)
    return iterator(SubIterGenerator::end(c));
  }
  static iterator end(container_type& c) {  // NOLINT(runtime/references)
    return iterator(SubIterGenerator::begin(c));
  }
  static const_iterator begin(const container_type& c) {
    return const_iterator(SubIterGenerator::end(c));
  }
  static const_iterator end(const container_type& c) {
    return const_iterator(SubIterGenerator::begin(c));
  }
};

// C:             the container type
// Iter:          the type of mutable iterator to generate
// ConstIter:     the type of constant iterator to generate
// IterGenerator: a policy type that returns native iterators from a C
template <typename C,
          typename Iter,
          typename ConstIter,
          typename IterGenerator = internal::IterGenerator<C>>
class iterator_view_helper {
 public:
  using container_type = C;
  using iterator = Iter;
  using const_iterator = ConstIter;
  using value_type = typename std::iterator_traits<iterator>::value_type;
  using size_type = typename internal::container_traits<C>::size_type;

  explicit iterator_view_helper(
      container_type& c)  // NOLINT(runtime/references)
      : c_(&c) {
  }

  iterator begin() {
    return iterator(IterGenerator::begin(container()));
  }
  iterator end() {
    return iterator(IterGenerator::end(container()));
  }
  const_iterator begin() const {
    return const_iterator(IterGenerator::begin(container()));
  }
  const_iterator end() const {
    return const_iterator(IterGenerator::end(container()));
  }
  const_iterator cbegin() const {
    return begin();
  }
  const_iterator cend() const {
    return end();
  }
  const container_type& container() const {
    return *c_;
  }
  container_type& container() {
    return *c_;
  }

  bool empty() const {
    return begin() == end();
  }
  size_type size() const {
    return c_->size();
  }

 private:
  container_type* c_;
};

template <typename C,
          typename ConstIter,
          typename IterGenerator = internal::IterGenerator<C>>
class const_iterator_view_helper {
 public:
  using container_type = C;
  using const_iterator = ConstIter;
  using value_type = typename std::iterator_traits<const_iterator>::value_type;
  using size_type = typename internal::container_traits<C>::size_type;

  explicit const_iterator_view_helper(const container_type& c) : c_(&c) {
  }

  // Allow implicit conversion from the corresponding iterator_view_helper.
  // Erring on the side of constness should be allowed. E.g.:
  //    MyMap m;
  //    key_view_type<MyMap>::type keys = key_view(m);  // ok
  //    key_view_type<const MyMap>::type const_keys = key_view(m);  // ok
  template <typename Iter>
  const_iterator_view_helper(const iterator_view_helper<container_type,
                                                        Iter,
                                                        const_iterator,
                                                        IterGenerator>& v)
      : c_(&v.container()) {
  }

  const_iterator begin() const {
    return const_iterator(IterGenerator::begin(container()));
  }
  const_iterator end() const {
    return const_iterator(IterGenerator::end(container()));
  }
  const_iterator cbegin() const {
    return begin();
  }
  const_iterator cend() const {
    return end();
  }
  const container_type& container() const {
    return *c_;
  }

  bool empty() const {
    return begin() == end();
  }
  size_type size() const {
    return c_->size();
  }

 private:
  const container_type* c_;
};

}  // namespace internal

// Note: The views like value_view, key_view should be in gtl namespace.
// Currently there are lot of callers that reference the methods in the global
// namespace.
//
// Traits to provide a typedef abstraction for the return value
// of the key_view() and value_view() functions, such that
// they can be declared as:
//
//    template <typename C> key_view_t<C> key_view(C& c);
//    template <typename C> value_view_t<C> value_view(C& c);
//
// This abstraction allows callers of these functions to use readable
// type names, and allows the maintainers of iterator_adaptors.h to
// change the return types if needed without updating callers.

template <typename C>
struct key_view_type {
  using type = internal::iterator_view_helper<
      C,
      iterator_first<typename C::iterator>,
      iterator_first<typename C::const_iterator>>;
};

template <typename C>
struct key_view_type<const C> {
  using type = internal::
      const_iterator_view_helper<C, iterator_first<typename C::const_iterator>>;
};

template <typename C>
struct value_view_type {
  using type = internal::iterator_view_helper<
      C,
      iterator_second<typename C::iterator>,
      iterator_second<typename C::const_iterator>>;
};

template <typename C>
struct value_view_type<const C> {
  using type = internal::const_iterator_view_helper<
      C,
      iterator_second<typename C::const_iterator>>;
};

// The key_view and value_view functions provide pretty ways to iterate either
// the keys or the values of a map using range based for loops.
//
// Example:
//    hash_map<int, string> my_map;
//    ...
//    for (string val : value_view(my_map)) {
//      ...
//    }
//
// Note: If you pass a temporary container to key_view or value_view, be careful
// that the temporary container outlives the wrapper view to avoid dangling
// references.
// This is fine:  PublishAll(value_view(Make());
// This is not:   for (const auto& v : value_view(Make())) Publish(v);

template <typename C>
typename key_view_type<C>::type key_view(
    C& map) {  // NOLINT(runtime/references)
  return typename key_view_type<C>::type(map);
}

template <typename C>
typename key_view_type<const C>::type key_view(const C& map) {
  return typename key_view_type<const C>::type(map);
}

template <typename C>
typename value_view_type<C>::type value_view(
    C& map) {  // NOLINT(runtime/references)
  return typename value_view_type<C>::type(map);
}

template <typename C>
typename value_view_type<const C>::type value_view(const C& map) {
  return typename value_view_type<const C>::type(map);
}

// Abstract container view that dereferences the pointer-like .second member
// of a container's std::pair elements, such as the elements of std::map<K,V*>
// or of std::vector<std::pair<K,V*>>.
//
// Example:
//   map<int, string*> elements;
//   for (const string& element : deref_second_view(elements)) {
//     ...
//   }
//
// Note: If you pass a temporary container to deref_second_view, be careful that
// the temporary container outlives the deref_second_view to avoid dangling
// references.
// This is fine:  PublishAll(deref_second_view(Make());
// This is not:   for (const auto& v : deref_second_view(Make())) {
//                  Publish(v);
//                }

template <typename C>
struct deref_second_view_type {
  using type = internal::iterator_view_helper<
      C,
      iterator_second_ptr<typename C::iterator>,
      iterator_second_ptr<typename C::const_iterator>>;
};

template <typename C>
struct deref_second_view_type<const C> {
  using type = internal::const_iterator_view_helper<
      C,
      iterator_second_ptr<typename C::const_iterator>>;
};

template <typename C>
typename deref_second_view_type<C>::type deref_second_view(
    C& map) {  // NOLINT(runtime/references)
  return typename deref_second_view_type<C>::type(map);
}

template <typename C>
typename deref_second_view_type<const C>::type deref_second_view(const C& map) {
  return typename deref_second_view_type<const C>::type(map);
}

// Abstract container view that dereferences pointer elements.
//
// Example:
//   vector<string*> elements;
//   for (const string& element : deref_view(elements)) {
//     ...
//   }
//
// Note: If you pass a temporary container to deref_view, be careful that the
// temporary container outlives the deref_view to avoid dangling references.
// This is fine:  PublishAll(deref_view(Make());
// This is not:   for (const auto& v : deref_view(Make())) { Publish(v); }

template <typename C>
struct deref_view_type {
  using type =
      internal::iterator_view_helper<C,
                                     iterator_ptr<typename C::iterator>,
                                     iterator_ptr<typename C::const_iterator>>;
};

template <typename C>
struct deref_view_type<const C> {
  using type = internal::
      const_iterator_view_helper<C, iterator_ptr<typename C::const_iterator>>;
};

template <typename C>
typename deref_view_type<C>::type deref_view(
    C& c) {  // NOLINT(runtime/references)
  return typename deref_view_type<C>::type(c);
}

template <typename C>
typename deref_view_type<const C>::type deref_view(const C& c) {
  return typename deref_view_type<const C>::type(c);
}

// Abstract container view that iterates backwards.
//
// Example:
//   vector<string> elements;
//   for (const string& element : reversed_view(elements)) {
//     ...
//   }
//
// Note: If you pass a temporary container to reversed_view_type, be careful
// that the temporary container outlives the reversed_view to avoid dangling
// references. This is fine:  PublishAll(reversed_view(Make());
// This is not:   for (const auto& v : reversed_view(Make())) { Publish(v); }

template <typename C>
struct reversed_view_type {
 private:
  using policy =
      internal::ReversingIterGeneratorAdaptor<internal::IterGenerator<C>>;

 public:
  using type = internal::iterator_view_helper<C,
                                              typename policy::iterator,
                                              typename policy::const_iterator,
                                              policy>;
};

template <typename C>
struct reversed_view_type<const C> {
 private:
  using policy =
      internal::ReversingIterGeneratorAdaptor<internal::IterGenerator<C>>;

 public:
  using type = internal::
      const_iterator_view_helper<C, typename policy::const_iterator, policy>;
};

template <typename C>
typename reversed_view_type<C>::type reversed_view(
    C& c) {  // NOLINT(runtime/references)
  return typename reversed_view_type<C>::type(c);
}

template <typename C>
typename reversed_view_type<const C>::type reversed_view(const C& c) {
  return typename reversed_view_type<const C>::type(c);
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_ITERATOR_ADAPTORS_H_
