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

#ifndef FIRESTORE_CORE_SRC_MODEL_MODEL_FWD_H_
#define FIRESTORE_CORE_SRC_MODEL_MODEL_FWD_H_

#include <cstdint>
#include <map>
#include <unordered_map>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "absl/types/optional.h"

namespace firebase {

class Timestamp;

namespace firestore {

class GeoPoint;

namespace util {

template <typename T>
struct Comparator;

}  // namespace util

namespace immutable {

template <typename K, typename V, typename C>
class SortedMap;

template <typename K, typename C>
class SortedSet;

}  // namespace immutable

namespace nanopb {

template <typename T>
class Message;

}  // namespace nanopb

namespace model {

class DatabaseId;
class DeleteMutation;
class Document;
class MutableDocument;
class DocumentComparator;
class DocumentKey;
class DocumentSet;
class FieldMask;
class FieldPath;
class FieldTransform;
class MutableDocument;
class Mutation;
class MutationBatch;
class MutationBatchResult;
class MutationResult;
class ObjectValue;
class PatchMutation;
class Precondition;
class SetMutation;
class SnapshotVersion;
class TransformOperation;
class VerifyMutation;

enum class OnlineState;

struct DocumentKeyHash;

using BatchId = int32_t;
using ListenSequenceNumber = int64_t;
using TargetId = int32_t;

using DocumentKeySet =
    immutable::SortedSet<DocumentKey, util::Comparator<DocumentKey>>;

using MutableDocumentMap = immutable::
    SortedMap<DocumentKey, MutableDocument, util::Comparator<DocumentKey>>;

using DocumentMap =
    immutable::SortedMap<DocumentKey, Document, util::Comparator<DocumentKey>>;

using DocumentVersionMap =
    std::unordered_map<DocumentKey, SnapshotVersion, DocumentKeyHash>;

using DocumentUpdateMap =
    std::unordered_map<DocumentKey, MutableDocument, DocumentKeyHash>;

// A map of FieldPaths to transforms. Sorted so it can be used in
// ObjectValue::SetAll, which makes it more efficient as it processes field
// maps one layer at a time.
using TransformMap =
    std::map<FieldPath,
             absl::optional<nanopb::Message<google_firestore_v1_Value>>>;

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_MODEL_FWD_H_
