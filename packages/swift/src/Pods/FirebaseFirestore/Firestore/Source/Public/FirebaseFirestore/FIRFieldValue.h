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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Sentinel values that can be used when writing document fields with setData() or updateData().
 */
NS_SWIFT_NAME(FieldValue)
@interface FIRFieldValue : NSObject

/** :nodoc: */
- (instancetype)init NS_UNAVAILABLE;

/** Used with updateData() to mark a field for deletion. */
// clang-format off
+ (instancetype)fieldValueForDelete NS_SWIFT_NAME(delete());
// clang-format on

/**
 * Used with setData() or updateData() to include a server-generated timestamp in the written
 * data.
 */
+ (instancetype)fieldValueForServerTimestamp NS_SWIFT_NAME(serverTimestamp());

/**
 * Returns a special value that can be used with setData() or updateData() that tells the server to
 * union the given elements with any array value that already exists on the server. Each
 * specified element that doesn't already exist in the array will be added to the end. If the
 * field being modified is not already an array it will be overwritten with an array containing
 * exactly the specified elements.
 *
 * @param elements The elements to union into the array.
 * @return The FieldValue sentinel for use in a call to setData() or updateData().
 */
+ (instancetype)fieldValueForArrayUnion:(NSArray<id> *)elements NS_SWIFT_NAME(arrayUnion(_:));

/**
 * Returns a special value that can be used with setData() or updateData() that tells the server to
 * remove the given elements from any array value that already exists on the server. All
 * instances of each element specified will be removed from the array. If the field being
 * modified is not already an array it will be overwritten with an empty array.
 *
 * @param elements The elements to remove from the array.
 * @return The FieldValue sentinel for use in a call to setData() or updateData().
 */
+ (instancetype)fieldValueForArrayRemove:(NSArray<id> *)elements NS_SWIFT_NAME(arrayRemove(_:));

/**
 * Returns a special value that can be used with setData() or updateData() that tells the server to
 * increment the field's current value by the given value.
 *
 * If the current value is an integer or a double, both the current and the given value will be
 * interpreted as doubles and all arithmetic will follow IEEE 754 semantics. Otherwise, the
 * transformation will set the field to the given value.
 *
 * @param d The double value to increment by.
 * @return The FieldValue sentinel for use in a call to setData() or update().
 */
+ (instancetype)fieldValueForDoubleIncrement:(double)d NS_SWIFT_NAME(increment(_:));

/**
 * Returns a special value that can be used with setData() or updateData() that tells the server to
 * increment the field's current value by the given value.
 *
 * If the current field value is an integer, possible integer overflows are resolved to LONG_MAX or
 * LONG_MIN. If the current field value is a double, both values will be interpreted as doubles and
 * the arithmetic will follow IEEE 754 semantics.
 *
 * If field is not an integer or double, or if the field does not yet exist, the transformation
 * will set the field to the given value.
 *
 * @param l The integer value to increment by.
 * @return The FieldValue sentinel for use in a call to setData() or updateData().
 */
+ (instancetype)fieldValueForIntegerIncrement:(int64_t)l NS_SWIFT_NAME(increment(_:));

@end

NS_ASSUME_NONNULL_END
