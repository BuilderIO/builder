/*
 * Copyright 2017 Google LLC
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

#import "FIRQuery.h"

#include <memory>
#include <utility>
#include <vector>

#import "FIRDocumentReference.h"
#import "FIRFirestoreErrors.h"
#import "Firestore/Source/API/FIRDocumentReference+Internal.h"
#import "Firestore/Source/API/FIRDocumentSnapshot+Internal.h"
#import "Firestore/Source/API/FIRFieldPath+Internal.h"
#import "Firestore/Source/API/FIRFieldValue+Internal.h"
#import "Firestore/Source/API/FIRFirestore+Internal.h"
#import "Firestore/Source/API/FIRFirestoreSource+Internal.h"
#import "Firestore/Source/API/FIRListenerRegistration+Internal.h"
#import "Firestore/Source/API/FIRQuery+Internal.h"
#import "Firestore/Source/API/FIRQuerySnapshot+Internal.h"
#import "Firestore/Source/API/FIRSnapshotMetadata+Internal.h"
#import "Firestore/Source/API/FSTUserDataReader.h"

#include "Firestore/core/src/api/query_core.h"
#include "Firestore/core/src/api/query_listener_registration.h"
#include "Firestore/core/src/api/query_snapshot.h"
#include "Firestore/core/src/api/source.h"
#include "Firestore/core/src/core/bound.h"
#include "Firestore/core/src/core/direction.h"
#include "Firestore/core/src/core/filter.h"
#include "Firestore/core/src/core/firestore_client.h"
#include "Firestore/core/src/core/listen_options.h"
#include "Firestore/core/src/core/order_by.h"
#include "Firestore/core/src/core/query.h"
#include "Firestore/core/src/model/document_key.h"
#include "Firestore/core/src/model/field_path.h"
#include "Firestore/core/src/model/resource_path.h"
#include "Firestore/core/src/model/server_timestamp_util.h"
#include "Firestore/core/src/model/value_util.h"
#include "Firestore/core/src/nanopb/message.h"
#include "Firestore/core/src/nanopb/nanopb_util.h"
#include "Firestore/core/src/util/error_apple.h"
#include "Firestore/core/src/util/exception.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_apple.h"
#include "absl/memory/memory.h"
#include "absl/strings/match.h"

namespace util = firebase::firestore::util;
namespace nanopb = firebase::firestore::nanopb;
using firebase::firestore::api::Firestore;
using firebase::firestore::api::Query;
using firebase::firestore::api::QueryListenerRegistration;
using firebase::firestore::api::QuerySnapshot;
using firebase::firestore::api::QuerySnapshotListener;
using firebase::firestore::api::SnapshotMetadata;
using firebase::firestore::api::Source;
using firebase::firestore::core::AsyncEventListener;
using firebase::firestore::core::Bound;
using firebase::firestore::core::Direction;
using firebase::firestore::core::EventListener;
using firebase::firestore::core::Filter;
using firebase::firestore::core::ListenOptions;
using firebase::firestore::core::OrderBy;
using firebase::firestore::core::OrderByList;
using firebase::firestore::core::QueryListener;
using firebase::firestore::core::ViewSnapshot;
using firebase::firestore::google_firestore_v1_ArrayValue;
using firebase::firestore::google_firestore_v1_Value;
using firebase::firestore::google_firestore_v1_Value_fields;
using firebase::firestore::model::DatabaseId;
using firebase::firestore::model::DeepClone;
using firebase::firestore::model::Document;
using firebase::firestore::model::DocumentKey;
using firebase::firestore::model::FieldPath;
using firebase::firestore::model::GetTypeOrder;
using firebase::firestore::model::IsServerTimestamp;
using firebase::firestore::model::RefValue;
using firebase::firestore::model::ResourcePath;
using firebase::firestore::model::TypeOrder;
using firebase::firestore::nanopb::CheckedSize;
using firebase::firestore::nanopb::MakeArray;
using firebase::firestore::nanopb::MakeString;
using firebase::firestore::nanopb::Message;
using firebase::firestore::nanopb::SharedMessage;
using firebase::firestore::nanopb::MakeSharedMessage;
using firebase::firestore::util::MakeNSError;
using firebase::firestore::util::MakeString;
using firebase::firestore::util::StatusOr;
using firebase::firestore::util::ThrowInvalidArgument;

NS_ASSUME_NONNULL_BEGIN

namespace {

FieldPath MakeFieldPath(NSString *field) {
  return FieldPath::FromDotSeparatedString(MakeString(field));
}

FIRQuery *Wrap(Query &&query) {
  return [[FIRQuery alloc] initWithQuery:std::move(query)];
}

int32_t SaturatedLimitValue(NSInteger limit) {
  int32_t internal_limit;
  if (limit == NSNotFound || limit >= core::Target::kNoLimit) {
    internal_limit = core::Target::kNoLimit;
  } else {
    internal_limit = static_cast<int32_t>(limit);
  }
  return internal_limit;
}

}  // namespace

@implementation FIRQuery {
  Query _query;
}

#pragma mark - Constructor Methods

- (instancetype)initWithQuery:(Query &&)query {
  if (self = [super init]) {
    _query = std::move(query);
  }
  return self;
}

- (instancetype)initWithQuery:(core::Query)query firestore:(std::shared_ptr<Firestore>)firestore {
  return [self initWithQuery:Query{std::move(query), std::move(firestore)}];
}

#pragma mark - NSObject Methods

- (BOOL)isEqual:(nullable id)other {
  if (other == self) return YES;
  if (![[other class] isEqual:[self class]]) return NO;

  auto otherQuery = static_cast<FIRQuery *>(other);
  return _query == otherQuery->_query;
}

- (NSUInteger)hash {
  return _query.Hash();
}

#pragma mark - Public Methods

- (FIRFirestore *)firestore {
  return [FIRFirestore recoverFromFirestore:_query.firestore()];
}

- (void)getDocumentsWithCompletion:(void (^)(FIRQuerySnapshot *_Nullable snapshot,
                                             NSError *_Nullable error))completion {
  _query.GetDocuments(Source::Default, [self wrapQuerySnapshotBlock:completion]);
}

- (void)getDocumentsWithSource:(FIRFirestoreSource)publicSource
                    completion:(void (^)(FIRQuerySnapshot *_Nullable snapshot,
                                         NSError *_Nullable error))completion {
  Source source = api::MakeSource(publicSource);
  _query.GetDocuments(source, [self wrapQuerySnapshotBlock:completion]);
}

- (id<FIRListenerRegistration>)addSnapshotListener:(FIRQuerySnapshotBlock)listener {
  return [self addSnapshotListenerWithIncludeMetadataChanges:NO listener:listener];
}

- (id<FIRListenerRegistration>)
    addSnapshotListenerWithIncludeMetadataChanges:(BOOL)includeMetadataChanges
                                         listener:(FIRQuerySnapshotBlock)listener {
  auto options = ListenOptions::FromIncludeMetadataChanges(includeMetadataChanges);
  return [self addSnapshotListenerInternalWithOptions:options listener:listener];
}

- (id<FIRListenerRegistration>)addSnapshotListenerInternalWithOptions:(ListenOptions)internalOptions
                                                             listener:
                                                                 (FIRQuerySnapshotBlock)listener {
  std::shared_ptr<Firestore> firestore = self.firestore.wrapped;
  const core::Query &query = self.query;

  // Convert from ViewSnapshots to QuerySnapshots.
  auto view_listener = EventListener<ViewSnapshot>::Create(
      [listener, firestore, query](StatusOr<ViewSnapshot> maybe_snapshot) {
        if (!maybe_snapshot.status().ok()) {
          listener(nil, MakeNSError(maybe_snapshot.status()));
          return;
        }

        ViewSnapshot snapshot = std::move(maybe_snapshot).ValueOrDie();
        SnapshotMetadata metadata(snapshot.has_pending_writes(), snapshot.from_cache());

        listener([[FIRQuerySnapshot alloc] initWithFirestore:firestore
                                               originalQuery:query
                                                    snapshot:std::move(snapshot)
                                                    metadata:std::move(metadata)],
                 nil);
      });

  // Call the view_listener on the user Executor.
  auto async_listener = AsyncEventListener<ViewSnapshot>::Create(
      firestore->client()->user_executor(), std::move(view_listener));

  std::shared_ptr<QueryListener> query_listener =
      firestore->client()->ListenToQuery(query, internalOptions, async_listener);

  return [[FSTListenerRegistration alloc]
      initWithRegistration:absl::make_unique<QueryListenerRegistration>(firestore->client(),
                                                                        std::move(async_listener),
                                                                        std::move(query_listener))];
}

- (FIRQuery *)queryWhereField:(NSString *)field isEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::Equal field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::Equal path:path.internalValue value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field isNotEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::NotEqual field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isNotEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::NotEqual
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field isLessThan:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::LessThan field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isLessThan:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::LessThan
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field isLessThanOrEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::LessThanOrEqual field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isLessThanOrEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::LessThanOrEqual
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field isGreaterThan:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::GreaterThan field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isGreaterThan:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::GreaterThan
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field arrayContains:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::ArrayContains field:field value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path arrayContains:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::ArrayContains
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field isGreaterThanOrEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::GreaterThanOrEqual
                                 field:field
                                 value:value];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path isGreaterThanOrEqualTo:(id)value {
  return [self queryWithFilterOperator:Filter::Operator::GreaterThanOrEqual
                                  path:path.internalValue
                                 value:value];
}

- (FIRQuery *)queryWhereField:(NSString *)field arrayContainsAny:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::ArrayContainsAny field:field value:values];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path arrayContainsAny:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::ArrayContainsAny
                                  path:path.internalValue
                                 value:values];
}

- (FIRQuery *)queryWhereField:(NSString *)field in:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::In field:field value:values];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path in:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::In path:path.internalValue value:values];
}

- (FIRQuery *)queryWhereField:(NSString *)field notIn:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::NotIn field:field value:values];
}

- (FIRQuery *)queryWhereFieldPath:(FIRFieldPath *)path notIn:(NSArray<id> *)values {
  return [self queryWithFilterOperator:Filter::Operator::NotIn
                                  path:path.internalValue
                                 value:values];
}

- (FIRQuery *)queryFilteredUsingComparisonPredicate:(NSPredicate *)predicate {
  NSComparisonPredicate *comparison = (NSComparisonPredicate *)predicate;
  if (comparison.comparisonPredicateModifier != NSDirectPredicateModifier) {
    ThrowInvalidArgument("Invalid query. Predicate cannot have an aggregate modifier.");
  }
  NSString *path;
  id value = nil;
  if ([comparison.leftExpression expressionType] == NSKeyPathExpressionType &&
      [comparison.rightExpression expressionType] == NSConstantValueExpressionType) {
    path = comparison.leftExpression.keyPath;
    value = comparison.rightExpression.constantValue;
    switch (comparison.predicateOperatorType) {
      case NSEqualToPredicateOperatorType:
        return [self queryWhereField:path isEqualTo:value];
      case NSLessThanPredicateOperatorType:
        return [self queryWhereField:path isLessThan:value];
      case NSLessThanOrEqualToPredicateOperatorType:
        return [self queryWhereField:path isLessThanOrEqualTo:value];
      case NSGreaterThanPredicateOperatorType:
        return [self queryWhereField:path isGreaterThan:value];
      case NSGreaterThanOrEqualToPredicateOperatorType:
        return [self queryWhereField:path isGreaterThanOrEqualTo:value];
      case NSNotEqualToPredicateOperatorType:
        return [self queryWhereField:path isNotEqualTo:value];
      case NSContainsPredicateOperatorType:
        return [self queryWhereField:path arrayContains:value];
      case NSInPredicateOperatorType:
        return [self queryWhereField:path in:value];
      default:;  // Fallback below to throw assertion.
    }
  } else if ([comparison.leftExpression expressionType] == NSConstantValueExpressionType &&
             [comparison.rightExpression expressionType] == NSKeyPathExpressionType) {
    path = comparison.rightExpression.keyPath;
    value = comparison.leftExpression.constantValue;
    switch (comparison.predicateOperatorType) {
      case NSEqualToPredicateOperatorType:
        return [self queryWhereField:path isEqualTo:value];
      case NSLessThanPredicateOperatorType:
        return [self queryWhereField:path isGreaterThan:value];
      case NSLessThanOrEqualToPredicateOperatorType:
        return [self queryWhereField:path isGreaterThanOrEqualTo:value];
      case NSGreaterThanPredicateOperatorType:
        return [self queryWhereField:path isLessThan:value];
      case NSGreaterThanOrEqualToPredicateOperatorType:
        return [self queryWhereField:path isLessThanOrEqualTo:value];
      case NSNotEqualToPredicateOperatorType:
        return [self queryWhereField:path isNotEqualTo:value];
      case NSContainsPredicateOperatorType:
        return [self queryWhereField:path arrayContains:value];
      case NSInPredicateOperatorType:
        return [self queryWhereField:path in:value];
      default:;  // Fallback below to throw assertion.
    }
  } else {
    ThrowInvalidArgument(
        "Invalid query. Predicate comparisons must include a key path and a constant.");
  }
  // Fallback cases of unsupported comparison operator.
  switch (comparison.predicateOperatorType) {
    case NSCustomSelectorPredicateOperatorType:
      ThrowInvalidArgument("Invalid query. Custom predicate filters are not supported.");
      break;
    default:
      ThrowInvalidArgument("Invalid query. Operator type %s is not supported.",
                           comparison.predicateOperatorType);
  }
}

- (FIRQuery *)queryFilteredUsingCompoundPredicate:(NSPredicate *)predicate {
  NSCompoundPredicate *compound = (NSCompoundPredicate *)predicate;
  if (compound.compoundPredicateType != NSAndPredicateType || compound.subpredicates.count == 0) {
    ThrowInvalidArgument("Invalid query. Only compound queries using AND are supported.");
  }
  FIRQuery *query = self;
  for (NSPredicate *pred in compound.subpredicates) {
    query = [query queryFilteredUsingPredicate:pred];
  }
  return query;
}

- (FIRQuery *)queryFilteredUsingPredicate:(NSPredicate *)predicate {
  if ([predicate isKindOfClass:[NSComparisonPredicate class]]) {
    return [self queryFilteredUsingComparisonPredicate:predicate];
  } else if ([predicate isKindOfClass:[NSCompoundPredicate class]]) {
    return [self queryFilteredUsingCompoundPredicate:predicate];
  } else if ([predicate isKindOfClass:[[NSPredicate predicateWithBlock:^BOOL(id, NSDictionary *) {
                          return true;
                        }] class]]) {
    ThrowInvalidArgument("Invalid query. Block-based predicates are not supported. Please use "
                         "predicateWithFormat to create predicates instead.");
  } else {
    ThrowInvalidArgument("Invalid query. Expect comparison or compound of comparison predicate. "
                         "Please use predicateWithFormat to create predicates.");
  }
}

- (FIRQuery *)queryOrderedByField:(NSString *)field {
  return [self queryOrderedByField:field descending:NO];
}

- (FIRQuery *)queryOrderedByFieldPath:(FIRFieldPath *)fieldPath {
  return [self queryOrderedByFieldPath:fieldPath descending:NO];
}

- (FIRQuery *)queryOrderedByField:(NSString *)field descending:(BOOL)descending {
  return [self queryOrderedByFieldPath:MakeFieldPath(field)
                             direction:Direction::FromDescending(descending)];
}

- (FIRQuery *)queryOrderedByFieldPath:(FIRFieldPath *)fieldPath descending:(BOOL)descending {
  return [self queryOrderedByFieldPath:fieldPath.internalValue
                             direction:Direction::FromDescending(descending)];
}

- (FIRQuery *)queryOrderedByFieldPath:(model::FieldPath)fieldPath direction:(Direction)direction {
  return Wrap(_query.OrderBy(std::move(fieldPath), direction));
}

- (FIRQuery *)queryLimitedTo:(NSInteger)limit {
  return Wrap(_query.LimitToFirst(SaturatedLimitValue(limit)));
}

- (FIRQuery *)queryLimitedToLast:(NSInteger)limit {
  return Wrap(_query.LimitToLast(SaturatedLimitValue(limit)));
}

- (FIRQuery *)queryStartingAtDocument:(FIRDocumentSnapshot *)snapshot {
  Bound bound = [self boundFromSnapshot:snapshot isBefore:YES];
  return Wrap(_query.StartAt(std::move(bound)));
}

- (FIRQuery *)queryStartingAtValues:(NSArray *)fieldValues {
  Bound bound = [self boundFromFieldValues:fieldValues isBefore:YES];
  return Wrap(_query.StartAt(std::move(bound)));
}

- (FIRQuery *)queryStartingAfterDocument:(FIRDocumentSnapshot *)snapshot {
  Bound bound = [self boundFromSnapshot:snapshot isBefore:NO];
  return Wrap(_query.StartAt(std::move(bound)));
}

- (FIRQuery *)queryStartingAfterValues:(NSArray *)fieldValues {
  Bound bound = [self boundFromFieldValues:fieldValues isBefore:NO];
  return Wrap(_query.StartAt(std::move(bound)));
}

- (FIRQuery *)queryEndingBeforeDocument:(FIRDocumentSnapshot *)snapshot {
  Bound bound = [self boundFromSnapshot:snapshot isBefore:YES];
  return Wrap(_query.EndAt(std::move(bound)));
}

- (FIRQuery *)queryEndingBeforeValues:(NSArray *)fieldValues {
  Bound bound = [self boundFromFieldValues:fieldValues isBefore:YES];
  return Wrap(_query.EndAt(std::move(bound)));
}

- (FIRQuery *)queryEndingAtDocument:(FIRDocumentSnapshot *)snapshot {
  Bound bound = [self boundFromSnapshot:snapshot isBefore:NO];
  return Wrap(_query.EndAt(std::move(bound)));
}

- (FIRQuery *)queryEndingAtValues:(NSArray *)fieldValues {
  Bound bound = [self boundFromFieldValues:fieldValues isBefore:NO];
  return Wrap(_query.EndAt(std::move(bound)));
}

#pragma mark - Private Methods

- (Message<google_firestore_v1_Value>)parsedQueryValue:(id)value {
  return [self.firestore.dataReader parsedQueryValue:value];
}

- (Message<google_firestore_v1_Value>)parsedQueryValue:(id)value allowArrays:(bool)allowArrays {
  return [self.firestore.dataReader parsedQueryValue:value allowArrays:allowArrays];
}

- (QuerySnapshotListener)wrapQuerySnapshotBlock:(FIRQuerySnapshotBlock)block {
  class Converter : public EventListener<QuerySnapshot> {
   public:
    explicit Converter(FIRQuerySnapshotBlock block) : block_(block) {
    }

    void OnEvent(StatusOr<QuerySnapshot> maybe_snapshot) override {
      if (maybe_snapshot.ok()) {
        FIRQuerySnapshot *result =
            [[FIRQuerySnapshot alloc] initWithSnapshot:std::move(maybe_snapshot).ValueOrDie()];
        block_(result, nil);
      } else {
        block_(nil, util::MakeNSError(maybe_snapshot.status()));
      }
    }

   private:
    FIRQuerySnapshotBlock block_;
  };

  return absl::make_unique<Converter>(block);
}

/** Private helper for all of the queryWhereField: methods. */
- (FIRQuery *)queryWithFilterOperator:(Filter::Operator)filterOperator
                                field:(NSString *)field
                                value:(id)value {
  return [self queryWithFilterOperator:filterOperator path:MakeFieldPath(field) value:value];
}

- (FIRQuery *)queryWithFilterOperator:(Filter::Operator)filterOperator
                                 path:(const FieldPath &)fieldPath
                                value:(id)value {
  Message<google_firestore_v1_Value> fieldValue =
      [self parsedQueryValue:value
                 allowArrays:filterOperator == Filter::Operator::In ||
                             filterOperator == Filter::Operator::NotIn];
  auto describer = [value] { return MakeString(NSStringFromClass([value class])); };
  return Wrap(_query.Filter(fieldPath, filterOperator, std::move(fieldValue), describer));
}

/**
 * Create a Bound from a query given the document.
 *
 * Note that the Bound will always include the key of the document and the position will be
 * unambiguous.
 *
 * Will throw if the document does not contain all fields of the order by of
 * the query or if any of the fields in the order by are an uncommitted server
 * timestamp.
 */
- (Bound)boundFromSnapshot:(FIRDocumentSnapshot *)snapshot isBefore:(BOOL)isBefore {
  if (![snapshot exists]) {
    ThrowInvalidArgument("Invalid query. You are trying to start or end a query using a document "
                         "that doesn't exist.");
  }
  const Document &document = *snapshot.internalDocument;
  const DatabaseId &databaseID = self.firestore.databaseID;
  const OrderByList &order_bys = self.query.order_bys();

  SharedMessage<google_firestore_v1_ArrayValue> components{{}};
  components->values_count = CheckedSize(order_bys.size());
  components->values = MakeArray<google_firestore_v1_Value>(components->values_count);

  // Because people expect to continue/end a query at the exact document provided, we need to
  // use the implicit sort order rather than the explicit sort order, because it's guaranteed to
  // contain the document key. That way the position becomes unambiguous and the query
  // continues/ends exactly at the provided document. Without the key (by using the explicit sort
  // orders), multiple documents could match the position, yielding duplicate results.
  for (size_t i = 0; i < order_bys.size(); ++i) {
    if (order_bys[i].field() == FieldPath::KeyFieldPath()) {
      components->values[i] = *RefValue(databaseID, document->key()).release();
    } else {
      absl::optional<google_firestore_v1_Value> value = document->field(order_bys[i].field());

      if (value) {
        if (IsServerTimestamp(*value)) {
          ThrowInvalidArgument(
              "Invalid query. You are trying to start or end a query using a document for which "
              "the field '%s' is an uncommitted server timestamp. (Since the value of this field "
              "is unknown, you cannot start/end a query with it.)",
              order_bys[i].field().CanonicalString());
        } else {
          components->values[i] = *DeepClone(*value).release();
        }
      } else {
        ThrowInvalidArgument(
            "Invalid query. You are trying to start or end a query using a document for which the "
            "field '%s' (used as the order by) does not exist.",
            order_bys[i].field().CanonicalString());
      }
    }
  }
  return Bound::FromValue(std::move(components), isBefore);
}

/** Converts a list of field values to an Bound. */
- (Bound)boundFromFieldValues:(NSArray<id> *)fieldValues isBefore:(BOOL)isBefore {
  // Use explicit sort order because it has to match the query the user made
  const OrderByList &explicitSortOrders = self.query.explicit_order_bys();
  if (fieldValues.count > explicitSortOrders.size()) {
    ThrowInvalidArgument("Invalid query. You are trying to start or end a query using more values "
                         "than were specified in the order by.");
  }

  SharedMessage<google_firestore_v1_ArrayValue> components{{}};
  components->values_count = CheckedSize(fieldValues.count);
  components->values = MakeArray<google_firestore_v1_Value>(components->values_count);
  for (NSUInteger idx = 0, max = fieldValues.count; idx < max; ++idx) {
    id rawValue = fieldValues[idx];
    const OrderBy &sortOrder = explicitSortOrders[idx];

    Message<google_firestore_v1_Value> fieldValue{[self parsedQueryValue:rawValue]};
    if (sortOrder.field().IsKeyFieldPath()) {
      if (GetTypeOrder(*fieldValue) != TypeOrder::kString) {
        ThrowInvalidArgument("Invalid query. Expected a string for the document ID.");
      }

      std::string documentID = MakeString(fieldValue->string_value);
      if (!self.query.IsCollectionGroupQuery() && absl::StrContains(documentID, "/")) {
        ThrowInvalidArgument("Invalid query. When querying a collection and ordering by document "
                             "ID, you must pass a plain document ID, but '%s' contains a slash.",
                             documentID);
      }
      ResourcePath path = self.query.path().Append(ResourcePath::FromString(documentID));
      if (!DocumentKey::IsDocumentKey(path)) {
        ThrowInvalidArgument("Invalid query. When querying a collection group and ordering by "
                             "document ID, you must pass a value that results in a valid document "
                             "path, but '%s' is not because it contains an odd number of segments.",
                             path.CanonicalString());
      }
      DocumentKey key{path};
      components->values[idx] = *RefValue(self.firestore.databaseID, key).release();
    } else {
      components->values[idx] = *fieldValue.release();
    }
  }

  return Bound::FromValue(std::move(components), isBefore);
}

@end

@implementation FIRQuery (Internal)

- (const core::Query &)query {
  return _query.query();
}

- (const api::Query &)apiQuery {
  return _query;
}

@end

NS_ASSUME_NONNULL_END
