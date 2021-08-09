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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAdditionalUserInfo.h"
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIROAuthCredential.h"
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRUser.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthDataResult_Internal.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthDataResult

/** @var kAdditionalUserInfoCodingKey
    @brief The key used to encode the additionalUserInfo property for NSSecureCoding.
 */
static NSString *const kAdditionalUserInfoCodingKey = @"additionalUserInfo";

/** @var kUserCodingKey
    @brief The key used to encode the user property for NSSecureCoding.
 */
static NSString *const kUserCodingKey = @"user";

/** @var kCredentialCodingKey
    @brief The key used to encode the credential for NSSecureCoding.
 */
static NSString *const kCredentialCodingKey = @"credential";

- (nullable instancetype)initWithUser:(FIRUser *)user
                   additionalUserInfo:(nullable FIRAdditionalUserInfo *)additionalUserInfo {
  return [self initWithUser:user additionalUserInfo:additionalUserInfo credential:nil];
}

- (nullable instancetype)initWithUser:(FIRUser *)user
                   additionalUserInfo:(nullable FIRAdditionalUserInfo *)additionalUserInfo
                           credential:(nullable FIROAuthCredential *)credential {
  self = [super init];
  if (self) {
    _additionalUserInfo = additionalUserInfo;
    _user = user;
    _credential = credential;
  }
  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  FIRUser *user = [aDecoder decodeObjectOfClass:[FIRUser class] forKey:kUserCodingKey];
  FIRAdditionalUserInfo *additionalUserInfo =
      [aDecoder decodeObjectOfClass:[FIRAdditionalUserInfo class]
                             forKey:kAdditionalUserInfoCodingKey];
  FIROAuthCredential *credential = [aDecoder decodeObjectOfClass:[FIROAuthCredential class]
                                                          forKey:kCredentialCodingKey];
  return [self initWithUser:user additionalUserInfo:additionalUserInfo credential:credential];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_user forKey:kUserCodingKey];
  [aCoder encodeObject:_additionalUserInfo forKey:kAdditionalUserInfoCodingKey];
  [aCoder encodeObject:_credential forKey:kCredentialCodingKey];
}

@end

NS_ASSUME_NONNULL_END
