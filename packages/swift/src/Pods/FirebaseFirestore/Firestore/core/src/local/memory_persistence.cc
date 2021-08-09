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

#include "Firestore/core/src/local/memory_persistence.h"

#include "Firestore/core/src/auth/user.h"
#include "Firestore/core/src/local/listen_sequence.h"
#include "Firestore/core/src/local/lru_garbage_collector.h"
#include "Firestore/core/src/local/memory_eager_reference_delegate.h"
#include "Firestore/core/src/local/memory_index_manager.h"
#include "Firestore/core/src/local/memory_lru_reference_delegate.h"
#include "Firestore/core/src/local/memory_mutation_queue.h"
#include "Firestore/core/src/local/memory_remote_document_cache.h"
#include "Firestore/core/src/local/memory_target_cache.h"
#include "Firestore/core/src/local/reference_delegate.h"
#include "Firestore/core/src/local/sizer.h"
#include "Firestore/core/src/local/target_data.h"
#include "absl/memory/memory.h"

namespace firebase {
namespace firestore {
namespace local {

using auth::User;
using model::ListenSequenceNumber;

std::unique_ptr<MemoryPersistence>
MemoryPersistence::WithEagerGarbageCollector() {
  std::unique_ptr<MemoryPersistence> persistence(new MemoryPersistence());
  auto delegate =
      absl::make_unique<MemoryEagerReferenceDelegate>(persistence.get());
  persistence->set_reference_delegate(std::move(delegate));
  return persistence;
}

std::unique_ptr<MemoryPersistence> MemoryPersistence::WithLruGarbageCollector(
    LruParams lru_params, std::unique_ptr<Sizer> sizer) {
  std::unique_ptr<MemoryPersistence> persistence(new MemoryPersistence());
  auto delegate = absl::make_unique<MemoryLruReferenceDelegate>(
      persistence.get(), lru_params, std::move(sizer));
  persistence->set_reference_delegate(std::move(delegate));
  return persistence;
}

MemoryPersistence::MemoryPersistence()
    : target_cache_(this), remote_document_cache_(this), started_(true) {
}

MemoryPersistence::~MemoryPersistence() = default;

ListenSequenceNumber MemoryPersistence::current_sequence_number() const {
  return reference_delegate_->current_sequence_number();
}

void MemoryPersistence::set_reference_delegate(
    std::unique_ptr<ReferenceDelegate> delegate) {
  reference_delegate_ = std::move(delegate);
}

void MemoryPersistence::Shutdown() {
  // No durable state to ensure is closed on shutdown.
  HARD_ASSERT(started_, "MemoryPersistence shutdown without start!");
  started_ = false;
}

MemoryMutationQueue* MemoryPersistence::GetMutationQueueForUser(
    const User& user) {
  auto iter = mutation_queues_.find(user);
  if (iter == mutation_queues_.end()) {
    auto queue = absl::make_unique<MemoryMutationQueue>(this);
    MemoryMutationQueue* result = queue.get();

    mutation_queues_.emplace(user, std::move(queue));
    return result;
  } else {
    return iter->second.get();
  }
}

MemoryTargetCache* MemoryPersistence::target_cache() {
  return &target_cache_;
}

MemoryBundleCache* MemoryPersistence::bundle_cache() {
  return &bundle_cache_;
}

MemoryRemoteDocumentCache* MemoryPersistence::remote_document_cache() {
  return &remote_document_cache_;
}

MemoryIndexManager* MemoryPersistence::index_manager() {
  return &index_manager_;
}

ReferenceDelegate* MemoryPersistence::reference_delegate() {
  return reference_delegate_.get();
}

void MemoryPersistence::RunInternal(absl::string_view label,
                                    std::function<void()> block) {
  TransactionGuard guard(reference_delegate_.get(), label);

  block();
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
