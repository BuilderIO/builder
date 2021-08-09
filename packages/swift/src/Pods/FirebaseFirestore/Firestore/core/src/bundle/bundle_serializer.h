/*
 * Copyright 2021 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_SERIALIZER_H_
#define FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_SERIALIZER_H_

#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/bundle/bundle_document.h"
#include "Firestore/core/src/bundle/bundle_metadata.h"
#include "Firestore/core/src/bundle/bundled_document_metadata.h"
#include "Firestore/core/src/bundle/named_query.h"
#include "Firestore/core/src/core/core_fwd.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/snapshot_version.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/remote/serializer.h"
#include "Firestore/core/src/util/read_context.h"
#include "Firestore/third_party/nlohmann_json/json.hpp"

namespace firebase {
namespace firestore {
namespace bundle {

/**
 * Provides the ability to report failure cases by inheriting `ReadContext`, and
 * checks and reads json object into specified types.
 *
 * `Required*` methods check the existence of the given name and compatibility
 * of its value (can it be read into the given type?). They fail the reader if
 * any of the checks fail, otherwise return the read value.
 *
 * `Optional*` methods check the existence of the given name, and return a
 * specified default value if the name does not exist. They then check
 * compatibility of its value, fail the reader if that check fails, or return
 * the read value if it succeeds.
 */
class JsonReader : public util::ReadContext {
 public:
  const std::string& RequiredString(const char* name,
                                    const nlohmann::json& json_object);
  const std::string& OptionalString(const char* name,
                                    const nlohmann::json& json_object,
                                    const std::string& default_value);

  const std::vector<nlohmann::json>& RequiredArray(
      const char* name, const nlohmann::json& json_object);
  const std::vector<nlohmann::json>& OptionalArray(
      const char* name,
      const nlohmann::json& json_object,
      const std::vector<nlohmann::json>& default_value);
  const nlohmann::json& RequiredObject(const char* child_name,
                                       const nlohmann::json& json_object);

  double RequiredDouble(const char* name, const nlohmann::json& json_object);
  double OptionalDouble(const char* name,
                        const nlohmann::json& json_object,
                        double default_value = 0);

  template <typename IntType>
  IntType RequiredInt(const char* name, const nlohmann::json& json_object);

  template <typename IntType>
  IntType OptionalInt(const char* name,
                      const nlohmann::json& json_object,
                      IntType default_value);

  static bool OptionalBool(const char* name,
                           const nlohmann::json& json_object,
                           bool default_value = false);

 private:
  double DecodeDouble(const nlohmann::json& value);
};

/** A JSON serializer to deserialize Firestore Bundles. */
class BundleSerializer {
 public:
  explicit BundleSerializer(remote::Serializer serializer)
      : rpc_serializer_(std::move(serializer)) {
  }
  BundleMetadata DecodeBundleMetadata(JsonReader& reader,
                                      const nlohmann::json& metadata) const;

  NamedQuery DecodeNamedQuery(JsonReader& reader,
                              const nlohmann::json& named_query) const;

  BundledDocumentMetadata DecodeDocumentMetadata(
      JsonReader& reader, const nlohmann::json& document_metadata) const;

  BundleDocument DecodeDocument(JsonReader& reader,
                                const nlohmann::json& document) const;

 private:
  BundledQuery DecodeBundledQuery(JsonReader& reader,
                                  const nlohmann::json& query) const;
  core::FilterList DecodeWhere(JsonReader& reader,
                               const nlohmann::json& query) const;
  core::Filter DecodeFieldFilter(JsonReader& reader,
                                 const nlohmann::json& filter) const;
  core::FilterList DecodeCompositeFilter(JsonReader& reader,
                                         const nlohmann::json& filter) const;
  nanopb::Message<google_firestore_v1_Value> DecodeValue(
      JsonReader& reader, const nlohmann::json& value) const;
  core::Bound DecodeBound(JsonReader& reader,
                          const nlohmann::json& query,
                          const char* bound_name) const;
  model::ResourcePath DecodeName(JsonReader& reader,
                                 const nlohmann::json& name) const;
  nanopb::Message<google_firestore_v1_ArrayValue> DecodeArrayValue(
      JsonReader& reader, const nlohmann::json& array_json) const;
  nanopb::Message<google_firestore_v1_MapValue> DecodeMapValue(
      JsonReader& reader, const nlohmann::json& map_json) const;
  pb_bytes_array_t* DecodeReferenceValue(JsonReader& reader,
                                         const std::string& ref_string) const;

  remote::Serializer rpc_serializer_;
};

}  // namespace bundle
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_BUNDLE_BUNDLE_SERIALIZER_H_
