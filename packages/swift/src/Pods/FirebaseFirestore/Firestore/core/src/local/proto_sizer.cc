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

#include "Firestore/core/src/local/proto_sizer.h"

#include <utility>

#include "Firestore/Protos/nanopb/firestore/local/maybe_document.nanopb.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/nanopb/byte_string.h"
#include "Firestore/core/src/nanopb/message.h"

namespace firebase {
namespace firestore {
namespace local {

using model::MutableDocument;

ProtoSizer::ProtoSizer(LocalSerializer serializer)
    : serializer_(std::move(serializer)) {
}

int64_t ProtoSizer::CalculateByteSize(const MutableDocument& maybe_doc) const {
  // TODO(varconst): implement a version of `nanopb::Writer` that only
  // calculates sizes without actually doing the encoding (to the extent
  // possible). This isn't high priority as long as `ProtoSizer` is only used in
  // tests.
  return MakeByteString(serializer_.EncodeMaybeDocument(maybe_doc)).size();
}

int64_t ProtoSizer::CalculateByteSize(const model::MutationBatch& batch) const {
  return MakeByteString(serializer_.EncodeMutationBatch(batch)).size();
}

int64_t ProtoSizer::CalculateByteSize(const TargetData& target_data) const {
  return MakeByteString(serializer_.EncodeTargetData(target_data)).size();
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
