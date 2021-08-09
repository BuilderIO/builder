/*
 * Copyright 2018 Google
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

#ifndef FIRESTORE_CORE_SRC_CORE_USER_DATA_H_
#define FIRESTORE_CORE_SRC_CORE_USER_DATA_H_

#include <memory>
#include <set>
#include <string>
#include <utility>
#include <vector>

#include "Firestore/core/src/model/field_mask.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/field_transform.h"
#include "Firestore/core/src/model/object_value.h"

namespace firebase {
namespace firestore {
namespace model {

class Precondition;
class Mutation;
class DocumentKey;

}  // namespace model

namespace core {

class ParseContext;
class ParsedSetData;
class ParsedUpdateData;

/**
 * Represents what type of API method provided the data being parsed; useful for
 * determining which error conditions apply during parsing and providing better
 * error messages.
 */
enum class UserDataSource {
  /** The data comes from a regular Set operation, without merge. */
  Set,
  /** The data comes from a Set operation with merge enabled. */
  MergeSet,
  /** The data comes from an Update operation. */
  Update,
  /**
   * Indicates the source is a where clause, cursor bound, array union element,
   * etc. In particular, this will result in ParseContext.write() returning
   * false.
   */
  Argument,
  /**
   * Indicates that the source is an Argument that may directly contain nested
   * arrays (e.g. the operand of a `in` query).
   */
  ArrayArgument
};

/**
 * Accumulates the side-effect results of parsing user input. These include:
 *
 *   * The field mask naming all the fields that have values.
 *   * The transform operations that must be applied in the batch to implement
 *     server-generated behavior. In the wire protocol these are encoded
 *     separately from the Value.
 */
class ParseAccumulator {
 public:
  /**
   * @param data_source Indicates what kind of API method this data came from.
   */
  explicit ParseAccumulator(UserDataSource data_source)
      : data_source_{data_source} {
  }

  /**
   * What type of API method provided the data being parsed; useful for
   * determining which error conditions apply during parsing and providing
   * better error messages.
   */
  UserDataSource data_source() const {
    return data_source_;
  }

  /**
   * Returns the current list of transforms.
   */
  const std::vector<model::FieldTransform>& field_transforms() const {
    return field_transforms_;
  }

  /**
   * Returns a new ParseContext representing the root of a user document.
   */
  ParseContext RootContext();

  /**
   * Returns `true` if the given `field_path` was encountered in the current
   * document.
   */
  bool Contains(const model::FieldPath& field_path) const;

  /**
   * Adds the given `field_path` to the accumulated FieldMask.
   */
  void AddToFieldMask(model::FieldPath field_path);

  /**
   * Adds a transformation for the given field path.
   */
  void AddToFieldTransforms(model::FieldPath field_path,
                            model::TransformOperation transform_operation);

  /**
   * Wraps the given `data` along with any accumulated field mask and transforms
   * into a ParsedSetData representing a user-issued merge.
   *
   * @return ParsedSetData that has consumed the contents of this
   * ParseAccumulator.
   */
  ParsedSetData MergeData(model::ObjectValue data) &&;

  /**
   * Wraps the given `data` and `user_field_mask` along with any accumulated
   * transforms that are covered by the given field mask into a ParsedSetData
   * that represents a user-issued merge.
   *
   * @param data The converted user data.
   * @param user_field_mask The user-supplied field mask that masks out any
   *     changes that have been accumulated so far.
   *
   * @return ParsedSetData that has consumed the contents of this
   * ParseAccumulator. The field mask in the result will be the user_field_mask
   * and only transforms that are covered by the mask will be included.
   */
  ParsedSetData MergeData(model::ObjectValue data,
                          model::FieldMask user_field_mask) &&;

  /**
   * Wraps the given `data` along with any accumulated transforms into a
   * ParsedSetData that represents a user-issued Set.
   *
   * @return ParsedSetData that has consumed the contents of this
   * ParseAccumulator.
   */
  ParsedSetData SetData(model::ObjectValue data) &&;

  /**
   * Wraps the given `data` along with any accumulated field mask and transforms
   * into a ParsedUpdateData that represents a user-issued Update.
   *
   * @return ParsedSetData that has consumed the contents of this
   * ParseAccumulator.
   */
  ParsedUpdateData UpdateData(model::ObjectValue data) &&;

 private:
  friend class ParseContext;

  UserDataSource data_source_;

  // field_mask_ and field_transforms_ are shared across all active context
  // objects to accumulate the result. All ChildContext objects append their
  // results here.
  std::set<model::FieldPath> field_mask_;
  std::vector<model::FieldTransform> field_transforms_;
};

/**
 * A "context" object that wraps a ParseAccumulator and refers to a specific
 * location in a user-supplied document. Instances are created and passed around
 * while traversing user data during parsing in order to conveniently accumulate
 * data in the ParseAccumulator.
 */
class ParseContext {
 public:
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param path A path within the object being parsed. This could be an empty
   * path (in which case the context represents the root of the data being
   * parsed), or a nonempty path (indicating the context represents a nested
   * location within the data).
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * nullptr to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  ParseContext(ParseAccumulator* accumulator,
               std::unique_ptr<model::FieldPath> path,
               bool array_element)
      : accumulator_{accumulator},
        path_{std::move(path)},
        array_element_{array_element} {
  }

  /** Whether or not this context corresponds to an element of an array. */
  bool array_element() const {
    return array_element_;
  }

  /**
   * What type of API method provided the data being parsed; useful for
   * determining which error conditions apply during parsing and providing
   * better error messages.
   */
  UserDataSource data_source() const {
    return accumulator_->data_source_;
  }

  const model::FieldPath* path() const {
    return path_.get();
  }

  /**
   * Returns true for the non-query parse contexts (Set, MergeSet and Update).
   */
  bool write() const;

  std::string FieldDescription() const;

  // Helpers to get a ParseContext for a child field.
  ParseContext ChildContext(const std::string& field_name);
  ParseContext ChildContext(const model::FieldPath& field_path);
  ParseContext ChildContext(size_t array_index);

  void AddToFieldMask(model::FieldPath field_path);

  void AddToFieldTransforms(model::FieldPath field_path,
                            model::TransformOperation transform_operation);

 private:
  void ValidatePath() const;
  void ValidatePathSegment(absl::string_view segment) const;

  ParseAccumulator* accumulator_;  // Non owning

  /** The current path being parsed. */
  // TODO(b/34871131): path should never be nullptr, but we don't support array
  // paths right now.
  std::unique_ptr<model::FieldPath> path_;

  bool array_element_ = false;
};

/** The result of parsing document data (e.g. for a SetData call). */
class ParsedSetData {
 public:
  ParsedSetData(model::ObjectValue data,
                std::vector<model::FieldTransform> field_transforms);
  ParsedSetData(model::ObjectValue data,
                model::FieldMask field_mask,
                std::vector<model::FieldTransform> field_transforms);

  /**
   * Converts the parsed document data into 1 or 2 mutations (depending on
   * whether there are any field transforms) using the specified document key
   * and precondition.
   *
   * This method consumes the values stored in the ParsedSetData
   */
  model::Mutation ToMutation(const model::DocumentKey& key,
                             const model::Precondition& precondition) &&;

  const model::ObjectValue& data() const {
    return data_;
  }

  const model::FieldMask& fieldMask() const {
    return field_mask_;
  }

  const std::vector<model::FieldTransform>& field_transforms() const {
    return field_transforms_;
  }

 private:
  model::ObjectValue data_;
  model::FieldMask field_mask_;
  std::vector<model::FieldTransform> field_transforms_;
  bool patch_;
};

/** The result of parsing "update" data (i.e. for an UpdateData call). */
class ParsedUpdateData {
 public:
  ParsedUpdateData(model::ObjectValue data,
                   model::FieldMask field_mask,
                   std::vector<model::FieldTransform> field_transforms);

  const model::ObjectValue& data() const {
    return data_;
  }

  const model::FieldMask& fieldMask() const {
    return field_mask_;
  }

  const std::vector<model::FieldTransform>& field_transforms() const {
    return field_transforms_;
  }

  /**
   * Converts the parsed update data into 1 or 2 mutations (depending on whether
   * there are any field transforms) using the specified document key and
   * precondition.
   *
   * This method consumes the values stored in the ParsedUpdateData
   */
  model::Mutation ToMutation(const model::DocumentKey& key,
                             const model::Precondition& precondition) &&;

 private:
  model::ObjectValue data_;
  // The field mask does not include document transforms.
  model::FieldMask field_mask_;
  std::vector<model::FieldTransform> field_transforms_;
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_USER_DATA_H_
