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

#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kReceiptKey
    @brief The key used to encode the receipt property for NSSecureCoding.
 */
static NSString *const kReceiptKey = @"receipt";

/** @var kSecretKey
    @brief The key used to encode the secret property for NSSecureCoding.
 */
static NSString *const kSecretKey = @"secret";

@implementation FIRAuthAppCredential

- (instancetype)initWithReceipt:(NSString *)receipt secret:(nullable NSString *)secret {
  self = [super init];
  if (self) {
    _receipt = [receipt copy];
    _secret = [secret copy];
  }
  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *receipt = [aDecoder decodeObjectOfClass:[NSString class] forKey:kReceiptKey];
  if (!receipt) {
    return nil;
  }
  NSString *secret = [aDecoder decodeObjectOfClass:[NSString class] forKey:kSecretKey];
  return [self initWithReceipt:receipt secret:secret];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_receipt forKey:kReceiptKey];
  [aCoder encodeObject:_secret forKey:kSecretKey];
}

@end

NS_ASSUME_NONNULL_END
