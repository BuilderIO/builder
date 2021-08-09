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

#import "FirebaseAuth/Sources/User/FIRUserInfoImpl.h"

#import "FirebaseAuth/Sources/Backend/RPC/FIRGetAccountInfoResponse.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kProviderIDCodingKey
    @brief The key used to encode the providerID property for NSSecureCoding.
 */
static NSString *const kProviderIDCodingKey = @"providerID";

/** @var kUserIDCodingKey
    @brief The key used to encode the userID property for NSSecureCoding.
 */
static NSString *const kUserIDCodingKey = @"userID";

/** @var kDisplayNameCodingKey
    @brief The key used to encode the displayName property for NSSecureCoding.
 */
static NSString *const kDisplayNameCodingKey = @"displayName";

/** @var kProfileURLCodingKey
    @brief The key used to encode the profileURL property for NSSecureCoding.
 */
static NSString *const kProfileURLCodingKey = @"profileURL";

/** @var kPhotoURLCodingKey
    @brief The key used to encode the photoURL property for NSSecureCoding.
 */
static NSString *const kPhotoURLCodingKey = @"photoURL";

/** @var kEmailCodingKey
    @brief The key used to encode the email property for NSSecureCoding.
 */
static NSString *const kEmailCodingKey = @"email";

/** @var kPhoneNumberCodingKey
    @brief The key used to encode the phoneNumber property for NSSecureCoding.
 */
static NSString *const kPhoneNumberCodingKey = @"phoneNumber";

@implementation FIRUserInfoImpl

@synthesize providerID = _providerID;
@synthesize uid = _userID;
@synthesize displayName = _displayName;
@synthesize photoURL = _photoURL;
@synthesize email = _email;
@synthesize phoneNumber = _phoneNumber;

+ (nullable instancetype)userInfoWithGetAccountInfoResponseProviderUserInfo:
    (FIRGetAccountInfoResponseProviderUserInfo *)providerUserInfo {
  return [[self alloc] initWithProviderID:providerUserInfo.providerID
                                   userID:providerUserInfo.federatedID
                              displayName:providerUserInfo.displayName
                                 photoURL:providerUserInfo.photoURL
                                    email:providerUserInfo.email
                              phoneNumber:providerUserInfo.phoneNumber];
}

- (nullable instancetype)initWithProviderID:(NSString *)providerID
                                     userID:(NSString *)userID
                                displayName:(nullable NSString *)displayName
                                   photoURL:(nullable NSURL *)photoURL
                                      email:(nullable NSString *)email
                                phoneNumber:(nullable NSString *)phoneNumber {
  self = [super init];
  if (self) {
    _providerID = [providerID copy];
    _userID = [userID copy];
    _displayName = [displayName copy];
    _photoURL = [photoURL copy];
    _email = [email copy];
    _phoneNumber = [phoneNumber copy];
  }
  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *providerID = [aDecoder decodeObjectOfClass:[NSString class]
                                                forKey:kProviderIDCodingKey];
  NSString *userID = [aDecoder decodeObjectOfClass:[NSString class] forKey:kUserIDCodingKey];
  NSString *displayName = [aDecoder decodeObjectOfClass:[NSString class]
                                                 forKey:kDisplayNameCodingKey];
  NSURL *photoURL = [aDecoder decodeObjectOfClass:[NSURL class] forKey:kPhotoURLCodingKey];
  NSString *email = [aDecoder decodeObjectOfClass:[NSString class] forKey:kEmailCodingKey];
  NSString *phoneNumber = [aDecoder decodeObjectOfClass:[NSString class]
                                                 forKey:kPhoneNumberCodingKey];

  return [self initWithProviderID:providerID
                           userID:userID
                      displayName:displayName
                         photoURL:photoURL
                            email:email
                      phoneNumber:phoneNumber];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_providerID forKey:kProviderIDCodingKey];
  [aCoder encodeObject:_userID forKey:kUserIDCodingKey];
  [aCoder encodeObject:_displayName forKey:kDisplayNameCodingKey];
  [aCoder encodeObject:_photoURL forKey:kPhotoURLCodingKey];
  [aCoder encodeObject:_email forKey:kEmailCodingKey];
  [aCoder encodeObject:_phoneNumber forKey:kPhoneNumberCodingKey];
}

@end

NS_ASSUME_NONNULL_END
