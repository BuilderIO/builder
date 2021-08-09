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

@class FIRGetAccountInfoResponse;

NS_ASSUME_NONNULL_BEGIN

/** @var FIRSetAccountInfoUserAttributeEmail
    @brief Constant for email attribute used in "deleteAttributes".
 */
extern NSString *const FIRSetAccountInfoUserAttributeEmail;

/** @var FIRSetAccountInfoUserAttributeDisplayName
    @brief Constant for displayName attribute used in "deleteAttributes".
 */
extern NSString *const FIRSetAccountInfoUserAttributeDisplayName;

/** @var FIRSetAccountInfoUserAttributeProvider
    @brief Constant for provider attribute used in "deleteAttributes".
 */
extern NSString *const FIRSetAccountInfoUserAttributeProvider;

/** @var FIRSetAccountInfoUserAttributePhotoURL
    @brief Constant for photoURL attribute used in "deleteAttributes".
 */
extern NSString *const FIRSetAccountInfoUserAttributePhotoURL;

/** @var FIRSetAccountInfoUserAttributePassword
    @brief Constant for password attribute used in "deleteAttributes".
 */
extern NSString *const FIRSetAccountInfoUserAttributePassword;

/** @class FIRSetAccountInfoRequest
    @brief Represents the parameters for the setAccountInfo endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/setAccountInfo
 */
@interface FIRSetAccountInfoRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

/** @property accessToken
    @brief The STS Access Token of the authenticated user.
 */
@property(nonatomic, copy, nullable) NSString *accessToken;

/** @property displayName
    @brief The name of the user.
 */
@property(nonatomic, copy, nullable) NSString *displayName;

/** @property localID
    @brief The local ID of the user.
 */
@property(nonatomic, copy, nullable) NSString *localID;

/** @property email
    @brief The email of the user.
 */
@property(nonatomic, copy, nullable) NSString *email;

/** @property photoURL
    @brief The photoURL of the user.
 */
@property(nonatomic, copy, nullable) NSURL *photoURL;

/** @property password
    @brief The new password of the user.
 */
@property(nonatomic, copy, nullable) NSString *password;

/** @property providers
    @brief The associated identity providers of the user.
 */
@property(nonatomic, copy, nullable) NSArray<NSString *> *providers;

/** @property OOBCode
    @brief The out-of-band code of the change email request.
 */
@property(nonatomic, copy, nullable) NSString *OOBCode;

/** @property emailVerified
    @brief Whether to mark the email as verified or not.
 */
@property(nonatomic, assign) BOOL emailVerified;

/** @property upgradeToFederatedLogin
    @brief Whether to mark the user to upgrade to federated login.
 */
@property(nonatomic, assign) BOOL upgradeToFederatedLogin;

/** @property captchaChallenge
    @brief The captcha challenge.
 */
@property(nonatomic, copy, nullable) NSString *captchaChallenge;

/** @property captchaResponse
    @brief Response to the captcha.
 */
@property(nonatomic, copy, nullable) NSString *captchaResponse;

/** @property deleteAttributes
    @brief The list of user attributes to delete.
    @remarks Every element of the list must be one of the predefined constant starts with
        "FIRSetAccountInfoUserAttribute".
 */
@property(nonatomic, copy, nullable) NSArray<NSString *> *deleteAttributes;

/** @property deleteProviders
    @brief The list of identity providers to delete.
 */
@property(nonatomic, copy, nullable) NSArray<NSString *> *deleteProviders;

/** @property returnSecureToken
    @brief Whether the response should return access token and refresh token directly.
    @remarks The default value is @c YES .
 */
@property(nonatomic, assign) BOOL returnSecureToken;

/** @fn initWithEndpoint:requestConfiguration:
    @brief Please use initWithAPIKey:email:password:displayName:requestConfiguration instead.
 */
- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
    NS_UNAVAILABLE;

/** @fn initWithRequestConfiguration:
    @brief Designated initializer.
    @param requestConfiguration An object containing configurations to be added to the request.
 */
- (nullable instancetype)initWithRequestConfiguration:
    (FIRAuthRequestConfiguration *)requestConfiguration NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
