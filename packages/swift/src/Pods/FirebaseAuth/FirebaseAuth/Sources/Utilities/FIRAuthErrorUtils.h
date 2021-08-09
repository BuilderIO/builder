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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRMultiFactorInfo.h"

#import "FirebaseAuth/Sources/Utilities/FIRAuthInternalErrors.h"

@class FIRAuthCredential;

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthErrorUtils
    @brief Utility class used to construct @c NSError instances.
 */
@interface FIRAuthErrorUtils : NSObject

+ (NSError *)errorWithCode:(FIRAuthInternalErrorCode)code message:(nullable NSString *)message;

/** @fn RPCRequestEncodingErrorWithUnderlyingError
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeRPCRequestEncodingError
        code and a populated @c NSUnderlyingErrorKey in the @c NSError.userInfo dictionary.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key.
    @remarks This error is used when an @c FIRAuthRPCRequest.unencodedHTTPRequestBodyWithError:
        invocation returns an error. The error returned is wrapped in this internal error code.
 */
+ (NSError *)RPCRequestEncodingErrorWithUnderlyingError:(NSError *)underlyingError;

/** @fn JSONSerializationErrorForUnencodableType
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeJSONSerializationError code.
    @remarks This error is used when an @c NSJSONSerialization.isValidJSONObject: check fails, not
        for when an error is returned from @c NSJSONSerialization.dataWithJSONObject:options:error:.
 */
+ (NSError *)JSONSerializationErrorForUnencodableType;

/** @fn JSONSerializationErrorWithUnderlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeJSONSerializationError code, and the
        @c underlyingError as the @c NSUnderlyingErrorKey value in the @c NSError.userInfo
        dictionary.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key.
    @remarks This error is used when an invocation of
        @c NSJSONSerialization.dataWithJSONObject:options:error: returns an error.
 */
+ (NSError *)JSONSerializationErrorWithUnderlyingError:(NSError *)underlyingError;

/** @fn networkErrorWithUnderlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeNetworkError code, and the
        @c underlyingError as the @c NSUnderlyingErrorKey value in the @c NSError.userInfo
        dictionary.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key. Should be the error from
        GTM.
    @remarks This error is used when a network request results in an error, and no body data was
        returned.
 */
+ (NSError *)networkErrorWithUnderlyingError:(NSError *)underlyingError;

/** @fn unexpectedErrorResponseWithUnderlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeNetworkError code, and the
        @c underlyingError as the @c NSUnderlyingErrorKey value.
    @param data The value of the @c FIRAuthErrorUserInfoDataKey key in the @c NSError.userInfo
        dictionary.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key in the @c NSError.userInfo
        dictionary.
    @remarks This error is used when a network request results in an error, and unserializable body
        data was returned.
 */
+ (NSError *)unexpectedErrorResponseWithData:(NSData *)data
                             underlyingError:(NSError *)underlyingError;

/** @fn unexpectedErrorResponseWithDeserializedResponse:
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeUnexpectedErrorResponse
        code, and a populated @c FIRAuthErrorUserInfoDeserializedResponseKey key in the
        @c NSError.userInfo dictionary.
    @param deserializedResponse The value of the @c FIRAuthErrorUserInfoDeserializedResponseKey key.
    @remarks This error is used when a network request results in an error, and the body data was
        deserializable as JSON, but couldn't be decoded as an error.
 */
+ (NSError *)unexpectedErrorResponseWithDeserializedResponse:(id)deserializedResponse;

/** @fn malformedJWTErrorWithToken:underlyingError:
    @brief Constructs an @c NSError with the code set to @c FIRAuthErrorCodeMalformedJWT and
        populates the userInfo dictionary with an error message, the bad token, and an underlying
        error that may have occurred when parsing.
    @param token The token that failed to parse.
    @param underlyingError The error that caused this error. If this parameter is nil, the
        NSUnderlyingErrorKey value will not be set.
    @remarks This error is returned when JWT parsing fails.
    @returns An @c FIRAuthErrorCodeMalformedJWT error wrapping an underlying error, if available.
 */
+ (NSError *)malformedJWTErrorWithToken:(NSString *)token
                        underlyingError:(NSError *_Nullable)underlyingError;

/** @fn unexpectedResponseWithData:underlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeUnexpectedResponse
        code, and a populated @c FIRAuthErrorUserInfoDataKey key in the @c NSError.userInfo
        dictionary.
    @param data The value of the @c FIRAuthErrorUserInfoDataKey key in the @c NSError.userInfo
        dictionary.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key in the @c NSError.userInfo
        dictionary.
    @remarks This error is used when a network request is apparently successful, but the body data
        couldn't be deserialized as JSON.
 */
+ (NSError *)unexpectedResponseWithData:(NSData *)data underlyingError:(NSError *)underlyingError;
;

/** @fn unexpectedResponseWithDeserializedResponse:
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeUnexpectedResponse
        code, and a populated @c FIRAuthErrorUserInfoDeserializedResponseKey key in the
        @c NSError.userInfo dictionary.
    @param deserializedResponse The value of the @c FIRAuthErrorUserInfoDeserializedResponseKey key.
    @remarks This error is used when a network request is apparently successful, the body data was
        successfully deserialized as JSON, but the JSON wasn't a dictionary.
 */
+ (NSError *)unexpectedResponseWithDeserializedResponse:(id)deserializedResponse;

/** @fn unexpectedResponseWithDeserializedResponse:underlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeUnexpectedResponse
        code, and populated @c FIRAuthErrorUserInfoDeserializedResponseKey and
        @c NSUnderlyingErrorKey keys in the @c NSError.userInfo dictionary.
    @param deserializedResponse The value of the @c FIRAuthErrorUserInfoDeserializedResponseKey key.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key.
    @remarks This error is used when a network request was apparently successful, the body data was
        successfully deserialized as JSON, but the data type of the response was unexpected.
 */
+ (NSError *)unexpectedResponseWithDeserializedResponse:(nullable id)deserializedResponse
                                        underlyingError:(NSError *)underlyingError;

/** @fn RPCResponseDecodingErrorWithDeserializedResponse:underlyingError:
    @brief Constructs an @c NSError with the @c FIRAuthInternalErrorCodeRPCResponseDecodingError
        code, and populated @c FIRAuthErrorUserInfoDeserializedResponseKey and
        @c NSUnderlyingErrorKey keys in the @c NSError.userInfo dictionary.
    @param deserializedResponse The value of the @c FIRAuthErrorUserInfoDeserializedResponseKey key.
    @param underlyingError The value of the @c NSUnderlyingErrorKey key.
    @remarks This error is used when an invocation of @c FIRAuthRPCResponse.setWithDictionary:error:
        resulted in an error.
 */
+ (NSError *)RPCResponseDecodingErrorWithDeserializedResponse:(id)deserializedResponse
                                              underlyingError:(NSError *)underlyingError;

/** @fn emailAlreadyInUseErrorWithEmail:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeEmailExists code.
    @param email The email address that is already in use.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)emailAlreadyInUseErrorWithEmail:(nullable NSString *)email;

/** @fn userDisabledErrorWithMessageWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeUserDisabled code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)userDisabledErrorWithMessage:(nullable NSString *)message;

/** @fn wrongPasswordErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeWrongPassword code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)wrongPasswordErrorWithMessage:(nullable NSString *)message;

/** @fn tooManyRequestsErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeTooManyRequests Code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)tooManyRequestsErrorWithMessage:(nullable NSString *)message;

/** @fn invalidCustomTokenErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidCustomToken code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidCustomTokenErrorWithMessage:(nullable NSString *)message;

/** @fn customTokenMistmatchErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeCustomTokenMismatch code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)customTokenMistmatchErrorWithMessage:(nullable NSString *)message;

/** @fn invalidCredentialErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidCredential code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidCredentialErrorWithMessage:(nullable NSString *)message;

/** @fn requiresRecentLoginError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeRequiresRecentLogin code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)requiresRecentLoginErrorWithMessage:(nullable NSString *)message;

/** @fn invalidUserTokenErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidUserToken code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidUserTokenErrorWithMessage:(nullable NSString *)message;

/** @fn invalidEmailErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidEmail code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidEmailErrorWithMessage:(nullable NSString *)message;

/** @fn accountExistsWithDifferentCredentialErrorWithEmail:
    @brief Constructs an @c NSError with the @c FIRAuthErrorAccountExistsWithDifferentCredential
        code.
    @param email The email address that is already associated with an existing account
    @param updatedCredential The updated credential for the existing account
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)accountExistsWithDifferentCredentialErrorWithEmail:(nullable NSString *)email
                                              updatedCredential:
                                                  (nullable FIRAuthCredential *)updatedCredential;

/** @fn providerAlreadyLinkedErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeProviderAlreadyLinked code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)providerAlreadyLinkedError;

/** @fn noSuchProviderError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeNoSuchProvider code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)noSuchProviderError;

/** @fn userTokenExpiredErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeUserTokenExpired code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)userTokenExpiredErrorWithMessage:(nullable NSString *)message;

/** @fn userNotFoundErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeUserNotFound code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)userNotFoundErrorWithMessage:(nullable NSString *)message;

/** @fn invalidLocalAPIKeyErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidAPIKey code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidAPIKeyError;

/** @fn userMismatchError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeUserMismatch code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)userMismatchError;

/** @fn credentialAlreadyInUseErrorWithMessage:email:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeCredentialAlreadyInUse code.
    @param message Error message from the backend, if any.
    @param credential Auth credential to be added to the Error User Info dictionary.
    @param email Email to be added to the Error User Info dictionary.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)credentialAlreadyInUseErrorWithMessage:(nullable NSString *)message
                                         credential:(nullable FIRAuthCredential *)credential
                                              email:(nullable NSString *)email;
/** @fn operationNotAllowedErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeOperationNotAllowed code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)operationNotAllowedErrorWithMessage:(nullable NSString *)message;

/** @fn weakPasswordErrorWithServerResponseReason:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeWeakPassword code.
    @param serverResponseReason A more detailed explanation string from server response.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)weakPasswordErrorWithServerResponseReason:(nullable NSString *)serverResponseReason;

/** @fn appNotAuthorizedError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeAppNotAuthorized code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)appNotAuthorizedError;

/** @fn expiredActionCodeErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeExpiredActionCode code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)expiredActionCodeErrorWithMessage:(nullable NSString *)message;

/** @fn invalidActionCodeErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidActionCode code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidActionCodeErrorWithMessage:(nullable NSString *)message;

/** @fn invalidMessagePayloadError:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidMessagePayload code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidMessagePayloadErrorWithMessage:(nullable NSString *)message;

/** @fn invalidSenderErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidSender code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidSenderErrorWithMessage:(nullable NSString *)message;

/** @fn invalidRecipientEmailError:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidRecipientEmail code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidRecipientEmailErrorWithMessage:(nullable NSString *)message;

/** @fn missingIosBundleIDErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingIosBundleID code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingIosBundleIDErrorWithMessage:(nullable NSString *)message;

/** @fn missingAndroidPackageNameErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingAndroidPackageName code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingAndroidPackageNameErrorWithMessage:(nullable NSString *)message;

/** @fn unauthorizedDomainErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeUnauthorizedDomain code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)unauthorizedDomainErrorWithMessage:(nullable NSString *)message;

/** @fn invalidContinueURIErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidContinueURI code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidContinueURIErrorWithMessage:(nullable NSString *)message;

/** @fn missingContinueURIErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingContinueURI code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingContinueURIErrorWithMessage:(nullable NSString *)message;

/** @fn missingEmailErrorWithMessage
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingEmail code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingEmailErrorWithMessage:(nullable NSString *)message;

/** @fn missingPhoneNumberErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingPhoneNumber code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingPhoneNumberErrorWithMessage:(nullable NSString *)message;

/** @fn invalidPhoneNumberErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidPhoneNumber code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidPhoneNumberErrorWithMessage:(nullable NSString *)message;

/** @fn missingVerificationCodeErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingVerificationCode code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingVerificationCodeErrorWithMessage:(nullable NSString *)message;

/** @fn invalidVerificationCodeErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidVerificationCode code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidVerificationCodeErrorWithMessage:(nullable NSString *)message;

/** @fn missingVerificationIDErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingVerificationID code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingVerificationIDErrorWithMessage:(nullable NSString *)message;

/** @fn invalidVerificationIDErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidVerificationID code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidVerificationIDErrorWithMessage:(nullable NSString *)message;

/** @fn sessionExpiredErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeSessionExpired code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)sessionExpiredErrorWithMessage:(nullable NSString *)message;

/** @fn missingAppCredentialWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorMissingCredential code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingAppCredentialWithMessage:(nullable NSString *)message;

/** @fn invalidAppCredentialWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorInvalidCredential code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)invalidAppCredentialWithMessage:(nullable NSString *)message;

/** @fn quotaExceededErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeQuotaExceeded code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)quotaExceededErrorWithMessage:(nullable NSString *)message;

/** @fn missingAppTokenErrorWithUnderlyingError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingAppToken code.
    @param underlyingError The underlying error, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingAppTokenErrorWithUnderlyingError:(nullable NSError *)underlyingError;

/** @fn localPlayerNotAuthenticatedError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeLocalPlayerNotAuthenticated code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)localPlayerNotAuthenticatedError;

/** @fn gameKitNotLinkedError
   @brief Constructs an @c NSError with the @c FIRAuthErrorCodeGameKitNotLinked code.
   @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)gameKitNotLinkedError;

/** @fn notificationNotForwardedError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeNotificationNotForwarded code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)notificationNotForwardedError;

#if TARGET_OS_IOS
/** @fn secondFactorRequiredError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeSecondFactorRequired code.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)secondFactorRequiredErrorWithPendingCredential:(NSString *)MFAPendingCredential
                                                      hints:(NSArray<FIRMultiFactorInfo *> *)
                                                                multiFactorInfo;
#endif

/** @fn appNotVerifiedErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeAppNotVerified code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)appNotVerifiedErrorWithMessage:(nullable NSString *)message;

/** @fn missingClientIdentifierErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeMissingClientIdentifier code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)missingClientIdentifierErrorWithMessage:(nullable NSString *)message;

/** @fn captchaCheckFailedErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCaptchaCheckFailed code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)captchaCheckFailedErrorWithMessage:(nullable NSString *)message;

/** @fn webContextAlreadyPresentedErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeWebContextAlreadyPresented code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)webContextAlreadyPresentedErrorWithMessage:(nullable NSString *)message;

/** @fn webContextCancelledErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeWebContextCancelled code.
    @param message Error message from the backend, if any.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)webContextCancelledErrorWithMessage:(nullable NSString *)message;

/** @fn appVerificationUserInteractionFailureWithReason:
    @brief Constructs an @c NSError with the @c
        FIRAuthErrorCodeAppVerificationUserInteractionFailure code.
    @param reason Reason for error, returned via URL response.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)appVerificationUserInteractionFailureWithReason:(NSString *)reason;

/** @fn webSignInUserInteractionFailureWithReason:
    @brief Constructs an @c NSError with the @c
        FIRAuthErrorCodeWebSignInUserInteractionFailure code.
    @param reason Reason for error, returned via URL response.
    @return The NSError instance associated with the given FIRAuthError.
 */
+ (NSError *)webSignInUserInteractionFailureWithReason:(nullable NSString *)reason;

/** @fn URLResponseErrorWithCode:message:
    @brief Constructs an @c NSError with the code and message provided.
    @param message Error message from the backend, if any.
    @return The nullable NSError instance associated with the given error message, if one is found.
 */
+ (nullable NSError *)URLResponseErrorWithCode:(NSString *)code
                                       message:(nullable NSString *)message;

/** @fn nullUserErrorWithMessage:
    @brief Constructs an @c NSError with the code and message provided.
    @param message Error message from the backend, if any.
    @return The nullable NSError instance associated with the given error message, if one is found.
 */
+ (NSError *)nullUserErrorWithMessage:(nullable NSString *)message;

/** @fn invalidProviderIDErrorWithMessage:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeInvalidProviderID code.
    @param message Error message from the backend, if any.
    @remarks This error indicates that the provider id given for the web operation is invalid.
 */
+ (NSError *)invalidProviderIDErrorWithMessage:(nullable NSString *)message;

/** @fn invalidDynamicLinkDomainErrorWithMessage:
    @brief Constructs an @c NSError with the code and message provided.
    @param message Error message from the backend, if any.
    @return The nullable NSError instance associated with the given error message, if one is found.
 */
+ (NSError *)invalidDynamicLinkDomainErrorWithMessage:(nullable NSString *)message;

/** @fn keychainErrorWithFunction:status:
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeKeychainError code.
    @param keychainFunction The keychain function which was invoked and yielded an unexpected
        response. The @c NSLocalizedFailureReasonErrorKey field in the @c NSError.userInfo
        dictionary will contain a string partially comprised of this value.
    @param status The response status from the invoked keychain function. The
        @c NSLocalizedFailureReasonErrorKey field in the @c NSError.userInfo dictionary will contain
        a string partially comprised of this value.
 */
+ (NSError *)keychainErrorWithFunction:(NSString *)keychainFunction status:(OSStatus)status;

/** @fn missingOrInvalidNonceErrorWithMessage:
    @brief Constructs an @c NSError with the code and message provided.
    @param message Error message from the backend, if any.
    @return The nullable NSError instance associated with the given error message, if one is found.
*/
+ (NSError *)missingOrInvalidNonceErrorWithMessage:(nullable NSString *)message;

/** @fn tenantIDMismatchError
    @brief Constructs an @c NSError with the @c FIRAuthErrorCodeTenantIDMismatch code.
    @remarks This error is used when an attempt is made to update the current user with a
        tenantId that differs from the current FirebaseAuth instance's tenantId.
 */
+ (NSError *)tenantIDMismatchError;

/** @fn unsupportedTenantOperationError
    @brief Constructs an @c NSError with the @c FIRUnsupportedTenantOperation code.
    @remarks This error indicates the operation is not supported in a multi-tenant context.
 */
+ (NSError *)unsupportedTenantOperationError;

@end

NS_ASSUME_NONNULL_END
