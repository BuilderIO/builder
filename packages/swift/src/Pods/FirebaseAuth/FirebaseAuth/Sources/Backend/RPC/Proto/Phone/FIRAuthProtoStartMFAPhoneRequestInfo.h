/*
 * Copyright 2019 Google
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

#import "FirebaseAuth/Sources/Backend/RPC/Proto/FIRAuthProto.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthProtoStartMFAPhoneRequestInfo : NSObject <FIRAuthProto>

@property(nonatomic, strong, readonly, nullable) NSString *phoneNumber;

@property(nonatomic, strong, readonly, nullable) FIRAuthAppCredential *appCredential;

@property(nonatomic, strong, readonly, nullable) NSString *reCAPTCHAToken;

- (nullable instancetype)initWithPhoneNumber:(NSString *)phoneNumber
                               appCredential:(nullable FIRAuthAppCredential *)appCredential
                              reCAPTCHAToken:(nullable NSString *)reCAPTCHAToken;

@end

NS_ASSUME_NONNULL_END
