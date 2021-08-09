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
#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"

@class FIRAuthRequestConfiguration;
@class FIRCreateAuthURIRequest;
@class FIRCreateAuthURIResponse;
@class FIRDeleteAccountRequest;
@class FIRDeleteAccountResponse;
@class FIREmailLinkSignInRequest;
@class FIREmailLinkSignInResponse;
@class FIRGetAccountInfoRequest;
@class FIRGetAccountInfoResponse;
@class FIRGetProjectConfigRequest;
@class FIRGetProjectConfigResponse;
@class FIRGetOOBConfirmationCodeRequest;
@class FIRGetOOBConfirmationCodeResponse;
@class FIRResetPasswordRequest;
@class FIRResetPasswordResponse;
@class FIRSecureTokenRequest;
@class FIRSecureTokenResponse;
@class FIRSetAccountInfoRequest;
@class FIRSetAccountInfoResponse;
@class FIRVerifyAssertionRequest;
@class FIRVerifyAssertionResponse;
@class FIRVerifyClientRequest;
@class FIRVerifyClientResponse;
@class FIRVerifyCustomTokenRequest;
@class FIRVerifyCustomTokenResponse;
@class FIRVerifyPasswordRequest;
@class FIRVerifyPasswordResponse;
@class FIRVerifyPhoneNumberRequest;
@class FIRVerifyPhoneNumberResponse;
@class FIRSendVerificationCodeRequest;
@class FIRSendVerificationCodeResponse;
@class FIRSignInWithGameCenterRequest;
@class FIRSignInWithGameCenterResponse;
@class FIRSignUpNewUserRequest;
@class FIRSignUpNewUserResponse;

@protocol FIRAuthBackendImplementation;
@protocol FIRAuthBackendRPCIssuer;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRAuthBackendRPCIssuerCompletionHandler
    @brief The type of block used to return the result of a call to an endpoint.
    @param data The HTTP response body.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRAuthBackendRPCIssuerCompletionHandler)(NSData *_Nullable data,
                                                         NSError *_Nullable error);

/** @typedef FIRCreateAuthURIResponseCallback
    @brief The type of block used to return the result of a call to the createAuthURI
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRCreateAuthURIResponseCallback)(FIRCreateAuthURIResponse *_Nullable response,
                                                 NSError *_Nullable error);

/** @typedef FIRGetAccountInfoResponseCallback
    @brief The type of block used to return the result of a call to the getAccountInfo
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRGetAccountInfoResponseCallback)(FIRGetAccountInfoResponse *_Nullable response,
                                                  NSError *_Nullable error);

/** @typedef FIRGetProjectConfigResponseCallback
    @brief The type of block used to return the result of a call to the getProjectInfo
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRGetProjectConfigResponseCallback)(FIRGetProjectConfigResponse *_Nullable response,
                                                    NSError *_Nullable error);

/** @typedef FIRSetAccountInfoResponseCallback
    @brief The type of block used to return the result of a call to the setAccountInfo
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRSetAccountInfoResponseCallback)(FIRSetAccountInfoResponse *_Nullable response,
                                                  NSError *_Nullable error);

/** @typedef FIRSecureTokenResponseCallback
    @brief The type of block used to return the result of a call to the token endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRSecureTokenResponseCallback)(FIRSecureTokenResponse *_Nullable response,
                                               NSError *_Nullable error);

/** @typedef FIRVerifyAssertionResponseCallback
    @brief The type of block used to return the result of a call to the verifyAssertion
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRVerifyAssertionResponseCallback)(FIRVerifyAssertionResponse *_Nullable response,
                                                   NSError *_Nullable error);

/** @typedef FIRVerifyPasswordResponseCallback
    @brief The type of block used to return the result of a call to the verifyPassword
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRVerifyPasswordResponseCallback)(FIRVerifyPasswordResponse *_Nullable response,
                                                  NSError *_Nullable error);

/** @typedef FIREmailLinkSigninResponseCallback
    @brief The type of block used to return the result of a call to the emailLinkSignin
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIREmailLinkSigninResponseCallback)(FIREmailLinkSignInResponse *_Nullable response,
                                                   NSError *_Nullable error);

/** @typedef FIRVerifyCustomTokenResponseCallback
    @brief The type of block used to return the result of a call to the verifyCustomToken
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRVerifyCustomTokenResponseCallback)(
    FIRVerifyCustomTokenResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRDeleteCallBack
    @brief The type of block called when a request delete account has finished.
    @param error The error which occurred, or nil if the request was successful.
 */
typedef void (^FIRDeleteCallBack)(NSError *_Nullable error);

/** @typedef FIRGetOOBConfirmationCodeResponseCallback
    @brief The type of block used to return the result of a call to the getOOBConfirmationCode
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRGetOOBConfirmationCodeResponseCallback)(
    FIRGetOOBConfirmationCodeResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRSignupNewUserCallback
    @brief The type of block used to return the result of a call to the signupNewUser endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRSignupNewUserCallback)(FIRSignUpNewUserResponse *_Nullable response,
                                         NSError *_Nullable error);

/** @typedef FIRResetPasswordCallback
    @brief The type of block used to return the result of a call to the resetPassword endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRResetPasswordCallback)(FIRResetPasswordResponse *_Nullable response,
                                         NSError *_Nullable error);

/** @typedef FIRSendVerificationCodeResponseCallback
    @brief The type of block used to return the result of a call to the sendVerificationCode
        endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRSendVerificationCodeResponseCallback)(
    FIRSendVerificationCodeResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRVerifyPhoneNumberResponseCallback
    @brief The type of block used to return the result of a call to the verifyPhoneNumber endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRVerifyPhoneNumberResponseCallback)(
    FIRVerifyPhoneNumberResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRVerifyClientResponseCallback
    @brief The type of block used to return the result of a call to the verifyClient endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRVerifyClientResponseCallback)(FIRVerifyClientResponse *_Nullable response,
                                                NSError *_Nullable error);

/** @typedef FIRSignInWithGameCenterResponseCallback
    @brief The type of block used to return the result of a call to the SignInWithGameCenter
   endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
 */
typedef void (^FIRSignInWithGameCenterResponseCallback)(
    FIRSignInWithGameCenterResponse *_Nullable response, NSError *_Nullable error);

/** @class FIRAuthBackend
    @brief Simple static class with methods representing the backend RPCs.
    @remarks All callback blocks passed as method parameters are invoked asynchronously on the
        global work queue in the future. See
        https://github.com/firebase/firebase-ios-sdk/tree/master/FirebaseAuth/Docs/threading.md
 */
@interface FIRAuthBackend : NSObject

/** @fn authUserAgent
    @brief Retrieves the Firebase Auth user agent.
    @return The Firebase Auth user agent.
 */
+ (NSString *)authUserAgent;

+ (id<FIRAuthBackendImplementation>)implementation;

/** @fn setBackendImplementation:
    @brief Changes the default backend implementation to something else.
    @param backendImplementation The backend implementation to use.
    @remarks This is not, generally, safe to call in a scenario where other backend requests may
        be occuring. This is specifically to help mock the backend for testing purposes.
 */
+ (void)setBackendImplementation:(id<FIRAuthBackendImplementation>)backendImplementation;

/** @fn setDefaultBackendImplementationWithRPCIssuer:
    @brief Uses the default backend implementation, but with a custom RPC issuer.
    @param RPCIssuer The RPC issuer to use. If @c nil, will use the default implementation.
    @remarks This is not, generally, safe to call in a scenario where other backend requests may
        be occuring. This is specifically to help test the backend interfaces (requests, responses,
        and shared FIRAuthBackend logic.)
 */
+ (void)setDefaultBackendImplementationWithRPCIssuer:
    (nullable id<FIRAuthBackendRPCIssuer>)RPCIssuer;

/** @fn createAuthURI:callback:
    @brief Calls the createAuthURI endpoint, which is responsible for creating the URI used by the
        IdP to authenticate the user.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)createAuthURI:(FIRCreateAuthURIRequest *)request
             callback:(FIRCreateAuthURIResponseCallback)callback;

/** @fn getAccountInfo:callback:
    @brief Calls the getAccountInfo endpoint, which returns account info for a given account.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)getAccountInfo:(FIRGetAccountInfoRequest *)request
              callback:(FIRGetAccountInfoResponseCallback)callback;

/** @fn getProjectConfig:callback:
    @brief Calls the getProjectConfig endpoint, which returns configuration information for a given
        project.
    @param request An object wrapping the backend get request.
    @param callback The callback.
 */
+ (void)getProjectConfig:(FIRGetProjectConfigRequest *)request
                callback:(FIRGetProjectConfigResponseCallback)callback;

/** @fn setAccountInfo:callback:
    @brief Calls the setAccountInfo endpoint, which is responsible for setting account info for a
        user, for example, to sign up a new user with email and password.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)setAccountInfo:(FIRSetAccountInfoRequest *)request
              callback:(FIRSetAccountInfoResponseCallback)callback;

/** @fn verifyAssertion:callback:
    @brief Calls the verifyAssertion endpoint, which is responsible for authenticating a
        user who has IDP-related credentials (an ID Token, an Access Token, etc.)
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)verifyAssertion:(FIRVerifyAssertionRequest *)request
               callback:(FIRVerifyAssertionResponseCallback)callback;

/** @fn verifyCustomToken:callback:
    @brief Calls the verifyCustomToken endpoint, which is responsible for authenticating a
        user who has BYOAuth credentials (a self-signed token using their BYOAuth private key.)
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)verifyCustomToken:(FIRVerifyCustomTokenRequest *)request
                 callback:(FIRVerifyCustomTokenResponseCallback)callback;

/** @fn verifyPassword:callback:
    @brief Calls the verifyPassword endpoint, which is responsible for authenticating a
        user who has email and password credentials.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)verifyPassword:(FIRVerifyPasswordRequest *)request
              callback:(FIRVerifyPasswordResponseCallback)callback;

/** @fn emailLinkSignin:callback:
    @brief Calls the emailLinkSignin endpoint, which is responsible for authenticating a
        user through passwordless sign-in.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)emailLinkSignin:(FIREmailLinkSignInRequest *)request
               callback:(FIREmailLinkSigninResponseCallback)callback;

/** @fn secureToken:callback:
    @brief Calls the token endpoint, which is responsible for performing STS token exchanges and
        token refreshes.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)secureToken:(FIRSecureTokenRequest *)request
           callback:(FIRSecureTokenResponseCallback)callback;

/** @fn getOOBConfirmationCode:callback:
    @brief Calls the getOOBConfirmationCode endpoint, which is responsible for sending email change
        request emails, and password reset emails.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)getOOBConfirmationCode:(FIRGetOOBConfirmationCodeRequest *)request
                      callback:(FIRGetOOBConfirmationCodeResponseCallback)callback;

/** @fn signUpNewUser:
    @brief Calls the signUpNewUser endpoint, which is responsible anonymously signing up a user
        or signing in a user anonymously.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)signUpNewUser:(FIRSignUpNewUserRequest *)request
             callback:(FIRSignupNewUserCallback)callback;

/** @fn resetPassword:callback
    @brief Calls the resetPassword endpoint, which is responsible for resetting a user's password
      given an OOB code and new password.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)resetPassword:(FIRResetPasswordRequest *)request
             callback:(FIRResetPasswordCallback)callback;

/** @fn deleteAccount:
    @brief Calls the DeleteAccount endpoint, which is responsible for deleting a user.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)deleteAccount:(FIRDeleteAccountRequest *)request callback:(FIRDeleteCallBack)callback;

/** @fn SignInWithGameCenter:callback:
    @brief Calls the SignInWithGameCenter endpoint, which is responsible for authenticating a user
      who has Game Center credentials.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)signInWithGameCenter:(FIRSignInWithGameCenterRequest *)request
                    callback:(FIRSignInWithGameCenterResponseCallback)callback;

#if TARGET_OS_IOS
/** @fn sendVerificationCode:callback:
    @brief Calls the sendVerificationCode endpoint, which is responsible for sending the
        verification code to a phone number specified in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)sendVerificationCode:(FIRSendVerificationCodeRequest *)request
                    callback:(FIRSendVerificationCodeResponseCallback)callback;

/** @fn verifyPhoneNumber:callback:
    @brief Calls the verifyPhoneNumber endpoint, which is responsible for sending the verification
        code to a phone number specified in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)verifyPhoneNumber:(FIRVerifyPhoneNumberRequest *)request
                 callback:(FIRVerifyPhoneNumberResponseCallback)callback;

/** @fn verifyClient:callback:
    @brief Calls the verifyClient endpoint, which is responsible for sending the silent push
        notification used for app validation to the device provided in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
+ (void)verifyClient:(FIRVerifyClientRequest *)request
            callback:(FIRVerifyClientResponseCallback)callback;
#endif

@end

/** @protocol FIRAuthBackendRPCIssuer
    @brief Used to make FIRAuthBackend
 */
@protocol FIRAuthBackendRPCIssuer <NSObject>

/** @fn asyncPostToURLWithRequestConfiguration:URL:body:contentType:completionHandler:
    @brief Asynchronously seXnds a POST request.
    @param requestConfiguration The request to be made.
    @param URL The request URL.
    @param body Request body.
    @param contentType Content type of the body.
    @param handler provided that handles POST response. Invoked asynchronously on the auth global
        work queue in the future.
 */
- (void)asyncPostToURLWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                                           URL:(NSURL *)URL
                                          body:(nullable NSData *)body
                                   contentType:(NSString *)contentType
                             completionHandler:(FIRAuthBackendRPCIssuerCompletionHandler)handler;

@end

/** @protocol FIRAuthBackendImplementation
    @brief Used to make FIRAuthBackend provide a layer of indirection to an actual RPC-based backend
        or a mock backend.
 */
@protocol FIRAuthBackendImplementation <NSObject>

/** @fn createAuthURI:callback:
    @brief Calls the createAuthURI endpoint, which is responsible for creating the URI used by the
        IdP to authenticate the user.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)createAuthURI:(FIRCreateAuthURIRequest *)request
             callback:(FIRCreateAuthURIResponseCallback)callback;

/** @fn getAccountInfo:callback:
    @brief Calls the getAccountInfo endpoint, which returns account info for a given account.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)getAccountInfo:(FIRGetAccountInfoRequest *)request
              callback:(FIRGetAccountInfoResponseCallback)callback;

/** @fn getProjectConfig:callback:
    @brief Calls the getProjectInfo endpoint, which returns configuration information for a given
        project.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)getProjectConfig:(FIRGetProjectConfigRequest *)request
                callback:(FIRGetProjectConfigResponseCallback)callback;

/** @fn setAccountInfo:callback:
    @brief Calls the setAccountInfo endpoint, which is responsible for setting account info for a
        user, for example, to sign up a new user with email and password.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)setAccountInfo:(FIRSetAccountInfoRequest *)request
              callback:(FIRSetAccountInfoResponseCallback)callback;

/** @fn verifyAssertion:callback:
    @brief Calls the verifyAssertion endpoint, which is responsible for authenticating a
        user who has IDP-related credentials (an ID Token, an Access Token, etc.)
    @param request The request parameters.
    @param callback The callback.
 */
- (void)verifyAssertion:(FIRVerifyAssertionRequest *)request
               callback:(FIRVerifyAssertionResponseCallback)callback;

/** @fn verifyCustomToken:callback:
    @brief Calls the verifyCustomToken endpoint, which is responsible for authenticating a
        user who has BYOAuth credentials (a self-signed token using their BYOAuth private key.)
    @param request The request parameters.
    @param callback The callback.
 */
- (void)verifyCustomToken:(FIRVerifyCustomTokenRequest *)request
                 callback:(FIRVerifyCustomTokenResponseCallback)callback;

/** @fn verifyPassword:callback:
    @brief Calls the verifyPassword endpoint, which is responsible for authenticating a
        user who has email and password credentials.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)verifyPassword:(FIRVerifyPasswordRequest *)request
              callback:(FIRVerifyPasswordResponseCallback)callback;

/** @fn emailLinkSignin:callback:
    @brief Calls the emailLinkSignin endpoint, which is responsible for authenticating a
        user through passwordless sign-in.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)emailLinkSignin:(FIREmailLinkSignInRequest *)request
               callback:(FIREmailLinkSigninResponseCallback)callback;

/** @fn secureToken:callback:
    @brief Calls the token endpoint, which is responsible for performing STS token exchanges and
        token refreshes.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)secureToken:(FIRSecureTokenRequest *)request
           callback:(FIRSecureTokenResponseCallback)callback;

/** @fn getOOBConfirmationCode:callback:
    @brief Calls the getOOBConfirmationCode endpoint, which is responsible for sending email change
        request emails, email sign-in link emails, and password reset emails.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)getOOBConfirmationCode:(FIRGetOOBConfirmationCodeRequest *)request
                      callback:(FIRGetOOBConfirmationCodeResponseCallback)callback;

/** @fn signUpNewUser:
    @brief Calls the signUpNewUser endpoint, which is responsible anonymously signing up a user
        or signing in a user anonymously.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)signUpNewUser:(FIRSignUpNewUserRequest *)request
             callback:(FIRSignupNewUserCallback)callback;

/** @fn deleteAccount:
    @brief Calls the DeleteAccount endpoint, which is responsible for deleting a user.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)deleteAccount:(FIRDeleteAccountRequest *)request callback:(FIRDeleteCallBack)callback;

#if TARGET_OS_IOS
/** @fn sendVerificationCode:callback:
    @brief Calls the sendVerificationCode endpoint, which is responsible for sending the
        verification code to a phone number specified in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)sendVerificationCode:(FIRSendVerificationCodeRequest *)request
                    callback:(FIRSendVerificationCodeResponseCallback)callback;

/** @fn verifyPhoneNumber:callback:
    @brief Calls the verifyPhoneNumber endpoint, which is responsible for sending the verification
        code to a phone number specified in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)verifyPhoneNumber:(FIRVerifyPhoneNumberRequest *)request
                 callback:(FIRVerifyPhoneNumberResponseCallback)callback;

/** @fn verifyClient:callback:
    @brief Calls the verifyClient endpoint, which is responsible for sending the silent push
        notification used for app validation to the device provided in the request parameters.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)verifyClient:(FIRVerifyClientRequest *)request
            callback:(FIRVerifyClientResponseCallback)callback;
#endif

/** @fn SignInWithGameCenter:callback:
    @brief Calls the SignInWithGameCenter endpoint, which is responsible for authenticating a user
      who has Game Center credentials.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)signInWithGameCenter:(FIRSignInWithGameCenterRequest *)request
                    callback:(FIRSignInWithGameCenterResponseCallback)callback;

/** @fn resetPassword:callback
    @brief Calls the resetPassword endpoint, which is responsible for resetting a user's password
      given an OOB code and new password.
    @param request The request parameters.
    @param callback The callback.
 */
- (void)resetPassword:(FIRResetPasswordRequest *)request
             callback:(FIRResetPasswordCallback)callback;

/** @fn postWithRequest:response:callback:
    @brief Calls the RPC using HTTP POST.
    @remarks Possible error responses:
        @see FIRAuthInternalErrorCodeRPCRequestEncodingError
        @see FIRAuthInternalErrorCodeJSONSerializationError
        @see FIRAuthInternalErrorCodeNetworkError
        @see FIRAuthInternalErrorCodeUnexpectedErrorResponse
        @see FIRAuthInternalErrorCodeUnexpectedResponse
        @see FIRAuthInternalErrorCodeRPCResponseDecodingError
    @param request The request.
    @param response The empty response to be filled.
    @param callback The callback for both success and failure.
*/
- (void)postWithRequest:(id<FIRAuthRPCRequest>)request
               response:(id<FIRAuthRPCResponse>)response
               callback:(void (^)(NSError *_Nullable error))callback;

@end

NS_ASSUME_NONNULL_END
