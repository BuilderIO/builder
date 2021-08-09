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

#ifndef FIRESTORE_CORE_SRC_API_QUERY_LISTENER_REGISTRATION_H_
#define FIRESTORE_CORE_SRC_API_QUERY_LISTENER_REGISTRATION_H_

#include <memory>

#include "Firestore/core/src/api/listener_registration.h"
#include "Firestore/core/src/core/core_fwd.h"

namespace firebase {
namespace firestore {
namespace api {

/**
 * An internal handle that encapsulates a user's ability to request that we
 * stop listening to a query.
 */
class QueryListenerRegistration : public ListenerRegistration {
 public:
  QueryListenerRegistration(
      std::shared_ptr<core::FirestoreClient> client,
      std::shared_ptr<core::AsyncEventListener<core::ViewSnapshot>>
          async_listener,
      std::shared_ptr<core::QueryListener> query_listener);

  /**
   * Removes the listener being tracked by this QueryListenerRegistration.
   */
  void Remove() override;

 private:
  /** The client that was used to register this listen. */
  std::shared_ptr<core::FirestoreClient> client_;

  /** The async listener that is used to mute events synchronously. */
  std::weak_ptr<core::AsyncEventListener<core::ViewSnapshot>> async_listener_;

  /** The internal QueryListener that can be used to unlisten the query. */
  std::weak_ptr<core::QueryListener> query_listener_;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_QUERY_LISTENER_REGISTRATION_H_
