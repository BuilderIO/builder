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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/Proto/FIRAuthProtoMFAEnrollment.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRVerifyPasswordResponse
    @brief Represents the response from the verifyPassword endpoint.
    @remarks Possible error codes:
       - FIRAuthInternalErrorCodeUserDisabled
       - FIRAuthInternalErrorCodeEmailNotFound
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/verifyPassword
 */
@interface FIRVerifyPasswordResponse : NSObject <FIRAuthRPCResponse>

/** @property localID
    @brief The RP local ID if it's already been mapped to the IdP account identified by the
        federated ID.
 */
@property(nonatomic, strong, readonly, nullable) NSString *localID;

/** @property email
    @brief The email returned by the IdP. NOTE: The federated login user may not own the email.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property displayName
    @brief The display name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *displayName;

/** @property IDToken
    @brief Either an authorization code suitable for performing an STS token exchange, or the
        access token from Secure Token Service, depending on whether @c returnSecureToken is set
        on the request.
 */
@property(nonatomic, strong, readonly, nullable) NSString *IDToken;

/** @property approximateExpirationDate
    @brief The approximate expiration date of the access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *approximateExpirationDate;

/** @property refreshToken
    @brief The refresh token from Secure Token Service.
 */
@property(nonatomic, strong, readonly, nullable) NSString *refreshToken;

/** @property photoURL
    @brief The URI of the public accessible profile picture.
 */
@property(nonatomic, strong, readonly, nullable) NSURL *photoURL;

@property(nonatomic, strong, readonly, nullable) NSString *MFAPendingCredential;

@property(nonatomic, strong, readonly, nullable) NSArray<FIRAuthProtoMFAEnrollment *> *MFAInfo;

@end

NS_ASSUME_NONNULL_END
