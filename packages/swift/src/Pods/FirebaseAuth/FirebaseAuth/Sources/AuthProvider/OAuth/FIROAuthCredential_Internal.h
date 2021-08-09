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
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIROAuthCredential.h"

@class FIRVerifyAssertionResponse;

NS_ASSUME_NONNULL_BEGIN

/** @extension FIROAuthCredential
    @brief Internal implementation of FIRAuthCredential for generic credentials.
 */
@interface FIROAuthCredential ()

/** @property OAuthResponseURLString
    @brief A string representation of the response URL corresponding to this OAuthCredential.
 */
@property(nonatomic, readonly, nullable) NSString *OAuthResponseURLString;

/** @property sessionID
    @brief The session ID used when completing the headful-lite flow.
 */
@property(nonatomic, readonly, nullable) NSString *sessionID;

/** @property pendingToken
    @brief The pending token used when completing the headful-lite flow.
 */
@property(nonatomic, readonly, nullable) NSString *pendingToken;

/** @fn initWithProviderId:IDToken:accessToken:secret:pendingToken
    @brief Designated initializer.
    @param providerID The provider ID associated with the credential being created.
    @param IDToken The ID Token associated with the credential being created.
    @param rawNonce The raw nonce associated with the Auth credential being created.
    @param accessToken The access token associated with the credential being created.
    @param secret The secret associated with the credential being created.
    @param pendingToken The pending token associated with the credential being created.
 */
- (instancetype)initWithProviderID:(NSString *)providerID
                           IDToken:(nullable NSString *)IDToken
                          rawNonce:(nullable NSString *)rawNonce
                       accessToken:(nullable NSString *)accessToken
                            secret:(nullable NSString *)secret
                      pendingToken:(nullable NSString *)pendingToken NS_DESIGNATED_INITIALIZER;

/** @fn initWithProviderId:sessionID:OAuthResponseURLString:
    @brief Intitializer which takes a sessionID and an OAuthResponseURLString.
    @param providerID The provider ID associated with the credential being created.
    @param sessionID The session ID used when completing the headful-lite flow.
    @param OAuthResponseURLString The error that occurred if any.
 */
- (instancetype)initWithProviderID:(NSString *)providerID
                         sessionID:(NSString *)sessionID
            OAuthResponseURLString:(NSString *)OAuthResponseURLString;

/** @fn initWithVerifyAssertionResponse
    @brief Intitializer which takes an verifyAssertion response.
    @param response The verifyAssertion Response to create the credential instance.
 */
- (nullable instancetype)initWithVerifyAssertionResponse:(FIRVerifyAssertionResponse *)response;

@end

NS_ASSUME_NONNULL_END
