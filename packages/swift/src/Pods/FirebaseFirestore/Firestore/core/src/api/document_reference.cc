/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/api/document_reference.h"

#include <future>  // NOLINT(build/c++11)
#include <memory>

#include "Firestore/core/src/api/collection_reference.h"
#include "Firestore/core/src/api/document_snapshot.h"
#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/api/query_listener_registration.h"
#include "Firestore/core/src/api/source.h"
#include "Firestore/core/src/core/firestore_client.h"
#include "Firestore/core/src/core/listen_options.h"
#include "Firestore/core/src/core/user_data.h"
#include "Firestore/core/src/core/view_snapshot.h"
#include "Firestore/core/src/model/delete_mutation.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/document_set.h"
#include "Firestore/core/src/model/precondition.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/firestore_exceptions.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/hashing.h"
#include "Firestore/core/src/util/status.h"
#include "Firestore/core/src/util/statusor.h"

namespace firebase {
namespace firestore {
namespace api {

using core::AsyncEventListener;
using core::EventListener;
using core::ListenOptions;
using core::QueryListener;
using core::ViewSnapshot;
using model::DeleteMutation;
using model::Document;
using model::DocumentKey;
using model::Precondition;
using model::ResourcePath;
using util::Status;
using util::StatusOr;
using util::StatusOrCallback;

DocumentReference::DocumentReference(model::ResourcePath path,
                                     std::shared_ptr<Firestore> firestore)
    : firestore_{std::move(firestore)} {
  if (path.size() % 2 != 0) {
    util::ThrowInvalidArgument(
        "Invalid document reference. Document references must have an even "
        "number of segments, but %s has %s",
        path.CanonicalString(), path.size());
  }
  key_ = DocumentKey{std::move(path)};
}

size_t DocumentReference::Hash() const {
  return util::Hash(firestore_.get(), key_);
}

const std::string& DocumentReference::document_id() const {
  return key_.path().last_segment();
}

CollectionReference DocumentReference::Parent() const {
  return CollectionReference{key_.path().PopLast(), firestore_};
}

std::string DocumentReference::Path() const {
  return key_.path().CanonicalString();
}

CollectionReference DocumentReference::GetCollectionReference(
    const std::string& collection_path) const {
  ResourcePath sub_path = ResourcePath::FromString(collection_path);
  ResourcePath path = key_.path().Append(sub_path);
  return CollectionReference{path, firestore_};
}

void DocumentReference::SetData(core::ParsedSetData&& set_data,
                                util::StatusCallback callback) {
  firestore_->client()->WriteMutations(
      {std::move(set_data).ToMutation(key(), Precondition::None())},
      std::move(callback));
}

void DocumentReference::UpdateData(core::ParsedUpdateData&& update_data,
                                   util::StatusCallback callback) {
  firestore_->client()->WriteMutations(
      {std::move(update_data).ToMutation(key(), Precondition::Exists(true))},
      std::move(callback));
}

void DocumentReference::DeleteDocument(util::StatusCallback callback) {
  DeleteMutation mutation(key_, Precondition::None());
  firestore_->client()->WriteMutations({mutation}, std::move(callback));
}

void DocumentReference::GetDocument(Source source,
                                    DocumentSnapshotListener&& callback) {
  if (source == Source::Cache) {
    firestore_->client()->GetDocumentFromLocalCache(*this, std::move(callback));
    return;
  }

  ListenOptions options(
      /*include_query_metadata_changes=*/true,
      /*include_document_metadata_changes=*/true,
      /*wait_for_sync_when_online=*/true);

  class ListenOnce : public EventListener<DocumentSnapshot> {
   public:
    ListenOnce(Source source, DocumentSnapshotListener&& listener)
        : source_(source), listener_(std::move(listener)) {
    }

    void OnEvent(StatusOr<DocumentSnapshot> maybe_snapshot) override {
      if (!maybe_snapshot.ok()) {
        listener_->OnEvent(std::move(maybe_snapshot));
        return;
      }

      DocumentSnapshot snapshot = std::move(maybe_snapshot).ValueOrDie();

      // Remove query first before passing event to user to avoid user actions
      // affecting the now stale query.
      std::unique_ptr<ListenerRegistration> registration =
          registration_promise_.get_future().get();
      registration->Remove();

      if (!snapshot.exists() && snapshot.metadata().from_cache()) {
        // TODO(dimond): Reconsider how to raise missing documents when
        // offline. If we're online and the document doesn't exist then we
        // call the callback with a document with document.exists set to
        // false. If we're offline however, we call the callback
        // with an error. Two options: 1) Cache the negative response from the
        // server so we can deliver that even when you're offline.
        // 2) Actually call the callback with an error if the
        // document doesn't exist when you are offline.
        listener_->OnEvent(
            Status{Error::kErrorUnavailable,
                   "Failed to get document because the client is offline."});
      } else if (snapshot.exists() && snapshot.metadata().from_cache() &&
                 source_ == Source::Server) {
        listener_->OnEvent(
            Status{Error::kErrorUnavailable,
                   "Failed to get document from server. (However, "
                   "this document does exist in the local cache. Run "
                   "again without setting source to "
                   "FirestoreSourceServer to retrieve the cached "
                   "document.)"});
      } else {
        listener_->OnEvent(std::move(snapshot));
      }
    }

    void Resolve(std::unique_ptr<ListenerRegistration> registration) {
      registration_promise_.set_value(std::move(registration));
    }

   private:
    Source source_;
    DocumentSnapshotListener listener_;

    std::promise<std::unique_ptr<ListenerRegistration>> registration_promise_;
  };
  auto listener = absl::make_unique<ListenOnce>(source, std::move(callback));
  auto listener_unowned = listener.get();

  std::unique_ptr<ListenerRegistration> registration =
      AddSnapshotListener(std::move(options), std::move(listener));

  listener_unowned->Resolve(std::move(registration));
}

std::unique_ptr<ListenerRegistration> DocumentReference::AddSnapshotListener(
    ListenOptions options, DocumentSnapshotListener&& user_listener) {
  // Convert from ViewSnapshots to DocumentSnapshots.
  class Converter : public EventListener<ViewSnapshot> {
   public:
    Converter(DocumentReference* parent,
              DocumentSnapshotListener&& user_listener)
        : firestore_(parent->firestore_),
          key_(parent->key_),
          user_listener_(std::move(user_listener)) {
    }

    void OnEvent(StatusOr<ViewSnapshot> maybe_snapshot) override {
      if (!maybe_snapshot.ok()) {
        user_listener_->OnEvent(maybe_snapshot.status());
        return;
      }

      ViewSnapshot snapshot = std::move(maybe_snapshot).ValueOrDie();
      HARD_ASSERT(snapshot.documents().size() <= 1,
                  "Too many documents returned on a document query");
      absl::optional<Document> document =
          snapshot.documents().GetDocument(key_);

      bool has_pending_writes =
          document ? snapshot.mutated_keys().contains(key_)
                   // We don't raise `has_pending_writes` for deleted documents.
                   : false;

      DocumentSnapshot result{
          firestore_, key_, document,
          SnapshotMetadata{has_pending_writes, snapshot.from_cache()}};
      user_listener_->OnEvent(std::move(result));
    }

   private:
    std::shared_ptr<Firestore> firestore_;
    DocumentKey key_;
    DocumentSnapshotListener user_listener_;
  };
  auto view_listener =
      absl::make_unique<Converter>(this, std::move(user_listener));

  // Call the view_listener on the user Executor.
  auto async_listener = AsyncEventListener<ViewSnapshot>::Create(
      firestore_->client()->user_executor(), std::move(view_listener));

  core::Query query(key_.path());
  std::shared_ptr<QueryListener> query_listener =
      firestore_->client()->ListenToQuery(std::move(query), options,
                                          async_listener);

  return absl::make_unique<QueryListenerRegistration>(
      firestore_->client(), std::move(async_listener),
      std::move(query_listener));
}

bool operator==(const DocumentReference& lhs, const DocumentReference& rhs) {
  return lhs.firestore() == rhs.firestore() && lhs.key() == rhs.key();
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
