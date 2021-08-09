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

#import "FirebaseAuth/Sources/Backend/RPC/FIRCreateAuthURIResponse.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRCreateAuthURIResponse

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  _providerID = [dictionary[@"providerId"] copy];
  _authURI = [dictionary[@"authUri"] copy];
  _registered = [dictionary[@"registered"] boolValue];
  _forExistingProvider = [dictionary[@"forExistingProvider"] boolValue];
  _allProviders = [dictionary[@"allProviders"] copy];
  _signinMethods = [dictionary[@"signinMethods"] copy];
  return YES;
}

@end

NS_ASSUME_NONNULL_END
