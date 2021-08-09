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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSignInWithGameCenterRequest.h"

#import "FirebaseAuth/Sources/Utilities/NSData+FIRBase64.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kSignInWithGameCenterEndPoint
    @brief The "SignInWithGameCenter" endpoint.
 */
static NSString *const kSignInWithGameCenterEndPoint = @"signInWithGameCenter";

@implementation FIRSignInWithGameCenterRequest

- (nullable instancetype)initWithPlayerID:(NSString *)playerID
                             publicKeyURL:(NSURL *)publicKeyURL
                                signature:(NSData *)signature
                                     salt:(NSData *)salt
                                timestamp:(uint64_t)timestamp
                              displayName:(NSString *)displayName
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super initWithEndpoint:kSignInWithGameCenterEndPoint
            requestConfiguration:requestConfiguration];
  if (self) {
    _playerID = playerID;
    _publicKeyURL = [publicKeyURL copy];
    _signature = [signature copy];
    _salt = [salt copy];
    _timestamp = timestamp;
    _displayName = displayName;
  }
  return self;
}

#pragma mark - FIRAuthRPCRequest

- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *__autoreleasing _Nullable *)error {
  NSMutableDictionary *postBody = [NSMutableDictionary dictionary];
  if (_playerID) {
    postBody[@"playerId"] = _playerID;
  }
  if (_publicKeyURL) {
    postBody[@"publicKeyUrl"] = _publicKeyURL.absoluteString;
  }
  if (_signature) {
    postBody[@"signature"] = [_signature fir_base64URLEncodedStringWithOptions:0];
  }
  if (_salt) {
    postBody[@"salt"] = [_salt fir_base64URLEncodedStringWithOptions:0];
  }
  if (_timestamp != 0) {
    postBody[@"timestamp"] = [NSNumber numberWithUnsignedLongLong:_timestamp];
  }
  if (_accessToken) {
    postBody[@"idToken"] = _accessToken;
  }
  if (_displayName) {
    postBody[@"displayName"] = _displayName;
  }
  return [postBody copy];
}

@end

NS_ASSUME_NONNULL_END
