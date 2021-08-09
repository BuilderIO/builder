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

#import "FirebaseAuth/Sources/Storage/FIRAuthUserDefaults.h"

NS_ASSUME_NONNULL_BEGIN

static NSString *const kPersistentDomainNamePrefix = @"com.google.Firebase.Auth.";

@implementation FIRAuthUserDefaults {
  /** @var _persistentDomainName
      @brief The name of the persistent domain in user defaults.
   */
  NSString *_persistentDomainName;

  /** @var _storage
      @brief The backing NSUserDefaults storage for this instance.
   */
  NSUserDefaults *_storage;
}

- (instancetype)initWithService:(NSString *)service {
  self = [super init];
  if (self) {
    _persistentDomainName = [kPersistentDomainNamePrefix stringByAppendingString:service];
    _storage = [[NSUserDefaults alloc] init];
  }
  return self;
}

- (nullable NSData *)dataForKey:(NSString *)key error:(NSError **_Nullable)error {
  if (error) {
    *error = nil;
  }
  NSDictionary<NSString *, id> *allData = [_storage persistentDomainForName:_persistentDomainName];
  return allData[key];
}

- (BOOL)setData:(NSData *)data forKey:(NSString *)key error:(NSError **_Nullable)error {
  NSMutableDictionary<NSString *, id> *allData =
      [([_storage persistentDomainForName:_persistentDomainName] ?: @{}) mutableCopy];
  allData[key] = data;
  [_storage setPersistentDomain:allData forName:_persistentDomainName];
  return YES;
}

- (BOOL)removeDataForKey:(NSString *)key error:(NSError **_Nullable)error {
  NSMutableDictionary<NSString *, id> *allData =
      [[_storage persistentDomainForName:_persistentDomainName] mutableCopy];
  [allData removeObjectForKey:key];
  [_storage setPersistentDomain:allData forName:_persistentDomainName];
  return YES;
}

- (void)clear {
  [_storage setPersistentDomain:@{} forName:_persistentDomainName];
}

@end

NS_ASSUME_NONNULL_END
