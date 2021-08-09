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

#include "Firestore/core/src/core/transaction_runner.h"

#include <utility>

#include "Firestore/core/src/remote/exponential_backoff.h"
#include "absl/algorithm/container.h"

namespace firebase {
namespace firestore {
namespace core {
namespace {

using remote::RemoteStore;
using util::AsyncQueue;
using util::Status;
using util::TimerId;

/** Maximum number of times a transaction can be attempted before failing. */
constexpr int kMaxAttemptsCount = 5;

bool IsRetryableTransactionError(const util::Status& error) {
  // In transactions, the backend will fail outdated reads with
  // FAILED_PRECONDITION and non-matching document versions with ABORTED. These
  // errors should be retried.
  Error code = error.code();
  return code == Error::kErrorAborted ||
         code == Error::kErrorFailedPrecondition ||
         !remote::Datastore::IsPermanentError(error);
}
}  // namespace

TransactionRunner::TransactionRunner(const std::shared_ptr<AsyncQueue>& queue,
                                     RemoteStore* remote_store,
                                     TransactionUpdateCallback update_callback,
                                     TransactionResultCallback result_callback)
    : queue_{queue},
      remote_store_{remote_store},
      update_callback_{std::move(update_callback)},
      result_callback_{std::move(result_callback)},
      backoff_{queue_, TimerId::RetryTransaction},
      attempts_remaining_{kMaxAttemptsCount} {
}

void TransactionRunner::Run() {
  queue_->VerifyIsCurrentQueue();
  attempts_remaining_ -= 1;

  auto shared_this = this->shared_from_this();
  backoff_.BackoffAndRun([shared_this] {
    std::shared_ptr<Transaction> transaction =
        shared_this->remote_store_->CreateTransaction();
    shared_this->update_callback_(
        transaction, [transaction, shared_this](const util::Status& status) {
          shared_this->queue_->Enqueue([transaction, shared_this, status] {
            shared_this->ContinueCommit(transaction, status);
          });
        });
  });
}

void TransactionRunner::ContinueCommit(
    const std::shared_ptr<Transaction>& transaction, util::Status status) {
  if (!status.ok()) {
    HandleTransactionError(transaction, std::move(status));
  } else {
    auto shared_this = this->shared_from_this();
    transaction->Commit([shared_this, transaction](Status commit_status) {
      shared_this->DispatchResult(transaction, std::move(commit_status));
    });
  }
}

void TransactionRunner::DispatchResult(
    const std::shared_ptr<Transaction>& transaction, Status status) {
  if (status.ok()) {
    result_callback_(std::move(status));
  } else {
    HandleTransactionError(transaction, std::move(status));
  }
}

void TransactionRunner::HandleTransactionError(
    const std::shared_ptr<Transaction>& transaction, Status status) {
  if (attempts_remaining_ > 0 && IsRetryableTransactionError(status) &&
      !transaction->IsPermanentlyFailed()) {
    Run();
  } else {
    result_callback_(std::move(status));
  }
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
