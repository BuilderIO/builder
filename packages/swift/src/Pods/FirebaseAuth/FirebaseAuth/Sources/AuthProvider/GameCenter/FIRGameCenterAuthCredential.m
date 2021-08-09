/*
 * Copyright 2018 Google
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

#import "FirebaseAuth/Sources/AuthProvider/GameCenter/FIRGameCenterAuthCredential.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRGameCenterAuthProvider.h"

#import "FirebaseAuth/Sources/AuthProvider/FIRAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRGameCenterAuthCredential

- (nullable instancetype)initWithProvider:(NSString *)provider {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:@"Please call the designated initializer."];
  return nil;
}

- (nullable instancetype)initWithPlayerID:(NSString *)playerID
                             publicKeyURL:(NSURL *)publicKeyURL
                                signature:(NSData *)signature
                                     salt:(NSData *)salt
                                timestamp:(uint64_t)timestamp
                              displayName:(NSString *)displayName {
  self = [super initWithProvider:FIRGameCenterAuthProviderID];
  if (self) {
    _playerID = [playerID copy];
    _publicKeyURL = [publicKeyURL copy];
    _signature = [signature copy];
    _salt = [salt copy];
    _timestamp = timestamp;
    _displayName = [displayName copy];
  }
  return self;
}

- (void)prepareVerifyAssertionRequest:(FIRVerifyAssertionRequest *)request {
  [FIRAuthExceptionUtils
      raiseMethodNotImplementedExceptionWithReason:
          @"Attempt to call prepareVerifyAssertionRequest: on a FIRGameCenterAuthCredential."];
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *playerID = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"playerID"];
  NSURL *publicKeyURL = [aDecoder decodeObjectOfClass:[NSURL class] forKey:@"publicKeyURL"];
  NSData *signature = [aDecoder decodeObjectOfClass:[NSData class] forKey:@"signature"];
  NSData *salt = [aDecoder decodeObjectOfClass:[NSData class] forKey:@"salt"];
  NSNumber *timestamp = [aDecoder decodeObjectOfClass:[NSNumber class] forKey:@"timestamp"];
  NSString *displayName = [aDecoder decodeObjectOfClass:[NSString class] forKey:@"displayName"];
  self = [self initWithPlayerID:playerID
                   publicKeyURL:publicKeyURL
                      signature:signature
                           salt:salt
                      timestamp:timestamp.unsignedLongLongValue
                    displayName:displayName];
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:self.playerID forKey:@"playerID"];
  [aCoder encodeObject:self.publicKeyURL forKey:@"publicKeyURL"];
  [aCoder encodeObject:self.signature forKey:@"signature"];
  [aCoder encodeObject:self.salt forKey:@"salt"];
  [aCoder encodeObject:[NSNumber numberWithUnsignedLongLong:self.timestamp] forKey:@"timestamp"];
  [aCoder encodeObject:self.displayName forKey:@"displayName"];
}

@end

NS_ASSUME_NONNULL_END
