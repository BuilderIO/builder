/*
 * Copyright 2019 Google LLC
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

#include "Firestore/core/src/api/query_core.h"

#include <future>  // NOLINT(build/c++11)
#include <memory>
#include <utility>
#include <vector>

#include "Firestore/core/src/api/firestore.h"
#include "Firestore/core/src/api/query_listener_registration.h"
#include "Firestore/core/src/api/query_snapshot.h"
#include "Firestore/core/src/api/source.h"
#include "Firestore/core/src/core/bound.h"
#include "Firestore/core/src/core/field_filter.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/core/firestore_client.h"
#include "Firestore/core/src/core/listen_options.h"
#include "Firestore/core/src/core/operator.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/exception.h"
#include "absl/algorithm/container.h"
#include "absl/strings/match.h"
#include "absl/types/span.h"

namespace firebase {
namespace firestore {
namespace api {

namespace util = firebase::firestore::util;
using core::AsyncEventListener;
using core::Bound;
using core::Direction;
using core::EventListener;
using core::FieldFilter;
using core::Filter;
using core::IsArrayOperator;
using core::IsDisjunctiveOperator;
using core::ListenOptions;
using core::QueryListener;
using core::ViewSnapshot;
using model::DocumentKey;
using model::FieldPath;
using model::GetTypeOrder;
using model::IsArray;
using model::RefValue;
using model::ResourcePath;
using model::TypeOrder;
using nanopb::MakeSharedMessage;
using nanopb::Message;
using util::Status;
using util::StatusOr;
using util::ThrowInvalidArgument;

using Operator = Filter::Operator;

namespace {
/**
 * Given an operator, returns the set of operators that cannot be used with
 * it.
 *
 * Operators in a query must adhere to the following set of rules:
 * 1. Only one array operator is allowed.
 * 2. Only one disjunctive operator is allowed.
 * 3. NOT_EQUAL cannot be used with another NOT_EQUAL operator.
 * 4. NOT_IN cannot be used with array, disjunctive, or NOT_EQUAL operators.
 *
 * Array operators: ARRAY_CONTAINS, ARRAY_CONTAINS_ANY
 * Disjunctive operators: IN, ARRAY_CONTAINS_ANY, NOT_IN
 */
static std::vector<Operator> ConflictingOps(Operator op) {
  switch (op) {
    case Operator::NotEqual:
      return {Operator::NotEqual, Operator::NotIn};
    case Operator::ArrayContains:
      return {Operator::ArrayContains, Operator::ArrayContainsAny,
              Operator::NotIn};
    case Operator::In:
      return {Operator::ArrayContainsAny, Operator::In, Operator::NotIn};
    case Operator::ArrayContainsAny:
      return {Operator::ArrayContains, Operator::ArrayContainsAny, Operator::In,
              Operator::NotIn};
    case Operator::NotIn:
      return {Operator::ArrayContains, Operator::ArrayContainsAny, Operator::In,
              Operator::NotIn, Operator::NotEqual};
    default:
      return std::vector<Operator>();
  }
}
}  // unnamed namespace

Query::Query(core::Query query, std::shared_ptr<Firestore> firestore)
    : firestore_{std::move(firestore)}, query_{std::move(query)} {
}

bool operator==(const Query& lhs, const Query& rhs) {
  return lhs.firestore() == rhs.firestore() && lhs.query() == rhs.query();
}

size_t Query::Hash() const {
  return util::Hash(firestore_.get(), query());
}

void Query::GetDocuments(Source source, QuerySnapshotListener&& callback) {
  ValidateHasExplicitOrderByForLimitToLast();
  if (source == Source::Cache) {
    firestore_->client()->GetDocumentsFromLocalCache(*this,
                                                     std::move(callback));
    return;
  }

  ListenOptions options(
      /*include_query_metadata_changes=*/true,
      /*include_document_metadata_changes=*/true,
      /*wait_for_sync_when_online=*/true);

  class ListenOnce : public EventListener<QuerySnapshot> {
   public:
    ListenOnce(Source source, QuerySnapshotListener&& listener)
        : source_(source), listener_(std::move(listener)) {
    }

    void OnEvent(StatusOr<QuerySnapshot> maybe_snapshot) override {
      if (!maybe_snapshot.ok()) {
        listener_->OnEvent(std::move(maybe_snapshot));
        return;
      }

      QuerySnapshot snapshot = std::move(maybe_snapshot).ValueOrDie();

      // Remove query first before passing event to user to avoid user actions
      // affecting the now stale query.
      std::unique_ptr<ListenerRegistration> registration =
          registration_promise_.get_future().get();
      registration->Remove();

      if (snapshot.metadata().from_cache() && source_ == Source::Server) {
        listener_->OnEvent(Status{
            Error::kErrorUnavailable,
            "Failed to get documents from server. (However, these documents "
            "may exist in the local cache. Run again without setting source to "
            "FirestoreSourceServer to retrieve the cached documents.)"});
      } else {
        listener_->OnEvent(std::move(snapshot));
      }
    };

    void Resolve(std::unique_ptr<ListenerRegistration> registration) {
      registration_promise_.set_value(std::move(registration));
    }

   private:
    Source source_;
    QuerySnapshotListener listener_;

    std::promise<std::unique_ptr<ListenerRegistration>> registration_promise_;
  };

  auto listener = absl::make_unique<ListenOnce>(source, std::move(callback));
  auto listener_unowned = listener.get();

  std::unique_ptr<ListenerRegistration> registration =
      AddSnapshotListener(std::move(options), std::move(listener));

  listener_unowned->Resolve(std::move(registration));
}

std::unique_ptr<ListenerRegistration> Query::AddSnapshotListener(
    ListenOptions options, QuerySnapshotListener&& user_listener) {
  ValidateHasExplicitOrderByForLimitToLast();
  // Convert from ViewSnapshots to QuerySnapshots.
  class Converter : public EventListener<ViewSnapshot> {
   public:
    Converter(Query* parent, QuerySnapshotListener&& user_listener)
        : firestore_(parent->firestore()),
          query_(parent->query()),
          user_listener_(std::move(user_listener)) {
    }

    void OnEvent(StatusOr<ViewSnapshot> maybe_snapshot) override {
      if (!maybe_snapshot.status().ok()) {
        user_listener_->OnEvent(maybe_snapshot.status());
        return;
      }

      ViewSnapshot snapshot = std::move(maybe_snapshot).ValueOrDie();
      SnapshotMetadata metadata(snapshot.has_pending_writes(),
                                snapshot.from_cache());

      QuerySnapshot result(firestore_, query_, std::move(snapshot),
                           std::move(metadata));

      user_listener_->OnEvent(std::move(result));
    }

   private:
    std::shared_ptr<Firestore> firestore_;
    core::Query query_;
    QuerySnapshotListener user_listener_;
  };
  auto view_listener =
      absl::make_unique<Converter>(this, std::move(user_listener));

  // Call the view_listener on the user Executor.
  auto async_listener = AsyncEventListener<ViewSnapshot>::Create(
      firestore_->client()->user_executor(), std::move(view_listener));

  std::shared_ptr<QueryListener> query_listener =
      firestore_->client()->ListenToQuery(this->query(), options,
                                          async_listener);

  return absl::make_unique<QueryListenerRegistration>(
      firestore_->client(), std::move(async_listener),
      std::move(query_listener));
}

Query Query::Filter(const FieldPath& field_path,
                    Operator op,
                    nanopb::SharedMessage<google_firestore_v1_Value> value,
                    const std::function<std::string()>& type_describer) const {
  if (field_path.IsKeyFieldPath()) {
    if (IsArrayOperator(op)) {
      ThrowInvalidArgument(
          "Invalid query. You can't perform %s queries on document "
          "ID since document IDs are not arrays.",
          Describe(op));
    } else if (op == Operator::In || op == Operator::NotIn) {
      ValidateDisjunctiveFilterElements(*value, op);
      // TODO(mutabledocuments): See if we can remove this copy and modify the
      // input values directly.
      auto references = MakeSharedMessage<google_firestore_v1_Value>({});
      references->which_value_type = google_firestore_v1_Value_array_value_tag;
      nanopb::SetRepeatedField(
          &references->array_value.values,
          &references->array_value.values_count,
          absl::Span<google_firestore_v1_Value>(
              value->array_value.values, value->array_value.values_count),
          [&](const google_firestore_v1_Value& value) {
            return *ParseExpectedReferenceValue(value, type_describer)
                        .release();
          });
      value = std::move(references);
    } else {
      value = ParseExpectedReferenceValue(*value, type_describer);
    }
  } else {
    if (IsDisjunctiveOperator(op)) {
      ValidateDisjunctiveFilterElements(*value, op);
    }
  }

  FieldFilter filter = FieldFilter::Create(field_path, op, std::move(value));
  ValidateNewFilter(filter);

  return Wrap(query_.AddingFilter(std::move(filter)));
}

Query Query::OrderBy(FieldPath field_path, bool descending) const {
  return OrderBy(std::move(field_path), Direction::FromDescending(descending));
}

Query Query::OrderBy(FieldPath field_path, Direction direction) const {
  ValidateNewOrderByPath(field_path);
  if (query_.start_at()) {
    ThrowInvalidArgument(
        "Invalid query. You must not specify a starting point "
        "before specifying the order by.");
  }
  if (query_.end_at()) {
    ThrowInvalidArgument(
        "Invalid query. You must not specify an ending point "
        "before specifying the order by.");
  }
  return Wrap(
      query_.AddingOrderBy(core::OrderBy(std::move(field_path), direction)));
}

Query Query::LimitToFirst(int32_t limit) const {
  if (limit <= 0) {
    ThrowInvalidArgument(
        "Invalid Query. Query limit (%s) is invalid. Limit must be positive.",
        limit);
  }
  return Wrap(query_.WithLimitToFirst(limit));
}

Query Query::LimitToLast(int32_t limit) const {
  if (limit <= 0) {
    ThrowInvalidArgument(
        "Invalid Query. Query limit (%s) is invalid. Limit must be positive.",
        limit);
  }
  return Wrap(query_.WithLimitToLast(limit));
}

Query Query::StartAt(Bound bound) const {
  return Wrap(query_.StartingAt(std::move(bound)));
}

Query Query::EndAt(Bound bound) const {
  return Wrap(query_.EndingAt(std::move(bound)));
}

void Query::ValidateNewFilter(const class Filter& filter) const {
  if (filter.IsAFieldFilter()) {
    FieldFilter field_filter(filter);

    if (field_filter.IsInequality()) {
      const FieldPath* existing_inequality = query_.InequalityFilterField();
      const FieldPath* new_inequality = &filter.field();

      if (existing_inequality && *existing_inequality != *new_inequality) {
        ThrowInvalidArgument(
            "Invalid Query. All where filters with an inequality (notEqual, "
            "lessThan, lessThanOrEqual, greaterThan, or greaterThanOrEqual) "
            "must be on the same field. But you have inequality filters on "
            "'%s' and '%s'",
            existing_inequality->CanonicalString(),
            new_inequality->CanonicalString());
      }

      const FieldPath* first_order_by_field = query_.FirstOrderByField();
      if (first_order_by_field) {
        ValidateOrderByField(*first_order_by_field, filter.field());
      }
    }
    Operator filter_op = field_filter.op();
    absl::optional<Operator> conflicting_op =
        query_.FindOperator(ConflictingOps(filter_op));

    if (conflicting_op) {
      // We special case when it's a duplicate op to give a slightly clearer
      // error message.
      if (*conflicting_op == filter_op) {
        ThrowInvalidArgument(
            "Invalid Query. You cannot use more than one '%s' filter.",
            Describe(filter_op));
      } else {
        ThrowInvalidArgument(
            "Invalid Query. You cannot use '%s' filters with"
            " '%s' filters.",
            Describe(filter_op), Describe(conflicting_op.value()));
      }
    }
  }
}

void Query::ValidateNewOrderByPath(const FieldPath& field_path) const {
  if (!query_.FirstOrderByField()) {
    // This is the first order by. It must match any inequality.
    const FieldPath* inequality_field = query_.InequalityFilterField();
    if (inequality_field) {
      ValidateOrderByField(field_path, *inequality_field);
    }
  }
}

void Query::ValidateOrderByField(const FieldPath& order_by_field,
                                 const FieldPath& inequality_field) const {
  if (order_by_field != inequality_field) {
    ThrowInvalidArgument(
        "Invalid query. You have a where filter with an inequality "
        "(notEqual, lessThan, lessThanOrEqual, greaterThan, or "
        "greaterThanOrEqual) on field '%s' and so you must also use '%s' as "
        "your first queryOrderedBy field, but your first queryOrderedBy is "
        "currently on field '%s' instead.",
        inequality_field.CanonicalString(), inequality_field.CanonicalString(),
        order_by_field.CanonicalString());
  }
}

void Query::ValidateHasExplicitOrderByForLimitToLast() const {
  if (query_.has_limit_to_last() && query_.explicit_order_bys().empty()) {
    ThrowInvalidArgument(
        "limit(toLast:) queries require specifying at least one OrderBy() "
        "clause.");
  }
}

void Query::ValidateDisjunctiveFilterElements(
    const google_firestore_v1_Value& value, Operator op) const {
  HARD_ASSERT(
      IsArray(value),
      "A FieldValue of Array type is required for disjunctive filters.");
  if (value.array_value.values_count == 0) {
    ThrowInvalidArgument(
        "Invalid Query. A non-empty array is required for '%s'"
        " filters.",
        Describe(op));
  }
  if (value.array_value.values_count > 10) {
    ThrowInvalidArgument(
        "Invalid Query. '%s' filters support a maximum of 10"
        " elements in the value array.",
        Describe(op));
  }
}

Message<google_firestore_v1_Value> Query::ParseExpectedReferenceValue(
    const google_firestore_v1_Value& value,
    const std::function<std::string()>& type_describer) const {
  if (GetTypeOrder(value) == TypeOrder::kString) {
    std::string document_key = nanopb::MakeString(value.string_value);
    if (document_key.empty()) {
      ThrowInvalidArgument(
          "Invalid query. When querying by document ID you must provide a "
          "valid document ID, but it was an empty string.");
    }
    if (!query().IsCollectionGroupQuery() &&
        absl::StrContains(document_key, "/")) {
      ThrowInvalidArgument(
          "Invalid query. When querying a collection by document ID you must "
          "provide a plain document ID, but '%s' contains a '/' character.",
          document_key);
    }
    ResourcePath path =
        query().path().Append(ResourcePath::FromString(document_key));
    if (!DocumentKey::IsDocumentKey(path)) {
      ThrowInvalidArgument(
          "Invalid query. When querying a collection group by document ID, "
          "the value provided must result in a valid document path, but '%s' "
          "is not because it has an odd number of segments.",
          path.CanonicalString());
    }
    return RefValue(firestore_->database_id(), DocumentKey{path});
  } else if (GetTypeOrder(value) == TypeOrder::kReference) {
    return model::DeepClone(value);
  } else {
    ThrowInvalidArgument(
        "Invalid query. When querying by document ID you must provide a "
        "valid string or DocumentReference, but it was of type: %s",
        type_describer());
  }
}

std::string Query::Describe(Operator op) const {
  switch (op) {
    case Operator::LessThan:
      return "lessThan";
    case Operator::LessThanOrEqual:
      return "lessThanOrEqual";
    case Operator::Equal:
      return "equal";
    case Operator::NotEqual:
      return "notEqual";
    case Operator::GreaterThanOrEqual:
      return "greaterThanOrEqual";
    case Operator::GreaterThan:
      return "greaterThan";
    case Operator::ArrayContains:
      return "arrayContains";
    case Operator::In:
      return "in";
    case Operator::ArrayContainsAny:
      return "arrayContainsAny";
    case Operator::NotIn:
      return "notIn";
  }

  UNREACHABLE();
}

}  // namespace api
}  // namespace firestore
}  // namespace firebase
