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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRUser.h"

@class FIRAuth;
@class FIRAuthRequestConfiguration;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRRetrieveUserCallback
    @brief The type of block that is invoked when the construction of a user succeeds or fails.
    @param user The user that was constructed, or nil if user construction failed.
    @param error The error which occurred, or nil if the request was successful.
 */
typedef void (^FIRRetrieveUserCallback)(FIRUser *_Nullable user, NSError *_Nullable error);

/** @typedef FIRVerifyBeforeUpdateEmailCallback
    @brief The type of block called when a request to verify before update email has finished.
    @param error Optionally; the error which occurred - or nil if the request was successful.
 */
typedef void (^FIRVerifyBeforeUpdateEmailCallback)(NSError *_Nullable error);

@interface FIRUser () <NSSecureCoding>

/** @property rawAccessToken
    @brief The cached access token.
    @remarks This method is specifically for providing the access token to internal clients during
        deserialization and sign-in events, and should not be used to retrieve the access token by
        anyone else.
 */
@property(nonatomic, copy, readonly) NSString *rawAccessToken;

/** @property auth
    @brief A weak reference to a FIRAuth instance associated with this instance.
 */
@property(nonatomic, weak) FIRAuth *auth;

/** @property auth
    @brief A strong reference to a requestConfiguration instance associated with this user instance.
 */
@property(nonatomic, strong) FIRAuthRequestConfiguration *requestConfiguration;

/** @var accessTokenExpirationDate
    @brief The expiration date of the cached access token.
 */
@property(nonatomic, copy, readonly) NSDate *accessTokenExpirationDate;

/** @fn retrieveUserWithAuth:accessToken:accessTokenExpirationDate:refreshToken:callback:
    @brief Constructs a user with Secure Token Service tokens, and obtains user details from the
        getAccountInfo endpoint.
    @param auth The associated FIRAuth instance.
    @param accessToken The Secure Token Service access token.
    @param accessTokenExpirationDate The approximate expiration date of the access token.
    @param refreshToken The Secure Token Service refresh token.
    @param anonymous Whether or not the user is anonymous.
    @param callback A block which is invoked when the construction succeeds or fails. Invoked
        asynchronously on the auth global work queue in the future.
 */
+ (void)retrieveUserWithAuth:(FIRAuth *)auth
                  accessToken:(nullable NSString *)accessToken
    accessTokenExpirationDate:(nullable NSDate *)accessTokenExpirationDate
                 refreshToken:(nullable NSString *)refreshToken
                    anonymous:(BOOL)anonymous
                     callback:(FIRRetrieveUserCallback)callback;

/** @fn internalGetTokenForcingRefresh:callback:
    @brief Retrieves the Firebase authentication token, possibly refreshing it if it has expired.
    @param forceRefresh Forces a token refresh. Useful if the token becomes invalid for some reason
        other than an expiration.
    @param callback The block to invoke when the token is available. Invoked asynchronously on the
        global work thread in the future.
 */
- (void)internalGetTokenForcingRefresh:(BOOL)forceRefresh
                              callback:(nonnull FIRAuthTokenCallback)callback;

/** @fn internalVerifyBeforeUpdateEmailWithNewEmail:actionCodeSettings:callback:
    @brief Sends a verification email to newEmail. Upon redemption of the link in the email,
        this user's email will be changed to newEmail and that email will be marked verified.
    @param newEmail the user's new email.
    @param actionCodeSettings the optional FIRActionCodeSettings object to allow linking back
        to your app in the email.
    @param completion The block to invoke when the call succeeds or fails. Invoked asynchronously on
        the global work thread in the future.

 */
- (void)internalVerifyBeforeUpdateEmailWithNewEmail:(NSString *)newEmail
                                 actionCodeSettings:
                                     (nullable FIRActionCodeSettings *)actionCodeSettings
                                         completion:(FIRVerifyBeforeUpdateEmailCallback)completion;

@end

NS_ASSUME_NONNULL_END
