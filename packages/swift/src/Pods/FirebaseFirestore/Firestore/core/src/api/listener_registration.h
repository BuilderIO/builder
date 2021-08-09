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

#ifndef FIRESTORE_CORE_SRC_API_LISTENER_REGISTRATION_H_
#define FIRESTORE_CORE_SRC_API_LISTENER_REGISTRATION_H_

namespace firebase {
namespace firestore {

namespace core {
class FirestoreClient;
}  // namespace core

namespace api {

/**
 * An internal handle that encapsulates a user's ability to request that we
 * stop listening to a listener. When a user calls Remove(),
 * ListenerRegistration will synchronously mute the listener and then send a
 * request to the FirestoreClient to actually unlisten.
 *
 * ListenerRegistration will not automatically stop listening if it is
 * destroyed. We allow users to fire and forget listens if they never want to
 * stop them.
 *
 * Getting shutdown code right is tricky so ListenerRegistration is very
 * forgiving. It will tolerate:
 *
 *   * Multiple calls to Remove(),
 *   * calls to Remove() after we send an error,
 *   * calls to Remove() even after deleting the App in which the listener was
 *     started.
 */
class ListenerRegistration {
 public:
  virtual ~ListenerRegistration() = default;

  /**
   * Removes the listener being tracked in this ListenerRegistration. After
   * the initial call, subsequent calls have no effect.
   */
  virtual void Remove() = 0;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_LISTENER_REGISTRATION_H_
