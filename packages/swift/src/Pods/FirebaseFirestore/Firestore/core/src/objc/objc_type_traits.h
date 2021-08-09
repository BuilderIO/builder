/*
 * Copyright 2019 Google
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

#ifndef FIRESTORE_CORE_SRC_OBJC_OBJC_TYPE_TRAITS_H_
#define FIRESTORE_CORE_SRC_OBJC_OBJC_TYPE_TRAITS_H_

#if __OBJC__

#include <objc/objc.h>  // for id

#include <type_traits>

namespace firebase {
namespace firestore {
namespace objc {

/**
 * A type trait that identifies whether or not the given pointer points to an
 * Objective-C object.
 *
 * is_objc_pointer<NSObject*>::value == true
 * is_objc_pointer<NSArray<NSString*>*>::value == true
 *
 * // id is a dynamically typed pointer to an Objective-C object.
 * is_objc_pointer<id>::value == true
 *
 * // pointers to C++ classes are not Objective-C pointers.
 * is_objc_pointer<void*>::value == false
 * is_objc_pointer<std::string*>::value == false
 * is_objc_pointer<std::unique_ptr<int>>::value == false
 */
template <typename T>
using is_objc_pointer = std::is_convertible<T, id>;

}  // namespace objc
}  // namespace firestore
}  // namespace firebase

#endif  // __OBJC__

#endif  // FIRESTORE_CORE_SRC_OBJC_OBJC_TYPE_TRAITS_H_
