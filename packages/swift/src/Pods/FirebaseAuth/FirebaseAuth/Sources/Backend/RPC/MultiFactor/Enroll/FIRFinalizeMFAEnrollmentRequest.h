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

#import "FirebaseAuth/Sources/Backend/FIRAuthRPCRequest.h"
#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/Proto/Phone/FIRAuthProtoFinalizeMFAPhoneRequestInfo.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRFinalizeMFAEnrollmentRequest : FIRIdentityToolkitRequest <FIRAuthRPCRequest>

@property(nonatomic, copy, readonly, nullable) NSString *IDToken;

@property(nonatomic, copy, readonly, nullable) NSString *displayName;

@property(nonatomic, copy, readonly, nullable)
    FIRAuthProtoFinalizeMFAPhoneRequestInfo *verificationInfo;

- (nullable instancetype)initWithIDToken:(NSString *)IDToken
                             displayName:(NSString *)displayName
                        verificationInfo:(FIRAuthProtoFinalizeMFAPhoneRequestInfo *)verificationInfo
                    requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration;

@end

NS_ASSUME_NONNULL_END
