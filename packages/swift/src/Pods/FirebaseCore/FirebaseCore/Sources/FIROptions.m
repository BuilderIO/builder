// Copyright 2017 Google
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import "FirebaseCore/Sources/FIRBundleUtil.h"
#import "FirebaseCore/Sources/Private/FIRAppInternal.h"
#import "FirebaseCore/Sources/Private/FIRLogger.h"
#import "FirebaseCore/Sources/Private/FIROptionsInternal.h"
#import "FirebaseCore/Sources/Public/FirebaseCore/FIRVersion.h"

// Keys for the strings in the plist file.
NSString *const kFIRAPIKey = @"API_KEY";
NSString *const kFIRTrackingID = @"TRACKING_ID";
NSString *const kFIRGoogleAppID = @"GOOGLE_APP_ID";
NSString *const kFIRClientID = @"CLIENT_ID";
NSString *const kFIRGCMSenderID = @"GCM_SENDER_ID";
NSString *const kFIRAndroidClientID = @"ANDROID_CLIENT_ID";
NSString *const kFIRDatabaseURL = @"DATABASE_URL";
NSString *const kFIRStorageBucket = @"STORAGE_BUCKET";
// The key to locate the expected bundle identifier in the plist file.
NSString *const kFIRBundleID = @"BUNDLE_ID";
// The key to locate the project identifier in the plist file.
NSString *const kFIRProjectID = @"PROJECT_ID";

NSString *const kFIRIsMeasurementEnabled = @"IS_MEASUREMENT_ENABLED";
NSString *const kFIRIsAnalyticsCollectionEnabled = @"FIREBASE_ANALYTICS_COLLECTION_ENABLED";
NSString *const kFIRIsAnalyticsCollectionDeactivated = @"FIREBASE_ANALYTICS_COLLECTION_DEACTIVATED";

NSString *const kFIRIsAnalyticsEnabled = @"IS_ANALYTICS_ENABLED";
NSString *const kFIRIsSignInEnabled = @"IS_SIGNIN_ENABLED";

// Library version ID formatted like:
// @"5"     // Major version (one or more digits)
// @"04"    // Minor version (exactly 2 digits)
// @"01"    // Build number (exactly 2 digits)
// @"000";  // Fixed "000"
NSString *kFIRLibraryVersionID;

// Plist file name.
NSString *const kServiceInfoFileName = @"GoogleService-Info";
// Plist file type.
NSString *const kServiceInfoFileType = @"plist";

// Exception raised from attempting to modify a FIROptions after it's been copied to a FIRApp.
NSString *const kFIRExceptionBadModification =
    @"Attempted to modify options after it's set on FIRApp. Please modify all properties before "
    @"initializing FIRApp.";

@interface FIROptions ()

/**
 * This property maintains the actual configuration key-value pairs.
 */
@property(nonatomic, readwrite) NSMutableDictionary *optionsDictionary;

/**
 * Calls `analyticsOptionsDictionaryWithInfoDictionary:` using [NSBundle mainBundle].infoDictionary.
 * It combines analytics options from both the infoDictionary and the GoogleService-Info.plist.
 * Values which are present in the main plist override values from the GoogleService-Info.plist.
 */
@property(nonatomic, readonly) NSDictionary *analyticsOptionsDictionary;

/**
 * Combination of analytics options from both the infoDictionary and the GoogleService-Info.plist.
 * Values which are present in the infoDictionary override values from the GoogleService-Info.plist.
 */
- (NSDictionary *)analyticsOptionsDictionaryWithInfoDictionary:(NSDictionary *)infoDictionary;

/**
 * Throw exception if editing is locked when attempting to modify an option.
 */
- (void)checkEditingLocked;

@end

@implementation FIROptions {
  /// Backing variable for self.analyticsOptionsDictionary.
  NSDictionary *_analyticsOptionsDictionary;
}

static FIROptions *sDefaultOptions = nil;
static NSDictionary *sDefaultOptionsDictionary = nil;
static dispatch_once_t sDefaultOptionsOnceToken;
static dispatch_once_t sDefaultOptionsDictionaryOnceToken;

#pragma mark - Public only for internal class methods

+ (FIROptions *)defaultOptions {
  dispatch_once(&sDefaultOptionsOnceToken, ^{
    NSDictionary *defaultOptionsDictionary = [self defaultOptionsDictionary];
    if (defaultOptionsDictionary != nil) {
      sDefaultOptions =
          [[FIROptions alloc] initInternalWithOptionsDictionary:defaultOptionsDictionary];
    }
  });

  return sDefaultOptions;
}

#pragma mark - Private class methods

+ (NSDictionary *)defaultOptionsDictionary {
  dispatch_once(&sDefaultOptionsDictionaryOnceToken, ^{
    NSString *plistFilePath = [FIROptions plistFilePathWithName:kServiceInfoFileName];
    if (plistFilePath == nil) {
      return;
    }
    sDefaultOptionsDictionary = [NSDictionary dictionaryWithContentsOfFile:plistFilePath];
    if (sDefaultOptionsDictionary == nil) {
      FIRLogError(kFIRLoggerCore, @"I-COR000011",
                  @"The configuration file is not a dictionary: "
                  @"'%@.%@'.",
                  kServiceInfoFileName, kServiceInfoFileType);
    }
  });

  return sDefaultOptionsDictionary;
}

// Returns the path of the plist file with a given file name.
+ (NSString *)plistFilePathWithName:(NSString *)fileName {
  NSArray *bundles = [FIRBundleUtil relevantBundles];
  NSString *plistFilePath =
      [FIRBundleUtil optionsDictionaryPathWithResourceName:fileName
                                               andFileType:kServiceInfoFileType
                                                 inBundles:bundles];
  if (plistFilePath == nil) {
    FIRLogError(kFIRLoggerCore, @"I-COR000012", @"Could not locate configuration file: '%@.%@'.",
                fileName, kServiceInfoFileType);
  }
  return plistFilePath;
}

+ (void)resetDefaultOptions {
  sDefaultOptions = nil;
  sDefaultOptionsDictionary = nil;
  sDefaultOptionsOnceToken = 0;
  sDefaultOptionsDictionaryOnceToken = 0;
}

#pragma mark - Private instance methods

- (instancetype)initInternalWithOptionsDictionary:(NSDictionary *)optionsDictionary {
  self = [super init];
  if (self) {
    _optionsDictionary = [optionsDictionary mutableCopy];
    _usingOptionsFromDefaultPlist = YES;
  }
  return self;
}

- (id)copyWithZone:(NSZone *)zone {
  FIROptions *newOptions = [(FIROptions *)[[self class] allocWithZone:zone]
      initInternalWithOptionsDictionary:self.optionsDictionary];
  if (newOptions) {
    newOptions.deepLinkURLScheme = self.deepLinkURLScheme;
    newOptions.appGroupID = self.appGroupID;
    newOptions.editingLocked = self.isEditingLocked;
    newOptions.usingOptionsFromDefaultPlist = self.usingOptionsFromDefaultPlist;
  }
  return newOptions;
}

#pragma mark - Public instance methods

- (instancetype)init {
  // Unavailable.
  [self doesNotRecognizeSelector:_cmd];
  return nil;
}

- (instancetype)initWithContentsOfFile:(NSString *)plistPath {
  self = [super init];
  if (self) {
    if (plistPath == nil) {
      FIRLogError(kFIRLoggerCore, @"I-COR000013", @"The plist file path is nil.");
      return nil;
    }
    _optionsDictionary = [[NSDictionary dictionaryWithContentsOfFile:plistPath] mutableCopy];
    if (_optionsDictionary == nil) {
      FIRLogError(kFIRLoggerCore, @"I-COR000014",
                  @"The configuration file at %@ does not exist or "
                  @"is not a well-formed plist file.",
                  plistPath);
      return nil;
    }
    // TODO: Do we want to validate the dictionary here? It says we do that already in
    // the public header.
  }
  return self;
}

- (instancetype)initWithGoogleAppID:(NSString *)googleAppID GCMSenderID:(NSString *)GCMSenderID {
  self = [super init];
  if (self) {
    NSMutableDictionary *mutableOptionsDict = [NSMutableDictionary dictionary];
    [mutableOptionsDict setValue:googleAppID forKey:kFIRGoogleAppID];
    [mutableOptionsDict setValue:GCMSenderID forKey:kFIRGCMSenderID];
    [mutableOptionsDict setValue:[[NSBundle mainBundle] bundleIdentifier] forKey:kFIRBundleID];
    self.optionsDictionary = mutableOptionsDict;
  }
  return self;
}

- (NSString *)APIKey {
  return self.optionsDictionary[kFIRAPIKey];
}

- (void)checkEditingLocked {
  if (self.isEditingLocked) {
    [NSException raise:kFirebaseCoreErrorDomain format:kFIRExceptionBadModification];
  }
}

- (void)setAPIKey:(NSString *)APIKey {
  [self checkEditingLocked];
  _optionsDictionary[kFIRAPIKey] = [APIKey copy];
}

- (NSString *)clientID {
  return self.optionsDictionary[kFIRClientID];
}

- (void)setClientID:(NSString *)clientID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRClientID] = [clientID copy];
}

- (NSString *)trackingID {
  return self.optionsDictionary[kFIRTrackingID];
}

- (void)setTrackingID:(NSString *)trackingID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRTrackingID] = [trackingID copy];
}

- (NSString *)GCMSenderID {
  return self.optionsDictionary[kFIRGCMSenderID];
}

- (void)setGCMSenderID:(NSString *)GCMSenderID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRGCMSenderID] = [GCMSenderID copy];
}

- (NSString *)projectID {
  return self.optionsDictionary[kFIRProjectID];
}

- (void)setProjectID:(NSString *)projectID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRProjectID] = [projectID copy];
}

- (NSString *)androidClientID {
  return self.optionsDictionary[kFIRAndroidClientID];
}

- (void)setAndroidClientID:(NSString *)androidClientID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRAndroidClientID] = [androidClientID copy];
}

- (NSString *)googleAppID {
  return self.optionsDictionary[kFIRGoogleAppID];
}

- (void)setGoogleAppID:(NSString *)googleAppID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRGoogleAppID] = [googleAppID copy];
}

- (NSString *)libraryVersionID {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    // The unit tests are set up to catch anything that does not properly convert.
    NSString *version = FIRFirebaseVersion();
    NSArray *components = [version componentsSeparatedByString:@"."];
    NSString *major = [components objectAtIndex:0];
    NSString *minor = [NSString stringWithFormat:@"%02d", [[components objectAtIndex:1] intValue]];
    NSString *patch = [NSString stringWithFormat:@"%02d", [[components objectAtIndex:2] intValue]];
    kFIRLibraryVersionID = [NSString stringWithFormat:@"%@%@%@000", major, minor, patch];
  });
  return kFIRLibraryVersionID;
}

- (void)setLibraryVersionID:(NSString *)libraryVersionID {
  _optionsDictionary[kFIRLibraryVersionID] = [libraryVersionID copy];
}

- (NSString *)databaseURL {
  return self.optionsDictionary[kFIRDatabaseURL];
}

- (void)setDatabaseURL:(NSString *)databaseURL {
  [self checkEditingLocked];

  _optionsDictionary[kFIRDatabaseURL] = [databaseURL copy];
}

- (NSString *)storageBucket {
  return self.optionsDictionary[kFIRStorageBucket];
}

- (void)setStorageBucket:(NSString *)storageBucket {
  [self checkEditingLocked];
  _optionsDictionary[kFIRStorageBucket] = [storageBucket copy];
}

- (void)setDeepLinkURLScheme:(NSString *)deepLinkURLScheme {
  [self checkEditingLocked];
  _deepLinkURLScheme = [deepLinkURLScheme copy];
}

- (NSString *)bundleID {
  return self.optionsDictionary[kFIRBundleID];
}

- (void)setBundleID:(NSString *)bundleID {
  [self checkEditingLocked];
  _optionsDictionary[kFIRBundleID] = [bundleID copy];
}

- (void)setAppGroupID:(NSString *)appGroupID {
  [self checkEditingLocked];
  _appGroupID = [appGroupID copy];
}

#pragma mark - Equality

- (BOOL)isEqual:(id)object {
  if (!object || ![object isKindOfClass:[FIROptions class]]) {
    return NO;
  }

  return [self isEqualToOptions:(FIROptions *)object];
}

- (BOOL)isEqualToOptions:(FIROptions *)options {
  // Skip any non-FIROptions classes.
  if (![options isKindOfClass:[FIROptions class]]) {
    return NO;
  }

  // Check the internal dictionary and custom properties for differences.
  if (![options.optionsDictionary isEqualToDictionary:self.optionsDictionary]) {
    return NO;
  }

  // Validate extra properties not contained in the dictionary. Only validate it if one of the
  // objects has the property set.
  if ((options.deepLinkURLScheme != nil || self.deepLinkURLScheme != nil) &&
      ![options.deepLinkURLScheme isEqualToString:self.deepLinkURLScheme]) {
    return NO;
  }

  if ((options.appGroupID != nil || self.appGroupID != nil) &&
      ![options.appGroupID isEqualToString:self.appGroupID]) {
    return NO;
  }

  // Validate the Analytics options haven't changed with the Info.plist.
  if (![options.analyticsOptionsDictionary isEqualToDictionary:self.analyticsOptionsDictionary]) {
    return NO;
  }

  // We don't care about the `editingLocked` or `usingOptionsFromDefaultPlist` properties since
  // those relate to lifecycle and construction, we only care if the contents of the options
  // themselves are equal.
  return YES;
}

- (NSUInteger)hash {
  // This is strongly recommended for any object that implements a custom `isEqual:` method to
  // ensure that dictionary and set behavior matches other `isEqual:` checks.
  // Note: `self.analyticsOptionsDictionary` was left out here since it solely relies on the
  // contents of the main bundle's `Info.plist`. We should avoid reading that file and the contents
  // should be identical.
  return self.optionsDictionary.hash ^ self.deepLinkURLScheme.hash ^ self.appGroupID.hash;
}

#pragma mark - Internal instance methods

- (NSDictionary *)analyticsOptionsDictionaryWithInfoDictionary:(NSDictionary *)infoDictionary {
  if (_analyticsOptionsDictionary == nil) {
    NSMutableDictionary *tempAnalyticsOptions = [[NSMutableDictionary alloc] init];
    NSArray *measurementKeys = @[
      kFIRIsMeasurementEnabled, kFIRIsAnalyticsCollectionEnabled,
      kFIRIsAnalyticsCollectionDeactivated
    ];
    for (NSString *key in measurementKeys) {
      id value = infoDictionary[key] ?: self.optionsDictionary[key] ?: nil;
      if (!value) {
        continue;
      }
      tempAnalyticsOptions[key] = value;
    }
    _analyticsOptionsDictionary = tempAnalyticsOptions;
  }
  return _analyticsOptionsDictionary;
}

- (NSDictionary *)analyticsOptionsDictionary {
  return [self analyticsOptionsDictionaryWithInfoDictionary:[NSBundle mainBundle].infoDictionary];
}

/**
 * Whether or not Measurement was enabled. Measurement is enabled unless explicitly disabled in
 * GoogleService-Info.plist. This uses the old plist flag IS_MEASUREMENT_ENABLED, which should still
 * be supported.
 */
- (BOOL)isMeasurementEnabled {
  if (self.isAnalyticsCollectionDeactivated) {
    return NO;
  }
  NSNumber *value = self.analyticsOptionsDictionary[kFIRIsMeasurementEnabled];
  if (value == nil) {
    // TODO: This could probably be cleaned up since FIROptions shouldn't know about FIRApp or have
    //       to check if it's the default app. The FIROptions instance can't be modified after
    //       `+configure` is called, so it's not a good place to copy it either in case the flag is
    //       changed at runtime.

    // If no values are set for Analytics, fall back to the global collection switch in FIRApp.
    // Analytics only supports the default FIRApp, so check that first.
    if (![FIRApp isDefaultAppConfigured]) {
      return NO;
    }

    // Fall back to the default app's collection switch when the key is not in the dictionary.
    return [FIRApp defaultApp].isDataCollectionDefaultEnabled;
  }
  return [value boolValue];
}

- (BOOL)isAnalyticsCollectionExplicitlySet {
  // If it's de-activated, it classifies as explicity set. If not, it's not a good enough indication
  // that the developer wants FirebaseAnalytics enabled so continue checking.
  if (self.isAnalyticsCollectionDeactivated) {
    return YES;
  }

  // Check if the current Analytics flag is set.
  id collectionEnabledObject = self.analyticsOptionsDictionary[kFIRIsAnalyticsCollectionEnabled];
  if (collectionEnabledObject && [collectionEnabledObject isKindOfClass:[NSNumber class]]) {
    // It doesn't matter what the value is, it's explicitly set.
    return YES;
  }

  // Check if the old measurement flag is set.
  id measurementEnabledObject = self.analyticsOptionsDictionary[kFIRIsMeasurementEnabled];
  if (measurementEnabledObject && [measurementEnabledObject isKindOfClass:[NSNumber class]]) {
    // It doesn't matter what the value is, it's explicitly set.
    return YES;
  }

  // No flags are set to explicitly enable or disable FirebaseAnalytics.
  return NO;
}

- (BOOL)isAnalyticsCollectionEnabled {
  if (self.isAnalyticsCollectionDeactivated) {
    return NO;
  }
  NSNumber *value = self.analyticsOptionsDictionary[kFIRIsAnalyticsCollectionEnabled];
  if (value == nil) {
    return self.isMeasurementEnabled;  // Fall back to older plist flag.
  }
  return [value boolValue];
}

- (BOOL)isAnalyticsCollectionDeactivated {
  NSNumber *value = self.analyticsOptionsDictionary[kFIRIsAnalyticsCollectionDeactivated];
  if (value == nil) {
    return NO;  // Analytics Collection is not deactivated when the key is not in the dictionary.
  }
  return [value boolValue];
}

- (BOOL)isAnalyticsEnabled {
  return [self.optionsDictionary[kFIRIsAnalyticsEnabled] boolValue];
}

- (BOOL)isSignInEnabled {
  return [self.optionsDictionary[kFIRIsSignInEnabled] boolValue];
}

@end
