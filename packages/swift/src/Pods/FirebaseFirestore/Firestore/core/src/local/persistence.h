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

#ifndef FIRESTORE_CORE_SRC_LOCAL_PERSISTENCE_H_
#define FIRESTORE_CORE_SRC_LOCAL_PERSISTENCE_H_

#include <functional>
#include <utility>

#include "Firestore/core/src/model/types.h"
#include "absl/strings/string_view.h"

namespace firebase {
namespace firestore {
namespace auth {

class User;

}  // namespace auth

namespace local {

class BundleCache;
class IndexManager;
class MutationQueue;
class ReferenceDelegate;
class RemoteDocumentCache;
class TargetCache;

/**
 * Persistence is the lowest-level shared interface to data storage in
 * Firestore.
 *
 * Persistence creates MutationQueue and RemoteDocumentCache instances backed
 * by some underlying storage mechanism (which might be in-memory or LevelDB).
 *
 * Persistence also exposes an API to run transactions against the backing
 * store. All read and write operations must be wrapped in a transaction.
 * Implementations of Persistence only need to guarantee that writes made
 * against the transaction are not made to durable storage until the transaction
 * commits. Since memory-only storage components do not alter durable storage,
 * they are free to ignore the transaction.
 *
 * This contract is enough to allow the LocalStore to be written independently
 * of whether or not the stored state actually is durably persisted. If a user
 * enables persistent storage, writes are grouped together to avoid inconsistent
 * state that could cause crashes.
 *
 * Concretely, when persistent storage is enabled, the durable versions of
 * MutationQueue, RemoteDocumentCache, and others (the mutators) will group
 * their writes in a transaction. Once the local store has completed one logical
 * operation, it commits the transaction.
 *
 * When persistent storage is disabled, the non-durable versions of the mutators
 * ignore the transaction. This short-cut is allowed because memory-only storage
 * leaves no state so it cannot be inconsistent.
 *
 * This simplifies the implementations of the mutators and allows memory-only
 * implementations to supplement the durable ones without requiring any special
 * dual-store implementation of Persistence. The cost is that LocalStore needs
 * to be slightly careful about the order of its reads and writes in order to
 * avoid relying on being able to read back uncommitted writes.
 */
class Persistence {
 public:
  virtual ~Persistence() = default;

  virtual model::ListenSequenceNumber current_sequence_number() const = 0;

  /** Releases any resources held during eager shutdown. */
  virtual void Shutdown() = 0;

  /**
   * Returns a MutationQueue representing the persisted mutations for the given
   * user.
   *
   * Note: The implementation is free to return the same instance every time
   * this is called for a given user. In particular, the memory-backed
   * implementation does this to emulate the persisted implementation to the
   * extent possible (e.g. in the case of UID switching from sally=>jack=>sally,
   * sally's mutation queue will be preserved).
   */
  virtual MutationQueue* GetMutationQueueForUser(const auth::User& user) = 0;

  /** Returns a TargetCache representing the persisted cache of queries. */
  virtual TargetCache* target_cache() = 0;

  /**
   * Returns a BundleCache representing the persisted cache of loaded bundles.
   */
  virtual BundleCache* bundle_cache() = 0;

  /**
   * Returns a RemoteDocumentCache representing the persisted cache of remote
   * documents.
   */
  virtual RemoteDocumentCache* remote_document_cache() = 0;

  /** Returns an IndexManager that manages our persisted query indexes. */
  virtual IndexManager* index_manager() = 0;

  /**
   * This property provides access to hooks around the document reference
   * lifecycle.
   */
  virtual ReferenceDelegate* reference_delegate() = 0;

  /**
   * Accepts a function and runs it within a transaction. When called, a
   * transaction will be started before a block is run, and committed after the
   * block has executed.
   *
   * @param label A semi-unique name for the transaction, for logging.
   * @param block A void-returning function to be executed within the
   *     transaction.
   */
  template <typename F>
  auto Run(absl::string_view label, F block) ->
      typename std::enable_if<std::is_same<void, decltype(block())>::value,
                              void>::type {
    RunInternal(label, std::forward<F>(block));
  }

  /**
   * Accepts a function and runs it within a transaction. When called, a
   * transaction will be started before a block is run, and committed after the
   * block has executed.
   *
   * @param label A semi-unique name for the transaction, for logging.
   * @param block A function to be executed within the transaction whose return
   *     value will be the result of the transaction. The type of the return
   *     value must be default constructible and copy- or move-assignable.
   * @return The value returned from the invocation of `block`.
   */
  template <typename F>
  auto Run(absl::string_view label, F block) ->
      typename std::enable_if<!std::is_same<void, decltype(block())>::value,
                              decltype(block())>::type {
    decltype(block()) result;

    RunInternal(label, [&]() mutable { result = block(); });

    return result;
  }

 private:
  virtual void RunInternal(absl::string_view label,
                           std::function<void()> block) = 0;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_PERSISTENCE_H_
