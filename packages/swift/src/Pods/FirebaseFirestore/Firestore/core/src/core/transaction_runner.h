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

#ifndef FIRESTORE_CORE_SRC_CORE_TRANSACTION_RUNNER_H_
#define FIRESTORE_CORE_SRC_CORE_TRANSACTION_RUNNER_H_

#include <memory>

#include "Firestore/core/src/core/transaction.h"
#include "Firestore/core/src/remote/exponential_backoff.h"
#include "Firestore/core/src/remote/remote_store.h"
#include "Firestore/core/src/util/async_queue.h"
#include "Firestore/core/src/util/status_fwd.h"

namespace firebase {
namespace firestore {
namespace core {

/**
 * TransactionRunner encapsulates the logic needed to run and retry transactions
 * with backoff.
 *
 * TransactionRunner manages its own lifetime by keeping itself alive until all
 * retries are completed. It must be allocated via
 * std::make_shared<TransactionRunner> because the implementation expects to be
 * able to call std::shared_from_this to create additional references that will
 * keep it alive.
 */
class TransactionRunner
    : public std::enable_shared_from_this<TransactionRunner> {
 public:
  TransactionRunner(const std::shared_ptr<util::AsyncQueue>& queue,
                    remote::RemoteStore* remote_store,
                    core::TransactionUpdateCallback update_callback,
                    core::TransactionResultCallback result_callback);

  /**
   * Runs the transaction and calls the result_callback_ with the result.
   */
  void Run();

 private:
  void ContinueCommit(const std::shared_ptr<Transaction>& transaction,
                      util::Status status);

  void DispatchResult(const std::shared_ptr<Transaction>& transaction,
                      util::Status status);

  void HandleTransactionError(const std::shared_ptr<Transaction>& transaction,
                              util::Status status);

  std::shared_ptr<util::AsyncQueue> queue_;
  remote::RemoteStore* remote_store_;
  core::TransactionUpdateCallback update_callback_;
  core::TransactionResultCallback result_callback_;
  remote::ExponentialBackoff backoff_;
  int attempts_remaining_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_TRANSACTION_RUNNER_H_
