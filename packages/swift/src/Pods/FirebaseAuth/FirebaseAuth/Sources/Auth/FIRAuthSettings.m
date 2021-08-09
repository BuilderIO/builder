/*
 * Copyright 2018 Google
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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthSettings.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthSettings

- (instancetype)init {
  self = [super init];
  if (self) {
    _appVerificationDisabledForTesting = NO;
  }
  return self;
}

- (instancetype)copyWithZone:(NSZone *__unused _Nullable)zone {
  // Auth settings are mutable, so always return a copy.
  FIRAuthSettings *newSettings = [[FIRAuthSettings alloc] init];
  newSettings.appVerificationDisabledForTesting = self.isAppVerificationDisabledForTesting;
  return newSettings;
}

@end

NS_ASSUME_NONNULL_END
