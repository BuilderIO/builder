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

#ifndef FIRESTORE_CORE_SRC_MODEL_PRECONDITION_H_
#define FIRESTORE_CORE_SRC_MODEL_PRECONDITION_H_

#include <string>
#include <utility>

#include "Firestore/core/src/model/snapshot_version.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {
namespace model {

class MutableDocument;

/**
 * Encodes a precondition for a mutation. This follows the model that the
 * backend accepts with the special case of an explicit "empty" precondition
 * (meaning no precondition).
 */
class Precondition {
 public:
  enum class Type {
    None,
    Exists,
    UpdateTime,
  };

  /** Creates a new Precondition with an exists flag. */
  static Precondition Exists(bool exists);

  /** Creates a new Precondition based on a time the document exists at. */
  static Precondition UpdateTime(SnapshotVersion update_time);

  /** Returns a precondition representing no precondition. */
  static Precondition None();

  /**
   * Default constructor which is equivalent to Precondition::None(). Prefer
   * calling Precondition::None for readability.
   */
  Precondition() = default;

  /**
   * Returns true if the precondition is valid for the given document (and the
   * document is available).
   */
  bool IsValidFor(const MutableDocument& document) const;

  Type type() const {
    return type_;
  }

  /** Returns whether this Precondition represents no precondition. */
  bool is_none() const {
    return type_ == Type::None;
  }

  const SnapshotVersion& update_time() const {
    return update_time_;
  }

  bool exists() const {
    return exists_;
  }

  bool operator==(const Precondition& other) const {
    return type_ == other.type_ && update_time_ == other.update_time_ &&
           exists_ == other.exists_;
  }

  size_t Hash() const;

  std::string ToString() const;

 private:
  Precondition(Type type, SnapshotVersion update_time, bool exists);

  // The actual time of this precondition.
  Type type_ = Type::None;

  // For UpdateTime type, preconditions a mutation based on the last
  // update_time_.
  SnapshotVersion update_time_;

  // For Exists type, preconditions a mutation based on whether the document
  // exists.
  bool exists_ = false;
};

}  // namespace model
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_MODEL_PRECONDITION_H_
