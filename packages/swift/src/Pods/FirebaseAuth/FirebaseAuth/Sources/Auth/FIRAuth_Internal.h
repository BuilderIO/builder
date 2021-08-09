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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuth.h"
#import "FirebaseCore/Sources/Private/FIRLogger.h"
#import "Interop/Auth/Public/FIRAuthInterop.h"

@class FIRAuthRequestConfiguration;
@class FIRAuthURLPresenter;

#if TARGET_OS_IOS
@class FIRAuthAPNSTokenManager;
@class FIRAuthAppCredentialManager;
@class FIRAuthNotificationManager;
#endif

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuth () <FIRAuthInterop>

/** @property requestConfiguration
    @brief The configuration object comprising of paramters needed to make a request to Firebase
        Auth's backend.
 */
@property(nonatomic, copy, readonly) FIRAuthRequestConfiguration *requestConfiguration;

#if TARGET_OS_IOS

/** @property tokenManager
    @brief The manager for APNs tokens used by phone number auth.
 */
@property(nonatomic, strong, readonly) FIRAuthAPNSTokenManager *tokenManager;

/** @property appCredentailManager
    @brief The manager for app credentials used by phone number auth.
 */
@property(nonatomic, strong, readonly) FIRAuthAppCredentialManager *appCredentialManager;

/** @property notificationManager
    @brief The manager for remote notifications used by phone number auth.
 */
@property(nonatomic, strong, readonly) FIRAuthNotificationManager *notificationManager;

#endif  // TARGET_OS_IOS

/** @property authURLPresenter
    @brief An object that takes care of presenting URLs via the auth instance.
 */
@property(nonatomic, strong, readonly) FIRAuthURLPresenter *authURLPresenter;

/** @fn initWithAPIKey:appName:
    @brief Designated initializer.
    @param APIKey The Google Developers Console API key for making requests from your app.
    @param appName The name property of the previously created @c FIRApp instance.
 */
- (nullable instancetype)initWithAPIKey:(NSString *)APIKey
                                appName:(NSString *)appName NS_DESIGNATED_INITIALIZER;

/** @fn getUserID
    @brief Gets the identifier of the current user, if any.
    @return The identifier of the current user, or nil if there is no current user.
 */
- (nullable NSString *)getUserID;

/** @fn updateKeychainWithUser:error:
    @brief Updates the keychain for the given user.
    @param user The user to be updated.
    @param error The error caused the method to fail if the method returns NO.
    @return Whether updating keychain has succeeded or not.
    @remarks Called by @c FIRUser when user info or token changes occur.
 */
- (BOOL)updateKeychainWithUser:(FIRUser *)user error:(NSError *_Nullable *_Nullable)error;

/** @fn internalSignInWithCredential:callback:
    @brief Convenience method for @c internalSignInAndRetrieveDataWithCredential:callback:
        This method doesn't return additional identity provider data.
*/
- (void)internalSignInWithCredential:(FIRAuthCredential *)credential
                            callback:(FIRAuthResultCallback)callback;

/** @fn internalSignInAndRetrieveDataWithCredential:callback:
    @brief Asynchronously signs in Firebase with the given 3rd party credentials (e.g. a Facebook
        login Access Token, a Google ID Token/Access Token pair, etc.) and returns additional
        identity provider data.
    @param credential The credential supplied by the IdP.
    @param isReauthentication Indicates whether or not the current invocation originated from an
        attempt to reauthenticate.
    @param callback A block which is invoked when the sign in finishes (or is cancelled.) Invoked
        asynchronously on the auth global work queue in the future.
    @remarks This is the internal counterpart of this method, which uses a callback that does not
        update the current user.
 */
- (void)internalSignInAndRetrieveDataWithCredential:(FIRAuthCredential *)credential
                                 isReauthentication:(BOOL)isReauthentication
                                           callback:(nullable FIRAuthDataResultCallback)callback;

/** @fn signOutByForceWithUserID:error:
    @brief Signs out the current user.
    @param userID The ID of the user to force sign out.
    @param error An optional out parameter for error results.
    @return @YES when the sign out request was successful. @NO otherwise.
 */
- (BOOL)signOutByForceWithUserID:(NSString *)userID error:(NSError *_Nullable *_Nullable)error;

/** @fn completeSignInWithTokenService:callback:
    @brief Completes a sign-in flow once we have access and refresh tokens for the user.
    @param accessToken The STS access token.
    @param accessTokenExpirationDate The approximate expiration date of the access token.
    @param refreshToken The STS refresh token.
    @param anonymous Whether or not the user is anonymous.
    @param callback Called when the user has been signed in or when an error occurred. Invoked
        asynchronously on the global auth work queue in the future.
*/
- (void)completeSignInWithAccessToken:(nullable NSString *)accessToken
            accessTokenExpirationDate:(nullable NSDate *)accessTokenExpirationDate
                         refreshToken:(nullable NSString *)refreshToken
                            anonymous:(BOOL)anonymous
                             callback:(FIRAuthResultCallback)callback;

/** @fn signInFlowAuthResultCallbackByDecoratingCallback:
    @brief Creates a FIRAuthResultCallback block which wraps another FIRAuthResultCallback; trying
        to update the current user before forwarding it's invocations along to a subject block
    @param callback Called when the user has been updated or when an error has occurred. Invoked
        asynchronously on the main thread in the future.
    @return Returns a block that updates the current user.
    @remarks Typically invoked as part of the complete sign-in flow. For any other uses please
        consider alternative ways of updating the current user.
*/
- (FIRAuthDataResultCallback)signInFlowAuthDataResultCallbackByDecoratingCallback:
    (nullable FIRAuthDataResultCallback)callback;

@end

/// Logger Service String

extern FIRLoggerService kFIRLoggerAuth;

NS_ASSUME_NONNULL_END
