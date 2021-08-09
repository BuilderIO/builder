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

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import <Foundation/Foundation.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRPhoneAuthCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @extension FIRPhoneAuthCredential
    @brief Internal implementation of FIRAuthCredential for Phone Auth credentials.
 */
@interface FIRPhoneAuthCredential ()

/** @var verificationID
    @brief The verification ID obtained from invoking @c verifyPhoneNumber:completion:
 */
@property(nonatomic, readonly, nonnull) NSString *verificationID;

/** @var verificationCode
    @brief The verification code provided by the user.
 */
@property(nonatomic, readonly, nonnull) NSString *verificationCode;

/** @var temporaryProof
    @brief The a temporary proof code perftaining to this credential, returned from the backend.
 */
@property(nonatomic, readonly, nonnull) NSString *temporaryProof;

/** @var phoneNumber
    @brief The a phone number pertaining to this credential, returned from the backend.
 */
@property(nonatomic, readonly, nonnull) NSString *phoneNumber;

/** @var initWithTemporaryProof:phoneNumber:
    @brief Designated Initializer.
    @param providerID The provider ID associated with the phone auth credential being created.
 */
- (instancetype)initWithTemporaryProof:(NSString *)temporaryProof
                           phoneNumber:(NSString *)phoneNumber
                            providerID:(NSString *)providerID NS_DESIGNATED_INITIALIZER;

/** @var initWithProviderID:verificationID:verificationCode:
    @brief Designated Initializer.
    @param providerID The provider ID associated with the phone auth credential being created.
    @param verificationID The verification ID associated witht Phone Auth credential being created.
    @param verificationCode The verification code associated witht Phone Auth credential being
        created.
 */
- (instancetype)initWithProviderID:(NSString *)providerID
                    verificationID:(NSString *)verificationID
                  verificationCode:(NSString *)verificationCode NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END

#endif
