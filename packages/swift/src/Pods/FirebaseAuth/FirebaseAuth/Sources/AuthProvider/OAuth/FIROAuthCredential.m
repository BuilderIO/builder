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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIROAuthCredential.h"

#import "FirebaseAuth/Sources/AuthProvider/FIRAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/AuthProvider/OAuth/FIROAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionResponse.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIROAuthCredential ()

@property(nonatomic, nullable) NSString *rawNonce;

- (nullable instancetype)initWithProvider:(NSString *)provider NS_UNAVAILABLE;

@end

@implementation FIROAuthCredential

- (nullable instancetype)initWithProvider:(NSString *)provider {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"Please call the designated initializer."];
  return nil;
}

- (instancetype)initWithProviderID:(NSString *)providerID
                           IDToken:(nullable NSString *)IDToken
                          rawNonce:(nullable NSString *)rawNonce
                       accessToken:(nullable NSString *)accessToken
                            secret:(nullable NSString *)secret
                      pendingToken:(nullable NSString *)pendingToken {
  self = [super initWithProvider:providerID];
  if (self) {
    _IDToken = IDToken;
    _rawNonce = rawNonce;
    _accessToken = accessToken;
    _pendingToken = pendingToken;
    _secret = secret;
  }
  return self;
}

- (instancetype)initWithProviderID:(NSString *)providerID
                         sessionID:(NSString *)sessionID
            OAuthResponseURLString:(NSString *)OAuthResponseURLString {
  self = [self initWithProviderID:providerID
                          IDToken:nil
                         rawNonce:nil
                      accessToken:nil
                           secret:nil
                     pendingToken:nil];
  if (self) {
    _OAuthResponseURLString = OAuthResponseURLString;
    _sessionID = sessionID;
  }
  return self;
}

- (nullable instancetype)initWithVerifyAssertionResponse:(FIRVerifyAssertionResponse *)response {
  if (response.oauthIDToken.length || response.oauthAccessToken.length ||
      response.oauthSecretToken.length) {
    return [self initWithProviderID:response.providerID
                            IDToken:response.oauthIDToken
                           rawNonce:nil
                        accessToken:response.oauthAccessToken
                             secret:response.oauthSecretToken
                       pendingToken:response.pendingToken];
  }
  return nil;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  request.providerIDToken = _IDToken;
  request.providerRawNonce = _rawNonce;
  request.providerAccessToken = _accessToken;
  request.requestURI = _OAuthResponseURLString;
  request.sessionID = _sessionID;
  request.providerOAuthTokenSecret = _secret;
  request.pendingToken = _pendingToken;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *IDToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"IDToken"];
  NSString *rawNonce = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"rawNonce"];
  NSString *accessToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"accessToken"];
  NSString *pendingToken = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"pendingToken"];
  NSString *secret = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"secret"];
  self = [self initWithProviderID:self.provider
                          IDToken:IDToken
                         rawNonce:rawNonce
                      accessToken:accessToken
                           secret:secret
                     pendingToken:pendingToken];
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:self.IDToken forKey:@"IDToken"];
  [aCoder encodeObject:self.rawNonce forKey:@"rawNonce"];
  [aCoder encodeObject:self.accessToken forKey:@"accessToken"];
  [aCoder encodeObject:self.pendingToken forKey:@"pendingToken"];
  [aCoder encodeObject:self.secret forKey:@"secret"];
}

@end

NS_ASSUME_NONNULL_END
