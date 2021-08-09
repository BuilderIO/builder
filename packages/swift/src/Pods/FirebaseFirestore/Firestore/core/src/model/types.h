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

#ifndef FIRESTORE_CORE_SRC_MODEL_TYPES_H_
#define FIRESTORE_CORE_SRC_MODEL_TYPES_H_

#include <cstdint>

namespace firebase {
namespace firestore {
namespace model {

/**
 * BatchId is a locally assigned identifier for a batch of mutations that have
 * been applied by the user but have not yet been fully committed at the server.
 */
using BatchId = int32_t;

/**
 * A sequence number that's incremented on each "interesting" action in the
 * local store that establishes the order in which items can be garbage
 * collected.
 */
using ListenSequenceNumber = int64_t;

/**
 * TargetId is a stable numeric identifier assigned for a specific query
 * applied.
 */
using TargetId = int32_t;

/**
 * Describes the online state of the Firestore client. Note that this does not
 * indicate whether or not the remote store is trying to connect or not. This is
 * primarily used by the View / EventManager code to change their behavior while
 * offline (e.g. get() calls shouldn't wait for data from the server and
 * snapshot events should set metadata.from_cache() to true).
 */
enum class OnlineState {
  /**
   * The Firestore client is in an unknown online state. This means the client
   * is either not actively trying to establish a connection or it is currently
   * trying to establish a connection, but it has not succeeded or failed yet.
   * Higher-level components should not operate in offline mode.
   */
  Unknown,

  /**
   * The client is connected and the connections are healthy. This state is
   * reached after a successful connection and there has been at least one
   * successful message received from the backends.
   */
  Online,

  /**
   * The client is either trying to establish a connection but failing, or it
   * has been explicitly marked offline via a call to `DisableNetwork`.
   * Higher-level components should operate in offline mode.
   */
  Offline
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_TYPES_H_
