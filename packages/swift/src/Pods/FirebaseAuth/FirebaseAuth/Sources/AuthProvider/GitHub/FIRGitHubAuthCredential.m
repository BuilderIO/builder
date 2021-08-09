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

#import "FirebaseAuth/Sources/AuthProvider/GitHub/FIRGitHubAuthCredential.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRGitHubAuthProvider.h"

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRGitHubAuthCredential ()

- (nullable instancetype)initWithProvider:(NSString *)provider NS_UNAVAILABLE;

@end

@implementation FIRGitHubAuthCredential

- (nullable instancetype)initWithProvider:(NSString *)provider {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"Please call the designated initializer."];
  return nil;
}

- (nullable instancetype)initWithToken:(NSString *)token {
  self = [super initWithProvider:FIRGitHubAuthProviderID];
  if (self) {
    _token = [token copy];
  }
  return self;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  request.providerAccessToken = _token;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *token = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"token"];
  self = [self initWithToken:token];
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:self.token forKey:@"token"];
}

@end

NS_ASSUME_NONNULL_END
