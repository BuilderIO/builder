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

#import "FIRMultiFactor.h"

NS_ASSUME_NONNULL_BEGIN

/** @class FIRMultiFactorResolver
    @brief The data structure used to help developers resolve 2nd factor requirements on users that
        have opted in to 2 factor authentication.
*/
NS_SWIFT_NAME(MultiFactorResolver)
@interface FIRMultiFactorResolver : NSObject

/**
   @brief The opaque session identifier for the current sign-in flow.
*/
@property(nonatomic, readonly) FIRMultiFactorSession *session;

/**
   @brief The list of hints for the second factors needed to complete the sign-in for the current
       session.
*/
@property(nonatomic, readonly) NSArray<FIRMultiFactorInfo *> *hints NS_SWIFT_NAME(hints);

/**
   @brief The Auth reference for the current FIRMultiResolver.
*/
@property(nonatomic, readonly) FIRAuth *auth;

/** @fn resolveSignInWithAssertion:completion:
    @brief A helper function to help users complete sign in with a second factor using an
        FIRMultiFactorAssertion confirming the user successfully completed the second factor
   challenge.
    @param completion The block invoked when the request is complete, or fails.
*/
- (void)resolveSignInWithAssertion:(FIRMultiFactorAssertion *)assertion
                        completion:(nullable FIRAuthDataResultCallback)completion;

@end

NS_ASSUME_NONNULL_END

#endif
