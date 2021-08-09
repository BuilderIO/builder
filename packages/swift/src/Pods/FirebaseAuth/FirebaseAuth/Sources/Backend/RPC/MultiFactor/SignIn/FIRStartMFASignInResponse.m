/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRStartMFASignInResponse.h"

@implementation FIRStartMFASignInResponse

- (BOOL)setWithDictionary:(nonnull NSDictionary *)dictionary
                    error:(NSError *__autoreleasing _Nullable *_Nullable)error {
  if (dictionary[@"phoneResponseInfo"] != nil) {
    NSDictionary *data = dictionary[@"phoneResponseInfo"];
    _responseInfo = [[FIRAuthProtoStartMFAPhoneResponseInfo alloc] initWithDictionary:data];
  } else {
    return NO;
  }
  return YES;
}

@end
