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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
    @brief The protocol for permanant data storage.
 */
@protocol FIRAuthStorage <NSObject>

/** @fn initWithService:
    @brief Initialize a @c FIRAuthStorage instance.
    @param service The name of the storage service to use.
    @return An initialized @c FIRAuthStorage instance for the specified service.
 */
- (id<FIRAuthStorage>)initWithService:(NSString *)service;

/** @fn dataForKey:error:
    @brief Gets the data for @c key in the storage. The key is set for the attribute
        @c kSecAttrAccount of a generic password query.
    @param key The key to use.
    @param error The address to store any error that occurs during the process, if not NULL.
        If the operation was successful, its content is set to @c nil .
    @return The data stored in the storage for @c key, if any.
 */
- (nullable NSData *)dataForKey:(NSString *)key error:(NSError **_Nullable)error;

/** @fn setData:forKey:error:
    @brief Sets the data for @c key in the storage. The key is set for the attribute
        @c kSecAttrAccount of a generic password query.
    @param data The data to store.
    @param key The key to use.
    @param error The address to store any error that occurs during the process, if not NULL.
    @return Whether the operation succeeded or not.
 */
- (BOOL)setData:(NSData *)data forKey:(NSString *)key error:(NSError **_Nullable)error;

/** @fn removeDataForKey:error:
    @brief Removes the data for @c key in the storage. The key is set for the attribute
        @c kSecAttrAccount of a generic password query.
    @param key The key to use.
    @param error The address to store any error that occurs during the process, if not NULL.
    @return Whether the operation succeeded or not.
 */
- (BOOL)removeDataForKey:(NSString *)key error:(NSError **_Nullable)error;

@end

/** @class FIRAuthKeychain
    @brief The utility class to manipulate data in iOS Keychain.
 */
@interface FIRAuthKeychainServices : NSObject <FIRAuthStorage>

/** @fn getItemWithQuery:error:
    @brief Get the item from keychain by given query.
    @param query The query to query the keychain.
    @param outError The address to store any error that occurs during the process, if not nil.
    @return The item of the given query. nil if not exsit.
 */
- (nullable NSData *)getItemWithQuery:(NSDictionary *)query
                                error:(NSError *_Nullable *_Nullable)outError;

/** @fn setItem:withQuery:error:
    @brief Set the item into keychain with given query.
    @param item The item to be added into keychain.
    @param query The query to query the keychain.
    @param outError The address to store any error that occurs during the process, if not nil.
    @return Whether the operation succeed.
 */
- (BOOL)setItem:(NSData *)item
      withQuery:(NSDictionary *)query
          error:(NSError *_Nullable *_Nullable)outError;

/** @fn getItemWithQuery:error:
    @brief Remove the item with given queryfrom keychain.
    @param query The query to query the keychain.
    @param outError The address to store any error that occurs during the process, if not nil.
    @return Whether the operation succeed.
 */
- (BOOL)removeItemWithQuery:(NSDictionary *)query error:(NSError *_Nullable *_Nullable)outError;

@end

NS_ASSUME_NONNULL_END
