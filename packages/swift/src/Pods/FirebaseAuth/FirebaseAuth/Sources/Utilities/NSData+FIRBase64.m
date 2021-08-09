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

#import "FirebaseAuth/Sources/Utilities/NSData+FIRBase64.h"

NS_ASSUME_NONNULL_BEGIN

@implementation NSData (FIRBase64)

- (NSString *)fir_base64URLEncodedStringWithOptions:(NSDataBase64EncodingOptions)options {
  NSString *string = [self base64EncodedStringWithOptions:options];
  string = [string stringByReplacingOccurrencesOfString:@"/" withString:@"_"];
  string = [string stringByReplacingOccurrencesOfString:@"+" withString:@"-"];
  string = [string stringByReplacingOccurrencesOfString:@"=" withString:@""];
  return string;
}

@end

NS_ASSUME_NONNULL_END
