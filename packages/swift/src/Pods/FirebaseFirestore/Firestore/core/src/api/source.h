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

#ifndef FIRESTORE_CORE_SRC_API_SOURCE_H_
#define FIRESTORE_CORE_SRC_API_SOURCE_H_

namespace firebase {
namespace firestore {
namespace api {

/**
 * An enum that configures the behavior of `DocumentReference.GetDocument()` and
 * `Query.GetDocuments()`. By providing a source enum the `GetDocument[s]`
 * methods can be configured to fetch results only from the server, only from
 * the local cache, or attempt to fetch results from the server and fall back to
 * the cache (which is the default).
 *
 * See `FIRFirestoreSource` for more details.
 */
enum class Source { Default, Server, Cache };

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_SOURCE_H_
