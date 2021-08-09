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

#import "FirebaseAuth/Sources/AuthProvider/Google/FIRGoogleAuthCredential.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRGoogleAuthProvider.h"

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRGoogleAuthCredential ()

- (nullable instancetype)initWithProvider:(NSString *)provider NS_UNAVAILABLE;

@end

@implementation FIRGoogleAuthCredential {
  NSString *_IDToken;
  NSString *_accessToken;
}

- (nullable instancetype)initWithProvider:(NSString *)provider {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"Please call the designated initializer."];
  return nil;
}

- (nullable instancetype)initWithIDToken:(NSString *)IDToken accessToken:(NSString *)accessToken {
  self = [super initWithProvider:FIRGoogleAuthProviderID];
  if (self) {
    _IDToken = [IDToken copy];
    _accessToken = [accessToken copy];
  }
  return self;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  request.providerIDToken = _IDToken;
  request.providerAccessToken = _accessToken;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *IDToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"IDToken"];
  NSString *accessToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"accessToken"];
  self = [self initWithIDToken:IDToken accessToken:accessToken];
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_IDToken forKey:@"IDToken"];
  [aCoder encodeObject:_accessToken forKey:@"accessToken"];
}

@end

NS_ASSUME_NONNULL_END
