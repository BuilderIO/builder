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

#import "FirebaseAuth/Sources/Backend/FIRAuthBackend+MultiFactor.h"

@implementation FIRAuthBackend (MultiFactor)

+ (void)startMultiFactorEnrollment:(FIRStartMFAEnrollmentRequest *)request
                          callback:(FIRStartMFAEnrollmentResponseCallback)callback {
  FIRStartMFAEnrollmentResponse *response = [[FIRStartMFAEnrollmentResponse alloc] init];
  [[self implementation] postWithRequest:request
                                response:response
                                callback:^(NSError *error) {
                                  if (error) {
                                    callback(nil, error);
                                  } else {
                                    callback(response, nil);
                                  }
                                }];
}

+ (void)finalizeMultiFactorEnrollment:(FIRFinalizeMFAEnrollmentRequest *)request
                             callback:(FIRFinalizeMFAEnrollmentResponseCallback)callback {
  FIRFinalizeMFAEnrollmentResponse *response = [[FIRFinalizeMFAEnrollmentResponse alloc] init];
  [[self implementation] postWithRequest:request
                                response:response
                                callback:^(NSError *error) {
                                  if (error) {
                                    callback(nil, error);
                                  } else {
                                    callback(response, nil);
                                  }
                                }];
}

+ (void)startMultiFactorSignIn:(FIRStartMFASignInRequest *)request
                      callback:(FIRStartMFASignInResponseCallback)callback {
  FIRStartMFASignInResponse *response = [[FIRStartMFASignInResponse alloc] init];
  [[self implementation] postWithRequest:request
                                response:response
                                callback:^(NSError *error) {
                                  if (error) {
                                    callback(nil, error);
                                  } else {
                                    callback(response, nil);
                                  }
                                }];
}

+ (void)finalizeMultiFactorSignIn:(FIRFinalizeMFASignInRequest *)request
                         callback:(FIRFinalizeMFASignInResponseCallback)callback {
  FIRFinalizeMFASignInResponse *response = [[FIRFinalizeMFASignInResponse alloc] init];
  [[self implementation] postWithRequest:request
                                response:response
                                callback:^(NSError *error) {
                                  if (error) {
                                    callback(nil, error);
                                  } else {
                                    callback(response, nil);
                                  }
                                }];
}

+ (void)withdrawMultiFactor:(FIRWithdrawMFARequest *)request
                   callback:(FIRWithdrawMFAResponseCallback)callback {
  FIRWithdrawMFAResponse *response = [[FIRWithdrawMFAResponse alloc] init];
  [[self implementation] postWithRequest:request
                                response:response
                                callback:^(NSError *error) {
                                  if (error) {
                                    callback(nil, error);
                                  } else {
                                    callback(response, nil);
                                  }
                                }];
}

@end

#endif
