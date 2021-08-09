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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

@class FIRActionCodeSettings;

NS_ASSUME_NONNULL_BEGIN

/** @enum FIRGetOOBConfirmationCodeRequestType
    @brief Types of OOB Confirmation Code requests.
 */
typedef NS_ENUM(NSInteger, FIRGetOOBConfirmationCodeRequestType) {
  /** @var FIRGetOOBConfirmationCodeRequestTypePasswordReset
      @brief Requests a password reset code.
   */
  FIRGetOOBConfirmationCodeRequestTypePasswordReset,

  /** @var FIRGetOOBConfirmationCodeRequestTypeVerifyEmail
      @brief Requests an email verification code.
   */
  FIRGetOOBConfirmationCodeRequestTypeVerifyEmail,

  /** @var FIRGetOOBConfirmationCodeRequestTypeEmailLink
      @brief Requests an email sign-in link.
   */
  FIRGetOOBConfirmationCodeRequestTypeEmailLink,

  /** @var FIRGetOOBConfirmationCodeRequestTypeVerifyBeforeUpdateEmail
      @brief Requests an verify before update email.
   */
  FIRGetOOBConfirmationCodeRequestTypeVerifyBeforeUpdateEmail,
};

/** @enum FIRGetOOBConfirmationCodeRequest
    @brief Represents the parameters for the getOOBConfirmationCode endpoint.
 */
@interface FIRGetOOBConfirmationCodeRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property requestType
    @brief The types of OOB Confirmation Code to request.
 */
@property(nonatomic, assign, readonly) FIRGetOOBConfirmationCodeRequestType requestType;

/** @property email
    @brief The email of the user.
    @remarks For password reset.
 */
@property(nonatomic, copy, nullable, readonly) NSString *email;

/** @property updatedEmail
    @brief The new email to be updated.
    @remarks For verifyBeforeUpdateEmail.
 */
@property(nonatomic, copy, nullable, readonly) NSString *updatedEmail;

/** @property accessToken
    @brief The STS Access Token of the authenticated user.
    @remarks For email change.
 */
@property(nonatomic, copy, nullable, readonly) NSString *accessToken;

/** @property continueURL
    @brief This URL represents the state/Continue URL in the form of a universal link.
 */
@property(nonatomic, copy, nullable, readonly) NSString *continueURL;

/** @property iOSBundleID
    @brief The iOS bundle Identifier, if available.
 */
@property(nonatomic, copy, nullable, readonly) NSString *iOSBundleID;

/** @property androidPackageName
    @brief The Android package name, if available.
 */
@property(nonatomic, copy, nullable, readonly) NSString *androidPackageName;

/** @property androidMinimumVersion
    @brief The minimum Android version supported, if available.
 */
@property(nonatomic, copy, nullable, readonly) NSString *androidMinimumVersion;

/** @property androidInstallIfNotAvailable
    @brief Indicates whether or not the Android app should be installed if not already available.
 */
@property(nonatomic, assign, readonly) BOOL androidInstallApp;

/** @property handleCodeInApp
    @brief Indicates whether the action code link will open the app directly or after being
        redirected from a Firebase owned web widget.
 */
@property(assign, nonatomic) BOOL handleCodeInApp;

/** @property dynamicLinkDomain
    @brief The Firebase Dynamic Link domain used for out of band code flow.
 */
@property(copy, nonatomic, nullable) NSString *dynamicLinkDomain;

/** @fn passwordResetRequestWithEmail:actionCodeSettings:requestConfiguration:
    @brief Creates a password reset request.
    @param email The user's email address.
    @param actionCodeSettings An object of FIRActionCodeSettings which specifies action code
        settings to be applied to the password reset request.
    @param requestConfiguration An object containing configurations to be added to the request.
    @return A password reset request.
 */
+ (nullable FIRGetOOBConfirmationCodeRequest *)
    passwordResetRequestWithEmail:(NSString *)email
               actionCodeSettings:(nullable FIRActionCodeSettings *)actionCodeSettings
             requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn verifyEmailRequestWithAccessToken:actionCodeSettings:requestConfiguration:
    @brief Creates a password reset request.
    @param accessToken The user's STS Access Token.
    @param actionCodeSettings An object of FIRActionCodeSettings which specifies action code
        settings to be applied to the email verification request.
    @param requestConfiguration An object containing configurations to be added to the request.
    @return A password reset request.
 */
+ (nullable FIRGetOOBConfirmationCodeRequest *)
    verifyEmailRequestWithAccessToken:(NSString *)accessToken
                   actionCodeSettings:(nullable FIRActionCodeSettings *)actionCodeSettings
                 requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn signInWithEmailLinkRequest:actionCodeSettings:requestConfiguration:
    @brief Creates a sign-in with email link.
    @param email The user's email address.
    @param actionCodeSettings An object of FIRActionCodeSettings which specifies action code
        settings to be applied to the email sign-in link.
    @param requestConfiguration An object containing configurations to be added to the request.
    @return An email sign-in link request.
 */
+ (nullable FIRGetOOBConfirmationCodeRequest *)
    signInWithEmailLinkRequest:(NSString *)email
            actionCodeSettings:(nullable FIRActionCodeSettings *)actionCodeSettings
          requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn verifyBeforeUpdateEmailWithAccessToken:newEmail:actionCodeSettings:requestConfiguration:
    @brief Creates a verifyBeforeUpdateEmail request.
    @param accessToken The user's STS Access Token.
    @param newEmail The user's email address to be updated.
    @param actionCodeSettings An object of FIRActionCodeSettings which specifies action code
        settings to be applied to the password reset request.
    @param requestConfiguration An object containing configurations to be added to the request.
    @return A verifyBeforeUpdateEmail request.
 */
+ (nullable FIRGetOOBConfirmationCodeRequest *)
    verifyBeforeUpdateEmailWithAccessToken:(NSString *)accessToken
                                  newEmail:(NSString *)newEmail
                        actionCodeSettings:(nullable FIRActionCodeSettings *)actionCodeSettings
                      requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

/** @fn init
    @brief Please use a factory method.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
