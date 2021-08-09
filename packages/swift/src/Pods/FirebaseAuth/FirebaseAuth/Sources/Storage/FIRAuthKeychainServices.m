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

#import "FirebaseAuth/Sources/Storage/FIRAuthKeychainServices.h"

#import <Security/Security.h>

#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/Storage/FIRAuthUserDefaults.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

/** @var kAccountPrefix
    @brief The prefix string for keychain item account attribute before the key.
    @remarks A number "1" is encoded in the prefix in case we need to upgrade the scheme in future.
 */
static NSString *const kAccountPrefix = @"firebase_auth_1_";

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthKeychainServices {
  /** @var _service
      @brief The name of the keychain service.
   */
  NSString *_service;

  /** @var _legacyItemDeletedForKey
      @brief Indicates whether or not this class knows that the legacy item for a particular key has
          been deleted.
      @remarks This dictionary is to avoid unecessary keychain operations against legacy items.
   */
  NSMutableDictionary *_legacyEntryDeletedForKey;
}

- (id<FIRAuthStorage>)initWithService:(NSString *)service {
  self = [super init];
  if (self) {
    _service = [service copy];
    _legacyEntryDeletedForKey = [[NSMutableDictionary alloc] init];
  }
  return self;
}

- (nullable NSData *)dataForKey:(NSString *)key error:(NSError **_Nullable)error {
  if (!key.length) {
    [NSException raise:NSInvalidArgumentException format:@"%@", @"The key cannot be nil or empty."];
    return nil;
  }
  NSData *data = [self itemWithQuery:[self genericPasswordQueryWithKey:key] error:error];
  if (error && *error) {
    return nil;
  }
  if (data) {
    return data;
  }
  // Check for legacy form.
  if (_legacyEntryDeletedForKey[key]) {
    return nil;
  }
  data = [self itemWithQuery:[self legacyGenericPasswordQueryWithKey:key] error:error];
  if (error && *error) {
    return nil;
  }
  if (!data) {
    // Mark legacy data as non-existing so we don't have to query it again.
    _legacyEntryDeletedForKey[key] = @YES;
    return nil;
  }
  // Move the data to current form.
  if (![self setData:data forKey:key error:error]) {
    return nil;
  }
  [self deleteLegacyItemWithKey:key];
  return data;
}

- (BOOL)setData:(NSData *)data forKey:(NSString *)key error:(NSError **_Nullable)error {
  if (!key.length) {
    [NSException raise:NSInvalidArgumentException format:@"%@", @"The key cannot be nil or empty."];
    return NO;
  }
  NSDictionary *attributes = @{
    (__bridge id)kSecValueData : data,
    (__bridge id)kSecAttrAccessible : (__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
  };
  return [self setItemWithQuery:[self genericPasswordQueryWithKey:key]
                     attributes:attributes
                          error:error];
}

- (BOOL)removeDataForKey:(NSString *)key error:(NSError **_Nullable)error {
  if (!key.length) {
    [NSException raise:NSInvalidArgumentException format:@"%@", @"The key cannot be nil or empty."];
    return NO;
  }
  if (![self deleteItemWithQuery:[self genericPasswordQueryWithKey:key] error:error]) {
    return NO;
  }
  // Legacy form item, if exists, also needs to be removed, otherwise it will be exposed when
  // current form item is removed, leading to incorrect semantics.
  [self deleteLegacyItemWithKey:key];
  return YES;
}

#pragma mark - Private methods for non-sharing keychain operations

- (nullable NSData *)itemWithQuery:(NSDictionary *)query error:(NSError **_Nullable)error {
  NSMutableDictionary *returningQuery = [query mutableCopy];
  returningQuery[(__bridge id)kSecReturnData] = @YES;
  returningQuery[(__bridge id)kSecReturnAttributes] = @YES;
  // Using a match limit of 2 means that we can check whether there is more than one item.
  // If we used a match limit of 1 we would never find out.
  returningQuery[(__bridge id)kSecMatchLimit] = @2;

  CFArrayRef result = NULL;
  OSStatus status =
      SecItemCopyMatching((__bridge CFDictionaryRef)returningQuery, (CFTypeRef *)&result);

  if (status == noErr && result != NULL) {
    NSArray *items = (__bridge_transfer NSArray *)result;
    if (items.count == 0) {
      if (error) {
        // The keychain query returned no error, but there were no items found.
        *error = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemCopyMatching" status:status];
      }
      return nil;
    } else if (items.count > 1) {
      // More than one keychain item was found, all but the first will be ignored.
      FIRLogWarning(
          kFIRLoggerAuth, @"I-AUT000005",
          @"Keychain query returned multiple results, all but the first will be ignored: %@",
          items);
    }

    if (error) {
      *error = nil;
    }
    // Return the non-legacy item.
    for (NSDictionary *item in items) {
      if (item[(__bridge NSString *)kSecAttrService] != nil) {
        return item[(__bridge id)kSecValueData];
      }
    }

    // If they were all legacy items, just return the first one.
    // This should not happen, since only one account should be
    // stored.
    return items[0][(__bridge id)kSecValueData];
  }

  if (status == errSecItemNotFound) {
    if (error) {
      *error = nil;
    }
  } else {
    if (error) {
      *error = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemCopyMatching" status:status];
    }
  }
  return nil;
}

- (BOOL)setItemWithQuery:(NSDictionary *)query
              attributes:(NSDictionary *)attributes
                   error:(NSError **_Nullable)error {
  NSMutableDictionary *combined = [attributes mutableCopy];
  [combined addEntriesFromDictionary:query];
  BOOL hasItem = NO;
  OSStatus status = SecItemAdd((__bridge CFDictionaryRef)combined, NULL);

  if (status == errSecDuplicateItem) {
    hasItem = YES;
    status = SecItemUpdate((__bridge CFDictionaryRef)query, (__bridge CFDictionaryRef)attributes);
  }

  if (status == noErr) {
    return YES;
  }
  if (error) {
    NSString *function = hasItem ? @"SecItemUpdate" : @"SecItemAdd";
    *error = [FIRAuthErrorUtils keychainErrorWithFunction:function status:status];
  }
  return NO;
}

- (BOOL)deleteItemWithQuery:(NSDictionary *)query error:(NSError **_Nullable)error {
  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);
  if (status == noErr || status == errSecItemNotFound) {
    return YES;
  }
  if (error) {
    *error = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemDelete" status:status];
  }
  return NO;
}

/** @fn deleteLegacyItemsWithKey:
    @brief Deletes legacy item from the keychain if it is not already known to be deleted.
    @param key The key for the item.
 */
- (void)deleteLegacyItemWithKey:(NSString *)key {
  if (_legacyEntryDeletedForKey[key]) {
    return;
  }
  NSDictionary *query = [self legacyGenericPasswordQueryWithKey:key];
  SecItemDelete((__bridge CFDictionaryRef)query);
  _legacyEntryDeletedForKey[key] = @YES;
}

/** @fn genericPasswordQueryWithKey:
    @brief Returns a keychain query of generic password to be used to manipulate key'ed value.
    @param key The key for the value being manipulated, used as the account field in the query.
 */
- (NSDictionary *)genericPasswordQueryWithKey:(NSString *)key {
  return @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount : [kAccountPrefix stringByAppendingString:key],
    (__bridge id)kSecAttrService : _service,
  };
}

/** @fn legacyGenericPasswordQueryWithKey:
    @brief Returns a keychain query of generic password without service field, which is used by
        previous version of this class.
    @param key The key for the value being manipulated, used as the account field in the query.
 */
- (NSDictionary *)legacyGenericPasswordQueryWithKey:(NSString *)key {
  return @{
    (__bridge id)kSecClass : (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount : key,
  };
}

#pragma mark - Private methods for shared keychain operations

- (nullable NSData *)getItemWithQuery:(NSDictionary *)query
                                error:(NSError *_Nullable *_Nullable)outError {
  NSMutableDictionary *mutableQuery = [query mutableCopy];

  mutableQuery[(__bridge id)kSecReturnData] = @YES;
  mutableQuery[(__bridge id)kSecReturnAttributes] = @YES;
  mutableQuery[(__bridge id)kSecMatchLimit] = @2;

  CFArrayRef result = NULL;
  OSStatus status =
      SecItemCopyMatching((__bridge CFDictionaryRef)mutableQuery, (CFTypeRef *)&result);

  if (status == noErr && result != NULL) {
    NSArray *items = (__bridge_transfer NSArray *)result;
    if (items.count != 1) {
      if (outError) {
        *outError = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemCopyMatching"
                                                          status:status];
      }
      return nil;
    }

    if (outError) {
      *outError = nil;
    }
    NSDictionary *item = items[0];
    return item[(__bridge id)kSecValueData];
  }

  if (status == errSecItemNotFound) {
    if (outError) {
      *outError = nil;
    }
  } else {
    if (outError) {
      *outError = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemCopyMatching"
                                                        status:status];
    }
  }
  return nil;
}

- (BOOL)setItem:(NSData *)item
      withQuery:(NSDictionary *)query
          error:(NSError *_Nullable *_Nullable)outError {
  NSData *existingItem = [self getItemWithQuery:query error:outError];
  if (outError && *outError) {
    return NO;
  }

  OSStatus status;
  if (!existingItem) {
    NSMutableDictionary *queryWithItem = [query mutableCopy];
    [queryWithItem setObject:item forKey:(__bridge id)kSecValueData];
    status = SecItemAdd((__bridge CFDictionaryRef)queryWithItem, NULL);
  } else {
    NSDictionary *attributes = @{(__bridge id)kSecValueData : item};
    status = SecItemUpdate((__bridge CFDictionaryRef)query, (__bridge CFDictionaryRef)attributes);
  }

  if (status == noErr) {
    if (outError) {
      *outError = nil;
    }
    return YES;
  }

  NSString *function = existingItem ? @"SecItemUpdate" : @"SecItemAdd";
  if (outError) {
    *outError = [FIRAuthErrorUtils keychainErrorWithFunction:function status:status];
  }
  return NO;
}

- (BOOL)removeItemWithQuery:(NSDictionary *)query error:(NSError *_Nullable *_Nullable)outError {
  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

  if (status == noErr || status == errSecItemNotFound) {
    if (outError) {
      *outError = nil;
    }
    return YES;
  }

  if (outError) {
    *outError = [FIRAuthErrorUtils keychainErrorWithFunction:@"SecItemDelete" status:status];
  }
  return NO;
}

@end

NS_ASSUME_NONNULL_END
