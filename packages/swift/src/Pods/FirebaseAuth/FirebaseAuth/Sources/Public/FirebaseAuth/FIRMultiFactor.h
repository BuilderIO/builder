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

#import <Foundation/Foundation.h>

#import "FIRAuth.h"
#import "FIRMultiFactorAssertion.h"
#import "FIRMultiFactorInfo.h"
#import "FIRMultiFactorSession.h"

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRMultiFactorSessionCallback
    @brief The callback that triggered when a developer calls `getSessionWithCompletion`.
    @param session The multi factor session returned, if any.
    @param error The error which occurred, if any.
*/
typedef void (^FIRMultiFactorSessionCallback)(FIRMultiFactorSession *_Nullable session,
                                              NSError *_Nullable error)
    NS_SWIFT_NAME(MultiFactorSessionCallback);

/**
   @brief The string identifier for second factors. e.g. "phone".
*/
extern NSString *const _Nonnull FIRPhoneMultiFactorID NS_SWIFT_NAME(PhoneMultiFactorID);

/** @class FIRMultiFactor
    @brief The interface defining the multi factor related properties and operations pertaining to a
   user.
*/
NS_SWIFT_NAME(MultiFactor)
@interface FIRMultiFactor : NSObject

@property(nonatomic, readonly) NSArray<FIRMultiFactorInfo *> *enrolledFactors;

/** @fn getSessionWithCompletion:
    @brief Get a session for a second factor enrollment operation.
    @param completion A block with the session identifier for a second factor enrollment operation.
        This is used to identify the current user trying to enroll a second factor.
*/
- (void)getSessionWithCompletion:(nullable void (^)(FIRMultiFactorSession *_Nullable credential,
                                                    NSError *_Nullable error))completion;

/** @fn enrollWithAssertion:displayName:completion:
    @brief Enrolls a second factor as identified by the `FIRMultiFactorAssertion` parameter for the
        current user.
    @param displayName An optional display name associated with the multi factor to enroll.
    @param completion The block invoked when the request is complete, or fails.
*/
- (void)enrollWithAssertion:(FIRMultiFactorAssertion *)assertion
                displayName:(nullable NSString *)displayName
                 completion:(nullable void (^)(NSError *_Nullable error))completion;

/** @fn unenrollWithInfo:completion:
    @brief Unenroll the given multi factor.
    @param completion The block invoked when the request to send the verification email is complete,
        or fails.
*/
- (void)unenrollWithInfo:(FIRMultiFactorInfo *)factorInfo
              completion:(nullable void (^)(NSError *_Nullable error))completion;

/** @fn unenrollWithFactorUID:completion:
    @brief Unenroll the given multi factor.
    @param completion The block invoked when the request to send the verification email is complete,
        or fails.
*/
- (void)unenrollWithFactorUID:(NSString *)factorUID
                   completion:(nullable void (^)(NSError *_Nullable error))completion;

@end

NS_ASSUME_NONNULL_END

#endif
