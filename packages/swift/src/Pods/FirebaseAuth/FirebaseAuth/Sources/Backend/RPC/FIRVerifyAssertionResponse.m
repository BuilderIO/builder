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

#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionResponse.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRVerifyAssertionResponse

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  _federatedID = [dictionary[@"federatedId"] copy];
  _providerID = [dictionary[@"providerId"] copy];
  _localID = [dictionary[@"localId"] copy];
  _emailRecycled = [dictionary[@"emailRecycled"] boolValue];
  _emailVerified = [dictionary[@"emailVerified"] boolValue];
  _email = [dictionary[@"email"] copy];
  _inputEmail = [dictionary[@"inputEmail"] copy];
  _originalEmail = [dictionary[@"originalEmail"] copy];
  _oauthRequestToken = [dictionary[@"oauthRequestToken"] copy];
  _oauthScope = [dictionary[@"oauthScope"] copy];
  _firstName = [dictionary[@"firstName"] copy];
  _lastName = [dictionary[@"lastName"] copy];
  _fullName = [dictionary[@"fullName"] copy];
  _nickName = [dictionary[@"nickName"] copy];
  _displayName = [dictionary[@"displayName"] copy];
  _IDToken = [dictionary[@"idToken"] copy];
  _approximateExpirationDate =
      [dictionary[@"expiresIn"] isKindOfClass:[NSString class]]
          ? [NSDate dateWithTimeIntervalSinceNow:[dictionary[@"expiresIn"] doubleValue]]
          : nil;
  _refreshToken = [dictionary[@"refreshToken"] copy];
  _isNewUser = [dictionary[@"isNewUser"] boolValue];
  id rawUserInfo = dictionary[@"rawUserInfo"];
  if ([rawUserInfo isKindOfClass:[NSString class]]) {
    NSData *data = [rawUserInfo dataUsingEncoding:NSUTF8StringEncoding];
    rawUserInfo = [NSJSONSerialization JSONObjectWithData:data
                                                  options:NSJSONReadingMutableLeaves
                                                    error:nil];
  }
  if ([rawUserInfo isKindOfClass:[NSDictionary class]]) {
    _profile = [[NSDictionary alloc] initWithDictionary:rawUserInfo copyItems:YES];
  }
  _username = [dictionary[@"username"] copy];
  _action = [dictionary[@"action"] copy];
  _language = [dictionary[@"language"] copy];
  _timeZone = [dictionary[@"timeZone"] copy];
  _photoURL = dictionary[@"photoUrl"] ? [NSURL URLWithString:dictionary[@"photoUrl"]] : nil;
  _dateOfBirth = [dictionary[@"dateOfBirth"] copy];
  _context = [dictionary[@"context"] copy];
  _needConfirmation = [dictionary[@"needConfirmation"] boolValue];
  id verifiedProvider = dictionary[@"verifiedProvider"];
  if ([verifiedProvider isKindOfClass:[NSString class]]) {
    NSData *data = [verifiedProvider dataUsingEncoding:NSUTF8StringEncoding];
    verifiedProvider = [NSJSONSerialization JSONObjectWithData:data
                                                       options:NSJSONReadingMutableLeaves
                                                         error:nil];
  }
  if ([verifiedProvider isKindOfClass:[NSArray class]]) {
    _verifiedProvider = [[NSArray alloc] initWithArray:verifiedProvider copyItems:YES];
  }
  _oauthIDToken = [dictionary[@"oauthIdToken"] copy];
  _oauthExpirationDate =
      [dictionary[@"oauthExpireIn"] isKindOfClass:[NSString class]]
          ? [NSDate dateWithTimeIntervalSinceNow:[dictionary[@"oauthExpireIn"] doubleValue]]
          : nil;
  _oauthAccessToken = [dictionary[@"oauthAccessToken"] copy];
  _oauthSecretToken = [dictionary[@"oauthTokenSecret"] copy];
  _pendingToken = [dictionary[@"pendingToken"] copy];

  if (dictionary[@"mfaInfo"] != nil) {
    NSMutableArray<FIRAuthProtoMFAEnrollment *> *MFAInfo = [NSMutableArray array];
    NSArray *MFAInfoDataArray = dictionary[@"mfaInfo"];
    for (NSDictionary *MFAInfoData in MFAInfoDataArray) {
      FIRAuthProtoMFAEnrollment *MFAEnrollment =
          [[FIRAuthProtoMFAEnrollment alloc] initWithDictionary:MFAInfoData];
      [MFAInfo addObject:MFAEnrollment];
    }
    _MFAInfo = MFAInfo;
  }
  _MFAPendingCredential = [dictionary[@"mfaPendingCredential"] copy];

  return YES;
}

@end

NS_ASSUME_NONNULL_END
