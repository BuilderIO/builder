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

// Implementation note:
//
// This is ported from //base/strerror.cc, with several local modifications:
//
//   * Removed non-portable optimization around to use sys_errlist where
//     available without warnings.
//   * Added __attribute__((unused)) to compile with -Wno-unused-functions.
//   * Conformed to style/lint rules.

#include "Firestore/core/src/util/strerror.h"

#include <cerrno>
#include <cstring>

#if defined(_WIN32)
#define HAVE_STRERROR_S 1

#elif defined(__GLIBC__)
#if (_POSIX_C_SOURCE >= 200112L) && !_GNU_SOURCE
#define HAVE_POSIX_STRERROR_R 1
#else
#define HAVE_GNU_STRERROR_R 1
#endif

#else
#define HAVE_POSIX_STRERROR_R 1

#endif

namespace firebase {
namespace firestore {
namespace util {
namespace {

inline const char* StrErrorAdaptor(int errnum, char* buf, size_t buflen) {
#if HAVE_STRERROR_S
  int rc = strerror_s(buf, buflen, errnum);
  buf[buflen - 1] = '\0';  // guarantee NUL termination

  if (rc == 0 && strcmp(buf, "Unknown error") == 0) {
    *buf = '\0';
  }
  return buf;

#elif HAVE_POSIX_STRERROR_R
  if (strerror_r(errnum, buf, buflen)) {
    *buf = '\0';
  }
  return buf;

#elif HAVE_GNU_STRERROR_R
  return strerror_r(errnum, buf, buflen);

#endif  // HAVE_STRERROR_S
}

}  // namespace

std::string StrError(int errnum) {
  const int saved_errno = errno;

  char buf[100];
  const char* str = StrErrorAdaptor(errnum, buf, sizeof buf);
  if (*str == '\0') {
    snprintf(buf, sizeof buf, "Unknown error %d", errnum);
    str = buf;
  }

  errno = saved_errno;
  return str;
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
