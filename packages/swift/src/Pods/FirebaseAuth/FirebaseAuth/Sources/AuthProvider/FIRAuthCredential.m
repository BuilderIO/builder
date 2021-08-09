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

#import "FirebaseAuth/Sources/AuthProvider/FIRAuthCredential_Internal.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthCredential

- (instancetype)init {
  @throw [NSException exceptionWithName:@"Attempt to call unavailable initializer."
                                 reason:@"This class is an abstract base class. It's init method "
                                         "should not be called directly."
                               userInfo:nil];
}

- (nullable instancetype)initWithProvider:(NSString *)provider {
  self = [super init];
  if (self) {
    _provider = [provider copy];
  }
  return self;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  @throw [NSException exceptionWithName:@"Attempt to call virtual method."
                                 reason:@"This method must be overridden by a subclass."
                               userInfo:nil];
}

@end

NS_ASSUME_NONNULL_END
