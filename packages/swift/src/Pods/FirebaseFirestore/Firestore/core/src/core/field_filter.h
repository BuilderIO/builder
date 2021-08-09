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

#ifndef FIRESTORE_CORE_SRC_CORE_FIELD_FILTER_H_
#define FIRESTORE_CORE_SRC_CORE_FIELD_FILTER_H_

#include <memory>
#include <string>

#include "Firestore/Protos/nanopb/google/firestore/v1/document.nanopb.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/nanopb/message.h"

namespace firebase {
namespace firestore {

namespace model {
class Document;
}  // namespace model

namespace core {

/**
 * FieldFilter is a document filter constraint on a query with a single
 * relation operator.
 */
class FieldFilter : public Filter {
 public:
  /**
   * Creates a Filter instance for the provided path, operator, and value.
   */
  static FieldFilter Create(
      const model::FieldPath& path,
      Operator op,
      nanopb::SharedMessage<google_firestore_v1_Value> value_rhs);

  explicit FieldFilter(const Filter& other);

  const model::FieldPath& field() const {
    return field_filter_rep().field_;
  }

  Operator op() const {
    return field_filter_rep().op_;
  }

  const google_firestore_v1_Value& value() const {
    return *(field_filter_rep().value_rhs_);
  }

 protected:
  class Rep : public Filter::Rep {
   public:
    Type type() const override {
      return Type::kFieldFilter;
    }

    bool IsAFieldFilter() const override {
      return true;
    }

    bool IsInequality() const override;

    const model::FieldPath& field() const override {
      return field_;
    }

    Operator op() const {
      return op_;
    }

    const google_firestore_v1_Value& value() const {
      return *value_rhs_;
    }

    bool Matches(const model::Document& doc) const override;

    std::string CanonicalId() const override;

    std::string ToString() const override;

    size_t Hash() const override;

   protected:
    /**
     * Creates a new filter that compares fields and values. Only intended to be
     * called from Filter::Create().
     *
     * The FieldFilter takes ownership of `value_rhs`.
     *
     * @param field A path to a field in the document to filter on. The LHS of
     * the expression.
     * @param op The binary operator to apply.
     * @param value_rhs A constant value to compare `field` to. The RHS of the
     *     expression.
     */
    Rep(model::FieldPath field,
        Operator op,
        nanopb::SharedMessage<google_firestore_v1_Value> value_rhs);

    bool MatchesComparison(util::ComparisonResult comparison) const;

   private:
    friend class FieldFilter;

    bool Equals(const Filter::Rep& other) const override;

    /** The left hand side of the relation. A path into a document field. */
    model::FieldPath field_;

    /** The type of equality/inequality operator to use in the relation. */
    Operator op_;

    /** The right hand side of the relation. A constant value to compare to. */
    nanopb::SharedMessage<google_firestore_v1_Value> value_rhs_;
  };

  explicit FieldFilter(std::shared_ptr<const Filter::Rep> rep);

 private:
  const Rep& field_filter_rep() const {
    return static_cast<const Rep&>(rep());
  }
};

}  // namespace core
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_CORE_FIELD_FILTER_H_
