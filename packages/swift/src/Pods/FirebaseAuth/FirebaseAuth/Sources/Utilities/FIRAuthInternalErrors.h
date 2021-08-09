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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthErrors.h"

NS_ASSUME_NONNULL_BEGIN

/** @var FIRAuthPublicErrorCodeFlag
    @brief Bitmask value indicating the error represents a public error code when this bit is
        zeroed. Error codes which don't contain this flag will be wrapped in an @c NSError whose
        code is @c FIRAuthErrorCodeInternalError.
 */
static const NSInteger FIRAuthPublicErrorCodeFlag = 1 << 20;

/** @var FIRAuthInternalErrorDomain
    @brief The Firebase Auth error domain for internal errors.
 */
extern NSString *const FIRAuthInternalErrorDomain;

/** @var FIRAuthErrorUserInfoDeserializedResponseKey
    @brief Errors with the code @c FIRAuthErrorCodeUnexpectedResponseError,
        @c FIRAuthErrorCodeUnexpectedErrorResponseError, and
        @c FIRAuthInternalErrorCodeRPCResponseDecodingError may contain an @c NSError.userInfo
        dictionary which contains this key. The value associated with this key is an object of
        unspecified contents containing the deserialized server response.
 */
extern NSString *const FIRAuthErrorUserInfoDeserializedResponseKey;

/** @var FIRAuthErrorUserInfoDataKey
    @brief Errors with the code @c FIRAuthErrorCodeUnexpectedResponseError or
        @c FIRAuthErrorCodeUnexpectedErrorResponseError may contain an @c NSError.userInfo
        dictionary which contains this key. The value associated with this key is an @c NSString
        which represents the response from a server to an RPC which could not be deserialized.
 */
extern NSString *const FIRAuthErrorUserInfoDataKey;

/** @var FIRAuthInternalErrorCode
    @brief Error codes used internally by Firebase Auth.
    @remarks All errors are generated using an internal error code. These errors are automatically
        converted to the appropriate public version of the @c NSError by the methods in
        @c FIRAuthErrorUtils
 */
typedef NS_ENUM(NSInteger, FIRAuthInternalErrorCode) {
  /** @var FIRAuthInternalErrorCodeNetworkError
      @brief Indicates a network error occurred (such as a timeout, interrupted connection, or
          unreachable host.)
      @remarks These types of errors are often recoverable with a retry.

          See the @c NSUnderlyingError value in the @c NSError.userInfo dictionary for details about
          the network error which occurred.
   */
  FIRAuthInternalErrorCodeNetworkError = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeNetworkError,

  /** @var FIRAuthInternalErrorCodeEmailAlreadyInUse
      @brief The email used to attempt a sign-up already exists.
   */
  FIRAuthInternalErrorCodeEmailAlreadyInUse = FIRAuthPublicErrorCodeFlag |
                                              FIRAuthErrorCodeEmailAlreadyInUse,

  /** @var FIRAuthInternalErrorCodeUserDisabled
      @brief Indicates the user's account is disabled on the server side.
   */
  FIRAuthInternalErrorCodeUserDisabled = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeUserDisabled,

  /** @var FIRAuthInternalErrorCodeWrongPassword
      @brief Indicates the user attempted sign in with a wrong password
   */
  FIRAuthInternalErrorCodeWrongPassword = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeWrongPassword,

  /** @var FIRAuthInternalErrorCodeKeychainError
      @brief Indicates an error occurred accessing the keychain.
      @remarks The @c NSLocalizedFailureReasonErrorKey field in the @c NSError.userInfo dictionary
          will contain more information about the error encountered.
   */
  FIRAuthInternalErrorCodeKeychainError = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeKeychainError,

  /** @var FIRAuthInternalErrorCodeMissingClientIdentifier
      @brief Indicates an error for when the client identifier is missing.
   */
  FIRAuthInternalErrorCodeMissingClientIdentifier = FIRAuthPublicErrorCodeFlag |
                                                    FIRAuthErrorCodeMissingClientIdentifier,

  /** @var FIRAuthInternalErrorCodeInternalError
      @brief An internal error occurred.
      @remarks This value is here for consistency. It's also used to make the implementation of
          wrapping internal errors simpler.
   */
  FIRAuthInternalErrorCodeInternalError = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeInternalError,

  /** @var FIRAuthInternalErrorCodeTooManyRequests
      @brief Indicates that too many requests were made to a server method.
   */
  FIRAuthInternalErrorCodeTooManyRequests = FIRAuthPublicErrorCodeFlag |
                                            FIRAuthErrorCodeTooManyRequests,

  /** @var FIRAuthInternalErrorCodeInvalidCustomToken
      @brief Indicates a validation error with the custom token.
   */
  FIRAuthInternalErrorCodeInvalidCustomToken = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeInvalidCustomToken,

  /** @var FIRAuthInternalErrorCodeCredentialMismatch
      @brief Indicates the service account and the API key belong to different projects.
   */
  FIRAuthInternalErrorCodeCustomTokenMismatch = FIRAuthPublicErrorCodeFlag |
                                                FIRAuthErrorCodeCustomTokenMismatch,

  /** @var FIRAuthInternalErrorCodeInvalidCredential
      @brief Indicates the IDP token or requestUri is invalid.
   */
  FIRAuthInternalErrorCodeInvalidCredential = FIRAuthPublicErrorCodeFlag |
                                              FIRAuthErrorCodeInvalidCredential,

  /** @var FIRAuthInternalErrorCodeRequiresRecentLogin
      @brief Indicates the user has attemped to change email or password more than 5 minutes after
          signing in.
   */
  FIRAuthInternalErrorCodeRequiresRecentLogin = FIRAuthPublicErrorCodeFlag |
                                                FIRAuthErrorCodeRequiresRecentLogin,

  /** @var FIRAuthInternalErrorCodeInvalidUserToken
     @brief Indicates user's saved auth credential is invalid, the user needs to sign in again.
  */
  FIRAuthInternalErrorCodeInvalidUserToken = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeInvalidUserToken,

  /** @var FIRAuthInternalErrorCodeInvalidEmail
     @brief Indicates the email identifier is invalid.
  */
  FIRAuthInternalErrorCodeInvalidEmail = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeInvalidEmail,

  /** @var FIRAuthInternalErrorCodeAccountExistsWithDifferentCredential
      @brief Indicates account linking is needed.
   */
  FIRAuthInternalErrorCodeAccountExistsWithDifferentCredential =
      FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeAccountExistsWithDifferentCredential,

  /** @var FIRAuthInternalErrorCodeProviderAlreadyLinked
      @brief Indicates an attempt to link a provider to which we are already linked.
   */
  FIRAuthInternalErrorCodeProviderAlreadyLinked = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeProviderAlreadyLinked,

  /** @var FIRAuthInternalErrorCodeNoSuchProvider
      @brief Indicates an attempt to unlink a provider that is not is not linked.
   */
  FIRAuthInternalErrorCodeNoSuchProvider = FIRAuthPublicErrorCodeFlag |
                                           FIRAuthErrorCodeNoSuchProvider,

  /** @var FIRAuthInternalErrorCodeUserTokenExpired
      @brief Indicates the token issue time is older than account's valid_since time.
   */
  FIRAuthInternalErrorCodeUserTokenExpired = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeUserTokenExpired,

  /** @var FIRAuthInternalErrorCodeUserNotFound
      @brief Indicates the user account was been found.
   */
  FIRAuthInternalErrorCodeUserNotFound = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeUserNotFound,

  /** @var FIRAuthInternalErrorCodeInvalidAPIKey
      @brief Indicates an invalid API Key was supplied in the request.
   */
  FIRAuthInternalErrorCodeInvalidAPIKey = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeInvalidAPIKey,

  /** @var FIRAuthInternalErrorCodeOperationNotAllowed
      @brief Indicates that admin disabled sign-in with the specified IDP.
   */
  FIRAuthInternalErrorCodeOperationNotAllowed = FIRAuthPublicErrorCodeFlag |
                                                FIRAuthErrorCodeOperationNotAllowed,

  /** @var FIRAuthInternalErrorCodeUserMismatch
      @brief Indicates that user attempted to reauthenticate with a user other than the current
          user.
   */
  FIRAuthInternalErrorCodeUserMismatch = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeUserMismatch,

  /** @var FIRAuthInternalErrorCodeCredentialAlreadyInUse
      @brief Indicates an attempt to link with a credential that has already been linked with a
          different Firebase account.
   */
  FIRAuthInternalErrorCodeCredentialAlreadyInUse = FIRAuthPublicErrorCodeFlag |
                                                   FIRAuthErrorCodeCredentialAlreadyInUse,

  /** @var FIRAuthInternalErrorCodeWeakPassword
      @brief Indicates an attempt to set a password that is considered too weak.
   */
  FIRAuthInternalErrorCodeWeakPassword = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeWeakPassword,

  /** @var FIRAuthInternalErrorCodeAppNotAuthorized
      @brief Indicates the App is not authorized to use Firebase Authentication with the
          provided API Key.
   */
  FIRAuthInternalErrorCodeAppNotAuthorized = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeAppNotAuthorized,

  /** @var FIRAuthInternalErrorCodeExpiredActionCode
      @brief Indicates the OOB code is expired.
   */
  FIRAuthInternalErrorCodeExpiredActionCode = FIRAuthPublicErrorCodeFlag |
                                              FIRAuthErrorCodeExpiredActionCode,

  /** @var FIRAuthInternalErrorCodeInvalidActionCode
      @brief Indicates the OOB code is invalid.
  */
  FIRAuthInternalErrorCodeInvalidActionCode = FIRAuthPublicErrorCodeFlag |
                                              FIRAuthErrorCodeInvalidActionCode,

  /** Indicates that there are invalid parameters in the payload during a "send password reset email
   *  " attempt.
   */
  FIRAuthInternalErrorCodeInvalidMessagePayload = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeInvalidMessagePayload,

  /** Indicates that the sender email is invalid during a "send password reset email" attempt.
   */
  FIRAuthInternalErrorCodeInvalidSender = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeInvalidSender,

  /** Indicates that the recipient email is invalid.
   */
  FIRAuthInternalErrorCodeInvalidRecipientEmail = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeInvalidRecipientEmail,

  /** Indicates that the iOS bundle ID is missing when a iOS App Store ID is provided.
   */
  FIRAuthinternalErrorCodeMissingIosBundleID = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeMissingIosBundleID,

  /** Indicates that the android package name is missing when the @c androidInstallApp flag is set
        to true.
   */
  FIRAuthInternalErrorCodeMissingAndroidPackageName = FIRAuthPublicErrorCodeFlag |
                                                      FIRAuthErrorCodeMissingAndroidPackageName,

  /** Indicates that the domain specified in the continue URL is not allowlisted in the Firebase
        console.
   */
  FIRAuthInternalErrorCodeUnauthorizedDomain = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeUnauthorizedDomain,

  /** Indicates that the domain specified in the continue URI is not valid.
   */
  FIRAuthInternalErrorCodeInvalidContinueURI = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeInvalidContinueURI,

  /** Indicates that a continue URI was not provided in a request to the backend which requires
        one.
   */
  FIRAuthInternalErrorCodeMissingContinueURI = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeMissingContinueURI,

  /** Indicates that an email address was expected but one was not provided.
   */
  FIRAuthInternalErrorCodeMissingEmail = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeMissingEmail,

  /** Indicates that a phone number was not provided in a call to @c verifyPhoneNumber:completion:.
   */
  FIRAuthInternalErrorCodeMissingPhoneNumber = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeMissingPhoneNumber,

  /** Indicates that an invalid phone number was provided in a call to @c
      verifyPhoneNumber:completion:.
   */
  FIRAuthInternalErrorCodeInvalidPhoneNumber = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeInvalidPhoneNumber,

  /** Indicates that the phone auth credential was created with an empty verification code.
   */
  FIRAuthInternalErrorCodeMissingVerificationCode = FIRAuthPublicErrorCodeFlag |
                                                    FIRAuthErrorCodeMissingVerificationCode,

  /** Indicates that an invalid verification code was used in the verifyPhoneNumber request.
   */
  FIRAuthInternalErrorCodeInvalidVerificationCode = FIRAuthPublicErrorCodeFlag |
                                                    FIRAuthErrorCodeInvalidVerificationCode,

  /** Indicates that the phone auth credential was created with an empty verification ID.
   */
  FIRAuthInternalErrorCodeMissingVerificationID = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeMissingVerificationID,

  /** Indicates that the APNS device token is missing in the verifyClient request.
   */
  FIRAuthInternalErrorCodeMissingAppCredential = FIRAuthPublicErrorCodeFlag |
                                                 FIRAuthErrorCodeMissingAppCredential,

  /** Indicates that an invalid APNS device token was used in the verifyClient request.
   */
  FIRAuthInternalErrorCodeInvalidAppCredential = FIRAuthPublicErrorCodeFlag |
                                                 FIRAuthErrorCodeInvalidAppCredential,

  /** Indicates that the reCAPTCHA token is not valid.
   */
  FIRAuthInternalErrorCodeCaptchaCheckFailed = FIRAuthPublicErrorCodeFlag |
                                               FIRAuthErrorCodeCaptchaCheckFailed,

  /** Indicates that an invalid verification ID was used in the verifyPhoneNumber request.
   */
  FIRAuthInternalErrorCodeInvalidVerificationID = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeInvalidVerificationID,

  /** Indicates that the quota of SMS messages for a given project has been exceeded.
   */
  FIRAuthInternalErrorCodeQuotaExceeded = FIRAuthPublicErrorCodeFlag |
                                          FIRAuthErrorCodeQuotaExceeded,

  /** Indicates that an attempt was made to present a new web context while one was already being
        presented.
   */
  FIRAuthInternalErrorCodeWebContextAlreadyPresented = FIRAuthPublicErrorCodeFlag |
                                                       FIRAuthErrorCodeWebContextAlreadyPresented,

  /** Indicates that the URL presentation was cancelled prematurely by the user.
   */
  FIRAuthInternalErrorCodeWebContextCancelled = FIRAuthPublicErrorCodeFlag |
                                                FIRAuthErrorCodeWebContextCancelled,

  /** Indicates a general failure during the app verification flow.
   */
  FIRAuthInternalErrorCodeAppVerificationUserInteractionFailure =
      FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeAppVerificationUserInteractionFailure,

  /** Indicates that the clientID used to invoke a web flow is invalid.
   */
  FIRAuthInternalErrorCodeInvalidClientID = FIRAuthPublicErrorCodeFlag |
                                            FIRAuthErrorCodeInvalidClientID,

  /** Indicates that a network request within a SFSafariViewController or WKWebView failed.
   */
  FIRAuthInternalErrorCodeWebNetworkRequestFailed = FIRAuthPublicErrorCodeFlag |
                                                    FIRAuthErrorCodeWebNetworkRequestFailed,

  /** Indicates that an internal error occurred within a SFSafariViewController or WKWebView.
   */
  FIRAuthInternalErrorCodeWebInternalError = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeWebInternalError,

  /** Indicates that an internal error occurred within a SFSafariViewController or WKWebView.
   */
  FIRAuthInternalErrorCodeWebSignInUserInteractionFailure =
      FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeWebSignInUserInteractionFailure,

  // The enum values between 17046 and 17051 are reserved and should NOT be used for new error
  // codes.

  /** Indicates that the SMS code has expired
   */
  FIRAuthInternalErrorCodeSessionExpired = FIRAuthPublicErrorCodeFlag |
                                           FIRAuthErrorCodeSessionExpired,

  FIRAuthInternalErrorCodeMissingAppToken = FIRAuthPublicErrorCodeFlag |
                                            FIRAuthErrorCodeMissingAppToken,

  FIRAuthInternalErrorCodeNotificationNotForwarded = FIRAuthPublicErrorCodeFlag |
                                                     FIRAuthErrorCodeNotificationNotForwarded,

  FIRAuthInternalErrorCodeAppNotVerified = FIRAuthPublicErrorCodeFlag |
                                           FIRAuthErrorCodeAppNotVerified,

  /** Indicates that the Game Center local player was not authenticated.
   */
  FIRAuthInternalErrorCodeLocalPlayerNotAuthenticated = FIRAuthPublicErrorCodeFlag |
                                                        FIRAuthErrorCodeLocalPlayerNotAuthenticated,

  /** Indicates that the Game Center local player was not authenticated.
   */
  FIRAuthInternalErrorCodeGameKitNotLinked = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeGameKitNotLinked,

  /** Indicates that the second factor is required for sign in.
   */
  FIRAuthInternalErrorCodeSecondFactorRequired = FIRAuthPublicErrorCodeFlag |
                                                 FIRAuthErrorCodeSecondFactorRequired,

  /** Indicates that the multi factor session is missing.
   */
  FIRAuthInternalErrorCodeMissingMultiFactorSession = FIRAuthPublicErrorCodeFlag |
                                                      FIRAuthErrorCodeMissingMultiFactorSession,

  /** Indicates that the multi factor info is missing.
   */
  FIRAuthInternalErrorCodeMissingMultiFactorInfo = FIRAuthPublicErrorCodeFlag |
                                                   FIRAuthErrorCodeMissingMultiFactorInfo,

  /** Indicates that the multi factor session is invalid.
   */
  FIRAuthInternalErrorCodeInvalidMultiFactorSession = FIRAuthPublicErrorCodeFlag |
                                                      FIRAuthErrorCodeInvalidMultiFactorSession,

  /** Indicates that the multi factor info is not found.
   */
  FIRAuthInternalErrorCodeMultiFactorInfoNotFound = FIRAuthPublicErrorCodeFlag |
                                                    FIRAuthErrorCodeMultiFactorInfoNotFound,

  /** Indicates that the operation is admin only.
   */
  FIRAuthInternalErrorCodeAdminRestrictedOperation = FIRAuthPublicErrorCodeFlag |
                                                     FIRAuthErrorCodeAdminRestrictedOperation,

  /** Indicates that the email is unverified.
   */
  FIRAuthInternalErrorCodeUnverifiedEmail = FIRAuthPublicErrorCodeFlag |
                                            FIRAuthErrorCodeUnverifiedEmail,

  /** Indicates that the second factor is already enrolled.
   */
  FIRAuthInternalErrorCodeSecondFactorAlreadyEnrolled = FIRAuthPublicErrorCodeFlag |
                                                        FIRAuthErrorCodeSecondFactorAlreadyEnrolled,

  /** Indicates that the number of multi factors reached the limit.
   */
  FIRAuthInternalErrorCodeMaximumSecondFactorCountExceeded =
      FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeMaximumSecondFactorCountExceeded,

  /** Indicates that the first factor is not supportted.
   */
  FIRAuthInternalErrorCodeUnsupportedFirstFactor = FIRAuthPublicErrorCodeFlag |
                                                   FIRAuthErrorCodeUnsupportedFirstFactor,

  /** Indicates that the email needs to be verified before changed.
   */
  FIRAuthInternalErrorCodeEmailChangeNeedsVerification =
      FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeEmailChangeNeedsVerification,

  /** Indicates that the nonce is missing or invalid.
   */
  FIRAuthInternalErrorCodeMissingOrInvalidNonce = FIRAuthPublicErrorCodeFlag |
                                                  FIRAuthErrorCodeMissingOrInvalidNonce,

  /** Indicates that a non-null user was expected as an argmument to the operation but a null
        user was provided.
   */
  FIRAuthInternalErrorCodeNullUser = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeNullUser,

  /** Indicates that the provider id given for the web operation is invalid.
   */
  FIRAuthInternalErrorCodeInvalidProviderID = FIRAuthPublicErrorCodeFlag |
                                              FIRAuthErrorCodeInvalidProviderID,

  /** @var FIRAuthInternalErrorCodeTenantIDMismatch
      @brief Indicates an error occurred when an attempt is made to update the current user with a
          tenantId that differs from the current FirebaseAuth instance's tenantId.
   */
  FIRAuthInternalErrorCodeTenantIDMismatch = FIRAuthPublicErrorCodeFlag |
                                             FIRAuthErrorCodeTenantIDMismatch,

  /** @var FIRAuthInternalErrorCodeUnsupportedTenantOperation
      @brief Indicates an error occurred when operation is not supported in a multi-tenant context.
   */
  FIRAuthInternalErrorCodeUnsupportedTenantOperation = FIRAuthPublicErrorCodeFlag |
                                                       FIRAuthErrorCodeUnsupportedTenantOperation,

  /** Indicates that the Firebase Dynamic Link domain used is either not configured or is
     unauthorized for the current project.
   */
  FIRAuthInternalErrorCodeInvalidDynamicLinkDomain = FIRAuthPublicErrorCodeFlag |
                                                     FIRAuthErrorCodeInvalidDynamicLinkDomain,

  FIRAuthInternalErrorCodeMalformedJWT = FIRAuthPublicErrorCodeFlag | FIRAuthErrorCodeMalformedJWT,

  /** @var FIRAuthInternalErrorCodeRPCRequestEncodingError
      @brief Indicates an error encoding the RPC request.
      @remarks This is typically due to some sort of unexpected input value.

          See the @c NSUnderlyingError value in the @c NSError.userInfo dictionary for details.
   */
  FIRAuthInternalErrorCodeRPCRequestEncodingError = 1,

  /** @var FIRAuthInternalErrorCodeJSONSerializationError
      @brief Indicates an error serializing an RPC request.
      @remarks This is typically due to some sort of unexpected input value.

          If an @c NSJSONSerialization.isValidJSONObject: check fails, the error will contain no
          @c NSUnderlyingError key in the @c NSError.userInfo dictionary. If an error was
          encountered calling @c NSJSONSerialization.dataWithJSONObject:options:error:, the
          resulting error will be associated with the @c NSUnderlyingError key in the
          @c NSError.userInfo dictionary.
   */
  FIRAuthInternalErrorCodeJSONSerializationError = 2,

  /** @var FIRAuthInternalErrorCodeUnexpectedErrorResponse
      @brief Indicates an HTTP error occurred and the data returned either couldn't be deserialized
          or couldn't be decoded.
      @remarks See the @c NSUnderlyingError value in the @c NSError.userInfo dictionary for details
          about the HTTP error which occurred.

          If the response could be deserialized as JSON then the @c NSError.userInfo dictionary will
          contain a value for the key @c FIRAuthErrorUserInfoDeserializedResponseKey which is the
          deserialized response value.

          If the response could not be deserialized as JSON then the @c NSError.userInfo dictionary
          will contain values for the @c NSUnderlyingErrorKey and @c FIRAuthErrorUserInfoDataKey
          keys.
   */
  FIRAuthInternalErrorCodeUnexpectedErrorResponse = 3,

  /** @var FIRAuthInternalErrorCodeUnexpectedResponse
      @brief Indicates the HTTP response indicated the request was a successes, but the response
          contains something other than a JSON-encoded dictionary, or the data type of the response
          indicated it is different from the type of response we expected.
      @remarks See the @c NSUnderlyingError value in the @c NSError.userInfo dictionary.
          If this key is present in the dictionary, it may contain an error from
          @c NSJSONSerialization error (indicating the response received was of the wrong data
              type).

          See the @c FIRAuthErrorUserInfoDeserializedResponseKey value in the @c NSError.userInfo
          dictionary. If the response could be deserialized, it's deserialized representation will
          be associated with this key. If the @c NSUnderlyingError value in the @c NSError.userInfo
          dictionary is @c nil, this indicates the JSON didn't represent a dictionary.
   */
  FIRAuthInternalErrorCodeUnexpectedResponse = 4,

  /** @var FIRAuthInternalErrorCodeRPCResponseDecodingError
      @brief Indicates an error decoding the RPC response.
          This is typically due to some sort of unexpected response value from the server.
      @remarks See the @c NSUnderlyingError value in the @c NSError.userInfo dictionary for details.

          See the @c FIRErrorUserInfoDecodedResponseKey value in the @c NSError.userInfo dictionary.
          The deserialized representation of the response will be associated with this key.
   */
  FIRAuthInternalErrorCodeRPCResponseDecodingError = 5,
};

NS_ASSUME_NONNULL_END
