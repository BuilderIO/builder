/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import "FirebaseAuth/Sources/Backend/FIRAuthBackend.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Enroll/FIRFinalizeMFAEnrollmentRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Enroll/FIRFinalizeMFAEnrollmentResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Enroll/FIRStartMFAEnrollmentRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Enroll/FIRStartMFAEnrollmentResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRFinalizeMFASignInRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRFinalizeMFASignInResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRStartMFASignInRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/SignIn/FIRStartMFASignInResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Unenroll/FIRWithdrawMFARequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Unenroll/FIRWithdrawMFAResponse.h"

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRStartMFAEnrollmentResponseCallback
    @brief The type of block used to return the result of a call to the startMFAEnroll endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
*/
typedef void (^FIRStartMFAEnrollmentResponseCallback)(
    FIRStartMFAEnrollmentResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRFinalizeMFAEnrollmentResponseCallback
    @brief The type of block used to return the result of a call to the finalizeMFAEnroll endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
*/
typedef void (^FIRFinalizeMFAEnrollmentResponseCallback)(
    FIRFinalizeMFAEnrollmentResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRStartMFASignInResponseCallback
    @brief The type of block used to return the result of a call to the startMFASignIn endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
*/
typedef void (^FIRStartMFASignInResponseCallback)(FIRStartMFASignInResponse *_Nullable response,
                                                  NSError *_Nullable error);

/** @typedef FIRFinalizeMFASignInResponseCallback
    @brief The type of block used to return the result of a call to the finalizeMFASignIn endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
*/
typedef void (^FIRFinalizeMFASignInResponseCallback)(
    FIRFinalizeMFASignInResponse *_Nullable response, NSError *_Nullable error);

/** @typedef FIRWithdrawMFAResponseCallback
    @brief The type of block used to return the result of a call to the MFAUnenroll endpoint.
    @param response The received response, if any.
    @param error The error which occurred, if any.
    @remarks One of response or error will be non-nil.
*/
typedef void (^FIRWithdrawMFAResponseCallback)(FIRWithdrawMFAResponse *_Nullable response,
                                               NSError *_Nullable error);

@interface FIRAuthBackend (MultiFactor)

/** @fn startMultiFactorEnrollment:callback:
    @brief Calls the startMFAEnrollment endpoint.
    @param request The request parameters.
    @param callback The callback.
*/
+ (void)startMultiFactorEnrollment:(FIRStartMFAEnrollmentRequest *)request
                          callback:(FIRStartMFAEnrollmentResponseCallback)callback;

/** @fn finalizeMultiFactorEnrollment:callback:
    @brief Calls the finalizeMultiFactorEnrollment endpoint.
    @param request The request parameters.
    @param callback The callback.
*/
+ (void)finalizeMultiFactorEnrollment:(FIRFinalizeMFAEnrollmentRequest *)request
                             callback:(FIRFinalizeMFAEnrollmentResponseCallback)callback;

/** @fn startMultiFactorSignIn:callback:
    @brief Calls the startMultiFactorSignIn endpoint.
    @param request The request parameters.
    @param callback The callback.
*/
+ (void)startMultiFactorSignIn:(FIRStartMFASignInRequest *)request
                      callback:(FIRStartMFASignInResponseCallback)callback;

/** @fn finalizeMultiFactorSignIn:callback:
    @brief Calls the finalizeMultiFactorSignIn endpoint.
    @param request The request parameters.
    @param callback The callback.
*/
+ (void)finalizeMultiFactorSignIn:(FIRFinalizeMFASignInRequest *)request
                         callback:(FIRFinalizeMFASignInResponseCallback)callback;

/** @fn withdrawMultiFactor:callback:
    @brief Calls the withdrawMultiFactor endpoint.
    @param request The request parameters.
    @param callback The callback.
*/
+ (void)withdrawMultiFactor:(FIRWithdrawMFARequest *)request
                   callback:(FIRWithdrawMFAResponseCallback)callback;

@end

NS_ASSUME_NONNULL_END

#endif
