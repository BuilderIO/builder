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

#import <TargetConditionals.h>
#if !TARGET_OS_OSX

#import "FirebaseAuth/Sources/SystemService/FIRAuthAPNSToken.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthAPNSToken {
  /** @var _string
      @brief The lazy-initialized string form of the token data.
   */
  NSString *_string;
}

- (instancetype)initWithData:(NSData *)data type:(FIRAuthAPNSTokenType)type {
  self = [super init];
  if (self) {
    _data = [data copy];
    _type = type;
  }
  return self;
}

- (NSString *)string {
  if (!_string) {
    NSUInteger capacity = _data.length * 2;
    NSMutableString *tokenString = [NSMutableString stringWithCapacity:capacity];
    const unsigned char *tokenData = _data.bytes;
    for (int idx = 0; idx < _data.length; ++idx) {
      [tokenString appendFormat:@"%02X", (int)tokenData[idx]];
    }
    _string = tokenString;
  }
  return _string;
}

@end

NS_ASSUME_NONNULL_END

#endif
