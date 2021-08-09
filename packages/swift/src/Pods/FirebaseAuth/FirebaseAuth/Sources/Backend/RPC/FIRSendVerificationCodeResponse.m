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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSendVerificationCodeResponse.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRSendVerificationCodeResponse

// TODO: remove when resolving b/37169084 .
- (nullable NSString *)expectedKind {
  return nil;
}

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  _verificationID = [dictionary[@"sessionInfo"] copy];
  return YES;
}

@end

NS_ASSUME_NONNULL_END
