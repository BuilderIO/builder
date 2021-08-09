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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRMultiFactor.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthDataResult_Internal.h"
#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthBackend+MultiFactor.h"
#import "FirebaseAuth/Sources/Backend/RPC/MultiFactor/Enroll/FIRStartMFAEnrollmentRequest.h"
#import "FirebaseAuth/Sources/MultiFactor/FIRMultiFactor+Internal.h"
#import "FirebaseAuth/Sources/MultiFactor/FIRMultiFactorInfo+Internal.h"
#import "FirebaseAuth/Sources/MultiFactor/FIRMultiFactorSession+Internal.h"
#import "FirebaseAuth/Sources/User/FIRUser_Internal.h"

#if TARGET_OS_IOS
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRPhoneMultiFactorAssertion.h"

#import "FirebaseAuth/Sources/AuthProvider/Phone/FIRPhoneAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/MultiFactor/Phone/FIRPhoneMultiFactorAssertion+Internal.h"
#endif

NS_ASSUME_NONNULL_BEGIN

static NSString *kEnrolledFactorsCodingKey = @"enrolledFactors";

static NSString *kUserCodingKey = @"user";

@implementation FIRMultiFactor

- (void)getSessionWithCompletion:(nullable FIRMultiFactorSessionCallback)completion {
  FIRMultiFactorSession *session = [FIRMultiFactorSession sessionForCurrentUser];
  if (completion) {
    completion(session, nil);
  }
}

- (void)enrollWithAssertion:(FIRMultiFactorAssertion *)assertion
                displayName:(nullable NSString *)displayName
                 completion:(nullable FIRAuthVoidErrorCallback)completion {
#if TARGET_OS_IOS
  FIRPhoneMultiFactorAssertion *phoneAssertion = (FIRPhoneMultiFactorAssertion *)assertion;
  FIRAuthProtoFinalizeMFAPhoneRequestInfo *finalizeMFAPhoneRequestInfo =
      [[FIRAuthProtoFinalizeMFAPhoneRequestInfo alloc]
          initWithSessionInfo:phoneAssertion.authCredential.verificationID
             verificationCode:phoneAssertion.authCredential.verificationCode];
  FIRFinalizeMFAEnrollmentRequest *request =
      [[FIRFinalizeMFAEnrollmentRequest alloc] initWithIDToken:self.user.rawAccessToken
                                                   displayName:displayName
                                              verificationInfo:finalizeMFAPhoneRequestInfo
                                          requestConfiguration:self.user.requestConfiguration];
  [FIRAuthBackend
      finalizeMultiFactorEnrollment:request
                           callback:^(FIRFinalizeMFAEnrollmentResponse *_Nullable response,
                                      NSError *_Nullable error) {
                             if (error) {
                               if (completion) {
                                 completion(error);
                               }
                             } else {
                               [FIRAuth.auth
                                   completeSignInWithAccessToken:response.IDToken
                                       accessTokenExpirationDate:nil
                                                    refreshToken:response.refreshToken
                                                       anonymous:NO
                                                        callback:^(FIRUser *_Nullable user,
                                                                   NSError *_Nullable error) {
                                                          FIRAuthDataResult *result =
                                                              [[FIRAuthDataResult alloc]
                                                                        initWithUser:user
                                                                  additionalUserInfo:nil];
                                                          FIRAuthDataResultCallback
                                                              decoratedCallback = [FIRAuth.auth
                                                                  signInFlowAuthDataResultCallbackByDecoratingCallback:
                                                                      ^(FIRAuthDataResult
                                                                            *_Nullable authResult,
                                                                        NSError *_Nullable error) {
                                                                        if (completion) {
                                                                          completion(error);
                                                                        }
                                                                      }];
                                                          decoratedCallback(result, error);
                                                        }];
                             }
                           }];
#endif
}

- (void)unenrollWithInfo:(FIRMultiFactorInfo *)factorInfo
              completion:(nullable FIRAuthVoidErrorCallback)completion {
  [self unenrollWithFactorUID:factorInfo.UID completion:completion];
}

- (void)unenrollWithFactorUID:(NSString *)factorUID
                   completion:(nullable FIRAuthVoidErrorCallback)completion {
  FIRWithdrawMFARequest *request =
      [[FIRWithdrawMFARequest alloc] initWithIDToken:self.user.rawAccessToken
                                     MFAEnrollmentID:factorUID
                                requestConfiguration:self.user.requestConfiguration];
  [FIRAuthBackend
      withdrawMultiFactor:request
                 callback:^(FIRWithdrawMFAResponse *_Nullable response, NSError *_Nullable error) {
                   if (error) {
                     if (completion) {
                       completion(error);
                     }
                   } else {
                     [FIRAuth.auth
                         completeSignInWithAccessToken:response.IDToken
                             accessTokenExpirationDate:nil
                                          refreshToken:response.refreshToken
                                             anonymous:NO
                                              callback:^(FIRUser *_Nullable user,
                                                         NSError *_Nullable error) {
                                                FIRAuthDataResult *result =
                                                    [[FIRAuthDataResult alloc] initWithUser:user
                                                                         additionalUserInfo:nil];
                                                FIRAuthDataResultCallback decoratedCallback = [FIRAuth
                                                                                                   .auth
                                                    signInFlowAuthDataResultCallbackByDecoratingCallback:
                                                        ^(FIRAuthDataResult *_Nullable authResult,
                                                          NSError *_Nullable error) {
                                                          if (error) {
                                                            [[FIRAuth auth] signOut:NULL];
                                                          }
                                                          if (completion) {
                                                            completion(error);
                                                          }
                                                        }];
                                                decoratedCallback(result, error);
                                              }];
                   }
                 }];
}

#pragma mark - Internal

- (instancetype)initWithMFAEnrollments:(NSArray<FIRAuthProtoMFAEnrollment *> *)MFAEnrollments {
  self = [super init];

  if (self) {
    NSMutableArray<FIRMultiFactorInfo *> *multiFactorInfoArray = [[NSMutableArray alloc] init];
    for (FIRAuthProtoMFAEnrollment *MFAEnrollment in MFAEnrollments) {
      FIRMultiFactorInfo *multiFactorInfo =
          [[FIRMultiFactorInfo alloc] initWithProto:MFAEnrollment];
      [multiFactorInfoArray addObject:multiFactorInfo];
    }
    _enrolledFactors = [multiFactorInfoArray copy];
  }

  return self;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  self = [self init];
  if (self) {
    NSArray<FIRMultiFactorInfo *> *enrolledFactors =
        [aDecoder decodeObjectOfClass:[NSArray<FIRMultiFactorInfo *> class]
                               forKey:kEnrolledFactorsCodingKey];
    _enrolledFactors = enrolledFactors;
    _user = [aDecoder decodeObjectOfClass:[FIRUser class] forKey:kUserCodingKey];
  }
  return self;
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_enrolledFactors forKey:kEnrolledFactorsCodingKey];
  [aCoder encodeObject:_user forKey:kUserCodingKey];
}

@end

NS_ASSUME_NONNULL_END

#endif
