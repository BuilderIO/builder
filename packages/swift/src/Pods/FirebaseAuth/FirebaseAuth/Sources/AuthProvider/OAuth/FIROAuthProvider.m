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

#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIROAuthProvider.h"
#include <CommonCrypto/CommonCrypto.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRFacebookAuthProvider.h"
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIROAuthCredential.h"
#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"
#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"
#import "FirebaseAuth/Sources/AuthProvider/OAuth/FIROAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthBackend.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthRequestConfiguration.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthWebUtils.h"

#if TARGET_OS_IOS
#import "FirebaseAuth/Sources/Utilities/FIRAuthURLPresenter.h"
#endif

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRHeadfulLiteURLCallBack
    @brief The callback invoked at the end of the flow to fetch a headful-lite URL.
    @param headfulLiteURL The headful lite URL.
    @param error The error that occurred while fetching the headful-lite, if any.
 */
typedef void (^FIRHeadfulLiteURLCallBack)(NSURL *_Nullable headfulLiteURL,
                                          NSError *_Nullable error);

/** @var kHeadfulLiteURLStringFormat
    @brief The format of the URL used to open the headful lite page during sign-in.
 */
NSString *const kHeadfulLiteURLStringFormat = @"https://%@/__/auth/handler?%@";

/** @var kHeadfulLiteEmulatorURLStringFormat
    @brief The format of the URL used to open the emulated headful lite page during sign-in.
 */
NSString *const kHeadfulLiteEmulatorURLStringFormat = @"http://%@/emulator/auth/handler?%@";

/** @var kauthTypeSignInWithRedirect
    @brief The auth type to be specified in the sign-in request with redirect request and response.
 */
static NSString *const kAuthTypeSignInWithRedirect = @"signInWithRedirect";

/** @var kCustomUrlSchemePrefix
    @brief The prefix to append to the Firebase app ID custom callback scheme..
 */
static NSString *const kCustomUrlSchemePrefix = @"app-";

@implementation FIROAuthProvider {
  /** @var _auth
      @brief The auth instance used for launching the URL presenter.
   */
  FIRAuth *_auth;

  /** @var _callbackScheme
      @brief The callback URL scheme used for headful-lite sign-in.
   */
  NSString *_callbackScheme;

  /** @var _usingClientIDScheme
      @brief True if the reverse client ID is registered as a custom URL scheme, and false
     otherwise.
   */
  BOOL _usingClientIDScheme;
}

+ (FIROAuthCredential *)credentialWithProviderID:(NSString *)providerID
                                         IDToken:(NSString *)IDToken
                                     accessToken:(nullable NSString *)accessToken {
  return [[FIROAuthCredential alloc] initWithProviderID:providerID
                                                IDToken:IDToken
                                               rawNonce:nil
                                            accessToken:accessToken
                                                 secret:nil
                                           pendingToken:nil];
}

+ (FIROAuthCredential *)credentialWithProviderID:(NSString *)providerID
                                     accessToken:(NSString *)accessToken {
  return [[FIROAuthCredential alloc] initWithProviderID:providerID
                                                IDToken:nil
                                               rawNonce:nil
                                            accessToken:accessToken
                                                 secret:nil
                                           pendingToken:nil];
}

+ (FIROAuthCredential *)credentialWithProviderID:(NSString *)providerID
                                         IDToken:(NSString *)IDToken
                                        rawNonce:(nullable NSString *)rawNonce
                                     accessToken:(nullable NSString *)accessToken {
  return [[FIROAuthCredential alloc] initWithProviderID:providerID
                                                IDToken:IDToken
                                               rawNonce:rawNonce
                                            accessToken:accessToken
                                                 secret:nil
                                           pendingToken:nil];
}

+ (FIROAuthCredential *)credentialWithProviderID:(NSString *)providerID
                                         IDToken:(NSString *)IDToken
                                        rawNonce:(nullable NSString *)rawNonce {
  return [[FIROAuthCredential alloc] initWithProviderID:providerID
                                                IDToken:IDToken
                                               rawNonce:rawNonce
                                            accessToken:nil
                                                 secret:nil
                                           pendingToken:nil];
}

+ (instancetype)providerWithProviderID:(NSString *)providerID {
  return [[self alloc] initWithProviderID:providerID auth:[FIRAuth auth]];
}

+ (instancetype)providerWithProviderID:(NSString *)providerID auth:(FIRAuth *)auth {
  return [[self alloc] initWithProviderID:providerID auth:auth];
}

#if TARGET_OS_IOS
- (void)getCredentialWithUIDelegate:(nullable id<FIRAuthUIDelegate>)UIDelegate
                         completion:(nullable FIRAuthCredentialCallback)completion {
  if (![FIRAuthWebUtils isCallbackSchemeRegisteredForCustomURLScheme:self->_callbackScheme]) {
    [NSException raise:NSInternalInconsistencyException
                format:@"Please register custom URL scheme '%@' in the app's Info.plist file.",
                       self->_callbackScheme];
  }
  __weak __typeof__(self) weakSelf = self;
  __weak FIRAuth *weakAuth = _auth;
  __weak NSString *weakProviderID = _providerID;
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthCredentialCallback callbackOnMainThread =
        ^(FIRAuthCredential *_Nullable credential, NSError *_Nullable error) {
          if (completion) {
            dispatch_async(dispatch_get_main_queue(), ^{
              completion(credential, error);
            });
          }
        };
    NSString *eventID = [FIRAuthWebUtils randomStringWithLength:10];
    NSString *sessionID = [FIRAuthWebUtils randomStringWithLength:10];
    __strong __typeof__(self) strongSelf = weakSelf;
    [strongSelf
        getHeadFulLiteURLWithEventID:eventID
                           sessionID:sessionID
                          completion:^(NSURL *_Nullable headfulLiteURL, NSError *_Nullable error) {
                            if (error) {
                              callbackOnMainThread(nil, error);
                              return;
                            }
                            FIRAuthURLCallbackMatcher callbackMatcher =
                                ^BOOL(NSURL *_Nullable callbackURL) {
                                  return [FIRAuthWebUtils
                                      isExpectedCallbackURL:callbackURL
                                                    eventID:eventID
                                                   authType:kAuthTypeSignInWithRedirect
                                             callbackScheme:strongSelf->_callbackScheme];
                                };
                            __strong FIRAuth *strongAuth = weakAuth;
                            [strongAuth.authURLPresenter
                                     presentURL:headfulLiteURL
                                     UIDelegate:UIDelegate
                                callbackMatcher:callbackMatcher
                                     completion:^(NSURL *_Nullable callbackURL,
                                                  NSError *_Nullable error) {
                                       if (error) {
                                         callbackOnMainThread(nil, error);
                                         return;
                                       }
                                       NSString *OAuthResponseURLString =
                                           [strongSelf OAuthResponseForURL:callbackURL
                                                                     error:&error];
                                       if (error) {
                                         callbackOnMainThread(nil, error);
                                         return;
                                       }
                                       __strong NSString *strongProviderID = weakProviderID;
                                       FIROAuthCredential *credential = [[FIROAuthCredential alloc]
                                               initWithProviderID:strongProviderID
                                                        sessionID:sessionID
                                           OAuthResponseURLString:OAuthResponseURLString];
                                       callbackOnMainThread(credential, nil);
                                     }];
                          }];
  });
}
#endif  // TARGET_OS_IOS

#pragma mark - Internal Methods

/** @fn initWithProviderID:auth:
    @brief returns an instance of @c FIROAuthProvider associated with the provided auth instance.
    @param auth The Auth instance to be associated with the OAuthProvider instance.
    @return An Instance of @c FIROAuthProvider.
  */
- (nullable instancetype)initWithProviderID:(NSString *)providerID auth:(FIRAuth *)auth {
  if (!auth.requestConfiguration.emulatorHostAndPort) {
    NSAssert(![providerID isEqual:FIRFacebookAuthProviderID],
             @"Sign in with Facebook is not supported via generic IDP; the Facebook TOS "
              "dictate that you must use the Facebook iOS SDK for Facebook login.");
    NSAssert(![providerID isEqual:@"apple.com"],
             @"Sign in with Apple is not supported via generic IDP; You must use the Apple iOS SDK"
              " for Sign in with Apple.");
  }
  self = [super init];
  if (self) {
    _auth = auth;
    _providerID = providerID;
    if (_auth.app.options.clientID) {
      NSString *reverseClientIDScheme =
          [[[_auth.app.options.clientID componentsSeparatedByString:@"."]
               reverseObjectEnumerator].allObjects componentsJoinedByString:@"."];
      if ([FIRAuthWebUtils isCallbackSchemeRegisteredForCustomURLScheme:reverseClientIDScheme]) {
        _callbackScheme = reverseClientIDScheme;
        _usingClientIDScheme = YES;
      }
    }

    if (!_usingClientIDScheme) {
      _callbackScheme = [kCustomUrlSchemePrefix
          stringByAppendingString:[_auth.app.options.googleAppID
                                      stringByReplacingOccurrencesOfString:@":"
                                                                withString:@"-"]];
    }
  }
  return self;
}

/** @fn OAuthResponseForURL:error:
    @brief Parses the redirected URL and returns a string representation of the OAuth response URL.
    @param URL The url to be parsed for an OAuth response URL.
    @param error The error that occurred if any.
    @return The OAuth response if successful.
 */
- (nullable NSString *)OAuthResponseForURL:(NSURL *)URL error:(NSError *_Nullable *_Nullable)error {
  NSDictionary<NSString *, NSString *> *URLQueryItems =
      [FIRAuthWebUtils dictionaryWithHttpArgumentsString:URL.query];
  NSURL *deepLinkURL = [NSURL URLWithString:URLQueryItems[@"deep_link_id"]];
  URLQueryItems = [FIRAuthWebUtils dictionaryWithHttpArgumentsString:deepLinkURL.query];
  NSString *queryItemLink = URLQueryItems[@"link"];
  if (queryItemLink) {
    return queryItemLink;
  }
  if (!error) {
    return nil;
  }
  NSData *errorData = [URLQueryItems[@"firebaseError"] dataUsingEncoding:NSUTF8StringEncoding];
  NSError *jsonError;
  NSDictionary *errorDict = [NSJSONSerialization JSONObjectWithData:errorData
                                                            options:0
                                                              error:&jsonError];
  if (jsonError) {
    *error = [FIRAuthErrorUtils JSONSerializationErrorWithUnderlyingError:jsonError];
    return nil;
  }
  *error = [FIRAuthErrorUtils URLResponseErrorWithCode:errorDict[@"code"]
                                               message:errorDict[@"message"]];
  if (!*error) {
    NSString *reason;
    if (errorDict[@"code"] && errorDict[@"message"]) {
      reason = [NSString stringWithFormat:@"[%@] - %@", errorDict[@"code"], errorDict[@"message"]];
    }
    *error = [FIRAuthErrorUtils webSignInUserInteractionFailureWithReason:reason];
  }
  return nil;
}

/** @fn getHeadFulLiteURLWithEventID:completion:
    @brief Constructs a URL used for opening a headful-lite flow using a given event
        ID and session ID.
    @param eventID The event ID used for this purpose.
    @param sessionID The session ID used when completing the headful lite flow.
    @param completion The callback invoked after the URL has been constructed or an error
        has been encountered.
 */
- (void)getHeadFulLiteURLWithEventID:(NSString *)eventID
                           sessionID:(NSString *)sessionID
                          completion:(FIRHeadfulLiteURLCallBack)completion {
  __weak __typeof__(self) weakSelf = self;
  [FIRAuthWebUtils
      fetchAuthDomainWithRequestConfiguration:_auth.requestConfiguration
                                   completion:^(NSString *_Nullable authDomain,
                                                NSError *_Nullable error) {
                                     if (error) {
                                       if (completion) {
                                         completion(nil, error);
                                       }
                                       return;
                                     }
                                     __strong __typeof__(self) strongSelf = weakSelf;
                                     NSString *bundleID = [NSBundle mainBundle].bundleIdentifier;
                                     NSString *clientID = strongSelf->_auth.app.options.clientID;
                                     NSString *appID = strongSelf->_auth.app.options.googleAppID;
                                     NSString *apiKey =
                                         strongSelf->_auth.requestConfiguration.APIKey;
                                     NSMutableDictionary *urlArguments = [@{
                                       @"apiKey" : apiKey,
                                       @"authType" : kAuthTypeSignInWithRedirect,
                                       @"ibi" : bundleID ?: @"",
                                       @"sessionId" : [strongSelf hashforString:sessionID],
                                       @"v" : [FIRAuthBackend authUserAgent],
                                       @"eventId" : eventID,
                                       @"providerId" : strongSelf->_providerID,
                                     } mutableCopy];
                                     if (strongSelf->_usingClientIDScheme) {
                                       urlArguments[@"clientId"] = clientID;
                                     } else {
                                       urlArguments[@"appId"] = appID;
                                     }
                                     if (strongSelf.scopes.count) {
                                       urlArguments[@"scopes"] =
                                           [strongSelf.scopes componentsJoinedByString:@","];
                                     }
                                     if (strongSelf.customParameters.count) {
                                       NSString *customParameters =
                                           [strongSelf customParametersStringWithError:&error];
                                       if (error) {
                                         completion(nil, error);
                                         return;
                                       }
                                       if (customParameters) {
                                         urlArguments[@"customParameters"] = customParameters;
                                       }
                                     }
                                     if (strongSelf->_auth.requestConfiguration.languageCode) {
                                       urlArguments[@"hl"] =
                                           strongSelf->_auth.requestConfiguration.languageCode;
                                     }
                                     NSString *argumentsString = [strongSelf
                                         httpArgumentsStringForArgsDictionary:urlArguments];
                                     NSString *URLString;
                                     if (strongSelf->_auth.requestConfiguration
                                             .emulatorHostAndPort) {
                                       URLString = [NSString
                                           stringWithFormat:kHeadfulLiteEmulatorURLStringFormat,
                                                            authDomain, argumentsString];
                                     } else {
                                       URLString =
                                           [NSString stringWithFormat:kHeadfulLiteURLStringFormat,
                                                                      authDomain, argumentsString];
                                     }
                                     if (completion) {
                                       NSCharacterSet *set =
                                           [NSCharacterSet URLFragmentAllowedCharacterSet];
                                       completion(
                                           [NSURL
                                               URLWithString:
                                                   [URLString
                                                       stringByAddingPercentEncodingWithAllowedCharacters:
                                                           set]],
                                           nil);
                                     }
                                   }];
}

/** @fn customParametersString
    @brief Returns a JSON string representation of the custom parameters dictionary corresponding
        to the OAuthProvider.
    @return The JSON string representation of the custom parameters dictionary corresponding
        to the OAuthProvider.
 */
- (nullable NSString *)customParametersStringWithError:(NSError *_Nullable *_Nullable)error {
  if (!_customParameters.count) {
    return nil;
  }

  if (!error) {
    return nil;
  }
  NSError *jsonError;
  NSData *customParametersJSONData = [NSJSONSerialization dataWithJSONObject:_customParameters
                                                                     options:0
                                                                       error:&jsonError];
  if (jsonError) {
    *error = [FIRAuthErrorUtils JSONSerializationErrorWithUnderlyingError:jsonError];
    return nil;
  }

  NSString *customParamsRawJSON = [[NSString alloc] initWithData:customParametersJSONData
                                                        encoding:NSUTF8StringEncoding];
  return customParamsRawJSON;
}

/** @fn hashforString:
    @brief Returns the SHA256 hash representation of a given string object.
    @param string The string for which a SHA256 hash is desired.
    @return An hexadecimal string representation of the SHA256 hash.
 */
- (NSString *)hashforString:(NSString *)string {
  NSData *sessionIDData = [string dataUsingEncoding:NSUTF8StringEncoding];
  NSMutableData *hashOutputData = [NSMutableData dataWithLength:CC_SHA256_DIGEST_LENGTH];
  if (CC_SHA256(sessionIDData.bytes, (CC_LONG)[sessionIDData length],
                hashOutputData.mutableBytes)) {
  }
  return [self hexStringFromData:hashOutputData];
  ;
}

/** @fn hexStringFromData:
    @brief Returns the hexadecimal string representation of an NSData object.
    @param data The NSData object for which a hexadecical string is desired.
    @return The hexadecimal string representation of the supplied NSData object.
 */
- (NSString *)hexStringFromData:(NSData *)data {
  const unsigned char *dataBuffer = (const unsigned char *)[data bytes];
  NSMutableString *string = [[NSMutableString alloc] init];
  for (unsigned int i = 0; i < data.length; i++) {
    [string appendFormat:@"%02lx", (unsigned long)dataBuffer[i]];
  }
  return [string copy];
}

- (NSString *)httpArgumentsStringForArgsDictionary:(NSDictionary *)argsDictionary {
  NSMutableArray *arguments = [NSMutableArray arrayWithCapacity:argsDictionary.count];
  NSString *key;
  for (key in argsDictionary) {
    NSString *description = [argsDictionary[key] description];
    [arguments
        addObject:[NSString
                      stringWithFormat:@"%@=%@",
                                       [FIRAuthWebUtils stringByUnescapingFromURLArgument:key],
                                       [FIRAuthWebUtils
                                           stringByUnescapingFromURLArgument:description]]];
  }
  return [arguments componentsJoinedByString:@"&"];
}

@end

NS_ASSUME_NONNULL_END
