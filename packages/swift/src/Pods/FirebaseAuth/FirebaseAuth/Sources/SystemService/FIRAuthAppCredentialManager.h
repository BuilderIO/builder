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
#if !TARGET_OS_OSX

#import <Foundation/Foundation.h>

#import "FirebaseAuth/Sources/Storage/FIRAuthKeychainServices.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRAuthAppCredentialCallback
    @brief The type of block to receive an app crdential.
    @param credential The best available app credential at the time.
 */
typedef void (^FIRAuthAppCredentialCallback)(FIRAuthAppCredential *credential);

/** @class FIRAuthAppCredentialManager
    @brief A class to manage app credentials backed by iOS Keychain.
 */
@interface FIRAuthAppCredentialManager : NSObject

/** @property credential
    @brief The full credential (which has a secret) to be used by the app, if one is available.
 */
@property(nonatomic, strong, readonly, nullable) FIRAuthAppCredential *credential;

/** @property maximumNumberOfPendingReceipts
    @brief The maximum (but not necessarily the minimum) number of pending receipts to be kept.
    @remarks Only tests should access this property.
 */
@property(nonatomic, assign, readonly) NSUInteger maximumNumberOfPendingReceipts;

/** @fn init
    @brief Call @c initWithKeychain: to initialize an instance of this class.
 */
- (instancetype)init NS_UNAVAILABLE;

/** @fn initWithKeychain:
    @brief Initializes the instance.
    @param keychain The iOS Keychain storage to back up the app credential with.
    @return The initialized instance.
 */
- (instancetype)initWithKeychain:(FIRAuthKeychainServices *)keychain NS_DESIGNATED_INITIALIZER;

/** @fn didStartVerificationWithReceipt:timeout:callback:
    @brief Notifies that the app verification process has started.
    @param receipt The receipt for verification.
    @param timeout The timeout value for how long the callback is waited to be called.
    @param callback The block to be called in future either when the verification finishes, or
        when timeout occurs, whichever happens earlier.
 */
- (void)didStartVerificationWithReceipt:(NSString *)receipt
                                timeout:(NSTimeInterval)timeout
                               callback:(FIRAuthAppCredentialCallback)callback;

/** @fn canFinishVerificationWithReceipt:
    @brief Attempts to finish verification.
    @param receipt The receipt to match the original receipt obtained when verification started.
    @param secret The secret to complete the verification.
    @return Whether or not the receipt matches a pending verification, and finishes verification
        if it does.
 */
- (BOOL)canFinishVerificationWithReceipt:(NSString *)receipt secret:(NSString *)secret;

/** @fn clearCredential
    @brief Clears the saved credential, to be used in the case that it is rejected by the server.
 */
- (void)clearCredential;

@end

NS_ASSUME_NONNULL_END

#endif
