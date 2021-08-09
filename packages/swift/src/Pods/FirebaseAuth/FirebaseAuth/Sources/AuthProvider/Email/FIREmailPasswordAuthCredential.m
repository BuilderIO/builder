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

#import "FirebaseAuth/Sources/AuthProvider/Email/FIREmailPasswordAuthCredential.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIREmailAuthProvider.h"

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIREmailPasswordAuthCredential ()

- (nullable instancetype)initWithProvider:(NSString *)provider NS_UNAVAILABLE;

@end

@implementation FIREmailPasswordAuthCredential

- (nullable instancetype)initWithProvider:(NSString *)provider {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"Please call the designated initializer."];
  return nil;
}

- (nullable instancetype)initWithEmail:(NSString *)email password:(NSString *)password {
  self = [super initWithProvider:FIREmailAuthProviderID];
  if (self) {
    _email = [email copy];
    _password = [password copy];
  }
  return self;
}

- (nullable instancetype)initWithEmail:(NSString *)email link:(NSString *)link {
  self = [super initWithProvider:FIREmailAuthProviderID];
  if (self) {
    _email = [email copy];
    _link = [link copy];
  }
  return self;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:
          @"Attempt to call prepareVerifyAssertionRequest: on a FIREmailPasswordAuthCredential."];
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *email = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"email"];
  NSString *password = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"password"];
  NSString *link = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"link"];
  if (email.length && password.length) {
    self = [self initWithEmail:email password:password];
  } else if (email.length && link.length) {
    self = [self initWithEmail:email link:link];
  } else {
    self = nil;
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:self.email forKey:@"email"];
  [aCoder encodeObject:self.password forKey:@"password"];
  [aCoder encodeObject:self.link forKey:@"link"];
}

@end

NS_ASSUME_NONNULL_END
