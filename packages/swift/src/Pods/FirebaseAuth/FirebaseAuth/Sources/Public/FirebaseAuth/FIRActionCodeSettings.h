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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/** @class FIRActionCodeSettings
    @brief Used to set and retrieve settings related to handling action codes.
 */
NS_SWIFT_NAME(ActionCodeSettings)
@interface FIRActionCodeSettings : NSObject

/** @property URL
    @brief This URL represents the state/Continue URL in the form of a universal link.
    @remarks This URL can should be constructed as a universal link that would either directly open
        the app where the action code would be handled or continue to the app after the action code
        is handled by Firebase.
 */
@property(nonatomic, copy, nullable) NSURL *URL;

/** @property handleCodeInApp
    @brief Indicates whether the action code link will open the app directly or after being
        redirected from a Firebase owned web widget.
 */
@property(assign, nonatomic) BOOL handleCodeInApp;

/** @property iOSBundleID
    @brief The iOS bundle ID, if available. The default value is the current app's bundle ID.
 */
@property(copy, nonatomic, readonly, nullable) NSString *iOSBundleID;

/** @property androidPackageName
    @brief The Android package name, if available.
 */
@property(nonatomic, copy, readonly, nullable) NSString *androidPackageName;

/** @property androidMinimumVersion
    @brief The minimum Android version supported, if available.
 */
@property(nonatomic, copy, readonly, nullable) NSString *androidMinimumVersion;

/** @property androidInstallIfNotAvailable
    @brief Indicates whether the Android app should be installed on a device where it is not
       available.
 */
@property(nonatomic, assign, readonly) BOOL androidInstallIfNotAvailable;

/** @property dynamicLinkDomain
    @brief The Firebase Dynamic Link domain used for out of band code flow.
 */
@property(copy, nonatomic, nullable) NSString *dynamicLinkDomain;

/** @fn setIOSBundleID
    @brief Sets the iOS bundle Id.
    @param iOSBundleID The iOS bundle ID.
 */
- (void)setIOSBundleID:(NSString *)iOSBundleID;

/** @fn setAndroidPackageName:installIfNotAvailable:minimumVersion:
    @brief Sets the Android package name, the flag to indicate whether or not to install the app
        and the minimum Android version supported.
    @param androidPackageName The Android package name.
    @param installIfNotAvailable Indicates whether or not the app should be installed if not
        available.
    @param minimumVersion The minimum version of Android supported.
    @remarks If installIfNotAvailable is set to YES and the link is opened on an android device, it
        will try to install the app if not already available. Otherwise the web URL is used.
 */
- (void)setAndroidPackageName:(NSString *)androidPackageName
        installIfNotAvailable:(BOOL)installIfNotAvailable
               minimumVersion:(nullable NSString *)minimumVersion;

@end

NS_ASSUME_NONNULL_END
