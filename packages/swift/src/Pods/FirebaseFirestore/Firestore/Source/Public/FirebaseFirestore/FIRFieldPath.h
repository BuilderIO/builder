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
 * A `FieldPath` refers to a field in a document. The path may consist of a single field name
 * (referring to a top level field in the document), or a list of field names (referring to a nested
 * field in the document).
 */
NS_SWIFT_NAME(FieldPath)
@interface FIRFieldPath : NSObject <NSCopying>

/** :nodoc: */
- (instancetype)init NS_UNAVAILABLE;

/**
 * Creates a `FieldPath` from the provided field names. If more than one field name is provided, the
 * path will point to a nested field in a document.
 *
 * @param fieldNames A list of field names.
 * @return A `FieldPath` that points to a field location in a document.
 */
- (instancetype)initWithFields:(NSArray<NSString *> *)fieldNames NS_SWIFT_NAME(init(_:));

/**
 * A special sentinel `FieldPath` to refer to the ID of a document. It can be used in queries to
 * sort or filter by the document ID.
 */
+ (instancetype)documentID;

@end

NS_ASSUME_NONNULL_END
