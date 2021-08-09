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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/** The Cloud Firestore error domain. */
FOUNDATION_EXPORT NSString *const FIRFirestoreErrorDomain NS_SWIFT_NAME(FirestoreErrorDomain);

/** Error codes used by Cloud Firestore. */
typedef NS_ENUM(NSInteger, FIRFirestoreErrorCode) {
  /**
   * The operation completed successfully. NSError objects will never have a code with this value.
   */
  FIRFirestoreErrorCodeOK = 0,

  /** The operation was cancelled (typically by the caller). */
  FIRFirestoreErrorCodeCancelled = 1,

  /** Unknown error or an error from a different error domain. */
  FIRFirestoreErrorCodeUnknown = 2,

  /**
   * Client specified an invalid argument. Note that this differs from FailedPrecondition.
   * InvalidArgument indicates arguments that are problematic regardless of the state of the
   * system (e.g., an invalid field name).
   */
  FIRFirestoreErrorCodeInvalidArgument = 3,

  /**
   * Deadline expired before operation could complete. For operations that change the state of the
   * system, this error may be returned even if the operation has completed successfully. For
   * example, a successful response from a server could have been delayed long enough for the
   * deadline to expire.
   */
  FIRFirestoreErrorCodeDeadlineExceeded = 4,

  /** Some requested document was not found. */
  FIRFirestoreErrorCodeNotFound = 5,

  /** Some document that we attempted to create already exists. */
  FIRFirestoreErrorCodeAlreadyExists = 6,

  /** The caller does not have permission to execute the specified operation. */
  FIRFirestoreErrorCodePermissionDenied = 7,

  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system
   * is out of space.
   */
  FIRFirestoreErrorCodeResourceExhausted = 8,

  /**
   * Operation was rejected because the system is not in a state required for the operation's
   * execution.
   */
  FIRFirestoreErrorCodeFailedPrecondition = 9,

  /**
   * The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.
   */
  FIRFirestoreErrorCodeAborted = 10,

  /** Operation was attempted past the valid range. */
  FIRFirestoreErrorCodeOutOfRange = 11,

  /** Operation is not implemented or not supported/enabled. */
  FIRFirestoreErrorCodeUnimplemented = 12,

  /**
   * Internal errors. Means some invariants expected by underlying system has been broken. If you
   * see one of these errors, something is very broken.
   */
  FIRFirestoreErrorCodeInternal = 13,

  /**
   * The service is currently unavailable. This is a most likely a transient condition and may be
   * corrected by retrying with a backoff.
   */
  FIRFirestoreErrorCodeUnavailable = 14,

  /** Unrecoverable data loss or corruption. */
  FIRFirestoreErrorCodeDataLoss = 15,

  /** The request does not have valid authentication credentials for the operation. */
  FIRFirestoreErrorCodeUnauthenticated = 16
} NS_SWIFT_NAME(FirestoreErrorCode);

NS_ASSUME_NONNULL_END
