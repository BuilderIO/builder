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
#import "FirebaseAuth/Sources/User/FIRAdditionalUserInfo_Internal.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAdditionalUserInfo

/** @var kProviderIDCodingKey
    @brief The key used to encode the providerID property for NSSecureCoding.
 */
static NSString *const kProviderIDCodingKey = @"providerID";

/** @var kProfileCodingKey
    @brief The key used to encode the profile property for NSSecureCoding.
 */
static NSString *const kProfileCodingKey = @"profile";

/** @var kUsernameCodingKey
    @brief The key used to encode the username property for NSSecureCoding.
 */
static NSString *const kUsernameCodingKey = @"username";

/** @var kNewUserKey
    @brief The key used to encode the newUser property for NSSecureCoding.
 */
static NSString *const kNewUserKey = @"newUser";

+ (nullable instancetype)userInfoWithVerifyAssertionResponse:
    (FIRVerifyAssertionResponse *)verifyAssertionResponse {
  return [[self alloc] initWithProviderID:verifyAssertionResponse.providerID
                                  profile:verifyAssertionResponse.profile
                                 username:verifyAssertionResponse.username
                                isNewUser:verifyAssertionResponse.isNewUser];
}

- (nullable instancetype)initWithProviderID:(nullable NSString *)providerID
                                    profile:(nullable NSDictionary<NSString *, NSObject *> *)profile
                                   username:(nullable NSString *)username
                                  isNewUser:(BOOL)isNewUser {
  self = [super init];
  if (self) {
    _providerID = [providerID copy];
    if (profile) {
      _profile = [[NSDictionary alloc] initWithDictionary:profile copyItems:YES];
    }
    _username = [username copy];
    _newUser = isNewUser;
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
  NSDictionary<NSString *, NSObject *> *profile = [aDecoder decodeObjectOfClass:[NSDictionary class]
                                                                         forKey:kProfileCodingKey];
  NSString *username = [aDecoder decodeObjectOfClass:[NSString class] forKey:kUsernameCodingKey];
  NSNumber *isNewUser = [aDecoder decodeObjectOfClass:[NSNumber class] forKey:kNewUserKey];

  return [self initWithProviderID:providerID
                          profile:profile
                         username:username
                        isNewUser:isNewUser.boolValue];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_providerID forKey:kProviderIDCodingKey];
  [aCoder encodeObject:_profile forKey:kProfileCodingKey];
  [aCoder encodeObject:_username forKey:kUsernameCodingKey];
  [aCoder encodeObject:[NSNumber numberWithBool:_newUser] forKey:kNewUserKey];
}

@end

NS_ASSUME_NONNULL_END
