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

#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthCredential.h"

#import "FirebaseAuth/Sources/MultiFactor/FIRMultiFactorResolver+Internal.h"

NS_ASSUME_NONNULL_BEGIN

NSString *const FIRAuthErrorDomain = @"FIRAuthErrorDomain";

NSString *const FIRAuthInternalErrorDomain = @"FIRAuthInternalErrorDomain";

NSString *const FIRAuthErrorUserInfoDeserializedResponseKey =
    @"FIRAuthErrorUserInfoDeserializedResponseKey";

NSString *const FIRAuthErrorUserInfoDataKey = @"FIRAuthErrorUserInfoDataKey";

NSString *const FIRAuthErrorUserInfoEmailKey = @"FIRAuthErrorUserInfoEmailKey";

NSString *const FIRAuthErrorUserInfoUpdatedCredentialKey =
    @"FIRAuthErrorUserInfoUpdatedCredentialKey";

NSString *const FIRAuthErrorUserInfoNameKey = @"FIRAuthErrorUserInfoNameKey";

NSString *const FIRAuthErrorUserInfoMultiFactorResolverKey =
    @"FIRAuthErrorUserInfoMultiFactorResolverKey";

/** @var kServerErrorDetailMarker
    @brief This marker indicates that the server error message contains a detail error message which
        should be used instead of the hardcoded client error message.
 */
static NSString *const kServerErrorDetailMarker = @" : ";

#pragma mark - URL response error codes

/** @var kURLResponseErrorCodeInvalidClientID
    @brief Error code that indicates that the client ID provided was invalid.
 */
static NSString *const kURLResponseErrorCodeInvalidClientID = @"auth/invalid-oauth-client-id";

/** @var kURLResponseErrorCodeNetworkRequestFailed
    @brief Error code that indicates that a network request within the SFSafariViewController or
        WKWebView failed.
 */
static NSString *const kURLResponseErrorCodeNetworkRequestFailed = @"auth/network-request-failed";

/** @var kURLResponseErrorCodeInternalError
    @brief Error code that indicates that an internal error occurred within the
        SFSafariViewController or WKWebView failed.
 */
static NSString *const kURLResponseErrorCodeInternalError = @"auth/internal-error";

#pragma mark - Standard Error Messages

/** @var kFIRAuthErrorMessageInvalidCustomToken
    @brief Message for @c FIRAuthErrorCodeInvalidCustomToken error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidCustomToken =
    @"The custom token format is "
     "incorrect. Please check the documentation.";

/** @var kFIRAuthErrorMessageCustomTokenMismatch
    @brief Message for @c FIRAuthErrorCodeCustomTokenMismatch error code.
 */
static NSString *const kFIRAuthErrorMessageCustomTokenMismatch = @"The custom token corresponds to "
                                                                  "a different audience.";

/** @var kFIRAuthErrorMessageInvalidEmail
    @brief Message for @c FIRAuthErrorCodeInvalidEmail error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidEmail = @"The email address is badly formatted.";

/** @var kFIRAuthErrorMessageInvalidCredential
    @brief Message for @c FIRAuthErrorCodeInvalidCredential error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidCredential = @"The supplied auth credential is "
                                                                "malformed or has expired.";

/** @var kFIRAuthErrorMessageUserDisabled
    @brief Message for @c FIRAuthErrorCodeUserDisabled error code.
 */
static NSString *const kFIRAuthErrorMessageUserDisabled = @"The user account has been disabled by "
                                                           "an administrator.";

/** @var kFIRAuthErrorMessageEmailAlreadyInUse
    @brief Message for @c FIRAuthErrorCodeEmailAlreadyInUse error code.
 */
static NSString *const kFIRAuthErrorMessageEmailAlreadyInUse = @"The email address is already in "
                                                                "use by another account.";

/** @var kFIRAuthErrorMessageWrongPassword
    @brief Message for @c FIRAuthErrorCodeWrongPassword error code.
 */
static NSString *const kFIRAuthErrorMessageWrongPassword = @"The password is invalid or the user "
                                                            "does not have a password.";

/** @var kFIRAuthErrorMessageTooManyRequests
    @brief Message for @c FIRAuthErrorCodeTooManyRequests error code.
 */
static NSString *const kFIRAuthErrorMessageTooManyRequests =
    @"We have blocked all requests from "
     "this device due to unusual activity. Try again later.";

/** @var kFIRAuthErrorMessageAccountExistsWithDifferentCredential
    @brief Message for @c FIRAuthErrorCodeAccountExistsWithDifferentCredential error code.
 */
static NSString *const kFIRAuthErrorMessageAccountExistsWithDifferentCredential =
    @"An account "
     "already exists with the same email address but different sign-in credentials. Sign in using "
     "a "
     "provider associated with this email address.";

/** @var kFIRAuthErrorMessageRequiresRecentLogin
    @brief Message for @c FIRAuthErrorCodeRequiresRecentLogin error code.
 */
static NSString *const kFIRAuthErrorMessageRequiresRecentLogin =
    @"This operation is sensitive and "
     "requires recent authentication. Log in again before retrying this request.";

/** @var kFIRAuthErrorMessageProviderAlreadyLinked
    @brief Message for @c FIRAuthErrorCodeProviderAlreadyExists error code.
 */
static NSString *const kFIRAuthErrorMessageProviderAlreadyLinked =
    @"[ERROR_PROVIDER_ALREADY_LINKED] - User can only be linked to one identity for the given "
     "provider.";

/** @var kFIRAuthErrorMessageNoSuchProvider
    @brief Message for @c FIRAuthErrorCodeNoSuchProvider error code.
 */
static NSString *const kFIRAuthErrorMessageNoSuchProvider = @"User was not linked to an account "
                                                             "with the given provider.";

/** @var kFIRAuthErrorMessageInvalidUserToken
    @brief Message for @c FIRAuthErrorCodeInvalidUserToken error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidUserToken =
    @"This user's credential isn't valid "
     "for this project. This can happen if the user's token has been tampered with, or if the user "
     "doesn’t belong to the project associated with the API key used in your request.";

/** @var kFIRAuthErrorMessageNetworkError
    @brief Message for @c FIRAuthErrorCodeNetworkError error code.
 */
static NSString *const kFIRAuthErrorMessageNetworkError =
    @"Network error (such as timeout, "
     "interrupted connection or unreachable host) has occurred.";

/** @var kFIRAuthErrorMessageKeychainError
    @brief Message for @c FIRAuthErrorCodeKeychainError error code.
 */
static NSString *const kFIRAuthErrorMessageKeychainError =
    @"An error occurred when accessing the "
     "keychain. The NSLocalizedFailureReasonErrorKey field in the NSError.userInfo dictionary "
     "will contain more information about the error encountered";

/** @var kFIRAuthErrorMessageMissingClientIdentifier
    @brief Message for @c FIRAuthErrorCodeMissingClientIdentifier error code.
 */
static NSString *const kFIRAuthErrorMessageMissingClientIdentifier =
    @"The request does not contain "
     "any client identifier.";

/** @var kFIRAuthErrorMessageUserTokenExpired
    @brief Message for @c FIRAuthErrorCodeTokenExpired error code.
 */
static NSString *const kFIRAuthErrorMessageUserTokenExpired =
    @"The user's credential is no longer "
     "valid. The user must sign in again.";

/** @var kFIRAuthErrorMessageUserNotFound
    @brief Message for @c FIRAuthErrorCodeUserNotFound error code.
 */
static NSString *const kFIRAuthErrorMessageUserNotFound =
    @"There is no user record corresponding "
     "to this identifier. The user may have been deleted.";

/** @var kFIRAuthErrorMessageInvalidAPIKey
    @brief Message for @c FIRAuthErrorCodeInvalidAPIKey error code.
    @remarks This error is not thrown by the server.
 */
static NSString *const kFIRAuthErrorMessageInvalidAPIKey = @"An invalid API Key was supplied in "
                                                            "the request.";

/** @var kFIRAuthErrorMessageUserMismatch.
    @brief Message for @c FIRAuthErrorCodeInvalidAPIKey error code.
 */
static NSString *const FIRAuthErrorMessageUserMismatch =
    @"The supplied credentials do not "
     "correspond to the previously signed in user.";

/** @var kFIRAuthErrorMessageCredentialAlreadyInUse
    @brief Message for @c FIRAuthErrorCodeCredentialAlreadyInUse error code.
 */
static NSString *const kFIRAuthErrorMessageCredentialAlreadyInUse =
    @"This credential is already "
     "associated with a different user account.";

/** @var kFIRAuthErrorMessageOperationNotAllowed
    @brief Message for @c FIRAuthErrorCodeOperationNotAllowed error code.
 */
static NSString *const kFIRAuthErrorMessageOperationNotAllowed =
    @"The given sign-in provider is "
     "disabled for this Firebase project. Enable it in the Firebase console, under the sign-in "
     "method tab of the Auth section.";

/** @var kFIRAuthErrorMessageWeakPassword
    @brief Message for @c FIRAuthErrorCodeWeakPassword error code.
 */
static NSString *const kFIRAuthErrorMessageWeakPassword = @"The password must be 6 characters long "
                                                           "or more.";

/** @var kFIRAuthErrorMessageAppNotAuthorized
    @brief Message for @c FIRAuthErrorCodeAppNotAuthorized error code.
 */
static NSString *const kFIRAuthErrorMessageAppNotAuthorized =
    @"This app is not authorized to use "
     "Firebase Authentication with the provided API key. Review your key configuration in the "
     "Google API console and ensure that it accepts requests from your app's bundle ID.";

/** @var kFIRAuthErrorMessageExpiredActionCode
    @brief Message for @c FIRAuthErrorCodeExpiredActionCode error code.
 */
static NSString *const kFIRAuthErrorMessageExpiredActionCode = @"The action code has expired.";

/** @var kFIRAuthErrorMessageInvalidActionCode
    @brief Message for @c FIRAuthErrorCodeInvalidActionCode error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidActionCode =
    @"The action code is invalid. This "
     "can happen if the code is malformed, expired, or has already been used.";

/** @var kFIRAuthErrorMessageInvalidMessagePayload
    @brief Message for @c FIRAuthErrorCodeInvalidMessagePayload error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidMessagePayload =
    @"The action code is invalid. "
     "This can happen if the code is malformed, expired, or has already been used.";

/** @var kFIRAuthErrorMessageInvalidSender
    @brief Message for @c FIRAuthErrorCodeInvalidSender error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidSender =
    @"The email template corresponding to "
     "this action contains invalid characters in its message. Please fix by going to the Auth "
     "email "
     "templates section in the Firebase Console.";

/** @var kFIRAuthErrorMessageInvalidRecipientEmail
    @brief Message for @c FIRAuthErrorCodeInvalidRecipient error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidRecipientEmail =
    @"The action code is invalid. "
     "This can happen if the code is malformed, expired, or has already been used.";

/** @var kFIRAuthErrorMessageMissingIosBundleID
    @brief Message for @c FIRAuthErrorCodeMissingIosbundleID error code.
 */
static NSString *const kFIRAuthErrorMessageMissingIosBundleID =
    @"An iOS Bundle ID must be provided if an App Store ID is provided.";

/** @var kFIRAuthErrorMessageMissingAndroidPackageName
    @brief Message for @c FIRAuthErrorCodeMissingAndroidPackageName error code.
 */
static NSString *const kFIRAuthErrorMessageMissingAndroidPackageName =
    @"An Android Package Name must be provided if the Android App is required to be installed.";

/** @var kFIRAuthErrorMessageUnauthorizedDomain
    @brief Message for @c FIRAuthErrorCodeUnauthorizedDomain error code.
 */
static NSString *const kFIRAuthErrorMessageUnauthorizedDomain =
    @"The domain of the continue URL "
     "is not allowlisted. Please allowlist the domain in the Firebase console.";

/** @var kFIRAuthErrorMessageInvalidContinueURI
    @brief Message for @c FIRAuthErrorCodeInvalidContinueURI error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidContinueURI =
    @"The continue URL provided in the request is invalid.";

/** @var kFIRAuthErrorMessageMissingEmail
    @brief Message for @c FIRAuthErrorCodeMissingEmail error code.
 */
static NSString *const kFIRAuthErrorMessageMissingEmail = @"An email address must be provided.";

/** @var kFIRAuthErrorMessageMissingContinueURI
    @brief Message for @c FIRAuthErrorCodeMissingContinueURI error code.
 */
static NSString *const kFIRAuthErrorMessageMissingContinueURI =
    @"A continue URL must be provided in the request.";

/** @var kFIRAuthErrorMessageMissingPhoneNumber
    @brief Message for @c FIRAuthErrorCodeMissingPhoneNumber error code.
 */
static NSString *const kFIRAuthErrorMessageMissingPhoneNumber =
    @"To send verification codes, provide a phone number for the recipient.";

/** @var kFIRAuthErrorMessageInvalidPhoneNumber
    @brief Message for @c FIRAuthErrorCodeInvalidPhoneNumber error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidPhoneNumber =
    @"The format of the phone number provided is incorrect. Please enter the phone number in a "
     "format that can be parsed into E.164 format. E.164 phone numbers are written in the format "
     "[+][country code][subscriber number including area code].";

/** @var kFIRAuthErrorMessageMissingVerificationCode
    @brief Message for @c FIRAuthErrorCodeMissingVerificationCode error code.
 */
static NSString *const kFIRAuthErrorMessageMissingVerificationCode =
    @"The phone auth credential was created with an empty SMS verification Code.";

/** @var kFIRAuthErrorMessageInvalidVerificationCode
    @brief Message for @c FIRAuthErrorCodeInvalidVerificationCode error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidVerificationCode =
    @"The SMS verification code used to create the phone auth credential is invalid. Please resend "
     "the verification code SMS and be sure to use the verification code provided by the user.";

/** @var kFIRAuthErrorMessageMissingVerificationID
    @brief Message for @c FIRAuthErrorCodeInvalidVerificationID error code.
 */
static NSString *const kFIRAuthErrorMessageMissingVerificationID =
    @"The phone auth credential was created with an empty verification ID.";

/** @var kFIRAuthErrorMessageInvalidVerificationID
    @brief Message for @c FIRAuthErrorCodeInvalidVerificationID error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidVerificationID =
    @"The verification ID used to create the phone auth credential is invalid.";

/** @var kFIRAuthErrorMessageLocalPlayerNotAuthenticated
    @brief Message for @c FIRAuthErrorCodeLocalPlayerNotAuthenticated error code.
 */
static NSString *const kFIRAuthErrorMessageLocalPlayerNotAuthenticated =
    @"The local player is not authenticated. Please log the local player in to Game Center.";

/** @var kFIRAuthErrorMessageGameKitNotLinked
    @brief Message for @c kFIRAuthErrorMessageGameKitNotLinked error code.
 */
static NSString *const kFIRAuthErrorMessageGameKitNotLinked =
    @"The GameKit framework is not linked. Please turn on the Game Center capability.";

/** @var kFIRAuthErrorMessageSessionExpired
    @brief Message for @c FIRAuthErrorCodeSessionExpired error code.
 */
static NSString *const kFIRAuthErrorMessageSessionExpired =
    @"The SMS code has expired. Please "
    @"re-send the verification code to try again.";

/** @var kFIRAuthErrorMessageMissingAppCredential
    @brief Message for @c FIRAuthErrorCodeMissingAppCredential error code.
 */
static NSString *const kFIRAuthErrorMessageMissingAppCredential =
    @"The phone verification request "
     "is missing an APNs Device token. Firebase Auth automatically detects APNs Device Tokens, "
     "however, if method swizzling is disabled, the APNs token must be set via the APNSToken "
     "property on FIRAuth or by calling setAPNSToken:type on FIRAuth.";

/** @var kFIRAuthErrorMessageInvalidAppCredential
    @brief Message for @c FIRAuthErrorCodeInvalidAppCredential error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidAppCredential =
    @"The APNs device token provided "
     "is either incorrect or does not match the private certificate uploaded to the Firebase "
     "Console.";

/** @var kFIRAuthErrorMessageQuotaExceeded
    @brief Message for @c FIRAuthErrorCodeQuotaExceeded error code.
 */
static NSString *const kFIRAuthErrorMessageQuotaExceeded = @"The quota for this operation "
                                                            "has been exceeded.";

/** @var kFIRAuthErrorMessageMissingAppToken
    @brief Message for @c FIRAuthErrorCodeMissingAppToken error code.
 */
static NSString *const kFIRAuthErrorMessageMissingAppToken =
    @"There seems to be a problem with "
     "your project's Firebase phone number authentication set-up, please make sure to follow the "
     "instructions found at https://firebase.google.com/docs/auth/ios/phone-auth";

/** @var kFIRAuthErrorMessageMissingAppToken
    @brief Message for @c FIRAuthErrorCodeMissingAppToken error code.
 */
static NSString *const kFIRAuthErrorMessageNotificationNotForwarded =
    @"If app delegate swizzling "
     "is disabled, remote notifications received by UIApplicationDelegate need to be forwarded to "
     "FIRAuth's canHandleNotificaton: method.";

/** @var kFIRAuthErrorMessageAppNotVerified
    @brief Message for @c FIRAuthErrorCodeMissingAppToken error code.
 */
static NSString *const kFIRAuthErrorMessageAppNotVerified =
    @"Firebase could not retrieve the "
     "silent push notification and therefore could not verify your app. Ensure that you configured "
     "your app correctly to receive push notifications.";

/** @var kFIRAuthErrorMessageCaptchaCheckFailed
    @brief Message for @c FIRAuthErrorCodeCaptchaCheckFailed error code.
 */
static NSString *const kFIRAuthErrorMessageCaptchaCheckFailed =
    @"The reCAPTCHA response token "
     "provided is either invalid, expired or already";

/** @var kFIRAuthErrorMessageWebContextAlreadyPresented
    @brief Message for @c FIRAuthErrorCodeWebContextAlreadyPresented error code.
 */
static NSString *const kFIRAuthErrorMessageWebContextAlreadyPresented =
    @"User interaction is "
     "still ongoing, another view cannot be presented.";

/** @var kFIRAuthErrorMessageWebContextCancelled
    @brief Message for @c FIRAuthErrorCodeWebContextCancelled error code.
 */
static NSString *const kFIRAuthErrorMessageWebContextCancelled = @"The interaction was cancelled "
                                                                  "by the user.";

/** @var kFIRAuthErrorMessageInvalidClientID
    @brief Message for @c FIRAuthErrorCodeInvalidClientID error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidClientID =
    @"The OAuth client ID provided is "
     "either invalid or does not match the specified API key.";

/** @var kFIRAuthErrorMessageWebRequestFailed
    @brief Message for @c FIRAuthErrorCodeWebRequestFailed error code.
 */
static NSString *const kFIRAuthErrorMessageWebRequestFailed =
    @"A network error (such as timeout, "
     "interrupted connection, or unreachable host) has occurred within the web context.";

/** @var kFIRAuthErrorMessageWebInternalError
    @brief Message for @c FIRAuthErrorCodeWebInternalError error code.
 */
static NSString *const kFIRAuthErrorMessageWebInternalError =
    @"An internal error has occurred "
     "within the SFSafariViewController or WKWebView.";

/** @var kFIRAuthErrorMessageAppVerificationUserInteractionFailure
    @brief Message for @c FIRAuthErrorCodeInvalidClientID error code.
 */
static NSString *const kFIRAuthErrorMessageAppVerificationUserInteractionFailure =
    @"The app "
     "verification process has failed, print and inspect the error details for more information";

/** @var kFIRAuthErrorMessageNullUser
    @brief Message for @c FIRAuthErrorCodeNullUser error code.
 */
static NSString *const kFIRAuthErrorMessageNullUser =
    @"A null user object was provided as the "
     "argument for an operation which requires a non-null user object.";

/** @var kFIRAuthErrorMessageInvalidProviderID
    @brief Message for @c FIRAuthErrorCodeInvalidProviderID error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidProviderID =
    @"The provider ID provided for the "
     "attempted web operation is invalid.";

/** @var kFIRAuthErrorMessageInvalidDynamicLinkDomain
    @brief Message for @c kFIRAuthErrorMessageInvalidDynamicLinkDomain error code.
 */
static NSString *const kFIRAuthErrorMessageInvalidDynamicLinkDomain =
    @"The "
     "Firebase Dynamic Link domain used is either not configured or is unauthorized "
     "for the current project.";

/** @var kFIRAuthErrorMessageInternalError
    @brief Message for @c FIRAuthErrorCodeInternalError error code.
 */
static NSString *const kFIRAuthErrorMessageInternalError =
    @"An internal error has occurred, "
     "print and inspect the error details for more information.";

/** @var kFIRAuthErrorMessageMalformedJWT
    @brief Error message constant describing @c FIRAuthErrorCodeMalformedJWT errors.
 */
static NSString *const kFIRAuthErrorMessageMalformedJWT =
    @"Failed to parse JWT. Check the userInfo dictionary for the full token.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const kFIRAuthErrorMessageSecondFactorRequired =
    @"Please complete a second factor challenge to finish signing into this account.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageMissingMultiFactorSession =
    @"The request is missing proof of first factor successful sign-in.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageMissingMultiFactorInfo =
    @"No second factor identifier is provided.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageInvalidMultiFactorSession =
    @"The request does not contain a valid proof of first factor successful sign-in.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageMultiFactorInfoNotFound =
    @"The user does not have a second factor matching the identifier provided.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageAdminRestrictedOperation =
    @"This operation is restricted to administrators only.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageUnverifiedEmail =
    @"The operation requires a verified email.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageSecondFactorAlreadyEnrolled =
    @"The second factor is already enrolled on this account.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageMaximumSecondFactorCountExceeded =
    @"The maximum allowed number of second factors on a user has been exceeded.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageUnsupportedFirstFactor =
    @"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a "
    @"supported first factor.";

/** @var kFIRAuthErrorMessageSecondFactorRequired
    @brief Message for @c kFIRAuthErrorMessageSecondFactorRequired error code.
 */
static NSString *const FIRAuthErrorMessageEmailChangeNeedsVerification =
    @"Multi-factor users must always have a verified email.";

/** @var kFIRAuthErrorMessageDynamicLinkNotActivated
    @brief Error message constant describing @c FIRAuthErrorCodeDynamicLinkNotActivated errors.
 */
static NSString *const kFIRAuthErrorMessageDynamicLinkNotActivated =
    @"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.";

/** @var kFIRAuthErrorMessageRejectedCredential
    @brief Error message constant describing @c FIRAuthErrorCodeRejectedCredential errors.
 */
static NSString *const kFIRAuthErrorMessageRejectedCredential =
    @"The request contains malformed or mismatching credentials.";

/** @var kFIRAuthErrorMessageMissingOrInvalidNonce
    @brief Error message constant describing @c FIRAuthErrorCodeMissingOrInvalidNonce errors.
 */
static NSString *const kFIRAuthErrorMessageMissingOrInvalidNonce =
    @"The request contains malformed or mismatched credentials.";

/** @var kFIRAuthErrorMessageTenantIDMismatch.
    @brief Message for @c FIRAuthErrorCodeTenantIDMismatch error code.
 */
static NSString *const kFIRAuthErrorMessageTenantIDMismatch =
    @"The provided user's tenant ID does"
     "not match the Auth instance's tenant ID.";

/** @var kFIRAuthErrorMessageUnsupportedTenantOperation
    @brief Message for @c FIRAuthErrorCodeUnsupportedTenantOperation error code.
 */
static NSString *const kFIRAuthErrorMessageUnsupportedTenantOperation =
    @"This operation is not"
     "supported in a multi-tenant context.";

/** @var FIRAuthErrorDescription
    @brief The error descrioption, based on the error code.
    @remarks No default case so that we get a compiler warning if a new value was added to the enum.
 */
static NSString *FIRAuthErrorDescription(FIRAuthErrorCode code) {
  switch (code) {
    case FIRAuthErrorCodeInvalidCustomToken:
      return kFIRAuthErrorMessageInvalidCustomToken;
    case FIRAuthErrorCodeCustomTokenMismatch:
      return kFIRAuthErrorMessageCustomTokenMismatch;
    case FIRAuthErrorCodeInvalidEmail:
      return kFIRAuthErrorMessageInvalidEmail;
    case FIRAuthErrorCodeInvalidCredential:
      return kFIRAuthErrorMessageInvalidCredential;
    case FIRAuthErrorCodeUserDisabled:
      return kFIRAuthErrorMessageUserDisabled;
    case FIRAuthErrorCodeEmailAlreadyInUse:
      return kFIRAuthErrorMessageEmailAlreadyInUse;
    case FIRAuthErrorCodeWrongPassword:
      return kFIRAuthErrorMessageWrongPassword;
    case FIRAuthErrorCodeTooManyRequests:
      return kFIRAuthErrorMessageTooManyRequests;
    case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
      return kFIRAuthErrorMessageAccountExistsWithDifferentCredential;
    case FIRAuthErrorCodeRequiresRecentLogin:
      return kFIRAuthErrorMessageRequiresRecentLogin;
    case FIRAuthErrorCodeProviderAlreadyLinked:
      return kFIRAuthErrorMessageProviderAlreadyLinked;
    case FIRAuthErrorCodeNoSuchProvider:
      return kFIRAuthErrorMessageNoSuchProvider;
    case FIRAuthErrorCodeInvalidUserToken:
      return kFIRAuthErrorMessageInvalidUserToken;
    case FIRAuthErrorCodeNetworkError:
      return kFIRAuthErrorMessageNetworkError;
    case FIRAuthErrorCodeKeychainError:
      return kFIRAuthErrorMessageKeychainError;
    case FIRAuthErrorCodeMissingClientIdentifier:
      return kFIRAuthErrorMessageMissingClientIdentifier;
    case FIRAuthErrorCodeUserTokenExpired:
      return kFIRAuthErrorMessageUserTokenExpired;
    case FIRAuthErrorCodeUserNotFound:
      return kFIRAuthErrorMessageUserNotFound;
    case FIRAuthErrorCodeInvalidAPIKey:
      return kFIRAuthErrorMessageInvalidAPIKey;
    case FIRAuthErrorCodeCredentialAlreadyInUse:
      return kFIRAuthErrorMessageCredentialAlreadyInUse;
    case FIRAuthErrorCodeInternalError:
      return kFIRAuthErrorMessageInternalError;
    case FIRAuthErrorCodeUserMismatch:
      return FIRAuthErrorMessageUserMismatch;
    case FIRAuthErrorCodeOperationNotAllowed:
      return kFIRAuthErrorMessageOperationNotAllowed;
    case FIRAuthErrorCodeWeakPassword:
      return kFIRAuthErrorMessageWeakPassword;
    case FIRAuthErrorCodeAppNotAuthorized:
      return kFIRAuthErrorMessageAppNotAuthorized;
    case FIRAuthErrorCodeExpiredActionCode:
      return kFIRAuthErrorMessageExpiredActionCode;
    case FIRAuthErrorCodeInvalidActionCode:
      return kFIRAuthErrorMessageInvalidActionCode;
    case FIRAuthErrorCodeInvalidSender:
      return kFIRAuthErrorMessageInvalidSender;
    case FIRAuthErrorCodeInvalidMessagePayload:
      return kFIRAuthErrorMessageInvalidMessagePayload;
    case FIRAuthErrorCodeInvalidRecipientEmail:
      return kFIRAuthErrorMessageInvalidRecipientEmail;
    case FIRAuthErrorCodeMissingIosBundleID:
      return kFIRAuthErrorMessageMissingIosBundleID;
    case FIRAuthErrorCodeMissingAndroidPackageName:
      return kFIRAuthErrorMessageMissingAndroidPackageName;
    case FIRAuthErrorCodeUnauthorizedDomain:
      return kFIRAuthErrorMessageUnauthorizedDomain;
    case FIRAuthErrorCodeInvalidContinueURI:
      return kFIRAuthErrorMessageInvalidContinueURI;
    case FIRAuthErrorCodeMissingContinueURI:
      return kFIRAuthErrorMessageMissingContinueURI;
    case FIRAuthErrorCodeMissingEmail:
      return kFIRAuthErrorMessageMissingEmail;
    case FIRAuthErrorCodeMissingPhoneNumber:
      return kFIRAuthErrorMessageMissingPhoneNumber;
    case FIRAuthErrorCodeInvalidPhoneNumber:
      return kFIRAuthErrorMessageInvalidPhoneNumber;
    case FIRAuthErrorCodeMissingVerificationCode:
      return kFIRAuthErrorMessageMissingVerificationCode;
    case FIRAuthErrorCodeInvalidVerificationCode:
      return kFIRAuthErrorMessageInvalidVerificationCode;
    case FIRAuthErrorCodeMissingVerificationID:
      return kFIRAuthErrorMessageMissingVerificationID;
    case FIRAuthErrorCodeInvalidVerificationID:
      return kFIRAuthErrorMessageInvalidVerificationID;
    case FIRAuthErrorCodeSessionExpired:
      return kFIRAuthErrorMessageSessionExpired;
    case FIRAuthErrorCodeMissingAppCredential:
      return kFIRAuthErrorMessageMissingAppCredential;
    case FIRAuthErrorCodeInvalidAppCredential:
      return kFIRAuthErrorMessageInvalidAppCredential;
    case FIRAuthErrorCodeQuotaExceeded:
      return kFIRAuthErrorMessageQuotaExceeded;
    case FIRAuthErrorCodeMissingAppToken:
      return kFIRAuthErrorMessageMissingAppToken;
    case FIRAuthErrorCodeNotificationNotForwarded:
      return kFIRAuthErrorMessageNotificationNotForwarded;
    case FIRAuthErrorCodeAppNotVerified:
      return kFIRAuthErrorMessageAppNotVerified;
    case FIRAuthErrorCodeCaptchaCheckFailed:
      return kFIRAuthErrorMessageCaptchaCheckFailed;
    case FIRAuthErrorCodeWebContextAlreadyPresented:
      return kFIRAuthErrorMessageWebContextAlreadyPresented;
    case FIRAuthErrorCodeWebContextCancelled:
      return kFIRAuthErrorMessageWebContextCancelled;
    case FIRAuthErrorCodeInvalidClientID:
      return kFIRAuthErrorMessageInvalidClientID;
    case FIRAuthErrorCodeAppVerificationUserInteractionFailure:
      return kFIRAuthErrorMessageAppVerificationUserInteractionFailure;
    case FIRAuthErrorCodeWebNetworkRequestFailed:
      return kFIRAuthErrorMessageWebRequestFailed;
    case FIRAuthErrorCodeNullUser:
      return kFIRAuthErrorMessageNullUser;
    case FIRAuthErrorCodeInvalidProviderID:
      return kFIRAuthErrorMessageInvalidProviderID;
    case FIRAuthErrorCodeInvalidDynamicLinkDomain:
      return kFIRAuthErrorMessageInvalidDynamicLinkDomain;
    case FIRAuthErrorCodeWebInternalError:
      return kFIRAuthErrorMessageWebInternalError;
    case FIRAuthErrorCodeWebSignInUserInteractionFailure:
      return kFIRAuthErrorMessageAppVerificationUserInteractionFailure;
    case FIRAuthErrorCodeMalformedJWT:
      return kFIRAuthErrorMessageMalformedJWT;
    case FIRAuthErrorCodeLocalPlayerNotAuthenticated:
      return kFIRAuthErrorMessageLocalPlayerNotAuthenticated;
    case FIRAuthErrorCodeGameKitNotLinked:
      return kFIRAuthErrorMessageGameKitNotLinked;
    case FIRAuthErrorCodeSecondFactorRequired:
      return kFIRAuthErrorMessageSecondFactorRequired;
    case FIRAuthErrorCodeMissingMultiFactorSession:
      return FIRAuthErrorMessageMissingMultiFactorSession;
    case FIRAuthErrorCodeMissingMultiFactorInfo:
      return FIRAuthErrorMessageMissingMultiFactorInfo;
    case FIRAuthErrorCodeInvalidMultiFactorSession:
      return FIRAuthErrorMessageInvalidMultiFactorSession;
    case FIRAuthErrorCodeMultiFactorInfoNotFound:
      return FIRAuthErrorMessageMultiFactorInfoNotFound;
    case FIRAuthErrorCodeAdminRestrictedOperation:
      return FIRAuthErrorMessageAdminRestrictedOperation;
    case FIRAuthErrorCodeUnverifiedEmail:
      return FIRAuthErrorMessageUnverifiedEmail;
    case FIRAuthErrorCodeSecondFactorAlreadyEnrolled:
      return FIRAuthErrorMessageSecondFactorAlreadyEnrolled;
    case FIRAuthErrorCodeMaximumSecondFactorCountExceeded:
      return FIRAuthErrorMessageMaximumSecondFactorCountExceeded;
    case FIRAuthErrorCodeUnsupportedFirstFactor:
      return FIRAuthErrorMessageUnsupportedFirstFactor;
    case FIRAuthErrorCodeEmailChangeNeedsVerification:
      return FIRAuthErrorMessageEmailChangeNeedsVerification;
    case FIRAuthErrorCodeDynamicLinkNotActivated:
      return kFIRAuthErrorMessageDynamicLinkNotActivated;
    case FIRAuthErrorCodeRejectedCredential:
      return kFIRAuthErrorMessageRejectedCredential;
    case FIRAuthErrorCodeMissingOrInvalidNonce:
      return kFIRAuthErrorMessageMissingOrInvalidNonce;
    case FIRAuthErrorCodeTenantIDMismatch:
      return kFIRAuthErrorMessageTenantIDMismatch;
    case FIRAuthErrorCodeUnsupportedTenantOperation:
      return kFIRAuthErrorMessageUnsupportedTenantOperation;
  }
}

/** @var FIRAuthErrorCodeString
    @brief The the error short string, based on the error code.
    @remarks No default case so that we get a compiler warning if a new value was added to the enum.
 */
static NSString *const FIRAuthErrorCodeString(FIRAuthErrorCode code) {
  switch (code) {
    case FIRAuthErrorCodeInvalidCustomToken:
      return @"ERROR_INVALID_CUSTOM_TOKEN";
    case FIRAuthErrorCodeCustomTokenMismatch:
      return @"ERROR_CUSTOM_TOKEN_MISMATCH";
    case FIRAuthErrorCodeInvalidEmail:
      return @"ERROR_INVALID_EMAIL";
    case FIRAuthErrorCodeInvalidCredential:
      return @"ERROR_INVALID_CREDENTIAL";
    case FIRAuthErrorCodeUserDisabled:
      return @"ERROR_USER_DISABLED";
    case FIRAuthErrorCodeEmailAlreadyInUse:
      return @"ERROR_EMAIL_ALREADY_IN_USE";
    case FIRAuthErrorCodeWrongPassword:
      return @"ERROR_WRONG_PASSWORD";
    case FIRAuthErrorCodeTooManyRequests:
      return @"ERROR_TOO_MANY_REQUESTS";
    case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
      return @"ERROR_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL";
    case FIRAuthErrorCodeRequiresRecentLogin:
      return @"ERROR_REQUIRES_RECENT_LOGIN";
    case FIRAuthErrorCodeProviderAlreadyLinked:
      return @"ERROR_PROVIDER_ALREADY_LINKED";
    case FIRAuthErrorCodeNoSuchProvider:
      return @"ERROR_NO_SUCH_PROVIDER";
    case FIRAuthErrorCodeInvalidUserToken:
      return @"ERROR_INVALID_USER_TOKEN";
    case FIRAuthErrorCodeNetworkError:
      return @"ERROR_NETWORK_REQUEST_FAILED";
    case FIRAuthErrorCodeKeychainError:
      return @"ERROR_KEYCHAIN_ERROR";
    case FIRAuthErrorCodeMissingClientIdentifier:
      return @"ERROR_MISSING_CLIENT_IDENTIFIER";
    case FIRAuthErrorCodeUserTokenExpired:
      return @"ERROR_USER_TOKEN_EXPIRED";
    case FIRAuthErrorCodeUserNotFound:
      return @"ERROR_USER_NOT_FOUND";
    case FIRAuthErrorCodeInvalidAPIKey:
      return @"ERROR_INVALID_API_KEY";
    case FIRAuthErrorCodeCredentialAlreadyInUse:
      return @"ERROR_CREDENTIAL_ALREADY_IN_USE";
    case FIRAuthErrorCodeInternalError:
      return @"ERROR_INTERNAL_ERROR";
    case FIRAuthErrorCodeUserMismatch:
      return @"ERROR_USER_MISMATCH";
    case FIRAuthErrorCodeOperationNotAllowed:
      return @"ERROR_OPERATION_NOT_ALLOWED";
    case FIRAuthErrorCodeWeakPassword:
      return @"ERROR_WEAK_PASSWORD";
    case FIRAuthErrorCodeAppNotAuthorized:
      return @"ERROR_APP_NOT_AUTHORIZED";
    case FIRAuthErrorCodeExpiredActionCode:
      return @"ERROR_EXPIRED_ACTION_CODE";
    case FIRAuthErrorCodeInvalidActionCode:
      return @"ERROR_INVALID_ACTION_CODE";
    case FIRAuthErrorCodeInvalidMessagePayload:
      return @"ERROR_INVALID_MESSAGE_PAYLOAD";
    case FIRAuthErrorCodeInvalidSender:
      return @"ERROR_INVALID_SENDER";
    case FIRAuthErrorCodeInvalidRecipientEmail:
      return @"ERROR_INVALID_RECIPIENT_EMAIL";
    case FIRAuthErrorCodeMissingIosBundleID:
      return @"ERROR_MISSING_IOS_BUNDLE_ID";
    case FIRAuthErrorCodeMissingAndroidPackageName:
      return @"ERROR_MISSING_ANDROID_PKG_NAME";
    case FIRAuthErrorCodeUnauthorizedDomain:
      return @"ERROR_UNAUTHORIZED_DOMAIN";
    case FIRAuthErrorCodeInvalidContinueURI:
      return @"ERROR_INVALID_CONTINUE_URI";
    case FIRAuthErrorCodeMissingContinueURI:
      return @"ERROR_MISSING_CONTINUE_URI";
    case FIRAuthErrorCodeMissingEmail:
      return @"ERROR_MISSING_EMAIL";
    case FIRAuthErrorCodeMissingPhoneNumber:
      return @"ERROR_MISSING_PHONE_NUMBER";
    case FIRAuthErrorCodeInvalidPhoneNumber:
      return @"ERROR_INVALID_PHONE_NUMBER";
    case FIRAuthErrorCodeMissingVerificationCode:
      return @"ERROR_MISSING_VERIFICATION_CODE";
    case FIRAuthErrorCodeInvalidVerificationCode:
      return @"ERROR_INVALID_VERIFICATION_CODE";
    case FIRAuthErrorCodeMissingVerificationID:
      return @"ERROR_MISSING_VERIFICATION_ID";
    case FIRAuthErrorCodeInvalidVerificationID:
      return @"ERROR_INVALID_VERIFICATION_ID";
    case FIRAuthErrorCodeSessionExpired:
      return @"ERROR_SESSION_EXPIRED";
    case FIRAuthErrorCodeMissingAppCredential:
      return @"MISSING_APP_CREDENTIAL";
    case FIRAuthErrorCodeInvalidAppCredential:
      return @"INVALID_APP_CREDENTIAL";
    case FIRAuthErrorCodeQuotaExceeded:
      return @"ERROR_QUOTA_EXCEEDED";
    case FIRAuthErrorCodeMissingAppToken:
      return @"ERROR_MISSING_APP_TOKEN";
    case FIRAuthErrorCodeNotificationNotForwarded:
      return @"ERROR_NOTIFICATION_NOT_FORWARDED";
    case FIRAuthErrorCodeAppNotVerified:
      return @"ERROR_APP_NOT_VERIFIED";
    case FIRAuthErrorCodeCaptchaCheckFailed:
      return @"ERROR_CAPTCHA_CHECK_FAILED";
    case FIRAuthErrorCodeWebContextAlreadyPresented:
      return @"ERROR_WEB_CONTEXT_ALREADY_PRESENTED";
    case FIRAuthErrorCodeWebContextCancelled:
      return @"ERROR_WEB_CONTEXT_CANCELLED";
    case FIRAuthErrorCodeInvalidClientID:
      return @"ERROR_INVALID_CLIENT_ID";
    case FIRAuthErrorCodeAppVerificationUserInteractionFailure:
      return @"ERROR_APP_VERIFICATION_FAILED";
    case FIRAuthErrorCodeWebNetworkRequestFailed:
      return @"ERROR_WEB_NETWORK_REQUEST_FAILED";
    case FIRAuthErrorCodeNullUser:
      return @"ERROR_NULL_USER";
    case FIRAuthErrorCodeInvalidProviderID:
      return @"ERROR_INVALID_PROVIDER_ID";
    case FIRAuthErrorCodeInvalidDynamicLinkDomain:
      return @"ERROR_INVALID_DYNAMIC_LINK_DOMAIN";
    case FIRAuthErrorCodeWebInternalError:
      return @"ERROR_WEB_INTERNAL_ERROR";
    case FIRAuthErrorCodeWebSignInUserInteractionFailure:
      return @"ERROR_WEB_USER_INTERACTION_FAILURE";
    case FIRAuthErrorCodeMalformedJWT:
      return @"ERROR_MALFORMED_JWT";
    case FIRAuthErrorCodeLocalPlayerNotAuthenticated:
      return @"ERROR_LOCAL_PLAYER_NOT_AUTHENTICATED";
    case FIRAuthErrorCodeGameKitNotLinked:
      return @"ERROR_GAME_KIT_NOT_LINKED";
    case FIRAuthErrorCodeSecondFactorRequired:
      return @"ERROR_SECOND_FACTOR_REQUIRED";
    case FIRAuthErrorCodeMissingMultiFactorSession:
      return @"ERROR_MISSING_MULTI_FACTOR_SESSION";
    case FIRAuthErrorCodeMissingMultiFactorInfo:
      return @"ERROR_MISSING_MULTI_FACTOR_INFO";
    case FIRAuthErrorCodeInvalidMultiFactorSession:
      return @"ERROR_INVALID_MULTI_FACTOR_SESSION";
    case FIRAuthErrorCodeMultiFactorInfoNotFound:
      return @"ERROR_MULTI_FACTOR_INFO_NOT_FOUND";
    case FIRAuthErrorCodeAdminRestrictedOperation:
      return @"ERROR_ADMIN_RESTRICTED_OPERATION";
    case FIRAuthErrorCodeUnverifiedEmail:
      return @"ERROR_UNVERIFIED_EMAIL";
    case FIRAuthErrorCodeSecondFactorAlreadyEnrolled:
      return @"ERROR_SECOND_FACTOR_ALREADY_ENROLLED";
    case FIRAuthErrorCodeMaximumSecondFactorCountExceeded:
      return @"ERROR_MAXIMUM_SECOND_FACTOR_COUNT_EXCEEDED";
    case FIRAuthErrorCodeUnsupportedFirstFactor:
      return @"ERROR_UNSUPPORTED_FIRST_FACTOR";
    case FIRAuthErrorCodeEmailChangeNeedsVerification:
      return @"ERROR_EMAIL_CHANGE_NEEDS_VERIFICATION";
    case FIRAuthErrorCodeDynamicLinkNotActivated:
      return @"ERROR_DYNAMIC_LINK_NOT_ACTIVATED";
    case FIRAuthErrorCodeRejectedCredential:
      return @"ERROR_REJECTED_CREDENTIAL";
    case FIRAuthErrorCodeMissingOrInvalidNonce:
      return @"ERROR_MISSING_OR_INVALID_NONCE";
    case FIRAuthErrorCodeTenantIDMismatch:
      return @"ERROR_TENANT_ID_MISMATCH";
    case FIRAuthErrorCodeUnsupportedTenantOperation:
      return @"ERROR_UNSUPPORTED_TENANT_OPERATION";
  }
}

@implementation FIRAuthErrorUtils

+ (NSError *)errorWithCode:(FIRAuthInternalErrorCode)code {
  return [self errorWithCode:code message:nil];
}

+ (NSError *)errorWithCode:(FIRAuthInternalErrorCode)code message:(nullable NSString *)message {
  NSDictionary *userInfo = nil;
  if (message.length) {
    userInfo = @{NSLocalizedDescriptionKey : message};
  }
  return [self errorWithCode:code userInfo:userInfo];
}

+ (NSError *)errorWithCode:(FIRAuthInternalErrorCode)code
           underlyingError:(nullable NSError *)underlyingError {
  NSDictionary *errorUserInfo;
  if (underlyingError) {
    errorUserInfo = @{NSUnderlyingErrorKey : underlyingError};
  }
  return [self errorWithCode:code userInfo:errorUserInfo];
}

+ (NSError *)errorWithCode:(FIRAuthInternalErrorCode)code
                  userInfo:(nullable NSDictionary *)userInfo {
  BOOL isPublic = (code & FIRAuthPublicErrorCodeFlag) == FIRAuthPublicErrorCodeFlag;
  if (isPublic) {
    // This is a public error. Return it as a public error and add a description.
    NSInteger errorCode = code & ~FIRAuthPublicErrorCodeFlag;
    NSMutableDictionary *errorUserInfo = [NSMutableDictionary dictionary];
    if (userInfo) {
      [errorUserInfo addEntriesFromDictionary:userInfo];
    }
    if (!errorUserInfo[NSLocalizedDescriptionKey]) {
      errorUserInfo[NSLocalizedDescriptionKey] = FIRAuthErrorDescription(errorCode);
    }
    errorUserInfo[FIRAuthErrorUserInfoNameKey] = FIRAuthErrorCodeString(errorCode);
    return [NSError errorWithDomain:FIRAuthErrorDomain code:errorCode userInfo:errorUserInfo];
  } else {
    // This is an internal error. Wrap it in an internal error.
    NSError *error = [NSError errorWithDomain:FIRAuthInternalErrorDomain
                                         code:code
                                     userInfo:userInfo];
    return [self errorWithCode:FIRAuthInternalErrorCodeInternalError underlyingError:error];
  }
}

+ (NSError *)RPCRequestEncodingErrorWithUnderlyingError:(NSError *)underlyingError {
  return [self errorWithCode:FIRAuthInternalErrorCodeRPCRequestEncodingError
             underlyingError:underlyingError];
}

+ (NSError *)JSONSerializationErrorForUnencodableType {
  return [self errorWithCode:FIRAuthInternalErrorCodeJSONSerializationError];
}

+ (NSError *)JSONSerializationErrorWithUnderlyingError:(NSError *)underlyingError {
  return [self errorWithCode:FIRAuthInternalErrorCodeJSONSerializationError
             underlyingError:underlyingError];
}

+ (NSError *)networkErrorWithUnderlyingError:(NSError *)underlyingError {
  return [self errorWithCode:FIRAuthInternalErrorCodeNetworkError underlyingError:underlyingError];
}

+ (NSError *)unexpectedErrorResponseWithData:(NSData *)data
                             underlyingError:(NSError *)underlyingError {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (data) {
    userInfo[FIRAuthErrorUserInfoDataKey] = data;
  }
  if (underlyingError) {
    userInfo[NSUnderlyingErrorKey] = underlyingError;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeUnexpectedErrorResponse
                    userInfo:[userInfo copy]];
}

+ (NSError *)unexpectedErrorResponseWithDeserializedResponse:(id)deserializedResponse {
  NSDictionary *userInfo;
  if (deserializedResponse) {
    userInfo = @{
      FIRAuthErrorUserInfoDeserializedResponseKey : deserializedResponse,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeUnexpectedErrorResponse userInfo:userInfo];
}

+ (NSError *)malformedJWTErrorWithToken:(NSString *)token
                        underlyingError:(NSError *_Nullable)underlyingError {
  NSMutableDictionary *userInfo =
      [NSMutableDictionary dictionaryWithObject:kFIRAuthErrorMessageMalformedJWT
                                         forKey:NSLocalizedDescriptionKey];
  [userInfo setObject:token forKey:FIRAuthErrorUserInfoDataKey];
  if (underlyingError != nil) {
    [userInfo setObject:underlyingError forKey:NSUnderlyingErrorKey];
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeMalformedJWT userInfo:[userInfo copy]];
}

+ (NSError *)unexpectedResponseWithData:(NSData *)data underlyingError:(NSError *)underlyingError {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (data) {
    userInfo[FIRAuthErrorUserInfoDataKey] = data;
  }
  if (underlyingError) {
    userInfo[NSUnderlyingErrorKey] = underlyingError;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeUnexpectedResponse userInfo:[userInfo copy]];
}

+ (NSError *)unexpectedResponseWithDeserializedResponse:(id)deserializedResponse {
  NSDictionary *userInfo;
  if (deserializedResponse) {
    userInfo = @{
      FIRAuthErrorUserInfoDeserializedResponseKey : deserializedResponse,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeUnexpectedResponse userInfo:userInfo];
}

+ (NSError *)unexpectedResponseWithDeserializedResponse:(nullable id)deserializedResponse
                                        underlyingError:(NSError *)underlyingError {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (deserializedResponse) {
    userInfo[FIRAuthErrorUserInfoDeserializedResponseKey] = deserializedResponse;
  }
  if (underlyingError) {
    userInfo[NSUnderlyingErrorKey] = underlyingError;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeUnexpectedResponse userInfo:[userInfo copy]];
}

+ (NSError *)RPCResponseDecodingErrorWithDeserializedResponse:(id)deserializedResponse
                                              underlyingError:(NSError *)underlyingError {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (deserializedResponse) {
    userInfo[FIRAuthErrorUserInfoDeserializedResponseKey] = deserializedResponse;
  }
  if (underlyingError) {
    userInfo[NSUnderlyingErrorKey] = underlyingError;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeRPCResponseDecodingError
                    userInfo:[userInfo copy]];
}

+ (NSError *)emailAlreadyInUseErrorWithEmail:(nullable NSString *)email {
  NSDictionary *userInfo;
  if (email.length) {
    userInfo = @{
      FIRAuthErrorUserInfoEmailKey : email,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeEmailAlreadyInUse userInfo:userInfo];
}

+ (NSError *)userDisabledErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeUserDisabled message:message];
}

+ (NSError *)wrongPasswordErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeWrongPassword message:message];
}

+ (NSError *)tooManyRequestsErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeTooManyRequests message:message];
}

+ (NSError *)invalidCustomTokenErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidCustomToken message:message];
}

+ (NSError *)customTokenMistmatchErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeCustomTokenMismatch message:message];
}

+ (NSError *)invalidCredentialErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidCredential message:message];
}

+ (NSError *)requiresRecentLoginErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeRequiresRecentLogin message:message];
}

+ (NSError *)invalidUserTokenErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidUserToken message:message];
}

+ (NSError *)invalidEmailErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidEmail message:message];
}

+ (NSError *)accountExistsWithDifferentCredentialErrorWithEmail:(nullable NSString *)email
                                              updatedCredential:
                                                  (nullable FIRAuthCredential *)updatedCredential {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (email) {
    userInfo[FIRAuthErrorUserInfoEmailKey] = email;
  }
  if (updatedCredential) {
    userInfo[FIRAuthErrorUserInfoUpdatedCredentialKey] = updatedCredential;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeAccountExistsWithDifferentCredential
                    userInfo:userInfo];
}

+ (NSError *)providerAlreadyLinkedError {
  return [self errorWithCode:FIRAuthInternalErrorCodeProviderAlreadyLinked];
}

+ (NSError *)noSuchProviderError {
  return [self errorWithCode:FIRAuthInternalErrorCodeNoSuchProvider];
}

+ (NSError *)userTokenExpiredErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeUserTokenExpired message:message];
}

+ (NSError *)userNotFoundErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeUserNotFound message:message];
}

+ (NSError *)invalidAPIKeyError {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidAPIKey];
}

+ (NSError *)userMismatchError {
  return [self errorWithCode:FIRAuthInternalErrorCodeUserMismatch];
}

+ (NSError *)credentialAlreadyInUseErrorWithMessage:(nullable NSString *)message
                                         credential:(nullable FIRAuthCredential *)credential
                                              email:(nullable NSString *)email {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (credential) {
    userInfo[FIRAuthErrorUserInfoUpdatedCredentialKey] = credential;
  }
  if (email.length) {
    userInfo[FIRAuthErrorUserInfoEmailKey] = email;
  }
  if (userInfo.count) {
    return [self errorWithCode:FIRAuthInternalErrorCodeCredentialAlreadyInUse userInfo:userInfo];
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeCredentialAlreadyInUse message:message];
}

+ (NSError *)operationNotAllowedErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeOperationNotAllowed message:message];
}

+ (NSError *)weakPasswordErrorWithServerResponseReason:(nullable NSString *)reason {
  NSDictionary *userInfo;
  if (reason.length) {
    userInfo = @{
      NSLocalizedFailureReasonErrorKey : reason,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeWeakPassword userInfo:userInfo];
}

+ (NSError *)appNotAuthorizedError {
  return [self errorWithCode:FIRAuthInternalErrorCodeAppNotAuthorized];
}

+ (NSError *)expiredActionCodeErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeExpiredActionCode message:message];
}

+ (NSError *)invalidActionCodeErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidActionCode message:message];
}

+ (NSError *)invalidMessagePayloadErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidMessagePayload message:message];
}

+ (NSError *)invalidSenderErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidSender message:message];
}

+ (NSError *)invalidRecipientEmailErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidRecipientEmail message:message];
}

+ (NSError *)missingIosBundleIDErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthinternalErrorCodeMissingIosBundleID message:message];
}

+ (NSError *)missingAndroidPackageNameErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingAndroidPackageName message:message];
}

+ (NSError *)unauthorizedDomainErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeUnauthorizedDomain message:message];
}

+ (NSError *)invalidContinueURIErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidContinueURI message:message];
}

+ (NSError *)missingContinueURIErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingContinueURI message:message];
}

+ (NSError *)missingEmailErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingEmail message:message];
}

+ (NSError *)missingPhoneNumberErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingPhoneNumber message:message];
}

+ (NSError *)invalidPhoneNumberErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidPhoneNumber message:message];
}

+ (NSError *)missingVerificationCodeErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingVerificationCode message:message];
}

+ (NSError *)invalidVerificationCodeErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidVerificationCode message:message];
}

+ (NSError *)missingVerificationIDErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingVerificationID message:message];
}

+ (NSError *)invalidVerificationIDErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidVerificationID message:message];
}

+ (NSError *)sessionExpiredErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeSessionExpired message:message];
}

+ (NSError *)missingAppCredentialWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingAppCredential message:message];
}

+ (NSError *)invalidAppCredentialWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidAppCredential message:message];
}

+ (NSError *)quotaExceededErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeQuotaExceeded message:message];
}

+ (NSError *)missingAppTokenErrorWithUnderlyingError:(nullable NSError *)underlyingError {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingAppToken
             underlyingError:underlyingError];
}

+ (NSError *)localPlayerNotAuthenticatedError {
  return [self errorWithCode:FIRAuthInternalErrorCodeLocalPlayerNotAuthenticated];
}

+ (NSError *)gameKitNotLinkedError {
  return [self errorWithCode:FIRAuthInternalErrorCodeGameKitNotLinked];
}

#if TARGET_OS_IOS
+ (NSError *)secondFactorRequiredErrorWithPendingCredential:(NSString *)MFAPendingCredential
                                                      hints:(NSArray<FIRMultiFactorInfo *> *)hints {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (MFAPendingCredential && hints) {
    FIRMultiFactorResolver *resolver =
        [[FIRMultiFactorResolver alloc] initWithMFAPendingCredential:MFAPendingCredential
                                                               hints:hints];
    userInfo[FIRAuthErrorUserInfoMultiFactorResolverKey] = resolver;
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeSecondFactorRequired userInfo:userInfo];
}
#endif

+ (NSError *)notificationNotForwardedError {
  return [self errorWithCode:FIRAuthInternalErrorCodeNotificationNotForwarded];
}

+ (NSError *)appNotVerifiedErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeAppNotVerified message:message];
}

+ (NSError *)missingClientIdentifierErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingClientIdentifier message:message];
}

+ (NSError *)captchaCheckFailedErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeCaptchaCheckFailed message:message];
}

+ (NSError *)webContextAlreadyPresentedErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeWebContextAlreadyPresented message:message];
}

+ (NSError *)webContextCancelledErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeWebContextCancelled message:message];
}

+ (NSError *)appVerificationUserInteractionFailureWithReason:(NSString *)reason {
  NSDictionary *userInfo;
  if (reason.length) {
    userInfo = @{
      NSLocalizedFailureReasonErrorKey : reason,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeAppVerificationUserInteractionFailure
                    userInfo:userInfo];
}

+ (NSError *)webSignInUserInteractionFailureWithReason:(nullable NSString *)reason {
  NSDictionary *userInfo;
  if (reason.length) {
    userInfo = @{
      NSLocalizedFailureReasonErrorKey : reason,
    };
  }
  return [self errorWithCode:FIRAuthInternalErrorCodeWebSignInUserInteractionFailure
                    userInfo:userInfo];
}

+ (nullable NSError *)URLResponseErrorWithCode:(NSString *)code
                                       message:(nullable NSString *)message {
  if ([code isEqualToString:kURLResponseErrorCodeInvalidClientID]) {
    return [self errorWithCode:FIRAuthInternalErrorCodeInvalidClientID message:message];
  }
  if ([code isEqualToString:kURLResponseErrorCodeNetworkRequestFailed]) {
    return [self errorWithCode:FIRAuthInternalErrorCodeWebNetworkRequestFailed message:message];
  }
  if ([code isEqualToString:kURLResponseErrorCodeInternalError]) {
    return [self errorWithCode:FIRAuthInternalErrorCodeWebInternalError message:message];
  }
  return nil;
}

+ (NSError *)nullUserErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeNullUser message:message];
}

+ (NSError *)invalidProviderIDErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidProviderID message:message];
}

+ (NSError *)invalidDynamicLinkDomainErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeInvalidDynamicLinkDomain message:message];
}

+ (NSError *)missingOrInvalidNonceErrorWithMessage:(nullable NSString *)message {
  return [self errorWithCode:FIRAuthInternalErrorCodeMissingOrInvalidNonce message:message];
}

+ (NSError *)keychainErrorWithFunction:(NSString *)keychainFunction status:(OSStatus)status {
  NSString *failureReason = [NSString stringWithFormat:@"%@ (%li)", keychainFunction, (long)status];
  return [self errorWithCode:FIRAuthInternalErrorCodeKeychainError
                    userInfo:@{
                      NSLocalizedFailureReasonErrorKey : failureReason,
                    }];
}

+ (NSError *)tenantIDMismatchError {
  return [self errorWithCode:FIRAuthInternalErrorCodeTenantIDMismatch];
}

+ (NSError *)unsupportedTenantOperationError {
  return [self errorWithCode:FIRAuthInternalErrorCodeUnsupportedTenantOperation];
}

@end

NS_ASSUME_NONNULL_END
