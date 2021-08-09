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

/** @class FIRVerifyAssertionResponse
    @brief Represents the response from the verifyAssertion endpoint.
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/verifyAssertion
 */
@interface FIRVerifyAssertionResponse : NSObject <FIRAuthRPCResponse>

/** @property federatedID
    @brief The unique ID identifies the IdP account.
 */
@property(nonatomic, strong, readonly, nullable) NSString *federatedID;

/** @property providerID
    @brief The IdP ID. For white listed IdPs it's a short domain name e.g. google.com, aol.com,
        live.net and yahoo.com. If the "providerId" param is set to OpenID OP identifer other than
        the whilte listed IdPs the OP identifier is returned. If the "identifier" param is federated
        ID in the createAuthUri request. The domain part of the federated ID is returned.
 */
@property(nonatomic, strong, readonly, nullable) NSString *providerID;

/** @property localID
    @brief The RP local ID if it's already been mapped to the IdP account identified by the
        federated ID.
 */
@property(nonatomic, strong, readonly, nullable) NSString *localID;

/** @property email
    @brief The email returned by the IdP. NOTE: The federated login user may not own the email.
 */
@property(nonatomic, strong, readonly, nullable) NSString *email;

/** @property inputEmail
    @brief It's the identifier param in the createAuthUri request if the identifier is an email. It
        can be used to check whether the user input email is different from the asserted email.
 */
@property(nonatomic, strong, readonly, nullable) NSString *inputEmail;

/** @property originalEmail
    @brief The original email stored in the mapping storage. It's returned when the federated ID is
        associated to a different email.
 */
@property(nonatomic, strong, readonly, nullable) NSString *originalEmail;

/** @property oauthRequestToken
    @brief The user approved request token for the OpenID OAuth extension.
 */
@property(nonatomic, strong, readonly, nullable) NSString *oauthRequestToken;

/** @property oauthScope
    @brief The scope for the OpenID OAuth extension.
 */
@property(nonatomic, strong, readonly, nullable) NSString *oauthScope;

/** @property firstName
    @brief The first name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *firstName;

/** @property lastName
    @brief The last name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *lastName;

/** @property fullName
    @brief The full name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *fullName;

/** @property nickName
    @brief The nick name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *nickName;

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

/** @property action
    @brief The action code.
 */
@property(nonatomic, strong, readonly, nullable) NSString *action;

/** @property language
    @brief The language preference of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *language;

/** @property timeZone
    @brief The timezone of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *timeZone;

/** @property photoURL
    @brief The URI of the public accessible profile picture.
 */
@property(nonatomic, strong, readonly, nullable) NSURL *photoURL;

/** @property dateOfBirth
    @brief The birth date of the IdP account.
 */
@property(nonatomic, strong, readonly, nullable) NSString *dateOfBirth;

/** @property context
    @brief The opaque value used by the client to maintain context info between the authentication
        request and the IDP callback.
 */
@property(nonatomic, strong, readonly, nullable) NSString *context;

/** @property verifiedProvider
    @brief When action is 'map', contains the idps which can be used for confirmation.
 */
@property(nonatomic, strong, readonly, nullable) NSArray<NSString *> *verifiedProvider;

/** @property needConfirmation
    @brief Whether the assertion is from a non-trusted IDP and need account linking confirmation.
 */
@property(nonatomic, assign) BOOL needConfirmation;

/** @property emailRecycled
    @brief It's true if the email is recycled.
 */
@property(nonatomic, assign) BOOL emailRecycled;

/** @property emailVerified
    @brief The value is true if the IDP is also the email provider. It means the user owns the
        email.
 */
@property(nonatomic, assign) BOOL emailVerified;

/** @property isNewUser
    @brief Flag indicating that the user signing in is a new user and not a returning user.
 */
@property(nonatomic, assign) BOOL isNewUser;

/** @property profile
    @brief Dictionary containing the additional IdP specific information.
 */
@property(nonatomic, readonly, nullable) NSDictionary<NSString *, NSObject *> *profile;

/** @property username
    @brief The name of the user.
 */
@property(nonatomic, strong, readonly, nullable) NSString *username;

/** @property oauthIDToken
    @brief The ID token for the OpenID OAuth extension.
 */
@property(nonatomic, strong, readonly, nullable) NSString *oauthIDToken;

/** @property oauthExpirationDate
    @brief The approximate expiration date of the oauth access token.
 */
@property(nonatomic, copy, readonly, nullable) NSDate *oauthExpirationDate;

/** @property oauthAccessToken
    @brief The access token for the OpenID OAuth extension.
 */
@property(nonatomic, strong, readonly, nullable) NSString *oauthAccessToken;

/** @property oauthSecretToken
    @brief The secret for the OpenID OAuth extention.
 */
@property(nonatomic, readonly, nullable) NSString *oauthSecretToken;

/** @property pendingToken
    @brief The pending ID Token string.
 */
@property(nonatomic, copy, nullable) NSString *pendingToken;

@property(nonatomic, strong, readonly, nullable) NSString *MFAPendingCredential;

@property(nonatomic, strong, readonly, nullable) NSArray<FIRAuthProtoMFAEnrollment *> *MFAInfo;

@end

NS_ASSUME_NONNULL_END
