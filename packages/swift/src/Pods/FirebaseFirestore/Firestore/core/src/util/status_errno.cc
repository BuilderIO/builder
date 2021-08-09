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

#include "Firestore/core/src/util/status.h"

#include <cerrno>

#include "Firestore/core/src/util/strerror.h"
#include "Firestore/core/src/util/string_format.h"

namespace firebase {
namespace firestore {
namespace util {

/// Returns the Canonical error code for the given errno value.
static Error CodeForErrno(int errno_code) {
  switch (errno_code) {
    case 0:
      return Error::kErrorOk;

      // Internal canonical mappings call these failed preconditions, but for
      // our purposes these must indicate an internal error in file handling.
    case EBADF:  // Invalid file descriptor
#if defined(EBADFD)
    case EBADFD:  // File descriptor in bad state
#endif
      return Error::kErrorInternal;

    case EINVAL:        // Invalid argument
    case ENAMETOOLONG:  // Filename too long
    case E2BIG:         // Argument list too long
    case EDESTADDRREQ:  // Destination address required
    case EDOM:          // Mathematics argument out of domain of function
    case EFAULT:        // Bad address
    case EILSEQ:        // Illegal byte sequence
    case ENOPROTOOPT:   // Protocol not available
    case ENOSTR:        // Not a STREAM
    case ENOTSOCK:      // Not a socket
    case ENOTTY:        // Inappropriate I/O control operation
    case EPROTOTYPE:    // Protocol wrong type for socket
    case ESPIPE:        // Invalid seek
      return Error::kErrorInvalidArgument;

    case ETIMEDOUT:  // Connection timed out
    case ETIME:      // Timer expired
      return Error::kErrorDeadlineExceeded;

    case ENODEV:  // No such device
    case ENOENT:  // No such file or directory
#if defined(ENOMEDIUM)
    case ENOMEDIUM:  // No medium found
#endif
    case ENXIO:  // No such device or address
    case ESRCH:  // No such process
      return Error::kErrorNotFound;

    case EEXIST:         // File exists
    case EADDRNOTAVAIL:  // Address not available
    case EALREADY:       // Connection already in progress
#if defined(ENOTUNIQ)
    case ENOTUNIQ:  // Name not unique on network
#endif
      return Error::kErrorAlreadyExists;

    case EPERM:   // Operation not permitted
    case EACCES:  // Permission denied
#if defined(ENOKEY)
    case ENOKEY:  // Required key not available
#endif
    case EROFS:  // Read only file system
      return Error::kErrorPermissionDenied;

    case ENOTEMPTY:   // Directory not empty
    case EISDIR:      // Is a directory
    case ENOTDIR:     // Not a directory
    case EADDRINUSE:  // Address already in use
    case EBUSY:       // Device or resource busy
    case ECHILD:      // No child processes
    case EISCONN:     // Socket is connected
#if defined(EISNAM)
    case EISNAM:  // Is a named type file
#endif
#if defined(ENOTBLK)
    case ENOTBLK:  // Block device required
#endif
    case ENOTCONN:  // The socket is not connected
    case EPIPE:     // Broken pipe
#if defined(ESHUTDOWN)
    case ESHUTDOWN:  // Cannot send after transport endpoint shutdown
#endif
    case ETXTBSY:  // Text file busy
#if defined(EUNATCH)
    case EUNATCH:  // Protocol driver not attached
#endif
      return Error::kErrorFailedPrecondition;

    case ENOSPC:  // No space left on device
#if defined(EDQUOT)
    case EDQUOT:  // Disk quota exceeded
#endif
    case EMFILE:   // Too many open files
    case EMLINK:   // Too many links
    case ENFILE:   // Too many open files in system
    case ENOBUFS:  // No buffer space available
    case ENODATA:  // No message is available on the STREAM read queue
    case ENOMEM:   // Not enough space
    case ENOSR:    // No STREAM resources
#if defined(EUSERS)
    case EUSERS:  // Too many users
#endif
      return Error::kErrorResourceExhausted;

#if defined(ECHRNG)
    case ECHRNG:  // Channel number out of range
#endif
    case EFBIG:      // File too large
    case EOVERFLOW:  // Value too large to be stored in data type
    case ERANGE:     // Result too large
      return Error::kErrorOutOfRange;

#if defined(ENOPKG)
    case ENOPKG:  // Package not installed
#endif
    case ENOSYS:        // Function not implemented
    case ENOTSUP:       // Operation not supported
    case EAFNOSUPPORT:  // Address family not supported
#if defined(EPFNOSUPPORT)
    case EPFNOSUPPORT:  // Protocol family not supported
#endif
    case EPROTONOSUPPORT:  // Protocol not supported
#if defined(ESOCKTNOSUPPORT)
    case ESOCKTNOSUPPORT:  // Socket type not supported
#endif
    case EXDEV:  // Improper link
      return Error::kErrorUnimplemented;

    case EAGAIN:  // Resource temporarily unavailable
#if defined(ECOMM)
    case ECOMM:  // Communication error on send
#endif
    case ECONNREFUSED:  // Connection refused
    case ECONNABORTED:  // Connection aborted
    case ECONNRESET:    // Connection reset
    case EINTR:         // Interrupted function call
#if defined(EHOSTDOWN)
    case EHOSTDOWN:  // Host is down
#endif
    case EHOSTUNREACH:  // Host is unreachable
    case ENETDOWN:      // Network is down
    case ENETRESET:     // Connection aborted by network
    case ENETUNREACH:   // Network unreachable
    case ENOLCK:        // No locks available
    case ENOLINK:       // Link has been severed
#if defined(ENONET)
    case ENONET:  // Machine is not on the network
#endif
      return Error::kErrorUnavailable;

    case EDEADLK:  // Resource deadlock avoided
#if defined(ESTALE)
    case ESTALE:  // Stale file handle
#endif
      return Error::kErrorAborted;

    case ECANCELED:  // Operation cancelled
      return Error::kErrorCancelled;

    default:
      return Error::kErrorUnknown;
  }
}

Status Status::FromErrno(int errno_code, absl::string_view msg) {
  if (errno_code == 0) {
    return Status::OK();
  }

  Error canonical_code = CodeForErrno(errno_code);
  return Status{canonical_code,
                util::StringFormat("%s (errno %s: %s)", msg, errno_code,
                                   StrError(errno_code))};
}

}  // namespace util
}  // namespace firestore
}  // namespace firebase
