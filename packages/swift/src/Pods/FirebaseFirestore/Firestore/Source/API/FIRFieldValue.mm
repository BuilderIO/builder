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

#import "Firestore/Source/API/FIRFieldValue+Internal.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRFieldValue ()
- (instancetype)initPrivate NS_DESIGNATED_INITIALIZER;
@end

#pragma mark - FSTDeleteFieldValue

@interface FSTDeleteFieldValue ()
/** Returns a single shared instance of the class. */
+ (instancetype)deleteFieldValue;
@end

@implementation FSTDeleteFieldValue

- (instancetype)initPrivate {
  self = [super initPrivate];
  return self;
}

+ (instancetype)deleteFieldValue {
  static FSTDeleteFieldValue *sharedInstance = nil;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    sharedInstance = [[FSTDeleteFieldValue alloc] initPrivate];
  });
  return sharedInstance;
}

- (NSString *)methodName {
  return @"FieldValue.delete()";
}

@end

#pragma mark - FSTServerTimestampFieldValue

@interface FSTServerTimestampFieldValue ()
/** Returns a single shared instance of the class. */
+ (instancetype)serverTimestampFieldValue;
@end

@implementation FSTServerTimestampFieldValue

- (instancetype)initPrivate {
  self = [super initPrivate];
  return self;
}

+ (instancetype)serverTimestampFieldValue {
  static FSTServerTimestampFieldValue *sharedInstance = nil;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    sharedInstance = [[FSTServerTimestampFieldValue alloc] initPrivate];
  });
  return sharedInstance;
}

- (NSString *)methodName {
  return @"FieldValue.serverTimestamp()";
}

@end

#pragma mark - FSTArrayUnionFieldValue

@interface FSTArrayUnionFieldValue ()
- (instancetype)initWithElements:(NSArray<id> *)elements;
@end

@implementation FSTArrayUnionFieldValue
- (instancetype)initWithElements:(NSArray<id> *)elements {
  if (self = [super initPrivate]) {
    _elements = elements;
  }
  return self;
}

- (NSString *)methodName {
  return @"FieldValue.arrayUnion()";
}

@end

#pragma mark - FSTArrayRemoveFieldValue

@interface FSTArrayRemoveFieldValue ()
- (instancetype)initWithElements:(NSArray<id> *)elements;
@end

@implementation FSTArrayRemoveFieldValue
- (instancetype)initWithElements:(NSArray<id> *)elements {
  if (self = [super initPrivate]) {
    _elements = elements;
  }
  return self;
}

- (NSString *)methodName {
  return @"FieldValue.arrayRemove()";
}

@end

#pragma mark - FSTNumericIncrementFieldValue

/* FieldValue class for increment() transforms. */
@interface FSTNumericIncrementFieldValue ()
- (instancetype)initWithOperand:(NSNumber *)operand;
@end

@implementation FSTNumericIncrementFieldValue
- (instancetype)initWithOperand:(NSNumber *)operand {
  if (self = [super initPrivate]) {
    _operand = operand;
  }
  return self;
}

- (NSString *)methodName {
  return @"FieldValue.increment()";
}

@end

#pragma mark - FIRFieldValue

@implementation FIRFieldValue

- (instancetype)initPrivate {
  self = [super init];
  return self;
}

+ (instancetype)fieldValueForDelete {
  return [FSTDeleteFieldValue deleteFieldValue];
}

+ (instancetype)fieldValueForServerTimestamp {
  return [FSTServerTimestampFieldValue serverTimestampFieldValue];
}

+ (instancetype)fieldValueForArrayUnion:(NSArray<id> *)elements {
  return [[FSTArrayUnionFieldValue alloc] initWithElements:elements];
}

+ (instancetype)fieldValueForArrayRemove:(NSArray<id> *)elements {
  return [[FSTArrayRemoveFieldValue alloc] initWithElements:elements];
}

+ (instancetype)fieldValueForDoubleIncrement:(double)d {
  return [[FSTNumericIncrementFieldValue alloc] initWithOperand:@(d)];
}

+ (instancetype)fieldValueForIntegerIncrement:(int64_t)l {
  return [[FSTNumericIncrementFieldValue alloc] initWithOperand:@(l)];
}

@end

NS_ASSUME_NONNULL_END
