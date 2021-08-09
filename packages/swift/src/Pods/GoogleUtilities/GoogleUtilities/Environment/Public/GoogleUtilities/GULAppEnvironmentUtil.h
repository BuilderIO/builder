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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface GULAppEnvironmentUtil : NSObject

/// Indicates whether the app is from Apple Store or not. Returns NO if the app is on simulator,
/// development environment or sideloaded.
+ (BOOL)isFromAppStore;

/// Indicates whether the app is a Testflight app. Returns YES if the app has sandbox receipt.
/// Returns NO otherwise.
+ (BOOL)isAppStoreReceiptSandbox;

/// Indicates whether the app is on simulator or not at runtime depending on the device
/// architecture.
+ (BOOL)isSimulator;

/// The current device model. Returns an empty string if device model cannot be retrieved.
+ (nullable NSString *)deviceModel;

/// The current operating system version. Returns an empty string if the system version cannot be
/// retrieved.
+ (NSString *)systemVersion;

/// Indicates whether it is running inside an extension or an app.
+ (BOOL)isAppExtension;

/// @return Returns @YES when is run on iOS version greater or equal to 7.0
+ (BOOL)isIOS7OrHigher DEPRECATED_MSG_ATTRIBUTE(
    "Always `YES` because only iOS 8 and higher supported. The method will be removed.");

/// @return YES if Swift runtime detected in the app.
+ (BOOL)hasSwiftRuntime;

/// @return An Apple platform. Possible values "ios", "tvos", "macos", "watchos", "maccatalyst".
+ (NSString *)applePlatform;

/// @return The way the library was added to the app, e.g. "swiftpm", "cocoapods", etc.
+ (NSString *)deploymentType;

@end

NS_ASSUME_NONNULL_END
