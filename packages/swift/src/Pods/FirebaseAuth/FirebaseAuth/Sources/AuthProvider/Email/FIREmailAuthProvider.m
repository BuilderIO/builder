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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIREmailAuthProvider.h"

#import "FirebaseAuth/Sources/AuthProvider/Email/FIREmailPasswordAuthCredential.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIREmailAuthProvider

- (instancetype)init {
  @throw [NSException exceptionWithName:@"Attempt to call unavailable initializer."
                                 reason:@"This class is not meant to be initialized."
                               userInfo:nil];
}

+ (FIRAuthCredential *)credentialWithEmail:(NSString *)email password:(NSString *)password {
  return [[FIREmailPasswordAuthCredential alloc] initWithEmail:email password:password];
}

+ (FIRAuthCredential *)credentialWithEmail:(NSString *)email link:(NSString *)link {
  return [[FIREmailPasswordAuthCredential alloc] initWithEmail:email link:link];
}

@end

NS_ASSUME_NONNULL_END
