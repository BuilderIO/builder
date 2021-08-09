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

#import "FirebaseAuth/Sources/Backend/FIRIdentityToolkitRequest.h"

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuth.h"

NS_ASSUME_NONNULL_BEGIN

static NSString *const kHttpsProtocol = @"https:";
static NSString *const kHttpProtocol = @"http:";

static NSString *const kFirebaseAuthAPIURLFormat =
    @"%@//%@/identitytoolkit/v3/relyingparty/%@?key=%@";
static NSString *const kIdentityPlatformAPIURLFormat = @"%@//%@/v2/%@?key=%@";
static NSString *const kEmulatorHostAndPrefixFormat = @"%@/%@";

static NSString *gAPIHost = @"www.googleapis.com";

static NSString *kFirebaseAuthAPIHost = @"www.googleapis.com";
static NSString *kIdentityPlatformAPIHost = @"identitytoolkit.googleapis.com";

static NSString *kFirebaseAuthStagingAPIHost = @"staging-www.sandbox.googleapis.com";
static NSString *kIdentityPlatformStagingAPIHost =
    @"staging-identitytoolkit.sandbox.googleapis.com";

@implementation FIRIdentityToolkitRequest {
  FIRAuthRequestConfiguration *_requestConfiguration;

  BOOL _useIdentityPlatform;

  BOOL _useStaging;
}

- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration {
  self = [super init];
  if (self) {
    _APIKey = [requestConfiguration.APIKey copy];
    _endpoint = [endpoint copy];
    _requestConfiguration = requestConfiguration;
    _useIdentityPlatform = NO;
    _useStaging = NO;

    // Automatically set the tenant ID. If the request is initialized before FIRAuth is configured,
    // set tenant ID to nil.
    @try {
      _tenantID = [FIRAuth auth].tenantID;
    } @catch (NSException *e) {
      _tenantID = nil;
    }
  }
  return self;
}

- (nullable instancetype)initWithEndpoint:(NSString *)endpoint
                     requestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                      useIdentityPlatform:(BOOL)useIdentityPlatform
                               useStaging:(BOOL)useStaging {
  self = [self initWithEndpoint:endpoint requestConfiguration:requestConfiguration];
  if (self) {
    _useIdentityPlatform = useIdentityPlatform;
    _useStaging = useStaging;
  }
  return self;
}

- (BOOL)containsPostBody {
  return YES;
}

- (NSURL *)requestURL {
  NSString *apiURLFormat;
  NSString *apiProtocol;
  NSString *apiHostAndPathPrefix;

  NSString *emulatorHostAndPort = _requestConfiguration.emulatorHostAndPort;

  if (_useIdentityPlatform) {
    apiURLFormat = kIdentityPlatformAPIURLFormat;
    apiProtocol = kHttpsProtocol;
    if (emulatorHostAndPort) {
      apiProtocol = kHttpProtocol;
      apiHostAndPathPrefix =
          [NSString stringWithFormat:kEmulatorHostAndPrefixFormat, emulatorHostAndPort,
                                     kIdentityPlatformAPIHost];
    } else if (_useStaging) {
      apiHostAndPathPrefix = kIdentityPlatformStagingAPIHost;
    } else {
      apiHostAndPathPrefix = kIdentityPlatformAPIHost;
    }
  } else {
    apiURLFormat = kFirebaseAuthAPIURLFormat;
    apiProtocol = kHttpsProtocol;
    if (emulatorHostAndPort) {
      apiProtocol = kHttpProtocol;
      apiHostAndPathPrefix = [NSString
          stringWithFormat:kEmulatorHostAndPrefixFormat, emulatorHostAndPort, kFirebaseAuthAPIHost];
    } else if (_useStaging) {
      apiHostAndPathPrefix = kFirebaseAuthStagingAPIHost;
    } else {
      apiHostAndPathPrefix = kFirebaseAuthAPIHost;
    }
  }
  NSString *URLString = [NSString
      stringWithFormat:apiURLFormat, apiProtocol, apiHostAndPathPrefix, _endpoint, _APIKey];
  NSURL *URL = [NSURL URLWithString:URLString];
  return URL;
}

- (FIRAuthRequestConfiguration *)requestConfiguration {
  return _requestConfiguration;
}

#pragma mark - Internal API for development

+ (NSString *)host {
  return gAPIHost;
}

+ (void)setHost:(NSString *)host {
  gAPIHost = host;
}

NS_ASSUME_NONNULL_END

@end
