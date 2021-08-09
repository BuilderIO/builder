/*
 * Copyright 2018 Google
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

#import "FirebaseAuth/Sources/Utilities/FIRAuthWebUtils.h"

#import "FirebaseAuth/Sources/Backend/FIRAuthBackend.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRGetProjectConfigRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRGetProjectConfigResponse.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthWebUtils

+ (NSArray<NSString *> *)supportedAuthDomains {
  return @[ @"firebaseapp.com", @"web.app" ];
}

+ (NSString *)randomStringWithLength:(NSUInteger)length {
  NSMutableString *randomString = [[NSMutableString alloc] init];
  for (int i = 0; i < length; i++) {
    [randomString
        appendString:[NSString stringWithFormat:@"%c", 'a' + arc4random_uniform('z' - 'a' + 1)]];
  }
  return randomString;
}

+ (BOOL)isCallbackSchemeRegisteredForCustomURLScheme:(NSString *)URLScheme {
  NSString *expectedCustomScheme = [URLScheme lowercaseString];
  NSArray *urlTypes = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleURLTypes"];
  for (NSDictionary *urlType in urlTypes) {
    NSArray *urlTypeSchemes = urlType[@"CFBundleURLSchemes"];
    for (NSString *urlTypeScheme in urlTypeSchemes) {
      if ([urlTypeScheme.lowercaseString isEqualToString:expectedCustomScheme]) {
        return YES;
      }
    }
  }
  return NO;
}

+ (BOOL)isExpectedCallbackURL:(nullable NSURL *)URL
                      eventID:(NSString *)eventID
                     authType:(NSString *)authType
               callbackScheme:(NSString *)callbackScheme {
  if (!URL) {
    return NO;
  }
  NSURLComponents *actualURLComponents = [NSURLComponents componentsWithURL:URL
                                                    resolvingAgainstBaseURL:NO];
  actualURLComponents.query = nil;
  actualURLComponents.fragment = nil;

  NSURLComponents *expectedURLComponents = [[NSURLComponents alloc] init];
  expectedURLComponents.scheme = callbackScheme;
  expectedURLComponents.host = @"firebaseauth";
  expectedURLComponents.path = @"/link";

  if (![expectedURLComponents.URL isEqual:actualURLComponents.URL]) {
    return NO;
  }
  NSDictionary<NSString *, NSString *> *URLQueryItems =
      [self dictionaryWithHttpArgumentsString:URL.query];
  NSURL *deeplinkURL = [NSURL URLWithString:URLQueryItems[@"deep_link_id"]];
  NSDictionary<NSString *, NSString *> *deeplinkQueryItems =
      [self dictionaryWithHttpArgumentsString:deeplinkURL.query];
  if ([deeplinkQueryItems[@"authType"] isEqualToString:authType] &&
      [deeplinkQueryItems[@"eventId"] isEqualToString:eventID]) {
    return YES;
  }
  return NO;
}

+ (void)fetchAuthDomainWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                                     completion:(FIRFetchAuthDomainCallback)completion {
  if (requestConfiguration.emulatorHostAndPort) {
    // If we are using the auth emulator, we do not want to call the GetProjectConfig endpoint. The
    // widget is hosted on the emulator host and port, so we can return that directly.
    completion(requestConfiguration.emulatorHostAndPort, nil);
    return;
  }
  FIRGetProjectConfigRequest *request =
      [[FIRGetProjectConfigRequest alloc] initWithRequestConfiguration:requestConfiguration];

  [FIRAuthBackend
      getProjectConfig:request
              callback:^(FIRGetProjectConfigResponse *_Nullable response,
                         NSError *_Nullable error) {
                if (error) {
                  completion(nil, error);
                  return;
                }
                // Look up an authorized domain ends with one of the supportedAuthDomains.
                // The sequence of supportedAuthDomains matters. ("firebaseapp.com", "web.app")
                // The searching ends once the first valid suportedAuthDomain is found.
                NSString *authDomain;
                for (NSString *domain in response.authorizedDomains) {
                  for (NSString *suportedAuthDomain in [self supportedAuthDomains]) {
                    NSInteger index = domain.length - suportedAuthDomain.length;
                    if (index >= 2) {
                      if ([domain hasSuffix:suportedAuthDomain] &&
                          domain.length >= suportedAuthDomain.length + 2) {
                        authDomain = domain;
                        break;
                      }
                    }
                  }
                  if (authDomain != nil) {
                    break;
                  }
                }
                if (!authDomain.length) {
                  completion(nil, [FIRAuthErrorUtils
                                      unexpectedErrorResponseWithDeserializedResponse:response]);
                  return;
                }
                completion(authDomain, nil);
              }];
}

/** @fn queryItemValue:from:
 @brief Utility function to get a value from a NSURLQueryItem array.
 @param name The key.
 @param queryList The NSURLQueryItem array.
 @return The value for the key.
 */
+ (nullable NSString *)queryItemValue:(NSString *)name from:(NSArray<NSURLQueryItem *> *)queryList {
  for (NSURLQueryItem *item in queryList) {
    if ([item.name isEqualToString:name]) {
      return item.value;
    }
  }
  return nil;
}

+ (NSDictionary *)dictionaryWithHttpArgumentsString:(NSString *)argString {
  NSMutableDictionary *ret = [NSMutableDictionary dictionary];
  NSArray *components = [argString componentsSeparatedByString:@"&"];
  NSString *component;
  // Use reverse order so that the first occurrence of a key replaces
  // those subsequent.
  for (component in [components reverseObjectEnumerator]) {
    if (component.length == 0) continue;
    NSRange pos = [component rangeOfString:@"="];
    NSString *key;
    NSString *val;
    if (pos.location == NSNotFound) {
      key = [self stringByUnescapingFromURLArgument:component];
      val = @"";
    } else {
      key = [self stringByUnescapingFromURLArgument:[component substringToIndex:pos.location]];
      val = [self stringByUnescapingFromURLArgument:[component substringFromIndex:pos.location +
                                                                                  pos.length]];
    }
    // returns nil on invalid UTF8 and NSMutableDictionary raises an exception when passed nil
    // values.
    if (!key) key = @"";
    if (!val) val = @"";
    [ret setObject:val forKey:key];
  }
  return ret;
}

+ (NSString *)stringByUnescapingFromURLArgument:(NSString *)argument {
  NSMutableString *resultString = [NSMutableString stringWithString:argument];
  [resultString replaceOccurrencesOfString:@"+"
                                withString:@" "
                                   options:NSLiteralSearch
                                     range:NSMakeRange(0, [resultString length])];
  return [resultString stringByRemovingPercentEncoding];
}

+ (NSDictionary<NSString *, NSString *> *)parseURL:(NSString *)urlString {
  NSString *linkURL = [NSURLComponents componentsWithString:urlString].query;
  if (!linkURL) {
    return @{};
  }
  NSArray<NSString *> *URLComponents = [linkURL componentsSeparatedByString:@"&"];
  NSMutableDictionary<NSString *, NSString *> *queryItems =
      [[NSMutableDictionary alloc] initWithCapacity:URLComponents.count];
  for (NSString *component in URLComponents) {
    NSRange equalRange = [component rangeOfString:@"="];
    if (equalRange.location != NSNotFound) {
      NSString *queryItemKey =
          [[component substringToIndex:equalRange.location] stringByRemovingPercentEncoding];
      NSString *queryItemValue =
          [[component substringFromIndex:equalRange.location + 1] stringByRemovingPercentEncoding];
      if (queryItemKey && queryItemValue) {
        queryItems[queryItemKey] = queryItemValue;
      }
    }
  }
  return queryItems;
}

@end

NS_ASSUME_NONNULL_END
