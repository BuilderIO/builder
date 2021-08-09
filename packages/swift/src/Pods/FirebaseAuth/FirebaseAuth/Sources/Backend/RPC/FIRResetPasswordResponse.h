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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCResponse.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRAuthResetPasswordResponse
    @brief Represents the response from the resetPassword endpoint.
    @remarks Possible error codes:
       - FIRAuthErrorCodeWeakPassword
       - FIRAuthErrorCodeUserDisabled
       - FIRAuthErrorCodeOperationNotAllowed
       - FIRAuthErrorCodeExpiredActionCode
       - FIRAuthErrorCodeInvalidActionCode
    @see https://developers.google.com/identity/toolkit/web/reference/relyingparty/resetPassword
 */
@interface FIRResetPasswordResponse : NSObject <FIRAuthRPCResponse>

/** @property email
    @brief The email address corresponding to the reset password request.
 */
@property(nonatomic, strong, readonly) NSString *email;

/** @property verifiedEmail
    @brief The verified email returned from the backend.
 */
@property(nonatomic, strong, readonly) NSString *verifiedEmail;

/** @property requestType
    @brief The tpye of request as returned by the backend.
 */
@property(nonatomic, strong, readonly) NSString *requestType;

@end

NS_ASSUME_NONNULL_END
