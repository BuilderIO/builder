/*
 * Copyright 2017 Google
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

#ifndef FIRESTORE_CORE_SRC_UTIL_BITS_H_
#define FIRESTORE_CORE_SRC_UTIL_BITS_H_

// Various bit-twiddling functions, all of which are static members of the Bits
// class (making it effectively a namespace). Operands are unsigned integers.
// Munging bits in _signed_ integers is fraught with peril! For example,
// -5 << n has undefined behavior (for some values of n).

#include <cstdint>

#if _MSC_VER
// The Microsoft implementation of iso646.h defines alternative operator names
// as macros and this interferes with the inline assembly, below, which uses the
// `and` and `xor` instructions. Defining these as macros is conforming behavior
// for C but not C++, where these are keywords.
//
// Unfortunately, fixing this by undefining the macros can't be enabled
// everywhere because other compilers (e.g. Clang) specifically prevent the use
// of these keywords as macro names.
#ifdef and
#undef and
#endif

#ifdef xor
#undef xor
#endif
#endif  // _MSC_VER

namespace firebase {
namespace firestore {
namespace util {

class Bits_Port32_Test;
class Bits_Port64_Test;

class Bits {
 public:
  /** Return floor(log2(n)) for positive integer n.  Returns -1 iff n == 0. */
  static int Log2Floor(uint32_t n);
  static int Log2Floor64(uint64_t n);

  /**
   * Potentially faster version of Log2Floor() that returns an
   * undefined value if n == 0.
   */
  static int Log2FloorNonZero(uint32_t n);
  static int Log2FloorNonZero64(uint64_t n);

 private:
  // Portable implementations.
  static int Log2Floor_Portable(uint32_t n);
  static int Log2Floor64_Portable(uint64_t n);
  static int Log2FloorNonZero_Portable(uint32_t n);
  static int Log2FloorNonZero64_Portable(uint64_t n);

  Bits(Bits const&) = delete;
  void operator=(Bits const&) = delete;

  // Allow tests to call _Portable variants directly.
  friend class Bits_Port32_Test;
  friend class Bits_Port64_Test;
};

// ------------------------------------------------------------------------
// Implementation details follow
// ------------------------------------------------------------------------

#if defined(__GNUC__)

inline int Bits::Log2Floor(uint32_t n) {
  return n == 0 ? -1 : 31 ^ __builtin_clz(n);
}

inline int Bits::Log2FloorNonZero(uint32_t n) {
  return 31 ^ __builtin_clz(n);
}

inline int Bits::Log2Floor64(uint64_t n) {
  return n == 0 ? -1 : 63 ^ __builtin_clzll(n);
}

inline int Bits::Log2FloorNonZero64(uint64_t n) {
  return 63 ^ __builtin_clzll(n);
}

#elif defined(_MSC_VER)

inline int Bits::Log2FloorNonZero(uint32_t n) {
#ifdef _M_IX86
  _asm {
    bsr ebx, n
    mov n, ebx
  }
  return n;
#else
  return Bits::Log2FloorNonZero_Portable(n);
#endif
}

inline int Bits::Log2Floor(uint32_t n) {
#ifdef _M_IX86
  _asm {
    xor ebx, ebx
    mov eax, n
    and eax, eax
    jz return_ebx
    bsr ebx, eax
  return_ebx:
    mov n, ebx
  }
  return n;
#else
  return Bits::Log2Floor_Portable(n);
#endif
}

inline int Bits::Log2Floor64(uint64_t n) {
  return Bits::Log2Floor64_Portable(n);
}

inline int Bits::Log2FloorNonZero64(uint64_t n) {
  return Bits::Log2FloorNonZero64_Portable(n);
}

#else  // !__GNUC__ && !_MSC_VER

inline int Bits::Log2Floor64(uint64_t n) {
  return Bits::Log2Floor64_Portable(n);
}

inline int Bits::Log2FloorNonZero64(uint64_t n) {
  return Bits::Log2FloorNonZero64_Portable(n);
}

#endif

inline int Bits::Log2FloorNonZero_Portable(uint32_t n) {
  // Just use the common routine
  return Log2Floor(n);
}

// Log2Floor64() is defined in terms of Log2Floor32(), Log2FloorNonZero32()
inline int Bits::Log2Floor64_Portable(uint64_t n) {
  const auto top_bits = static_cast<uint32_t>(n >> 32);
  if (top_bits == 0) {
    // Top bits are zero, so scan in bottom bits
    return Log2Floor(static_cast<uint32_t>(n));
  } else {
    return 32 + Log2FloorNonZero(top_bits);
  }
}

// Log2FloorNonZero64() is defined in terms of Log2FloorNonZero32()
inline int Bits::Log2FloorNonZero64_Portable(uint64_t n) {
  const auto top_bits = static_cast<uint32_t>(n >> 32);
  if (top_bits == 0) {
    // Top bits are zero, so scan in bottom bits
    return Log2FloorNonZero(static_cast<uint32_t>(n));
  } else {
    return 32 + Log2FloorNonZero(top_bits);
  }
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_UTIL_BITS_H_
