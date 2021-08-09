/*
 * Copyright 2017 Google
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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRActionCodeSettings.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRActionCodeSettings

- (instancetype)init {
  self = [super init];
  if (self) {
    _iOSBundleID = [NSBundle mainBundle].bundleIdentifier;
  }
  return self;
}

- (void)setIOSBundleID:(NSString *)iOSBundleID {
  _iOSBundleID = [iOSBundleID copy];
}

- (void)setAndroidPackageName:(NSString *)androidPackageName
        installIfNotAvailable:(BOOL)installIfNotAvailable
               minimumVersion:(nullable NSString *)minimumVersion {
  _androidPackageName = [androidPackageName copy];
  _androidInstallIfNotAvailable = installIfNotAvailable;
  _androidMinimumVersion = [minimumVersion copy];
}

@end

NS_ASSUME_NONNULL_END
