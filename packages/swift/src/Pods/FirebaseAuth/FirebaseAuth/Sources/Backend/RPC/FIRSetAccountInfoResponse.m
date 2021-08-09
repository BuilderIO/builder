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

#import "FirebaseAuth/Sources/Backend/RPC/FIRSetAccountInfoResponse.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRSetAccountInfoResponseProviderUserInfo

- (instancetype)initWithDictionary:(NSDictionary *)dictionary {
  self = [super init];
  if (self) {
    _providerID = [dictionary[@"providerId"] copy];
    _displayName = [dictionary[@"displayName"] copy];
    NSString *photoURL = dictionary[@"photoUrl"];
    if (photoURL) {
      _photoURL = [NSURL URLWithString:photoURL];
    }
  }
  return self;
}

@end

@implementation FIRSetAccountInfoResponse

- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error {
  _email = [dictionary[@"email"] copy];
  _displayName = [dictionary[@"displayName"] copy];
  _IDToken = [dictionary[@"idToken"] copy];
  _approximateExpirationDate =
      [dictionary[@"expiresIn"] isKindOfClass:[NSString class]]
          ? [NSDate dateWithTimeIntervalSinceNow:[dictionary[@"expiresIn"] doubleValue]]
          : nil;
  _refreshToken = [dictionary[@"refreshToken"] copy];
  NSArray<NSDictionary *> *providerUserInfoData = dictionary[@"providerUserInfo"];
  if (providerUserInfoData) {
    NSMutableArray<FIRSetAccountInfoResponseProviderUserInfo *> *providerUserInfoArray =
        [NSMutableArray arrayWithCapacity:providerUserInfoData.count];
    for (NSDictionary *dictionary in providerUserInfoData) {
      [providerUserInfoArray addObject:[[FIRSetAccountInfoResponseProviderUserInfo alloc]
                                           initWithDictionary:dictionary]];
    }
    _providerUserInfo = [providerUserInfoArray copy];
  }
  return YES;
}

@end

NS_ASSUME_NONNULL_END
