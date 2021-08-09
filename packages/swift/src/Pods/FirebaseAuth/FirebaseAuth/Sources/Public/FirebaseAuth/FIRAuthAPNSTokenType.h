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

NS_ASSUME_NONNULL_BEGIN

/**
 *  @brief The APNs token type for the app.
 */
typedef NS_ENUM(NSInteger, FIRAuthAPNSTokenType) {

  /** Unknown token type.
      The actual token type will be detected from the provisioning profile in the app's bundle.
   */
  FIRAuthAPNSTokenTypeUnknown,

  /** Sandbox token type.
   */
  FIRAuthAPNSTokenTypeSandbox,

  /** Production token type.
   */
  FIRAuthAPNSTokenTypeProd,
} NS_SWIFT_NAME(AuthAPNSTokenType);

NS_ASSUME_NONNULL_END

#endif
