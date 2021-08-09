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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRGitHubAuthProvider.h"

#import "FirebaseAuth/Sources/AuthProvider/GitHub/FIRGitHubAuthCredential.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

// FIRGitHubAuthProviderID is defined in FIRAuthProvider.m.

NS_ASSUME_NONNULL_BEGIN

@implementation FIRGitHubAuthProvider

- (instancetype)init {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"This class is not meant to be initialized."];
  return nil;
}

+ (FIRAuthCredential *)credentialWithToken:(NSString *)token {
  return [[FIRGitHubAuthCredential alloc] initWithToken:token];
}

@end

NS_ASSUME_NONNULL_END
