/*
 * Copyright 2019 Google
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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRUser.h"

#import "FirebaseAuth/Sources/Storage/FIRAuthKeychainServices.h"
#import "FirebaseAuth/Sources/Storage/FIRAuthUserDefaults.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthStoredUserManager : NSObject

/** @property keychain
    @brief The mediator object to access to the system Keychain services.
 */
@property(readonly, nonatomic, strong) FIRAuthKeychainServices *keychainServices;

/** @property userDefaults
    @brief The mediator object to access to the system User Defaults services.
 */
@property(readonly, nonatomic, strong) FIRAuthUserDefaults *userDefaults;

/** @fn init
    @brief The default initializer is disabled.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithServiceName:
    @brief The designated initializer.
    @param serviceName The service name to initialize with.
 */
- (instancetype)initWithServiceName:(NSString *)serviceName NS_DESIGNATED_INITIALIZER;

/** @fn getStoredUserAccessGroupWithError:
    @brief Get the user access group stored locally.
    @param outError Return value for any error which occurs.
 */
- (nullable NSString *)getStoredUserAccessGroupWithError:(NSError *_Nullable *_Nullable)outError;

/** @fn setStoredUserAccessGroup:error:
    @brief The setter of the user access group stored locally.
    @param accessGroup The access group to be set.
    @param outError Return value for any error which occurs.
 */
- (BOOL)setStoredUserAccessGroup:(NSString *_Nullable)accessGroup
                           error:(NSError *_Nullable *_Nullable)outError;

/** @fn getStoredUserForAccessGroup:projectID:error:
    @brief The getter of the user stored locally.
    @param accessGroup The access group to retrieve the user from.
    @param shareAuthStateAcrossDevices If true, the keychain will be synced across the end-user's
   iCloud.
    @param projectIdentifier An identifier of the project that the user associates with. Currently,
        we use API KEY.
    @param outError Return value for any error which occurs.
 */
- (nullable FIRUser *)getStoredUserForAccessGroup:(NSString *)accessGroup
                      shareAuthStateAcrossDevices:(BOOL)shareAuthStateAcrossDevices
                                projectIdentifier:(NSString *)projectIdentifier
                                            error:(NSError *_Nullable *_Nullable)outError;

/** @fn setStoredUser:forAccessGroup:projectID:error:
    @brief The setter of the user stored locally.
    @param user The user to be stored.
    @param accessGroup The access group to store the user in.
    @param shareAuthStateAcrossDevices If true, the keychain will be synced across the end-user's
   iCloud.
    @param projectIdentifier An identifier of the project that the user associates with. Currently,
        we use API KEY.
    @param outError Return value for any error which occurs.
 */
- (BOOL)setStoredUser:(FIRUser *)user
                 forAccessGroup:(NSString *)accessGroup
    shareAuthStateAcrossDevices:(BOOL)shareAuthStateAcrossDevices
              projectIdentifier:(NSString *)projectIdentifier
                          error:(NSError *_Nullable *_Nullable)outError;

/** @fn removeStoredUserForAccessGroup:projectID:error:
    @brief Remove the user that stored locally.
    @param accessGroup The access group to remove the user from.
    @param shareAuthStateAcrossDevices If true, the keychain will be synced across the end-user's
   iCloud.
    @param projectIdentifier An identifier of the project that the user associates with. Currently,
        we use API KEY.
    @param outError Return value for any error which occurs.
 */
- (BOOL)removeStoredUserForAccessGroup:(NSString *)accessGroup
           shareAuthStateAcrossDevices:(BOOL)shareAuthStateAcrossDevices
                     projectIdentifier:(NSString *)projectIdentifier
                                 error:(NSError *_Nullable *_Nullable)outError;

@end

NS_ASSUME_NONNULL_END
