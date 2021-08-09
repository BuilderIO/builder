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

#include "Firestore/core/src/util/ordered_code.h"

#include "Firestore/core/src/util/bits.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "absl/base/internal/endian.h"
#include "absl/base/internal/unaligned_access.h"
#include "absl/base/port.h"

#if !defined(ABSL_IS_LITTLE_ENDIAN) && !defined(ABSL_IS_BIG_ENDIAN)
#error \
    "Unsupported byte order: Either ABSL_IS_BIG_ENDIAN or " \
       "ABSL_IS_LITTLE_ENDIAN must be defined"
#endif

#define UNALIGNED_LOAD32 ABSL_INTERNAL_UNALIGNED_LOAD32
#define UNALIGNED_LOAD64 ABSL_INTERNAL_UNALIGNED_LOAD64
#define UNALIGNED_STORE32 ABSL_INTERNAL_UNALIGNED_STORE32
#define UNALIGNED_STORE64 ABSL_INTERNAL_UNALIGNED_STORE64

// We encode a string in different ways depending on whether the item
// should be in lexicographically increasing or decreasing order.
//
//
// Lexicographically increasing order
//
// We want a string-to-string mapping F(x) such that for any two strings
//
//      x < y   =>   F(x) < F(y)
//
// In addition to the normal characters '\x00' through '\xff', we want to
// encode a few extra symbols in strings:
//
//      <sep>           Separator between items
//      <infinity>      Infinite string
//
// Therefore we need an alphabet with at least 258 symbols.  Each
// character '\1' through '\xfe' is mapped to itself.  The other four are
// encoded into two-letter sequences starting with '\0' and '\xff':
//
//      <sep>           encoded as =>           \0\1
//      \0              encoded as =>           \0\xff
//      \xff            encoded as =>           \xff\x00
//      <infinity>      encoded as =>           \xff\xff
//
// The remaining two-letter sequences starting with '\0' and '\xff' are
// currently unused.
//
// F(<infinity>) is defined above.  For any finite string x, F(x) is the
// the encodings of x's characters followed by the encoding for <sep>.  The
// ordering of two finite strings is the same as the ordering of the
// respective characters at the first position where they differ, which in
// turn is the same as the ordering of the encodings of those two
// characters.  Moreover, for every finite string x, F(x) < F(<infinity>).

namespace firebase {
namespace firestore {
namespace util {

static const char kEscape1 = '\000';
static const char kNullCharacter = '\xff';  // Combined with kEscape1
static const char kSeparator = '\001';      // Combined with kEscape1

static const char kEscape2 = '\xff';
static const char kInfinity = '\xff';     // Combined with kEscape2
static const char kFFCharacter = '\000';  // Combined with kEscape2

static const char kEscape1_Separator[2] = {kEscape1, kSeparator};

/** Append to "*dest" the "len" bytes starting from "*src". */
inline static void AppendBytes(std::string* dest, const char* src, size_t len) {
  dest->append(src, len);
}

inline static bool IsSpecialByte(char c) {
  return ((unsigned char)(c + 1)) < 2;
}

/**
 * Returns 0 if one or more of the bytes in the specified uint32 value
 * are the special values 0 or 255, and returns 4 otherwise.  The
 * result of this routine can be added to "p" to either advance past
 * the next 4 bytes if they do not contain a special byte, or to
 * remain on this set of four bytes if they contain the next special
 * byte occurrence.
 *
 * REQUIRES: v_32 is the value of loading the next 4 bytes from "*p" (we
 * pass in v_32 rather than loading it because in some cases, the client
 * may already have the value in a register: "p" is just used for
 * assertion checking).
 */
inline static int AdvanceIfNoSpecialBytes(uint32_t v_32, const char* p) {
  HARD_ASSERT(UNALIGNED_LOAD32(p) == v_32);
  // See comments in SkipToNextSpecialByte if you wish to
  // understand this expression (which checks for the occurrence
  // of the special byte values 0 or 255 in any of the bytes of v_32).
  if ((v_32 - 0x01010101u) & ~(v_32 + 0x01010101u) & 0x80808080u) {
    // Special byte is in p[0..3]
    HARD_ASSERT(IsSpecialByte(p[0]) || IsSpecialByte(p[1]) ||
                IsSpecialByte(p[2]) || IsSpecialByte(p[3]));
    return 0;
  } else {
    HARD_ASSERT(!IsSpecialByte(p[0]));
    HARD_ASSERT(!IsSpecialByte(p[1]));
    HARD_ASSERT(!IsSpecialByte(p[2]));
    HARD_ASSERT(!IsSpecialByte(p[3]));
    return 4;
  }
}

/**
 * Return a pointer to the first byte in the range "[start..limit)"
 * whose value is 0 or 255 (kEscape1 or kEscape2).  If no such byte
 * exists in the range, returns "limit".
 */
inline static const char* SkipToNextSpecialByte(const char* start,
                                                const char* limit) {
  // If these constants were ever changed, this routine needs to change
  static_assert(kEscape1 == 0, "bit fiddling needs readjusting");
  static_assert((kEscape2 & 0xff) == 255, "bit fiddling needs readjusting");
  const char* p = start;
  while (p + 8 <= limit) {
    // Find out if any of the next 8 bytes are either 0 or 255 (our
    // two characters that require special handling).  We do this using
    // the technique described in:
    //
    //    http://graphics.stanford.edu/~seander/bithacks.html#HasLessInWord
    //
    // We use the test (x + 1) < 2 to check x = 0 or -1(255)
    //
    // If x is a byte value (0x00..0xff):
    // (x - 0x01) & 0x80 is true only when x = 0x81..0xff, 0x00
    // ~(x + 0x01) & 0x80 is true only when x = 0x00..0x7e, 0xff
    // The intersection of the above two sets is x = 0x00 or 0xff.
    // We can ignore carry between bytes because only x = 0x00 or 0xff
    // can cause carry in the expression -- and such x already makes the
    // result value non-zero.
    uint64_t v = UNALIGNED_LOAD64(p);
    bool hasZeroOr255Byte = (v - 0x0101010101010101ull) &
                            ~(v + 0x0101010101010101ull) &
                            0x8080808080808080ull;
    if (!hasZeroOr255Byte) {
      // No special values in the next 8 bytes
      p += 8;
    } else {
// We know the next 8 bytes have a special byte: find it
#ifdef ABSL_IS_LITTLE_ENDIAN
      uint32_t v_32 = static_cast<uint32_t>(v);  // Low 32 bits of v
#else
      uint32_t v_32 = UNALIGNED_LOAD32(p);
#endif
      // Test 32 bits at once to see if special byte is in next 4 bytes
      // or the following 4 bytes
      p += AdvanceIfNoSpecialBytes(v_32, p);
      if (IsSpecialByte(p[0])) return p;
      if (IsSpecialByte(p[1])) return p + 1;
      if (IsSpecialByte(p[2])) return p + 2;
      HARD_ASSERT(IsSpecialByte(p[3]));  // Last byte must be the special one
      return p + 3;
    }
  }
  if (p + 4 <= limit) {
    uint32_t v_32 = UNALIGNED_LOAD32(p);
    p += AdvanceIfNoSpecialBytes(v_32, p);
  }
  while (p < limit && !IsSpecialByte(*p)) {
    p++;
  }
  return p;
}

// Expose SkipToNextSpecialByte for testing purposes
const char* OrderedCode::TEST_SkipToNextSpecialByte(const char* start,
                                                    const char* limit) {
  return SkipToNextSpecialByte(start, limit);
}

/**
 * Helper routine to encode "s" and append to "*dest", escaping special
 * characters.
 */
inline static void EncodeStringFragment(std::string* dest,
                                        absl::string_view s) {
  const char* p = s.data();
  const char* limit = p + s.size();
  const char* copy_start = p;
  while (true) {
    p = SkipToNextSpecialByte(p, limit);
    if (p >= limit) break;  // No more special characters that need escaping
    char c = *(p++);
    HARD_ASSERT(IsSpecialByte(c));
    if (c == kEscape1) {
      AppendBytes(dest, copy_start, static_cast<size_t>(p - copy_start) - 1);
      dest->push_back(kEscape1);
      dest->push_back(kNullCharacter);
      copy_start = p;
    } else {
      HARD_ASSERT(c == kEscape2);
      AppendBytes(dest, copy_start, static_cast<size_t>(p - copy_start) - 1);
      dest->push_back(kEscape2);
      dest->push_back(kFFCharacter);
      copy_start = p;
    }
  }
  if (p > copy_start) {
    AppendBytes(dest, copy_start, static_cast<size_t>(p - copy_start));
  }
}

void OrderedCode::WriteString(std::string* dest, absl::string_view s) {
  EncodeStringFragment(dest, s);
  AppendBytes(dest, kEscape1_Separator, 2);
}

/**
 * Return number of bytes needed to encode the non-length portion
 * of val in ordered coding.  Returns number in range [0,8].
 */
static inline unsigned int OrderedNumLength(uint64_t val) {
  const int lg = Bits::Log2Floor64(val);  // -1 if val==0
  return static_cast<unsigned int>(lg + 1 + 7) / 8;
}

/**
 * Append n bytes from src to *dst.
 * REQUIRES: n <= 9
 * REQUIRES: src[0..8] are readable bytes (even if n is smaller)
 *
 * If we use string::append() instead of this routine, it increases the
 * runtime of WriteNumIncreasing from ~9ns to ~13ns.
 */
static inline void AppendUpto9(std::string* dst,
                               const char* src,
                               unsigned int n) {
  dst->append(src, 9);         // Fixed-length append
  const size_t extra = 9 - n;  // How many extra bytes we added
  dst->erase(dst->size() - extra, extra);
}

void OrderedCode::WriteNumIncreasing(std::string* dest, uint64_t val) {
  // Values are encoded with a single byte length prefix, followed
  // by the actual value in big-endian format with leading 0 bytes
  // dropped.

  // 8 bytes for value plus one byte for length.  In addition, we have
  // 8 extra bytes at the end so that we can have a fixed-length append
  // call on *dest.
  char buf[17];

  UNALIGNED_STORE64(buf + 1,
                    absl::ghtonll(val));  // buf[0] may be needed for length
  const unsigned int length = OrderedNumLength(val);
  char* start = buf + 9 - length - 1;
  *start = static_cast<char>(length);
  AppendUpto9(dest, start, length + 1);
}

inline static void WriteInfinityInternal(std::string* dest) {
  // Make an array so that we can just do one string operation for performance
  static const char buf[2] = {kEscape2, kInfinity};
  dest->append(buf, 2);
}

void OrderedCode::WriteInfinity(std::string* dest) {
  WriteInfinityInternal(dest);
}

void OrderedCode::WriteTrailingString(std::string* dest,
                                      absl::string_view str) {
  dest->append(str.data(), str.size());
}

/**
 * Parse the encoding of a string previously encoded with or without
 * inversion.  If parse succeeds, return true, consume encoding from
 * "*src", and if result != NULL append the decoded string to "*result".
 * Otherwise, return false and leave both undefined.
 */
inline static bool ReadStringInternal(absl::string_view* src,
                                      std::string* result) {
  const char* start = src->data();
  const char* string_limit = src->data() + src->size();

  // We only scan up to "limit-2" since a valid string must end with
  // a two character terminator: 'kEscape1 kSeparator'
  const char* limit = string_limit - 1;
  const char* copy_start = start;
  while (true) {
    start = SkipToNextSpecialByte(start, limit);
    if (start >= limit) break;  // No terminator sequence found
    const char c = *(start++);
    // If inversion is required, instead of inverting 'c', we invert the
    // character constants to which 'c' is compared.  We get the same
    // behavior but save the runtime cost of inverting 'c'.
    HARD_ASSERT(IsSpecialByte(c));
    if (c == kEscape1) {
      if (result) {
        AppendBytes(result, copy_start,
                    static_cast<size_t>(start - copy_start) - 1);
      }
      // kEscape1 kSeparator ends component
      // kEscape1 kNullCharacter represents '\0'
      const char next = *(start++);
      if (next == kSeparator) {
        src->remove_prefix(static_cast<size_t>(start - src->data()));
        return true;
      } else if (next == kNullCharacter) {
        if (result) {
          *result += '\0';
        }
      } else {
        return false;
      }
      copy_start = start;
    } else {
      HARD_ASSERT(c == kEscape2);
      if (result) {
        AppendBytes(result, copy_start,
                    static_cast<size_t>(start - copy_start) - 1);
      }
      // kEscape2 kFFCharacter represents '\xff'
      // kEscape2 kInfinity is an error
      const char next = *(start++);
      if (next == kFFCharacter) {
        if (result) {
          *result += '\xff';
        }
      } else {
        return false;
      }
      copy_start = start;
    }
  }
  return false;
}

bool OrderedCode::ReadString(absl::string_view* src, std::string* result) {
  return ReadStringInternal(src, result);
}

bool OrderedCode::ReadNumIncreasing(absl::string_view* src, uint64_t* result) {
  if (src->empty()) {
    return false;  // Not enough bytes
  }

  // Decode length byte
  const size_t len = static_cast<size_t>((*src)[0]);

  // If len > 0 and src is longer than 1, the first byte of "payload"
  // must be non-zero (otherwise the encoding is not minimal).
  // In opt mode, we don't enforce that encodings must be minimal.
  HARD_ASSERT(0 == len || src->size() == 1 || (*src)[1] != '\0');

  if (len + 1 > src->size() || len > 8) {
    return false;  // Not enough bytes or too many bytes
  }

  if (result) {
    uint64_t tmp = 0;
    for (size_t i = 0; i < len; i++) {
      tmp <<= 8;
      tmp |= static_cast<unsigned char>((*src)[1 + i]);
    }
    *result = tmp;
  }
  src->remove_prefix(len + 1);
  return true;
}

inline static bool ReadInfinityInternal(absl::string_view* src) {
  if (src->size() >= 2 && ((*src)[0] == kEscape2) && ((*src)[1] == kInfinity)) {
    src->remove_prefix(2);
    return true;
  } else {
    return false;
  }
}

bool OrderedCode::ReadInfinity(absl::string_view* src) {
  return ReadInfinityInternal(src);
}

inline static bool ReadStringOrInfinityInternal(absl::string_view* src,
                                                std::string* result,
                                                bool* inf) {
  if (ReadInfinityInternal(src)) {
    if (inf) *inf = true;
    return true;
  }

  // We don't use ReadStringInternal here because that would inline
  // the whole encoded string parsing code here.  Depending on INVERT, only
  // one of the following two calls will be generated at compile time.
  bool success = OrderedCode::ReadString(src, result);
  if (success) {
    if (inf) *inf = false;
    return true;
  } else {
    return false;
  }
}

bool OrderedCode::ReadStringOrInfinity(absl::string_view* src,
                                       std::string* result,
                                       bool* inf) {
  return ReadStringOrInfinityInternal(src, result, inf);
}

bool OrderedCode::ReadTrailingString(absl::string_view* src,
                                     std::string* result) {
  if (result) result->assign(src->data(), src->size());
  src->remove_prefix(src->size());
  return true;
}

void OrderedCode::TEST_Corrupt(std::string* str, int k) {
  int seen_seps = 0;
  for (size_t i = 0; i < str->size() - 1; i++) {
    if ((*str)[i] == kEscape1 && (*str)[i + 1] == kSeparator) {
      seen_seps++;
      if (seen_seps == k) {
        (*str)[i + 1] = kSeparator + 1;
        return;
      }
    }
  }
}

// Signed number encoding/decoding /////////////////////////////////////
//
// The format is as follows:
//
// The first bit (the most significant bit of the first byte)
// represents the sign, 0 if the number is negative and
// 1 if the number is >= 0.
//
// Any unbroken sequence of successive bits with the same value as the sign
// bit, up to 9 (the 8th and 9th are the most significant bits of the next
// byte), are size bits that count the number of bytes after the first byte.
// That is, the total length is between 1 and 10 bytes.
//
// The value occupies the bits after the sign bit and the "size bits"
// till the end of the string, in network byte order.  If the number
// is negative, the bits are in 2-complement.
//
//
// Example 1: number 0x424242 -> 4 byte big-endian hex string 0xf0424242:
//
// +---------------+---------------+---------------+---------------+
//  1 1 1 1 0 0 0 0 0 1 0 0 0 0 1 0 0 1 0 0 0 1 0 0 0 1 0 0 0 0 1 0
// +---------------+---------------+---------------+---------------+
//  ^ ^ ^ ^   ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
//  | | | |   | | | | | | | | | | | | | | | | | | | | | | | | | | |
//  | | | |   payload: the remaining bits after the sign and size bits
//  | | | |            and the delimiter bit, the value is 0x424242
//  | | | |
//  | size bits: 3 successive bits with the same value as the sign bit
//  |            (followed by a delimiter bit with the opposite value)
//  |            mean that there are 3 bytes after the first byte, 4 total
//  |
//  sign bit: 1 means that the number is non-negative
//
// Example 2: negative number -0x800 -> 2 byte big-endian hex string 0x3800:
//
// +---------------+---------------+
//  0 0 1 1 1 0 0 0 0 0 0 0 0 0 0 0
// +---------------+---------------+
//  ^ ^   ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^
//  | |   | | | | | | | | | | | | | | | | | | | | | | | | | | |
//  | |   payload: the remaining bits after the sign and size bits and the
//  | |            delimiter bit, 2-complement because of the negative sign,
//  | |            value is ~0x7ff, represents the value -0x800
//  | |
//  | size bits: 1 bit with the same value as the sign bit
//  |            (followed by a delimiter bit with the opposite value)
//  |            means that there is 1 byte after the first byte, 2 total
//  |
//  sign bit: 0 means that the number is negative
//
//
// Compared with the simpler unsigned format used for uint64_t numbers,
// this format is more compact for small numbers, namely one byte encodes
// numbers in the range [-64,64), two bytes cover the range [-2^13,2^13), etc.
// In general, n bytes encode numbers in the range [-2^(n*7-1),2^(n*7-1)).
// (The cross-over point for compactness of representation is 8 bytes,
// where this format only covers the range [-2^55,2^55),
// whereas an encoding with sign bit and length in the first byte and
// payload in all following bytes would cover [-2^56,2^56).)

static const int kMaxSigned64Length = 10;

// This array maps encoding length to header bits in the first two bytes.
static const char kLengthToHeaderBits[1 + kMaxSigned64Length][2] = {
    {0, 0},      {'\x80', 0},      {'\xc0', 0},     {'\xe0', 0},
    {'\xf0', 0}, {'\xf8', 0},      {'\xfc', 0},     {'\xfe', 0},
    {'\xff', 0}, {'\xff', '\x80'}, {'\xff', '\xc0'}};

// This array maps encoding lengths to the header bits that overlap with
// the payload and need fixing when reading.
static const uint64_t kLengthToMask[1 + kMaxSigned64Length] = {
    0ULL,
    0x80ULL,
    0xc000ULL,
    0xe00000ULL,
    0xf0000000ULL,
    0xf800000000ULL,
    0xfc0000000000ULL,
    0xfe000000000000ULL,
    0xff00000000000000ULL,
    0x8000000000000000ULL,
    0ULL};

// This array maps the number of bits in a number to the encoding
// length produced by WriteSignedNumIncreasing.
// For positive numbers, the number of bits is 1 plus the most significant
// bit position (the highest bit position in a positive int64_t is 63).
// For a negative number n, we count the bits in ~n.
// That is, length = kBitsToLength[Bits::Log2Floor64(n < 0 ? ~n : n) + 1].
static const int8_t kBitsToLength[1 + 63] = {
    1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4,
    4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7,
    7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10};

/** Calculates the encoding length in bytes of the signed number n. */
static inline int SignedEncodingLength(int64_t n) {
  return kBitsToLength[Bits::Log2Floor64(
                           static_cast<uint64_t>(n < 0 ? ~n : n)) +
                       1];
}

/** Slightly faster version for n > 0. */
static inline int SignedEncodingLengthPositive(int64_t n) {
  return kBitsToLength[Bits::Log2FloorNonZero64(static_cast<uint64_t>(n)) + 1];
}

void OrderedCode::WriteSignedNumIncreasing(std::string* dest, int64_t val) {
  const int64_t x = val < 0 ? ~val : val;
  if (x < 64) {  // fast path for encoding length == 1
    *dest += static_cast<char>(kLengthToHeaderBits[1][0] ^ val);
    return;
  }
  // buf = val in network byte order, sign extended to 10 bytes
  const char sign_byte = val < 0 ? '\xff' : '\0';
  char buf[10] = {
      sign_byte,
      sign_byte,
  };
  UNALIGNED_STORE64(buf + 2, absl::ghtonll(static_cast<uint64_t>(val)));

  HARD_ASSERT(sizeof(buf) == kMaxSigned64Length, "max length size mismatch");
  const size_t len = static_cast<size_t>(SignedEncodingLengthPositive(x));
  HARD_ASSERT(len >= 2);
  char* const begin = buf + sizeof(buf) - len;
  begin[0] ^= kLengthToHeaderBits[len][0];
  begin[1] ^= kLengthToHeaderBits[len][1];  // ok because len >= 2
  dest->append(begin, len);
}

bool OrderedCode::ReadSignedNumIncreasing(absl::string_view* src,
                                          int64_t* result) {
  if (src->empty()) return false;
  const uint64_t xor_mask = (!((*src)[0] & 0x80)) ? ~0ULL : 0ULL;
  const unsigned char first_byte = static_cast<unsigned char>(
      static_cast<uint64_t>((*src)[0]) ^ (xor_mask & 0xff));

  // now calculate and test length, and set x to raw (unmasked) result
  size_t len;
  uint64_t x;
  if (first_byte != 0xff) {
    len = static_cast<size_t>(7 - Bits::Log2FloorNonZero(first_byte ^ 0xff));
    if (src->size() < len) return false;
    x = xor_mask;  // sign extend using xor_mask
    for (size_t i = 0; i < len; ++i)
      x = (x << 8) | static_cast<unsigned char>((*src)[i]);
  } else {
    len = 8;
    if (src->size() < len) return false;
    const unsigned char second_byte = static_cast<unsigned char>(
        static_cast<uint64_t>((*src)[1]) ^ (xor_mask & 0xff));
    if (second_byte >= 0x80) {
      if (second_byte < 0xc0) {
        len = 9;
      } else {
        const unsigned char third_byte = static_cast<unsigned char>(
            static_cast<uint64_t>((*src)[2]) ^ (xor_mask & 0xff));
        if (second_byte == 0xc0 && third_byte < 0x80) {
          len = 10;
        } else {
          return false;  // either len > 10 or len == 10 and #bits > 63
        }
      }
      if (src->size() < len) return false;
    }
    x = absl::gntohll(UNALIGNED_LOAD64(src->data() + len - 8));
  }

  x ^= kLengthToMask[len];  // remove spurious header bits

  HARD_ASSERT(len == static_cast<size_t>(
                         SignedEncodingLength(static_cast<int64_t>(x))));

  if (result) *result = static_cast<int64_t>(x);
  src->remove_prefix(static_cast<size_t>(len));
  return true;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
