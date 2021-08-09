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

#import "FirebaseAuth/Sources/Backend/RPC/FIRGetAccountInfoResponse.h"

#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kErrorKey
    @brief The key for the "error" value in JSON responses from the server.
 */
static NSString *const kErrorKey = @"error";

@implementation FIRGetAccountInfoResponseProviderUserInfo

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  self = [super init];
  if (self) {
    _providerID = [dictionary[@"providerId"] copy];
    _displayName = [dictionary[@"displayName"] copy];
    NSString *photoURL = dictionary[@"photoUrl"];
    if (photoURL) {
      _photoURL = [NSURL URLWithString:photoURL];
    }
    _federatedID = [dictionary[@"federatedId"] copy];
    _email = [dictionary[@"email"] copy];
    _phoneNumber = [dictionary[@"phoneNumber"] copy];
  }
  return self;
}

@end

@implementation FIRGetAccountInfoResponseUser

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  self = [super init];
  if (self) {
    NSArray<NSDictionary *> *providerUserInfoData = dictionary[@"providerUserInfo"];
    if (providerUserInfoData) {
      NSMutableArray<FIRGetAccountInfoResponseProviderUserInfo *> *providerUserInfoArray =
          [NSMutableArray arrayWithCapacity:providerUserInfoData.count];
      for (NSDictionary *dictionary in providerUserInfoData) {
        [providerUserInfoArray addObject:[[FIRGetAccountInfoResponseProviderUserInfo alloc]
                                             initWithDictionary:dictionary]];
      }
      _providerUserInfo = [providerUserInfoArray copy];
    }
    _localID = [dictionary[@"localId"] copy];
    _displayName = [dictionary[@"displayName"] copy];
    _email = [dictionary[@"email"] copy];
    NSString *photoURL = dictionary[@"photoUrl"];
    if (photoURL) {
      _photoURL = [NSURL URLWithString:photoURL];
    }
    if ([dictionary[@"createdAt"] isKindOfClass:[NSString class]]) {
      // Divide by 1000 in order to convert miliseconds to seconds.
      NSTimeInterval creationDateTimeInterval = [dictionary[@"createdAt"] doubleValue] / 1000;
      _creationDate = [NSDate dateWithTimeIntervalSince1970:creationDateTimeInterval];
    }
    if ([dictionary[@"lastLoginAt"] isKindOfClass:[NSString class]]) {
      // Divide by 1000 in order to convert miliseconds to seconds
      NSTimeInterval creationDateTimeInterval = [dictionary[@"lastLoginAt"] doubleValue] / 1000;
      _lastLoginDate = [NSDate dateWithTimeIntervalSince1970:creationDateTimeInterval];
    }
    _emailVerified = [dictionary[@"emailVerified"] boolValue];
    _passwordHash = [dictionary[@"passwordHash"] copy];
    _phoneNumber = [dictionary[@"phoneNumber"] copy];
    NSArray<NSDictionary *> *MFAEnrollmentData = dictionary[@"mfaInfo"];
    if (MFAEnrollmentData) {
      NSMutableArray<FIRAuthProtoMFAEnrollment *> *MFAEnrollments =
          [NSMutableArray arrayWithCapacity:MFAEnrollmentData.count];
      for (NSDictionary *dictionary in MFAEnrollmentData) {
        [MFAEnrollments
            addObject:[[FIRAuthProtoMFAEnrollment alloc] initWithDictionary:dictionary]];
      }
      _MFAEnrollments = [MFAEnrollments copy];
    }
  }
  return self;
}

@end

@implementation FIRGetAccountInfoResponse

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  NSArray<NSDictionary *> *usersData = dictionary[@"users"];
  // The client side never sends a getAccountInfo request with multiple localID, so only one user
  // data is expected in the response.
  if (![usersData isKindOfClass:[NSArray class]] || usersData.count != 1) {
    if (error) {
      *error = [FIRAuthErrorUtils unexpectedResponseWithDeserializedResponse:dictionary];
    }
    return NO;
  }
  _users = @[ [[FIRGetAccountInfoResponseUser alloc] initWithDictionary:usersData.firstObject] ];
  return YES;
}

@end

NS_ASSUME_NONNULL_END
