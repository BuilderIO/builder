/*
 * Copyright 2017 Google
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

#import "FIRFieldValue.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRFieldValue (Internal)
/**
 * The method name (e.g. "FieldValue.delete()") that was used to create this FIRFieldValue
 * instance, for use in error messages, etc.
 */
@property(nonatomic, strong, readonly) NSString *methodName;
@end

/**
 * FIRFieldValue class for field deletes. Exposed internally so code can do isKindOfClass checks on
 * it.
 */
@interface FSTDeleteFieldValue : FIRFieldValue
- (instancetype)init NS_UNAVAILABLE;
@end

/**
 * FIRFieldValue class for server timestamps. Exposed internally so code can do isKindOfClass checks
 * on it.
 */
@interface FSTServerTimestampFieldValue : FIRFieldValue
- (instancetype)init NS_UNAVAILABLE;
@end

/** FIRFieldValue class for array unions. */
@interface FSTArrayUnionFieldValue : FIRFieldValue
- (instancetype)init NS_UNAVAILABLE;
@property(strong, nonatomic, readonly) NSArray<id> *elements;
@end

/** FIRFieldValue class for array removes. */
@interface FSTArrayRemoveFieldValue : FIRFieldValue
- (instancetype)init NS_UNAVAILABLE;
@property(strong, nonatomic, readonly) NSArray<id> *elements;
@end

/** FIRFieldValue class for number increments. */
@interface FSTNumericIncrementFieldValue : FIRFieldValue
- (instancetype)init NS_UNAVAILABLE;
@property(strong, nonatomic, readonly) NSNumber *operand;
@end

NS_ASSUME_NONNULL_END
