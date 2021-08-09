/*
 * Copyright 2020 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_CORE_CORE_FWD_H_
#define FIRESTORE_CORE_SRC_CORE_CORE_FWD_H_

#include <functional>
#include <memory>
#include <string>

namespace firebase {
namespace firestore {

namespace immutable {
template <typename T>
class AppendOnlyList;
}  // namespace immutable

namespace util {
class Status;

struct Empty;

using StatusCallback = std::function<void(Status)>;
}  // namespace util

namespace core {

class Bound;
class DatabaseInfo;
class Direction;
class EventManager;
class FieldFilter;
class Filter;
class FirestoreClient;
class ListenOptions;
class OrderBy;
class ParsedSetData;
class ParsedUpdateData;
class Query;
class QueryListener;
class SyncEngine;
class SyncEngineCallback;
class Target;
class TargetIdGenerator;
class Transaction;
class ViewDocumentChanges;
class ViewChange;
class View;
class DocumentViewChange;
class DocumentViewChangeSet;
class ViewSnapshot;

template <typename T>
class AsyncEventListener;

template <typename T>
class EventListener;

using CollectionGroupId = std::shared_ptr<const std::string>;

using FilterList = immutable::AppendOnlyList<Filter>;

using OrderByList = immutable::AppendOnlyList<OrderBy>;

using TransactionResultCallback = util::StatusCallback;

using TransactionUpdateCallback = std::function<void(
    std::shared_ptr<Transaction>, TransactionResultCallback)>;

using ViewSnapshotListener = std::unique_ptr<EventListener<ViewSnapshot>>;

using ViewSnapshotSharedListener = std::shared_ptr<EventListener<ViewSnapshot>>;

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_CORE_FWD_H_
