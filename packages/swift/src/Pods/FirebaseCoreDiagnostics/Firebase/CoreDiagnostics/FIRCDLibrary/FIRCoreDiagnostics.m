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

#import <objc/runtime.h>
#include <sys/utsname.h>

#import <GoogleDataTransport/GoogleDataTransport.h>

#import <GoogleUtilities/GULAppEnvironmentUtil.h>
#import <GoogleUtilities/GULHeartbeatDateStorage.h>
#import <GoogleUtilities/GULLogger.h>

#import "Interop/CoreDiagnostics/Public/FIRCoreDiagnosticsData.h"
#import "Interop/CoreDiagnostics/Public/FIRCoreDiagnosticsInterop.h"

#import <nanopb/pb.h>
#import <nanopb/pb_decode.h>
#import <nanopb/pb_encode.h>

#import "Firebase/CoreDiagnostics/FIRCDLibrary/Protogen/nanopb/firebasecore.nanopb.h"

/** The logger service string to use when printing to the console. */
static GULLoggerService kFIRCoreDiagnostics = @"[FirebaseCoreDiagnostics/FIRCoreDiagnostics]";

#ifdef FIREBASE_BUILD_ZIP_FILE
static BOOL kUsingZipFile = YES;
#else   // FIREBASE_BUILD_ZIP_FILE
static BOOL kUsingZipFile = NO;
#endif  // FIREBASE_BUILD_ZIP_FILE

#if SWIFT_PACKAGE
#define kDeploymentType logs_proto_mobilesdk_ios_ICoreConfiguration_DeploymentType_SPM
#elif FIREBASE_BUILD_CARTHAGE
#define kDeploymentType logs_proto_mobilesdk_ios_ICoreConfiguration_DeploymentType_CARTHAGE
#elif FIREBASE_BUILD_ZIP_FILE
#define kDeploymentType logs_proto_mobilesdk_ios_ICoreConfiguration_DeploymentType_ZIP_FILE
#else
#define kDeploymentType logs_proto_mobilesdk_ios_ICoreConfiguration_DeploymentType_COCOAPODS
#endif

static NSString *const kFIRServiceMLModelInterpreter = @"MLModelInterpreter";

static NSString *const kFIRServiceAdMob = @"AdMob";
static NSString *const kFIRServiceAuth = @"Auth";
static NSString *const kFIRServiceAuthUI = @"AuthUI";
static NSString *const kFIRServiceCrash = @"Crash";
static NSString *const kFIRServiceDatabase = @"Database";
static NSString *const kFIRServiceDynamicLinks = @"DynamicLinks";
static NSString *const kFIRServiceFirestore = @"Firestore";
static NSString *const kFIRServiceFunctions = @"Functions";
static NSString *const kFIRServiceIAM = @"InAppMessaging";
static NSString *const kFIRServiceInstanceID = @"InstanceID";
static NSString *const kFIRServiceInvites = @"Invites";
static NSString *const kFIRServiceMessaging = @"Messaging";
static NSString *const kFIRServiceMeasurement = @"Measurement";
static NSString *const kFIRServicePerformance = @"Performance";
static NSString *const kFIRServiceRemoteConfig = @"RemoteConfig";
static NSString *const kFIRServiceStorage = @"Storage";
static NSString *const kGGLServiceAnalytics = @"Analytics";
static NSString *const kGGLServiceSignIn = @"SignIn";
static NSString *const kFIRAppDiagnosticsConfigurationTypeKey =
    @"FIRAppDiagnosticsConfigurationTypeKey";
static NSString *const kFIRAppDiagnosticsFIRAppKey = @"FIRAppDiagnosticsFIRAppKey";
static NSString *const kFIRAppDiagnosticsSDKNameKey = @"FIRAppDiagnosticsSDKNameKey";
static NSString *const kFIRAppDiagnosticsSDKVersionKey = @"FIRAppDiagnosticsSDKVersionKey";
static NSString *const kFIRCoreDiagnosticsHeartbeatTag = @"FIRCoreDiagnostics";

/**
 * The file name to the recent heartbeat date.
 */
NSString *const kFIRCoreDiagnosticsHeartbeatDateFileName = @"FIREBASE_DIAGNOSTICS_HEARTBEAT_DATE";

/**
 * @note This should implement the GDTCOREventDataObject protocol, but can't because of
 * weak-linking.
 */
@interface FIRCoreDiagnosticsLog : NSObject

/** The config that will be converted to proto bytes. */
@property(nonatomic) logs_proto_mobilesdk_ios_ICoreConfiguration config;

@end

@implementation FIRCoreDiagnosticsLog

- (instancetype)initWithConfig:(logs_proto_mobilesdk_ios_ICoreConfiguration)config {
  self = [super init];
  if (self) {
    _config = config;
  }
  return self;
}

// Provided and required by the GDTCOREventDataObject protocol.
- (NSData *)transportBytes {
  pb_ostream_t sizestream = PB_OSTREAM_SIZING;

  // Encode 1 time to determine the size.
  if (!pb_encode(&sizestream, logs_proto_mobilesdk_ios_ICoreConfiguration_fields, &_config)) {
    GDTCORLogError(GDTCORMCETransportBytesError, @"Error in nanopb encoding for size: %s",
                   PB_GET_ERROR(&sizestream));
  }

  // Encode a 2nd time to actually get the bytes from it.
  size_t bufferSize = sizestream.bytes_written;
  CFMutableDataRef dataRef = CFDataCreateMutable(CFAllocatorGetDefault(), bufferSize);
  CFDataSetLength(dataRef, bufferSize);
  pb_ostream_t ostream = pb_ostream_from_buffer((void *)CFDataGetBytePtr(dataRef), bufferSize);
  if (!pb_encode(&ostream, logs_proto_mobilesdk_ios_ICoreConfiguration_fields, &_config)) {
    GDTCORLogError(GDTCORMCETransportBytesError, @"Error in nanopb encoding for bytes: %s",
                   PB_GET_ERROR(&ostream));
  }
  CFDataSetLength(dataRef, ostream.bytes_written);

  return CFBridgingRelease(dataRef);
}

- (void)dealloc {
  pb_release(logs_proto_mobilesdk_ios_ICoreConfiguration_fields, &_config);
}

@end

NS_ASSUME_NONNULL_BEGIN

/** This class produces a protobuf containing diagnostics and usage data to be logged. */
@interface FIRCoreDiagnostics : NSObject <FIRCoreDiagnosticsInterop>

/** The queue on which all diagnostics collection will occur. */
@property(nonatomic, readonly) dispatch_queue_t diagnosticsQueue;

/** The transport object used to send data. */
@property(nonatomic, readonly) GDTCORTransport *transport;

/** The storage to store the date of the last sent heartbeat. */
@property(nonatomic, readonly) GULHeartbeatDateStorage *heartbeatDateStorage;

@end

NS_ASSUME_NONNULL_END

@implementation FIRCoreDiagnostics

+ (instancetype)sharedInstance {
  static FIRCoreDiagnostics *sharedInstance;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[FIRCoreDiagnostics alloc] init];
  });
  return sharedInstance;
}

- (instancetype)init {
  GDTCORTransport *transport = [[GDTCORTransport alloc] initWithMappingID:@"137"
                                                             transformers:nil
                                                                   target:kGDTCORTargetFLL];

  GULHeartbeatDateStorage *dateStorage =
      [[GULHeartbeatDateStorage alloc] initWithFileName:kFIRCoreDiagnosticsHeartbeatDateFileName];

  return [self initWithTransport:transport heartbeatDateStorage:dateStorage];
}

/** Initializer for unit tests.
 *
 * @param transport A `GDTCORTransport` instance which that be used to send event.
 * @param heartbeatDateStorage An instanse of date storage to track heartbeat sending.
 * @return Returns the initialized `FIRCoreDiagnostics` instance.
 */
- (instancetype)initWithTransport:(GDTCORTransport *)transport
             heartbeatDateStorage:(GULHeartbeatDateStorage *)heartbeatDateStorage {
  self = [super init];
  if (self) {
    _diagnosticsQueue =
        dispatch_queue_create("com.google.FIRCoreDiagnostics", DISPATCH_QUEUE_SERIAL);
    _transport = transport;
    _heartbeatDateStorage = heartbeatDateStorage;
  }
  return self;
}

#pragma mark - nanopb helper functions

/** Callocs a pb_bytes_array and copies the given NSString's bytes into the bytes array.
 *
 * @note Memory needs to be free manually, through pb_free or pb_release.
 * @param string The string to encode as pb_bytes.
 */
pb_bytes_array_t *FIREncodeString(NSString *string) {
  NSData *stringBytes = [string dataUsingEncoding:NSUTF8StringEncoding];
  return FIREncodeData(stringBytes);
}

/** Callocs a pb_bytes_array and copies the given NSData bytes into the bytes array.
 *
 * @note Memory needs to be free manually, through pb_free or pb_release.
 * @param data The data to copy into the new bytes array.
 */
pb_bytes_array_t *FIREncodeData(NSData *data) {
  pb_bytes_array_t *pbBytesArray = calloc(1, PB_BYTES_ARRAY_T_ALLOCSIZE(data.length));
  if (pbBytesArray != NULL) {
    [data getBytes:pbBytesArray->bytes length:data.length];
    pbBytesArray->size = (pb_size_t)data.length;
  }
  return pbBytesArray;
}

/** Maps a service string to the representative nanopb enum.
 *
 * @param serviceString The SDK service string to convert.
 * @return The representative nanopb enum.
 */
logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType FIRMapFromServiceStringToTypeEnum(
    NSString *serviceString) {
  static NSDictionary<NSString *, NSNumber *> *serviceStringToTypeEnum;
  if (serviceStringToTypeEnum == nil) {
    serviceStringToTypeEnum = @{
      kFIRServiceAdMob : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_ADMOB),
      kFIRServiceMessaging : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_MESSAGING),
      kFIRServiceMeasurement :
          @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_MEASUREMENT),
      kFIRServiceRemoteConfig :
          @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_REMOTE_CONFIG),
      kFIRServiceDatabase : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_DATABASE),
      kFIRServiceDynamicLinks :
          @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_DYNAMIC_LINKS),
      kFIRServiceAuth : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_AUTH),
      kFIRServiceAuthUI : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_AUTH_UI),
      kFIRServiceFirestore : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_FIRESTORE),
      kFIRServiceFunctions : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_FUNCTIONS),
      kFIRServicePerformance :
          @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_PERFORMANCE),
      kFIRServiceStorage : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_STORAGE),
      kFIRServiceMLModelInterpreter :
          @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_ML_MODEL_INTERPRETER),
      kGGLServiceAnalytics : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_ANALYTICS),
      kGGLServiceSignIn : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_SIGN_IN),
      kFIRServiceIAM : @(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_IN_APP_MESSAGING),
    };
  }
  if (serviceStringToTypeEnum[serviceString] != nil) {
    return (int32_t)serviceStringToTypeEnum[serviceString].longLongValue;
  }
  return logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_UNKNOWN_SDK_SERVICE;
}

#pragma mark - Proto population functions

/** Populates the given proto with data related to an SDK logDiagnostics call from the
 * diagnosticObjects dictionary.
 *
 * @param config The proto to populate
 * @param diagnosticObjects The dictionary of diagnostics objects.
 */
void FIRPopulateProtoWithInfoFromUserInfoParams(logs_proto_mobilesdk_ios_ICoreConfiguration *config,
                                                NSDictionary<NSString *, id> *diagnosticObjects) {
  NSNumber *configurationType = diagnosticObjects[kFIRCDConfigurationTypeKey];
  if (configurationType != nil) {
    switch (configurationType.integerValue) {
      case logs_proto_mobilesdk_ios_ICoreConfiguration_ConfigurationType_CORE:
        config->configuration_type =
            logs_proto_mobilesdk_ios_ICoreConfiguration_ConfigurationType_CORE;
        config->has_configuration_type = 1;
        break;
      case logs_proto_mobilesdk_ios_ICoreConfiguration_ConfigurationType_SDK:
        config->configuration_type =
            logs_proto_mobilesdk_ios_ICoreConfiguration_ConfigurationType_SDK;
        config->has_configuration_type = 1;
        break;
      default:
        break;
    }
  }

  NSString *sdkName = diagnosticObjects[kFIRCDSdkNameKey];
  if (sdkName) {
    config->sdk_name = FIRMapFromServiceStringToTypeEnum(sdkName);
    config->has_sdk_name = 1;
  }

  NSString *version = diagnosticObjects[kFIRCDSdkVersionKey];
  if (version) {
    config->sdk_version = FIREncodeString(version);
  }
}

/** Populates the given proto with data from the calling FIRApp using the given
 * diagnosticObjects dictionary.
 *
 * @param config The proto to populate
 * @param diagnosticObjects The dictionary of diagnostics objects.
 */
void FIRPopulateProtoWithCommonInfoFromApp(logs_proto_mobilesdk_ios_ICoreConfiguration *config,
                                           NSDictionary<NSString *, id> *diagnosticObjects) {
  config->pod_name = logs_proto_mobilesdk_ios_ICoreConfiguration_PodName_FIREBASE;
  config->has_pod_name = 1;

  if (!diagnosticObjects[kFIRCDllAppsCountKey]) {
    GDTCORLogError(GDTCORMCEGeneralError, @"%@",
                   @"App count is a required value in the data dict.");
  }
  config->app_count = (int32_t)[diagnosticObjects[kFIRCDllAppsCountKey] integerValue];
  config->has_app_count = 1;

  NSString *googleAppID = diagnosticObjects[kFIRCDGoogleAppIDKey];
  if (googleAppID.length) {
    config->app_id = FIREncodeString(googleAppID);
  }

  NSString *bundleID = diagnosticObjects[kFIRCDBundleIDKey];
  if (bundleID.length) {
    config->bundle_id = FIREncodeString(bundleID);
  }

  NSString *firebaseUserAgent = diagnosticObjects[kFIRCDFirebaseUserAgentKey];
  if (firebaseUserAgent.length) {
    config->platform_info = FIREncodeString(firebaseUserAgent);
  }

  NSNumber *usingOptionsFromDefaultPlist = diagnosticObjects[kFIRCDUsingOptionsFromDefaultPlistKey];
  if (usingOptionsFromDefaultPlist != nil) {
    config->use_default_app = [usingOptionsFromDefaultPlist boolValue];
    config->has_use_default_app = 1;
  }

  NSString *libraryVersionID = diagnosticObjects[kFIRCDLibraryVersionIDKey];
  if (libraryVersionID) {
    config->icore_version = FIREncodeString(libraryVersionID);
  }

  NSString *deviceModel = [GULAppEnvironmentUtil deviceModel];
  if (deviceModel.length) {
    config->device_model = FIREncodeString(deviceModel);
  }

  NSString *osVersion = [GULAppEnvironmentUtil systemVersion];
  if (osVersion.length) {
    config->os_version = FIREncodeString(osVersion);
  }

  config->using_zip_file = kUsingZipFile;
  config->has_using_zip_file = 1;
  config->deployment_type = kDeploymentType;
  config->has_deployment_type = 1;
  config->deployed_in_app_store = [GULAppEnvironmentUtil isFromAppStore];
  config->has_deployed_in_app_store = 1;
}

/** Populates the given proto with installed services data.
 *
 * @param config The proto to populate
 */
void FIRPopulateProtoWithInstalledServices(logs_proto_mobilesdk_ios_ICoreConfiguration *config) {
  NSMutableArray<NSNumber *> *sdkServiceInstalledArray = [NSMutableArray array];

  // AdMob
  if (NSClassFromString(@"GADBannerView") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceAdMob))];
  }
  // CloudMessaging
  if (NSClassFromString(@"FIRMessaging") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceMessaging))];
  }
  // RemoteConfig
  if (NSClassFromString(@"FIRRemoteConfig") != nil) {
    [sdkServiceInstalledArray
        addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceRemoteConfig))];
  }
  // Measurement/Analtyics
  if (NSClassFromString(@"FIRAnalytics") != nil) {
    [sdkServiceInstalledArray
        addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceMeasurement))];
  }
  // ML Model Interpreter
  if (NSClassFromString(@"FIRCustomModelInterpreter") != nil) {
    [sdkServiceInstalledArray
        addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceMLModelInterpreter))];
  }
  // Database
  if (NSClassFromString(@"FIRDatabase") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceDatabase))];
  }
  // DynamicDeepLink
  if (NSClassFromString(@"FIRDynamicLinks") != nil) {
    [sdkServiceInstalledArray
        addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceDynamicLinks))];
  }
  // Auth
  if (NSClassFromString(@"FIRAuth") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceAuth))];
  }
  // AuthUI
  if (NSClassFromString(@"FUIAuth") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceAuthUI))];
  }
  // Firestore
  if (NSClassFromString(@"FIRFirestore") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceFirestore))];
  }
  // Functions
  if (NSClassFromString(@"FIRFunctions") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceFunctions))];
  }
  // Performance
  if (NSClassFromString(@"FIRPerformance") != nil) {
    [sdkServiceInstalledArray
        addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServicePerformance))];
  }
  // Storage
  if (NSClassFromString(@"FIRStorage") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceStorage))];
  }
  // SignIn via Google pod
  if (NSClassFromString(@"GIDSignIn") != nil && NSClassFromString(@"GGLContext") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kGGLServiceSignIn))];
  }
  // Analytics via Google pod
  if (NSClassFromString(@"GAI") != nil && NSClassFromString(@"GGLContext") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kGGLServiceAnalytics))];
  }

  // In-App Messaging
  if (NSClassFromString(@"FIRInAppMessaging") != nil) {
    [sdkServiceInstalledArray addObject:@(FIRMapFromServiceStringToTypeEnum(kFIRServiceIAM))];
  }

  logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType *servicesInstalled =
      calloc(sdkServiceInstalledArray.count,
             sizeof(logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType));
  if (servicesInstalled == NULL) {
    return;
  }
  for (NSUInteger i = 0; i < sdkServiceInstalledArray.count; i++) {
    NSNumber *typeEnum = sdkServiceInstalledArray[i];
    logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType serviceType =
        (int32_t)typeEnum.integerValue;
    servicesInstalled[i] = serviceType;
  }

  config->sdk_service_installed = servicesInstalled;
  config->sdk_service_installed_count = (int32_t)sdkServiceInstalledArray.count;
}

/** Populates the proto with Info.plist values.
 *
 * @param config The proto to populate.
 */
void FIRPopulateProtoWithInfoPlistValues(logs_proto_mobilesdk_ios_ICoreConfiguration *config) {
  NSDictionary<NSString *, id> *info = [[NSBundle mainBundle] infoDictionary];

  NSString *xcodeVersion = info[@"DTXcodeBuild"] ?: @"";
  NSString *sdkVersion = info[@"DTSDKBuild"] ?: @"";
  NSString *combinedVersions = [NSString stringWithFormat:@"%@-%@", xcodeVersion, sdkVersion];
  config->apple_framework_version = FIREncodeString(combinedVersions);

  NSString *minVersion = info[@"MinimumOSVersion"];
  if (minVersion) {
    config->min_supported_ios_version = FIREncodeString(minVersion);
  }

  // Apps can turn off swizzling in the Info.plist, check if they've explicitly set the value and
  // report it. It's enabled by default.
  NSNumber *appDelegateSwizzledNum = info[@"FirebaseAppDelegateProxyEnabled"];
  BOOL appDelegateSwizzled = YES;
  if ([appDelegateSwizzledNum isKindOfClass:[NSNumber class]]) {
    appDelegateSwizzled = [appDelegateSwizzledNum boolValue];
  }
  config->swizzling_enabled = appDelegateSwizzled;
  config->has_swizzling_enabled = 1;
}

#pragma mark - FIRCoreDiagnosticsInterop

+ (void)sendDiagnosticsData:(nonnull id<FIRCoreDiagnosticsData>)diagnosticsData {
  FIRCoreDiagnostics *diagnostics = [FIRCoreDiagnostics sharedInstance];
  [diagnostics sendDiagnosticsData:diagnosticsData];
}

- (void)sendDiagnosticsData:(nonnull id<FIRCoreDiagnosticsData>)diagnosticsData {
  dispatch_async(self.diagnosticsQueue, ^{
    NSDictionary<NSString *, id> *diagnosticObjects = diagnosticsData.diagnosticObjects;
    NSNumber *isDataCollectionDefaultEnabled =
        diagnosticObjects[kFIRCDIsDataCollectionDefaultEnabledKey];
    if (isDataCollectionDefaultEnabled && ![isDataCollectionDefaultEnabled boolValue]) {
      return;
    }

    // Create the proto.
    logs_proto_mobilesdk_ios_ICoreConfiguration icore_config =
        logs_proto_mobilesdk_ios_ICoreConfiguration_init_default;

    icore_config.using_gdt = 1;
    icore_config.has_using_gdt = 1;

    // Populate the proto with information.
    FIRPopulateProtoWithInfoFromUserInfoParams(&icore_config, diagnosticObjects);
    FIRPopulateProtoWithCommonInfoFromApp(&icore_config, diagnosticObjects);
    FIRPopulateProtoWithInstalledServices(&icore_config);
    FIRPopulateProtoWithInfoPlistValues(&icore_config);
    [self setHeartbeatFlagIfNeededToConfig:&icore_config];

    // This log object is capable of converting the proto to bytes.
    FIRCoreDiagnosticsLog *log = [[FIRCoreDiagnosticsLog alloc] initWithConfig:icore_config];

    // Send the log as a telemetry event.
    GDTCOREvent *event = [self.transport eventForTransport];
    event.dataObject = (id<GDTCOREventDataObject>)log;
    [self.transport sendTelemetryEvent:event];
  });
}

#pragma mark - Heartbeat

- (void)setHeartbeatFlagIfNeededToConfig:(logs_proto_mobilesdk_ios_ICoreConfiguration *)config {
  // Check if need to send a heartbeat.
  NSDate *currentDate = [NSDate date];
  NSDate *lastCheckin =
      [self.heartbeatDateStorage heartbeatDateForTag:kFIRCoreDiagnosticsHeartbeatTag];
  if (lastCheckin) {
    // Ensure the previous checkin was on a different date in the past.
    if ([self isDate:currentDate inSameDayOrBeforeThan:lastCheckin]) {
      return;
    }
  }

  // Update heartbeat sent date.
  [self.heartbeatDateStorage setHearbeatDate:currentDate forTag:kFIRCoreDiagnosticsHeartbeatTag];
  // Set the flag.
  config->sdk_name = logs_proto_mobilesdk_ios_ICoreConfiguration_ServiceType_ICORE;
  config->has_sdk_name = 1;
}

- (BOOL)isDate:(NSDate *)date1 inSameDayOrBeforeThan:(NSDate *)date2 {
  return [[NSCalendar currentCalendar] isDate:date1 inSameDayAsDate:date2] ||
         [date1 compare:date2] == NSOrderedAscending;
}

@end
