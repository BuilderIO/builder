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

#import "FirebaseAuth/Sources/Auth/FIRAuth_Internal.h"

#if __has_include(<UIKit/UIKit.h>)
#import <UIKit/UIKit.h>
#endif

#import <GoogleUtilities/GULAppDelegateSwizzler.h>
#import <GoogleUtilities/GULAppEnvironmentUtil.h>
#import <GoogleUtilities/GULSceneDelegateSwizzler.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FirebaseAuth.h"
#import "FirebaseCore/Sources/Private/FirebaseCoreInternal.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthDataResult_Internal.h"
#import "FirebaseAuth/Sources/Auth/FIRAuthDispatcher.h"
#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"
#import "FirebaseAuth/Sources/Auth/FIRAuthOperationType.h"
#import "FirebaseAuth/Sources/AuthProvider/Email/FIREmailPasswordAuthCredential.h"
#import "FirebaseAuth/Sources/AuthProvider/FIRAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/AuthProvider/GameCenter/FIRGameCenterAuthCredential.h"
#import "FirebaseAuth/Sources/AuthProvider/OAuth/FIROAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthBackend.h"
#import "FirebaseAuth/Sources/Backend/FIRAuthRequestConfiguration.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRCreateAuthURIRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRCreateAuthURIResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIREmailLinkSignInRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIREmailLinkSignInResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRGetOOBConfirmationCodeRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRGetOOBConfirmationCodeResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRResetPasswordRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRResetPasswordResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSendVerificationCodeRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSendVerificationCodeResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSetAccountInfoRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSetAccountInfoResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSignInWithGameCenterRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSignInWithGameCenterResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSignUpNewUserRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRSignUpNewUserResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyAssertionResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyCustomTokenRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyCustomTokenResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPasswordRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPasswordResponse.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPhoneNumberRequest.h"
#import "FirebaseAuth/Sources/Backend/RPC/FIRVerifyPhoneNumberResponse.h"
#import "FirebaseAuth/Sources/Storage/FIRAuthKeychainServices.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthStoredUserManager.h"
#import "FirebaseAuth/Sources/User/FIRAdditionalUserInfo_Internal.h"
#import "FirebaseAuth/Sources/User/FIRUser_Internal.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthExceptionUtils.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthWebUtils.h"

#if TARGET_OS_IOS
#import "FirebaseAuth/Sources/AuthProvider/Phone/FIRPhoneAuthCredential_Internal.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAPNSToken.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAPNSTokenManager.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredentialManager.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthNotificationManager.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthURLPresenter.h"
#endif

NS_ASSUME_NONNULL_BEGIN

#pragma mark-- Logger Service String.
FIRLoggerService kFIRLoggerAuth = @"[Firebase/Auth]";

#pragma mark - Constants

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
const NSNotificationName FIRAuthStateDidChangeNotification = @"FIRAuthStateDidChangeNotification";
#else
NSString *const FIRAuthStateDidChangeNotification = @"FIRAuthStateDidChangeNotification";
#endif  // defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0

/** @var kMaxWaitTimeForBackoff
    @brief The maximum wait time before attempting to retry auto refreshing tokens after a failed
        attempt.
    @remarks This is the upper limit (in seconds) of the exponential backoff used for retrying
        token refresh.
 */
static NSTimeInterval kMaxWaitTimeForBackoff = 16 * 60;

/** @var kTokenRefreshHeadStart
    @brief The amount of time before the token expires that proactive refresh should be attempted.
 */
NSTimeInterval kTokenRefreshHeadStart = 5 * 60;

/** @var kUserKey
    @brief Key of user stored in the keychain. Prefixed with a Firebase app name.
 */
static NSString *const kUserKey = @"%@_firebase_user";

/** @var kMissingEmailInvalidParameterExceptionReason
    @brief The reason for @c invalidParameterException when the email used to initiate password
        reset is nil.
 */
static NSString *const kMissingEmailInvalidParameterExceptionReason =
    @"The email used to initiate password reset cannot be nil.";

/** @var kHandleCodeInAppFalseExceptionReason
    @brief The reason for @c invalidParameterException when the handleCodeInApp parameter is false
        on the ActionCodeSettings object used to send the link for Email-link Authentication.
 */
static NSString *const kHandleCodeInAppFalseExceptionReason =
    @"You must set handleCodeInApp in your ActionCodeSettings to true for Email-link "
     "Authentication.";

static NSString *const kInvalidEmailSignInLinkExceptionMessage =
    @"The link provided is not valid for email/link sign-in. Please check the link by calling "
     "isSignInWithEmailLink:link: on Auth before attempting to use it for email/link sign-in.";

/** @var kPasswordResetRequestType
    @brief The action code type value for resetting password in the check action code response.
 */
static NSString *const kPasswordResetRequestType = @"PASSWORD_RESET";

/** @var kVerifyEmailRequestType
    @brief The action code type value for verifying email in the check action code response.
 */
static NSString *const kVerifyEmailRequestType = @"VERIFY_EMAIL";

/** @var kRecoverEmailRequestType
    @brief The action code type value for recovering email in the check action code response.
 */
static NSString *const kRecoverEmailRequestType = @"RECOVER_EMAIL";

/** @var kEmailLinkSignInRequestType
    @brief The action code type value for an email sign-in link in the check action code response.
*/
static NSString *const kEmailLinkSignInRequestType = @"EMAIL_SIGNIN";

/** @var kVerifyAndChangeEmailRequestType
    @brief The action code type value for verifing and changing email in the check action code
           response.
 */
static NSString *const kVerifyAndChangeEmailRequestType = @"VERIFY_AND_CHANGE_EMAIL";

/** @var kRevertSecondFactorAdditionRequestType
    @brief The action code type value for reverting second factor addition in the check action code
           response.
 */
static NSString *const kRevertSecondFactorAdditionRequestType = @"REVERT_SECOND_FACTOR_ADDITION";

/** @var kMissingPasswordReason
    @brief The reason why the @c FIRAuthErrorCodeWeakPassword error is thrown.
    @remarks This error message will be localized in the future.
 */
static NSString *const kMissingPasswordReason = @"Missing Password";

/** @var gKeychainServiceNameForAppName
    @brief A map from Firebase app name to keychain service names.
    @remarks This map is needed for looking up the keychain service name after the FIRApp instance
        is deleted, to remove the associated keychain item. Accessing should occur within a
        @syncronized([FIRAuth class]) context.
 */
static NSMutableDictionary *gKeychainServiceNameForAppName;

#pragma mark - FIRActionCodeInfo

@interface FIRActionCodeInfo ()

/**
    @brief The operation being performed.
 */
@property(nonatomic, readwrite) FIRActionCodeOperation operation;

/** @property email
    @brief The email address to which the code was sent. The new email address in the case of
        FIRActionCodeOperationRecoverEmail.
 */
@property(nonatomic, nullable, readwrite, copy) NSString *email;

/** @property previousEmail
    @brief The current email address in the case of FIRActionCodeOperationRecoverEmail.
 */
@property(nonatomic, nullable, readwrite, copy) NSString *previousEmail;

#if TARGET_OS_IOS
/** @property multiFactorInfo
    @brief The MultiFactorInfo object of the second factor to be reverted in case of
        FIRActionCodeMultiFactorInfoKey.
 */
@property(nonatomic, nullable, readwrite) FIRMultiFactorInfo *multiFactorInfo;
#endif

@end

@implementation FIRActionCodeInfo

- (instancetype)initWithOperation:(FIRActionCodeOperation)operation
                            email:(NSString *)email
                         newEmail:(nullable NSString *)newEmail {
  self = [super init];
  if (self) {
    _operation = operation;
    if (newEmail) {
      _email = [newEmail copy];
      _previousEmail = [email copy];
    } else {
      _email = [email copy];
    }
  }
  return self;
}

/** @fn actionCodeOperationForRequestType:
    @brief Returns the corresponding operation type per provided request type string.
    @param requestType Request type returned in in the server response.
    @return The corresponding FIRActionCodeOperation for the supplied request type.
 */
+ (FIRActionCodeOperation)actionCodeOperationForRequestType:(NSString *)requestType {
  if ([requestType isEqualToString:kPasswordResetRequestType]) {
    return FIRActionCodeOperationPasswordReset;
  }
  if ([requestType isEqualToString:kVerifyEmailRequestType]) {
    return FIRActionCodeOperationVerifyEmail;
  }
  if ([requestType isEqualToString:kRecoverEmailRequestType]) {
    return FIRActionCodeOperationRecoverEmail;
  }
  if ([requestType isEqualToString:kEmailLinkSignInRequestType]) {
    return FIRActionCodeOperationEmailLink;
  }
  if ([requestType isEqualToString:kVerifyAndChangeEmailRequestType]) {
    return FIRActionCodeOperationVerifyAndChangeEmail;
  }
  if ([requestType isEqualToString:kRevertSecondFactorAdditionRequestType]) {
    return FIRActionCodeOperationRevertSecondFactorAddition;
  }
  return FIRActionCodeOperationUnknown;
}

@end

#pragma mark - FIRActionCodeURL

@implementation FIRActionCodeURL

/** @fn FIRAuthParseURL:NSString
    @brief Parses an incoming URL into all available query items.
    @param urlString The url to be parsed.
    @return A dictionary of available query items in the target URL.
 */
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

+ (nullable instancetype)actionCodeURLWithLink:(NSString *)link {
  NSDictionary<NSString *, NSString *> *queryItems = [FIRActionCodeURL parseURL:link];
  if (!queryItems.count) {
    NSURLComponents *urlComponents = [NSURLComponents componentsWithString:link];
    queryItems = [FIRActionCodeURL parseURL:urlComponents.query];
  }
  if (!queryItems.count) {
    return nil;
  }
  NSString *APIKey = queryItems[@"apiKey"];
  NSString *actionCode = queryItems[@"oobCode"];
  NSString *continueURLString = queryItems[@"continueUrl"];
  NSString *languageCode = queryItems[@"languageCode"];
  NSString *mode = queryItems[@"mode"];
  NSString *tenantID = queryItems[@"tenantID"];
  return [[FIRActionCodeURL alloc] initWithAPIKey:APIKey
                                       actionCode:actionCode
                                continueURLString:continueURLString
                                     languageCode:languageCode
                                             mode:mode
                                         tenantID:tenantID];
}

- (nullable instancetype)initWithAPIKey:(NSString *)APIKey
                             actionCode:(NSString *)actionCode
                      continueURLString:(NSString *)continueURLString
                           languageCode:(NSString *)languageCode
                                   mode:(NSString *)mode
                               tenantID:(NSString *)tenantID {
  self = [super init];
  if (self) {
    _APIKey = APIKey;
    _operation = [FIRActionCodeInfo actionCodeOperationForRequestType:mode];
    _code = actionCode;
    _continueURL = [NSURL URLWithString:continueURLString];
    _languageCode = languageCode;
  }
  return self;
}

@end

#pragma mark - FIRAuth

#if TARGET_OS_IOS
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
@interface FIRAuth () <UIApplicationDelegate,
                       UISceneDelegate,
                       FIRLibrary,
                       FIRComponentLifecycleMaintainer>
#else
@interface FIRAuth () <UIApplicationDelegate, FIRLibrary, FIRComponentLifecycleMaintainer>
#endif
#else
@interface FIRAuth () <FIRLibrary, FIRComponentLifecycleMaintainer>
#endif

/** @property firebaseAppId
    @brief The Firebase app ID.
 */
@property(nonatomic, copy, readonly) NSString *firebaseAppId;

/** @property additionalFrameworkMarker
    @brief Additional framework marker that will be added as part of the header of every request.
 */
@property(nonatomic, copy, nullable) NSString *additionalFrameworkMarker;

/** @property storedUserManager
    @brief The stored user manager.
 */
@property(nonatomic, strong, nullable) FIRAuthStoredUserManager *storedUserManager;

/** @fn initWithApp:
    @brief Creates a @c FIRAuth instance associated with the provided @c FIRApp instance.
    @param app The application to associate the auth instance with.
 */
- (instancetype)initWithApp:(FIRApp *)app;

@end

@implementation FIRAuth {
  /** @var _currentUser
      @brief The current user.
   */
  FIRUser *_currentUser;

  /** @var _firebaseAppName
      @brief The Firebase app name.
   */
  NSString *_firebaseAppName;

  /** @var _listenerHandles
      @brief Handles returned from @c NSNotificationCenter for blocks which are "auth state did
          change" notification listeners.
      @remarks Mutations should occur within a @syncronized(self) context.
   */
  NSMutableArray<FIRAuthStateDidChangeListenerHandle> *_listenerHandles;

  /** @var _keychainServices
      @brief The keychain service.
   */
  FIRAuthKeychainServices *_keychainServices;

  /** @var _lastNotifiedUserToken
      @brief The user access (ID) token used last time for posting auth state changed notification.
   */
  NSString *_lastNotifiedUserToken;

  /** @var _autoRefreshTokens
      @brief This flag denotes whether or not tokens should be automatically refreshed.
      @remarks Will only be set to @YES if the another Firebase service is included (additionally to
        Firebase Auth).
   */
  BOOL _autoRefreshTokens;

  /** @var _autoRefreshScheduled
      @brief Whether or not token auto-refresh is currently scheduled.
   */
  BOOL _autoRefreshScheduled;

  /** @var _isAppInBackground
      @brief A flag that is set to YES if the app is put in the background and no when the app is
          returned to the foreground.
   */
  BOOL _isAppInBackground;

  /** @var _applicationDidBecomeActiveObserver
      @brief An opaque object to act as the observer for UIApplicationDidBecomeActiveNotification.
   */
  id<NSObject> _applicationDidBecomeActiveObserver;

  /** @var _applicationDidBecomeActiveObserver
      @brief An opaque object to act as the observer for
          UIApplicationDidEnterBackgroundNotification.
   */
  id<NSObject> _applicationDidEnterBackgroundObserver;
}

+ (void)load {
  [FIRApp registerInternalLibrary:(Class<FIRLibrary>)self withName:@"fire-auth"];
}

+ (void)initialize {
  gKeychainServiceNameForAppName = [[NSMutableDictionary alloc] init];
}

+ (FIRAuth *)auth {
  FIRApp *defaultApp = [FIRApp defaultApp];
  if (!defaultApp) {
    [NSException
         raise:NSInternalInconsistencyException
        format:@"The default FirebaseApp instance must be configured before the default Auth"
               @"instance can be initialized. One way to ensure this is to call "
               @"`FirebaseApp.configure()` in the App Delegate's "
               @"`application(_:didFinishLaunchingWithOptions:)` (or the `@main` struct's "
               @"initializer in SwiftUI)."];
  }
  return [self authWithApp:defaultApp];
}

+ (FIRAuth *)authWithApp:(FIRApp *)app {
  // Get the instance of Auth from the container, which will create or return the cached instance
  // associated with this app.
  id<FIRAuthInterop> auth = FIR_COMPONENT(FIRAuthInterop, app.container);
  return (FIRAuth *)auth;
}

- (instancetype)initWithApp:(FIRApp *)app {
  [FIRAuth setKeychainServiceNameForApp:app];
  self = [self initWithAPIKey:app.options.APIKey appName:app.name];
  if (self) {
    _app = app;
#if TARGET_OS_IOS
    _authURLPresenter = [[FIRAuthURLPresenter alloc] init];
#endif
  }
  return self;
}

- (nullable instancetype)initWithAPIKey:(NSString *)APIKey appName:(NSString *)appName {
  self = [super init];
  if (self) {
    _listenerHandles = [NSMutableArray array];
    _requestConfiguration = [[FIRAuthRequestConfiguration alloc] initWithAPIKey:APIKey];
    _firebaseAppName = [appName copy];
#if TARGET_OS_IOS
    _settings = [[FIRAuthSettings alloc] init];
    static Class applicationClass = nil;
    // iOS App extensions should not call [UIApplication sharedApplication], even if UIApplication
    // responds to it.
    if (![GULAppEnvironmentUtil isAppExtension]) {
      Class cls = NSClassFromString(@"UIApplication");
      if (cls && [cls respondsToSelector:NSSelectorFromString(@"sharedApplication")]) {
        applicationClass = cls;
      }
    }
    UIApplication *application = [applicationClass sharedApplication];

    [GULAppDelegateSwizzler proxyOriginalDelegateIncludingAPNSMethods];
    [GULSceneDelegateSwizzler proxyOriginalSceneDelegate];
#endif  // TARGET_OS_IOS

    // Continue with the rest of initialization in the work thread.
    __weak FIRAuth *weakSelf = self;
    dispatch_async(FIRAuthGlobalWorkQueue(), ^{
      // Load current user from Keychain.
      FIRAuth *strongSelf = weakSelf;
      if (!strongSelf) {
        return;
      }
      NSString *keychainServiceName =
          [FIRAuth keychainServiceNameForAppName:strongSelf->_firebaseAppName];
      if (keychainServiceName) {
        strongSelf->_keychainServices =
            [[FIRAuthKeychainServices alloc] initWithService:keychainServiceName];
        strongSelf.storedUserManager =
            [[FIRAuthStoredUserManager alloc] initWithServiceName:keychainServiceName];
      }

      NSError *error;
      NSString *storedUserAccessGroup =
          [strongSelf.storedUserManager getStoredUserAccessGroupWithError:&error];
      if (!error) {
        if (!storedUserAccessGroup) {
          FIRUser *user;
          if ([strongSelf getUser:&user error:&error]) {
            strongSelf.tenantID = user.tenantID;
            [strongSelf updateCurrentUser:user byForce:NO savingToDisk:NO error:&error];
            self->_lastNotifiedUserToken = user.rawAccessToken;
          } else {
            FIRLogError(kFIRLoggerAuth, @"I-AUT000001",
                        @"Error loading saved user when starting up: %@", error);
          }
        } else {
          [strongSelf internalUseUserAccessGroup:storedUserAccessGroup error:&error];
          if (error) {
            FIRLogError(kFIRLoggerAuth, @"I-AUT000001",
                        @"Error loading saved user when starting up: %@", error);
          }
        }
      } else {
        FIRLogError(kFIRLoggerAuth, @"I-AUT000001",
                    @"Error loading saved user when starting up: %@", error);
      }

#if TARGET_OS_IOS
      // Initialize for phone number auth.
      strongSelf->_tokenManager = [[FIRAuthAPNSTokenManager alloc] initWithApplication:application];

      strongSelf->_appCredentialManager =
          [[FIRAuthAppCredentialManager alloc] initWithKeychain:strongSelf->_keychainServices];

      strongSelf->_notificationManager = [[FIRAuthNotificationManager alloc]
           initWithApplication:application
          appCredentialManager:strongSelf->_appCredentialManager];

      [GULAppDelegateSwizzler registerAppDelegateInterceptor:strongSelf];
#if ((TARGET_OS_IOS || TARGET_OS_TV) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 130000))
      if (@available(iOS 13, tvos 13, *)) {
        [GULSceneDelegateSwizzler registerSceneDelegateInterceptor:strongSelf];
      }
#endif  // ((TARGET_OS_IOS || TARGET_OS_TV) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 130000))
#endif  // TARGET_OS_IOS
    });
  }
  return self;
}

- (void)dealloc {
  @synchronized(self) {
    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
    while (_listenerHandles.count != 0) {
      FIRAuthStateDidChangeListenerHandle handleToRemove = _listenerHandles.lastObject;
      [defaultCenter removeObserver:handleToRemove];
      [_listenerHandles removeLastObject];
    }

#if TARGET_OS_IOS
    [defaultCenter removeObserver:_applicationDidBecomeActiveObserver
                             name:UIApplicationDidBecomeActiveNotification
                           object:nil];
    [defaultCenter removeObserver:_applicationDidEnterBackgroundObserver
                             name:UIApplicationDidEnterBackgroundNotification
                           object:nil];
#endif
  }
}

#pragma mark - Public API

- (nullable FIRUser *)currentUser {
  __block FIRUser *result;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    result = self->_currentUser;
  });
  return result;
}

- (void)signInWithProvider:(id<FIRFederatedAuthProvider>)provider
                UIDelegate:(nullable id<FIRAuthUIDelegate>)UIDelegate
                completion:(nullable FIRAuthDataResultCallback)completion {
#if TARGET_OS_IOS
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    [provider getCredentialWithUIDelegate:UIDelegate
                               completion:^(FIRAuthCredential *_Nullable credential,
                                            NSError *_Nullable error) {
                                 if (error) {
                                   decoratedCallback(nil, error);
                                   return;
                                 }
                                 [self
                                   internalSignInAndRetrieveDataWithCredential:credential
                                                            isReauthentication:NO
                                                                      callback:decoratedCallback];
                               }];
  });
#endif  // TARGET_OS_IOS
}

- (void)fetchSignInMethodsForEmail:(nonnull NSString *)email
                        completion:(nullable FIRSignInMethodQueryCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRCreateAuthURIRequest *request =
        [[FIRCreateAuthURIRequest alloc] initWithIdentifier:email
                                                continueURI:@"http://www.google.com/"
                                       requestConfiguration:self->_requestConfiguration];
    [FIRAuthBackend
        createAuthURI:request
             callback:^(FIRCreateAuthURIResponse *_Nullable response, NSError *_Nullable error) {
               if (completion) {
                 dispatch_async(dispatch_get_main_queue(), ^{
                   completion(response.signinMethods, error);
                 });
               }
             }];
  });
}

- (void)signInWithEmail:(NSString *)email
               password:(NSString *)password
             completion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    [self internalSignInAndRetrieveDataWithEmail:email
                                        password:password
                                      completion:^(FIRAuthDataResult *_Nullable authResult,
                                                   NSError *_Nullable error) {
                                        decoratedCallback(authResult, error);
                                      }];
  });
}

- (void)signInWithEmail:(NSString *)email
                   link:(NSString *)link
             completion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    FIREmailPasswordAuthCredential *credential =
        [[FIREmailPasswordAuthCredential alloc] initWithEmail:email link:link];
    [self internalSignInAndRetrieveDataWithCredential:credential
                                   isReauthentication:NO
                                             callback:^(FIRAuthDataResult *_Nullable authResult,
                                                        NSError *_Nullable error) {
                                               decoratedCallback(authResult, error);
                                             }];
  });
}

/** @fn signInWithEmail:password:callback:
    @brief Signs in using an email address and password.
    @param email The user's email address.
    @param password The user's password.
    @param callback A block which is invoked when the sign in finishes (or is cancelled.) Invoked
        asynchronously on the global auth work queue in the future.
    @remarks This is the internal counterpart of this method, which uses a callback that does not
        update the current user.
 */
- (void)signInWithEmail:(NSString *)email
               password:(NSString *)password
               callback:(FIRAuthResultCallback)callback {
  FIRVerifyPasswordRequest *request =
      [[FIRVerifyPasswordRequest alloc] initWithEmail:email
                                             password:password
                                 requestConfiguration:_requestConfiguration];

  if (![request.password length]) {
    callback(nil, [FIRAuthErrorUtils wrongPasswordErrorWithMessage:nil]);
    return;
  }
  [FIRAuthBackend
    verifyPassword:request
          callback:^(FIRVerifyPasswordResponse *_Nullable response, NSError *_Nullable error) {
            if (error) {
              callback(nil, error);
              return;
            }
            [self completeSignInWithAccessToken:response.IDToken
                      accessTokenExpirationDate:response.approximateExpirationDate
                                   refreshToken:response.refreshToken
                                      anonymous:NO
                                       callback:callback];
          }];
}

/** @fn internalSignInAndRetrieveDataWithEmail:password:callback:
    @brief Signs in using an email address and password.
    @param email The user's email address.
    @param password The user's password.
    @param completion A block which is invoked when the sign in finishes (or is cancelled.) Invoked
        asynchronously on the global auth work queue in the future.
    @remarks This is the internal counterpart of this method, which uses a callback that does not
        update the current user.
 */
- (void)internalSignInAndRetrieveDataWithEmail:(NSString *)email
                                      password:(NSString *)password
                                    completion:(FIRAuthDataResultCallback)completion {
  FIREmailPasswordAuthCredential *credentail =
      [[FIREmailPasswordAuthCredential alloc] initWithEmail:email password:password];
  [self internalSignInAndRetrieveDataWithCredential:credentail
                                 isReauthentication:NO
                                           callback:completion];
}

/** @fn signInAndRetrieveDataWithGameCenterCredential:callback:
    @brief Signs in using a game center credential.
    @param credential The Game Center Auth Credential used to sign in.
    @param callback A block which is invoked when the sign in finished (or is cancelled). Invoked
        asynchronously on the global auth work queue in the future.
 */
- (void)signInAndRetrieveDataWithGameCenterCredential:(FIRGameCenterAuthCredential *)credential
                                             callback:(FIRAuthDataResultCallback)callback {
  FIRSignInWithGameCenterRequest *request =
      [[FIRSignInWithGameCenterRequest alloc] initWithPlayerID:credential.playerID
                                                  publicKeyURL:credential.publicKeyURL
                                                     signature:credential.signature
                                                          salt:credential.salt
                                                     timestamp:credential.timestamp
                                                   displayName:credential.displayName
                                          requestConfiguration:_requestConfiguration];
  [FIRAuthBackend
      signInWithGameCenter:request
                  callback:^(FIRSignInWithGameCenterResponse *_Nullable response,
                             NSError *_Nullable error) {
                    if (error) {
                      if (callback) {
                        callback(nil, error);
                      }
                      return;
                    }

                    [self
                      completeSignInWithAccessToken:response.IDToken
                          accessTokenExpirationDate:response.approximateExpirationDate
                                       refreshToken:response.refreshToken
                                          anonymous:NO
                                           callback:^(FIRUser *_Nullable user,
                                                      NSError *_Nullable error) {
                                             if (error && callback) {
                                               callback(nil, error);
                                               return;
                                             }
                                             FIRAdditionalUserInfo *additionalUserInfo =
                                                 [[FIRAdditionalUserInfo alloc]
                                                     initWithProviderID:FIRGameCenterAuthProviderID
                                                                profile:nil
                                                               username:nil
                                                              isNewUser:response.isNewUser];
                                             FIRAuthDataResult *result =
                                                 user ? [[FIRAuthDataResult alloc]
                                                                  initWithUser:user
                                                            additionalUserInfo:additionalUserInfo]
                                                      : nil;
                                             if (callback) {
                                               callback(result, error);
                                             }
                                           }];
                  }];
}

/** @fn internalSignInAndRetrieveDataWithEmail:link:completion:
    @brief Signs in using an email and email sign-in link.
    @param email The user's email address.
    @param link The email sign-in link.
    @param callback A block which is invoked when the sign in finishes (or is cancelled.) Invoked
        asynchronously on the global auth work queue in the future.
 */
- (void)internalSignInAndRetrieveDataWithEmail:(nonnull NSString *)email
                                          link:(nonnull NSString *)link
                                      callback:(nullable FIRAuthDataResultCallback)callback {
  if (![self isSignInWithEmailLink:link]) {
    [FIRAuthExceptionUtils
        raiseInvalidParameterExceptionWithReason:kInvalidEmailSignInLinkExceptionMessage];
    return;
  }
  NSDictionary<NSString *, NSString *> *queryItems = [FIRAuthWebUtils parseURL:link];
  if (![queryItems count]) {
    NSURLComponents *urlComponents = [NSURLComponents componentsWithString:link];
    queryItems = [FIRAuthWebUtils parseURL:urlComponents.query];
  }
  NSString *actionCode = queryItems[@"oobCode"];

  FIREmailLinkSignInRequest *request =
      [[FIREmailLinkSignInRequest alloc] initWithEmail:email
                                               oobCode:actionCode
                                  requestConfiguration:_requestConfiguration];

  [FIRAuthBackend
      emailLinkSignin:request
             callback:^(FIREmailLinkSignInResponse *_Nullable response, NSError *_Nullable error) {
               if (error) {
                 if (callback) {
                   callback(nil, error);
                 }
                 return;
               }
               [self completeSignInWithAccessToken:response.IDToken
                         accessTokenExpirationDate:response.approximateExpirationDate
                                      refreshToken:response.refreshToken
                                         anonymous:NO
                                          callback:^(FIRUser *_Nullable user,
                                                     NSError *_Nullable error) {
                                            if (error && callback) {
                                              callback(nil, error);
                                              return;
                                            }
                                            FIRAdditionalUserInfo *additionalUserInfo =
                                                [[FIRAdditionalUserInfo alloc]
                                                    initWithProviderID:FIREmailAuthProviderID
                                                               profile:nil
                                                              username:nil
                                                             isNewUser:response.isNewUser];
                                            FIRAuthDataResult *result =
                                                user ? [[FIRAuthDataResult alloc]
                                                                 initWithUser:user
                                                           additionalUserInfo:additionalUserInfo]
                                                     : nil;
                                            if (callback) {
                                              callback(result, error);
                                            }
                                          }];
             }];
}

- (void)signInWithCredential:(FIRAuthCredential *)credential
                  completion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback callback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    [self internalSignInAndRetrieveDataWithCredential:credential
                                   isReauthentication:NO
                                             callback:callback];
  });
}

- (void)internalSignInWithCredential:(FIRAuthCredential *)credential
                            callback:(FIRAuthResultCallback)callback {
  [self internalSignInAndRetrieveDataWithCredential:credential
                                 isReauthentication:NO
                                           callback:^(FIRAuthDataResult *_Nullable authResult,
                                                      NSError *_Nullable error) {
                                             callback(authResult.user, error);
                                           }];
}

- (void)internalSignInAndRetrieveDataWithCredential:(FIRAuthCredential *)credential
                                 isReauthentication:(BOOL)isReauthentication
                                           callback:(nullable FIRAuthDataResultCallback)callback {
  if ([credential isKindOfClass:[FIREmailPasswordAuthCredential class]]) {
    // Special case for email/password credentials
    FIREmailPasswordAuthCredential *emailPasswordCredential =
        (FIREmailPasswordAuthCredential *)credential;

    if (emailPasswordCredential.link) {
      // Email link sign in
      [self internalSignInAndRetrieveDataWithEmail:emailPasswordCredential.email
                                              link:emailPasswordCredential.link
                                          callback:callback];
    } else {
      // Email password sign in
      FIRAuthResultCallback completeEmailSignIn =
          ^(FIRUser *_Nullable user, NSError *_Nullable error) {
            if (callback) {
              if (error) {
                callback(nil, error);
                return;
              }
              FIRAdditionalUserInfo *additionalUserInfo =
                  [[FIRAdditionalUserInfo alloc] initWithProviderID:FIREmailAuthProviderID
                                                            profile:nil
                                                           username:nil
                                                          isNewUser:NO];
              FIRAuthDataResult *result =
                  user ? [[FIRAuthDataResult alloc] initWithUser:user
                                              additionalUserInfo:additionalUserInfo]
                       : nil;
              callback(result, error);
            }
          };

      [self signInWithEmail:emailPasswordCredential.email
                   password:emailPasswordCredential.password
                   callback:completeEmailSignIn];
    }
    return;
  }

  if ([credential isKindOfClass:[FIRGameCenterAuthCredential class]]) {
    // Special case for Game Center credentials.
    [self signInAndRetrieveDataWithGameCenterCredential:(FIRGameCenterAuthCredential *)credential
                                               callback:callback];
    return;
  }

#if TARGET_OS_IOS
  if ([credential isKindOfClass:[FIRPhoneAuthCredential class]]) {
    // Special case for phone auth credentials
    FIRPhoneAuthCredential *phoneCredential = (FIRPhoneAuthCredential *)credential;
    FIRAuthOperationType operation =
        isReauthentication ? FIRAuthOperationTypeReauth : FIRAuthOperationTypeSignUpOrSignIn;
    [self signInWithPhoneCredential:phoneCredential
                          operation:operation
                           callback:^(FIRVerifyPhoneNumberResponse *_Nullable response,
                                      NSError *_Nullable error) {
                             if (callback) {
                               if (error) {
                                 callback(nil, error);
                                 return;
                               }

                               [self
                                 completeSignInWithAccessToken:response.IDToken
                                     accessTokenExpirationDate:response.approximateExpirationDate
                                                  refreshToken:response.refreshToken
                                                     anonymous:NO
                                                      callback:^(FIRUser *_Nullable user,
                                                                 NSError *_Nullable error) {
                                                        if (error && callback) {
                                                          callback(nil, error);
                                                          return;
                                                        }
                                                        FIRAdditionalUserInfo *additionalUserInfo =
                                                            [[FIRAdditionalUserInfo alloc]
                                                                initWithProviderID:
                                                                    FIRPhoneAuthProviderID
                                                                           profile:nil
                                                                          username:nil
                                                                         isNewUser:response
                                                                                       .isNewUser];
                                                        FIRAuthDataResult *result =
                                                            user ? [[FIRAuthDataResult alloc]
                                                                             initWithUser:user
                                                                       additionalUserInfo:
                                                                           additionalUserInfo]
                                                                 : nil;
                                                        if (callback) {
                                                          callback(result, error);
                                                        }
                                                      }];
                             }
                           }];
    return;
  }
#endif
  FIRVerifyAssertionRequest *request =
      [[FIRVerifyAssertionRequest alloc] initWithProviderID:credential.provider
                                       requestConfiguration:_requestConfiguration];
  request.autoCreate = !isReauthentication;
  [credential prepareVerifyAssertionRequest:request];
  [FIRAuthBackend
      verifyAssertion:request
             callback:^(FIRVerifyAssertionResponse *response, NSError *error) {
               if (error) {
                 if (callback) {
                   callback(nil, error);
                 }
                 return;
               }

               if (response.needConfirmation) {
                 if (callback) {
                   NSString *email = response.email;
                   FIROAuthCredential *credential =
                       [[FIROAuthCredential alloc] initWithVerifyAssertionResponse:response];
                   callback(nil,
                            [FIRAuthErrorUtils
                                accountExistsWithDifferentCredentialErrorWithEmail:email
                                                                 updatedCredential:credential]);
                 }
                 return;
               }

               if (!response.providerID.length) {
                 if (callback) {
                   callback(nil, [FIRAuthErrorUtils
                                     unexpectedResponseWithDeserializedResponse:response]);
                 }
                 return;
               }
               [self
                 completeSignInWithAccessToken:response.IDToken
                     accessTokenExpirationDate:response.approximateExpirationDate
                                  refreshToken:response.refreshToken
                                     anonymous:NO
                                      callback:^(FIRUser *_Nullable user,
                                                 NSError *_Nullable error) {
                                        if (callback) {
                                          if (error) {
                                            callback(nil, error);
                                            return;
                                          }
                                          FIRAdditionalUserInfo *additionalUserInfo =
                                              [FIRAdditionalUserInfo
                                                  userInfoWithVerifyAssertionResponse:response];
                                          FIROAuthCredential *updatedOAuthCredential =
                                              [[FIROAuthCredential alloc]
                                                  initWithVerifyAssertionResponse:response];
                                          FIRAuthDataResult *result =
                                              user ? [[FIRAuthDataResult alloc]
                                                               initWithUser:user
                                                         additionalUserInfo:additionalUserInfo
                                                                 credential:updatedOAuthCredential]
                                                   : nil;
                                          callback(result, error);
                                        }
                                      }];
             }];
}

- (void)signInAnonymouslyWithCompletion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    if (self->_currentUser.anonymous) {
      FIRAuthDataResult *result = [[FIRAuthDataResult alloc] initWithUser:self->_currentUser
                                                       additionalUserInfo:nil];
      decoratedCallback(result, nil);
      return;
    }
    [self internalSignInAnonymouslyWithCompletion:^(FIRSignUpNewUserResponse *_Nullable response,
                                                    NSError *_Nullable error) {
      if (error) {
        decoratedCallback(nil, error);
        return;
      }
      [self completeSignInWithAccessToken:response.IDToken
                accessTokenExpirationDate:response.approximateExpirationDate
                             refreshToken:response.refreshToken
                                anonymous:YES
                                 callback:^(FIRUser *_Nullable user, NSError *_Nullable error) {
                                   if (error) {
                                     decoratedCallback(nil, error);
                                     return;
                                   }
                                   FIRAdditionalUserInfo *additionalUserInfo =
                                       [[FIRAdditionalUserInfo alloc] initWithProviderID:nil
                                                                                 profile:nil
                                                                                username:nil
                                                                               isNewUser:YES];
                                   FIRAuthDataResult *authDataResult =
                                       user ? [[FIRAuthDataResult alloc]
                                                        initWithUser:user
                                                  additionalUserInfo:additionalUserInfo]
                                            : nil;
                                   decoratedCallback(authDataResult, error);
                                 }];
    }];
  });
}

- (void)signInWithCustomToken:(NSString *)token
                   completion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    [self internalSignInAndRetrieveDataWithCustomToken:token
                                            completion:^(FIRAuthDataResult *_Nullable authResult,
                                                         NSError *_Nullable error) {
                                              decoratedCallback(authResult, error);
                                            }];
  });
}

- (void)createUserWithEmail:(NSString *)email
                   password:(NSString *)password
                 completion:(nullable FIRAuthDataResultCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuthDataResultCallback decoratedCallback =
        [self signInFlowAuthDataResultCallbackByDecoratingCallback:completion];
    [self internalCreateUserWithEmail:email
                             password:password
                           completion:^(FIRSignUpNewUserResponse *_Nullable response,
                                        NSError *_Nullable error) {
                             if (error) {
                               decoratedCallback(nil, error);
                               return;
                             }
                             [self
                               completeSignInWithAccessToken:response.IDToken
                                   accessTokenExpirationDate:response.approximateExpirationDate
                                                refreshToken:response.refreshToken
                                                   anonymous:NO
                                                    callback:^(FIRUser *_Nullable user,
                                                               NSError *_Nullable error) {
                                                      if (error) {
                                                        decoratedCallback(nil, error);
                                                        return;
                                                      }
                                                      FIRAdditionalUserInfo *additionalUserInfo =
                                                          [[FIRAdditionalUserInfo alloc]
                                                              initWithProviderID:
                                                                  FIREmailAuthProviderID
                                                                         profile:nil
                                                                        username:nil
                                                                       isNewUser:YES];
                                                      FIRAuthDataResult *authDataResult =
                                                          user ? [[FIRAuthDataResult alloc]
                                                                           initWithUser:user
                                                                     additionalUserInfo:
                                                                         additionalUserInfo]
                                                               : nil;
                                                      decoratedCallback(authDataResult, error);
                                                    }];
                           }];
  });
}

- (void)confirmPasswordResetWithCode:(NSString *)code
                         newPassword:(NSString *)newPassword
                          completion:(FIRConfirmPasswordResetCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRResetPasswordRequest *request =
        [[FIRResetPasswordRequest alloc] initWithOobCode:code
                                             newPassword:newPassword
                                    requestConfiguration:self->_requestConfiguration];
    [FIRAuthBackend
        resetPassword:request
             callback:^(FIRResetPasswordResponse *_Nullable response, NSError *_Nullable error) {
               if (completion) {
                 dispatch_async(dispatch_get_main_queue(), ^{
                   if (error) {
                     completion(error);
                     return;
                   }
                   completion(nil);
                 });
               }
             }];
  });
}

- (void)checkActionCode:(NSString *)code completion:(FIRCheckActionCodeCallBack)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRResetPasswordRequest *request =
        [[FIRResetPasswordRequest alloc] initWithOobCode:code
                                             newPassword:nil
                                    requestConfiguration:self->_requestConfiguration];
    [FIRAuthBackend
        resetPassword:request
             callback:^(FIRResetPasswordResponse *_Nullable response, NSError *_Nullable error) {
               if (completion) {
                 if (error) {
                   dispatch_async(dispatch_get_main_queue(), ^{
                     completion(nil, error);
                   });
                   return;
                 }
                 FIRActionCodeOperation operation =
                     [FIRActionCodeInfo actionCodeOperationForRequestType:response.requestType];
                 FIRActionCodeInfo *actionCodeInfo =
                     [[FIRActionCodeInfo alloc] initWithOperation:operation
                                                            email:response.email
                                                         newEmail:response.verifiedEmail];
                 dispatch_async(dispatch_get_main_queue(), ^{
                   completion(actionCodeInfo, nil);
                 });
               }
             }];
  });
}

- (void)verifyPasswordResetCode:(NSString *)code
                     completion:(FIRVerifyPasswordResetCodeCallback)completion {
  [self checkActionCode:code
             completion:^(FIRActionCodeInfo *_Nullable info, NSError *_Nullable error) {
               if (completion) {
                 if (error) {
                   completion(nil, error);
                   return;
                 }
                 completion(info.email, nil);
               }
             }];
}

- (void)applyActionCode:(NSString *)code completion:(FIRApplyActionCodeCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRSetAccountInfoRequest *request =
        [[FIRSetAccountInfoRequest alloc] initWithRequestConfiguration:self->_requestConfiguration];
    request.OOBCode = code;
    [FIRAuthBackend
        setAccountInfo:request
              callback:^(FIRSetAccountInfoResponse *_Nullable response, NSError *_Nullable error) {
                if (completion) {
                  dispatch_async(dispatch_get_main_queue(), ^{
                    completion(error);
                  });
                }
              }];
  });
}

- (void)sendPasswordResetWithEmail:(NSString *)email
                        completion:(nullable FIRSendPasswordResetCallback)completion {
  [self sendPasswordResetWithNullableActionCodeSettings:nil email:email completion:completion];
}

- (void)sendPasswordResetWithEmail:(NSString *)email
                actionCodeSettings:(FIRActionCodeSettings *)actionCodeSettings
                        completion:(nullable FIRSendPasswordResetCallback)completion {
  [self sendPasswordResetWithNullableActionCodeSettings:actionCodeSettings
                                                  email:email
                                             completion:completion];
}

/** @fn sendPasswordResetWithNullableActionCodeSettings:actionCodeSetting:email:completion:
    @brief Initiates a password reset for the given email address and @FIRActionCodeSettings object.

    @param actionCodeSettings Optionally, An @c FIRActionCodeSettings object containing settings
        related to the handling action codes.
    @param email The email address of the user.
    @param completion Optionally; a block which is invoked when the request finishes. Invoked
        asynchronously on the main thread in the future.
 */
- (void)sendPasswordResetWithNullableActionCodeSettings:
            (nullable FIRActionCodeSettings *)actionCodeSettings
                                                  email:(NSString *)email
                                             completion:
                                                 (nullable FIRSendPasswordResetCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    if (!email) {
      [FIRAuthExceptionUtils
          raiseInvalidParameterExceptionWithReason:kMissingEmailInvalidParameterExceptionReason];
      return;
    }
    FIRGetOOBConfirmationCodeRequest *request = [FIRGetOOBConfirmationCodeRequest
        passwordResetRequestWithEmail:email
                   actionCodeSettings:actionCodeSettings
                 requestConfiguration:self->_requestConfiguration];
    [FIRAuthBackend getOOBConfirmationCode:request
                                  callback:^(FIRGetOOBConfirmationCodeResponse *_Nullable response,
                                             NSError *_Nullable error) {
                                    if (completion) {
                                      dispatch_async(dispatch_get_main_queue(), ^{
                                        completion(error);
                                      });
                                    }
                                  }];
  });
}

- (void)sendSignInLinkToEmail:(nonnull NSString *)email
           actionCodeSettings:(nonnull FIRActionCodeSettings *)actionCodeSettings
                   completion:(nullable FIRSendSignInLinkToEmailCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    if (!email) {
      [FIRAuthExceptionUtils
          raiseInvalidParameterExceptionWithReason:kMissingEmailInvalidParameterExceptionReason];
    }

    if (!actionCodeSettings.handleCodeInApp) {
      [FIRAuthExceptionUtils
          raiseInvalidParameterExceptionWithReason:kHandleCodeInAppFalseExceptionReason];
    }
    FIRGetOOBConfirmationCodeRequest *request =
        [FIRGetOOBConfirmationCodeRequest signInWithEmailLinkRequest:email
                                                  actionCodeSettings:actionCodeSettings
                                                requestConfiguration:self->_requestConfiguration];
    [FIRAuthBackend getOOBConfirmationCode:request
                                  callback:^(FIRGetOOBConfirmationCodeResponse *_Nullable response,
                                             NSError *_Nullable error) {
                                    if (completion) {
                                      dispatch_async(dispatch_get_main_queue(), ^{
                                        completion(error);
                                      });
                                    }
                                  }];
  });
}

- (void)updateCurrentUser:(FIRUser *)user completion:(nullable FIRUserUpdateCallback)completion {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    if (!user) {
      if (completion) {
        dispatch_async(dispatch_get_main_queue(), ^{
          completion([FIRAuthErrorUtils nullUserErrorWithMessage:nil]);
        });
      }
      return;
    }
    void (^updateUserBlock)(FIRUser *user) = ^(FIRUser *user) {
      NSError *error;
      [self updateCurrentUser:user byForce:YES savingToDisk:YES error:(&error)];
      if (error) {
        if (completion) {
          dispatch_async(dispatch_get_main_queue(), ^{
            completion(error);
          });
        }
        return;
      }
      if (completion) {
        dispatch_async(dispatch_get_main_queue(), ^{
          completion(nil);
        });
      }
    };
    if (![user.requestConfiguration.APIKey isEqualToString:self->_requestConfiguration.APIKey]) {
      // If the API keys are different, then we need to confirm that the user belongs to the same
      // project before proceeding.
      user.requestConfiguration = self->_requestConfiguration;
      [user reloadWithCompletion:^(NSError *_Nullable error) {
        if (error) {
          if (completion) {
            dispatch_async(dispatch_get_main_queue(), ^{
              completion(error);
            });
          }
          return;
        }
        updateUserBlock(user);
      }];
    } else {
      updateUserBlock(user);
    }
  });
}

- (BOOL)signOut:(NSError *_Nullable __autoreleasing *_Nullable)error {
  __block BOOL result = YES;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    if (!self->_currentUser) {
      return;
    }
    result = [self updateCurrentUser:nil byForce:NO savingToDisk:YES error:error];
  });
  return result;
}

- (BOOL)signOutByForceWithUserID:(NSString *)userID error:(NSError *_Nullable *_Nullable)error {
  if (_currentUser.uid != userID) {
    return YES;
  }
  return [self updateCurrentUser:nil byForce:YES savingToDisk:YES error:error];
}

- (BOOL)isSignInWithEmailLink:(NSString *)link {
  if (link.length == 0) {
    return NO;
  }
  NSDictionary<NSString *, NSString *> *queryItems = [FIRAuthWebUtils parseURL:link];
  if (![queryItems count]) {
    NSURLComponents *urlComponents = [NSURLComponents componentsWithString:link];
    if (!urlComponents.query) {
      return NO;
    }
    queryItems = [FIRAuthWebUtils parseURL:urlComponents.query];
  }

  if (![queryItems count]) {
    return NO;
  }

  NSString *actionCode = queryItems[@"oobCode"];
  NSString *mode = queryItems[@"mode"];

  if (actionCode && [mode isEqualToString:@"signIn"]) {
    return YES;
  }
  return NO;
}

- (FIRAuthStateDidChangeListenerHandle)addAuthStateDidChangeListener:
    (FIRAuthStateDidChangeListenerBlock)listener {
  __block BOOL firstInvocation = YES;
  __block NSString *previousUserID;
  return [self addIDTokenDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
    BOOL shouldCallListener = firstInvocation || !(previousUserID == user.uid ||
                                                   [previousUserID isEqualToString:user.uid]);
    firstInvocation = NO;
    previousUserID = [user.uid copy];
    if (shouldCallListener) {
      listener(auth, user);
    }
  }];
}

- (void)removeAuthStateDidChangeListener:(FIRAuthStateDidChangeListenerHandle)listenerHandle {
  [self removeIDTokenDidChangeListener:listenerHandle];
}

- (FIRIDTokenDidChangeListenerHandle)addIDTokenDidChangeListener:
    (FIRIDTokenDidChangeListenerBlock)listener {
  if (!listener) {
    [NSException raise:NSInvalidArgumentException format:@"Listener must not be nil."];
    return nil;
  }
  FIRAuthStateDidChangeListenerHandle handle;
  NSNotificationCenter *notifications = [NSNotificationCenter defaultCenter];
  handle = [notifications addObserverForName:FIRAuthStateDidChangeNotification
                                      object:self
                                       queue:[NSOperationQueue mainQueue]
                                  usingBlock:^(NSNotification *_Nonnull notification) {
                                    FIRAuth *auth = notification.object;
                                    listener(auth, auth.currentUser);
                                  }];
  @synchronized(self) {
    [_listenerHandles addObject:handle];
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    listener(self, self->_currentUser);
  });
  return handle;
}

- (void)removeIDTokenDidChangeListener:(FIRIDTokenDidChangeListenerHandle)listenerHandle {
  [[NSNotificationCenter defaultCenter] removeObserver:listenerHandle];
  @synchronized(self) {
    [_listenerHandles removeObject:listenerHandle];
  }
}

- (void)useAppLanguage {
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    self->_requestConfiguration.languageCode = [[NSLocale preferredLanguages] firstObject];
  });
}

- (void)useEmulatorWithHost:(NSString *)host port:(NSInteger)port {
  NSAssert(host.length > 0, @"Cannot connect to nil or empty host");

  NSString *formattedHost;
  if ([host containsString:@":"]) {
    // Host is an IPv6 address and should be formatted with surrounding brackets.
    formattedHost = [NSString stringWithFormat:@"[%@]", host];
  } else {
    formattedHost = host;
  }

  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    self->_requestConfiguration.emulatorHostAndPort =
        [NSString stringWithFormat:@"%@:%ld", formattedHost, (long)port];
#if TARGET_OS_IOS
    self->_settings.appVerificationDisabledForTesting = YES;
#endif
  });
}

- (nullable NSString *)languageCode {
  return _requestConfiguration.languageCode;
}

- (void)setLanguageCode:(nullable NSString *)languageCode {
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    self->_requestConfiguration.languageCode = [languageCode copy];
  });
}

- (nullable NSString *)additionalFrameworkMarker {
  return self->_requestConfiguration.additionalFrameworkMarker;
}

- (void)setAdditionalFrameworkMarker:(nullable NSString *)additionalFrameworkMarker {
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    self->_requestConfiguration.additionalFrameworkMarker = [additionalFrameworkMarker copy];
  });
}

#if TARGET_OS_IOS
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-property-ivar"
// The warning is ignored because we use the token manager to get the token, instead of using the
// ivar.
- (nullable NSData *)APNSToken {
  __block NSData *result = nil;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    result = self->_tokenManager.token.data;
  });
  return result;
}
#pragma clang diagnostic pop

#pragma mark - UIApplicationDelegate

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [self setAPNSToken:deviceToken type:FIRAuthAPNSTokenTypeUnknown];
}

- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    [self->_tokenManager cancelWithError:error];
  });
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [self canHandleNotification:userInfo];
  completionHandler(UIBackgroundFetchResultNoData);
}

// iOS 10 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-implementations"
- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo {
  [self canHandleNotification:userInfo];
}
#pragma clang diagnostic pop

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [self canHandleURL:url];
}

// iOS 10 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-implementations"
- (BOOL)application:(UIApplication *)application
              openURL:(NSURL *)url
    sourceApplication:(nullable NSString *)sourceApplication
           annotation:(id)annotation {
  return [self canHandleURL:url];
}
#pragma clang diagnostic pop

- (void)setAPNSToken:(NSData *)token type:(FIRAuthAPNSTokenType)type {
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    self->_tokenManager.token = [[FIRAuthAPNSToken alloc] initWithData:token type:type];
  });
}

- (BOOL)canHandleNotification:(NSDictionary *)userInfo {
  __block BOOL result = NO;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    result = [self->_notificationManager canHandleNotification:userInfo];
  });
  return result;
}

- (BOOL)canHandleURL:(NSURL *)URL {
  __block BOOL result = NO;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
    result = [self->_authURLPresenter canHandleURL:URL];
  });
  return result;
}

#pragma mark - UISceneDelegate
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
- (void)scene:(UIScene *)scene
    openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts API_AVAILABLE(ios(13.0)) {
  for (UIOpenURLContext *urlContext in URLContexts) {
    NSURL *url = [urlContext URL];
    [self canHandleURL:url];
  }
}
#endif  // __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
#endif  // TARGET_OS_IOS

#pragma mark - Internal Methods

#if TARGET_OS_IOS
/** @fn signInWithPhoneCredential:callback:
    @brief Signs in using a phone credential.
    @param credential The Phone Auth credential used to sign in.
    @param operation The type of operation for which this sign-in attempt is initiated.
    @param callback A block which is invoked when the sign in finishes (or is cancelled.) Invoked
        asynchronously on the global auth work queue in the future.
 */
- (void)signInWithPhoneCredential:(FIRPhoneAuthCredential *)credential
                        operation:(FIRAuthOperationType)operation
                         callback:(FIRVerifyPhoneNumberResponseCallback)callback {
  if (credential.temporaryProof.length && credential.phoneNumber.length) {
    FIRVerifyPhoneNumberRequest *request =
        [[FIRVerifyPhoneNumberRequest alloc] initWithTemporaryProof:credential.temporaryProof
                                                        phoneNumber:credential.phoneNumber
                                                          operation:operation
                                               requestConfiguration:_requestConfiguration];
    [FIRAuthBackend verifyPhoneNumber:request callback:callback];
    return;
  }

  if (!credential.verificationID.length) {
    callback(nil, [FIRAuthErrorUtils missingVerificationIDErrorWithMessage:nil]);
    return;
  }
  if (!credential.verificationCode.length) {
    callback(nil, [FIRAuthErrorUtils missingVerificationCodeErrorWithMessage:nil]);
    return;
  }
  FIRVerifyPhoneNumberRequest *request =
      [[FIRVerifyPhoneNumberRequest alloc] initWithVerificationID:credential.verificationID
                                                 verificationCode:credential.verificationCode
                                                        operation:operation
                                             requestConfiguration:_requestConfiguration];
  [FIRAuthBackend verifyPhoneNumber:request callback:callback];
}

#endif

/** @fn internalSignInAndRetrieveDataWithCustomToken:completion:
    @brief Signs in a Firebase user given a custom token.
    @param token A self-signed custom auth token.
    @param completion A block which is invoked when the custom token sign in request completes.
 */
- (void)internalSignInAndRetrieveDataWithCustomToken:(NSString *)token
                                          completion:
                                              (nullable FIRAuthDataResultCallback)completion {
  FIRVerifyCustomTokenRequest *request =
      [[FIRVerifyCustomTokenRequest alloc] initWithToken:token
                                    requestConfiguration:_requestConfiguration];
  [FIRAuthBackend
      verifyCustomToken:request
               callback:^(FIRVerifyCustomTokenResponse *_Nullable response,
                          NSError *_Nullable error) {
                 if (error) {
                   if (completion) {
                     completion(nil, error);
                     return;
                   }
                 }
                 [self completeSignInWithAccessToken:response.IDToken
                           accessTokenExpirationDate:response.approximateExpirationDate
                                        refreshToken:response.refreshToken
                                           anonymous:NO
                                            callback:^(FIRUser *_Nullable user,
                                                       NSError *_Nullable error) {
                                              if (error && completion) {
                                                completion(nil, error);
                                                return;
                                              }
                                              FIRAdditionalUserInfo *additonalUserInfo =
                                                  [[FIRAdditionalUserInfo alloc]
                                                      initWithProviderID:nil
                                                                 profile:nil
                                                                username:nil
                                                               isNewUser:response.isNewUser];
                                              FIRAuthDataResult *result =
                                                  user ? [[FIRAuthDataResult alloc]
                                                                   initWithUser:user
                                                             additionalUserInfo:additonalUserInfo]
                                                       : nil;
                                              if (completion) {
                                                completion(result, error);
                                              }
                                            }];
               }];
}

/** @fn internalCreateUserWithEmail:password:completion:
    @brief Makes a backend request attempting to create a new Firebase user given an email address
        and password.
    @param email The email address used to create the new Firebase user.
    @param password The password used to create the new Firebase user.
    @param completion Optionally; a block which is invoked when the request finishes.
 */
- (void)internalCreateUserWithEmail:(NSString *)email
                           password:(NSString *)password
                         completion:(nullable FIRSignupNewUserCallback)completion {
  FIRSignUpNewUserRequest *request =
      [[FIRSignUpNewUserRequest alloc] initWithEmail:email
                                            password:password
                                         displayName:nil
                                requestConfiguration:_requestConfiguration];
  if (![request.password length]) {
    completion(
        nil, [FIRAuthErrorUtils weakPasswordErrorWithServerResponseReason:kMissingPasswordReason]);
    return;
  }
  if (![request.email length]) {
    completion(nil, [FIRAuthErrorUtils missingEmailErrorWithMessage:nil]);
    return;
  }
  [FIRAuthBackend signUpNewUser:request callback:completion];
}

/** @fn internalSignInAnonymouslyWithCompletion:
    @param completion A block which is invoked when the anonymous sign in request completes.
 */
- (void)internalSignInAnonymouslyWithCompletion:(FIRSignupNewUserCallback)completion {
  FIRSignUpNewUserRequest *request =
      [[FIRSignUpNewUserRequest alloc] initWithRequestConfiguration:_requestConfiguration];
  [FIRAuthBackend signUpNewUser:request callback:completion];
}

/** @fn possiblyPostAuthStateChangeNotification
    @brief Posts the auth state change notificaton if current user's token has been changed.
 */
- (void)possiblyPostAuthStateChangeNotification {
  NSString *token = _currentUser.rawAccessToken;
  if (_lastNotifiedUserToken == token ||
      (token != nil && [_lastNotifiedUserToken isEqualToString:token])) {
    return;
  }
  _lastNotifiedUserToken = token;
  if (_autoRefreshTokens) {
    // Shedule new refresh task after successful attempt.
    [self scheduleAutoTokenRefresh];
  }
  NSMutableDictionary *internalNotificationParameters = [NSMutableDictionary dictionary];
  if (self.app) {
    internalNotificationParameters[FIRAuthStateDidChangeInternalNotificationAppKey] = self.app;
  }
  if (token.length) {
    internalNotificationParameters[FIRAuthStateDidChangeInternalNotificationTokenKey] = token;
  }
  internalNotificationParameters[FIRAuthStateDidChangeInternalNotificationUIDKey] =
      _currentUser.uid;
  NSNotificationCenter *notifications = [NSNotificationCenter defaultCenter];
  dispatch_async(dispatch_get_main_queue(), ^{
    [notifications postNotificationName:FIRAuthStateDidChangeInternalNotification
                                 object:self
                               userInfo:internalNotificationParameters];
    [notifications postNotificationName:FIRAuthStateDidChangeNotification object:self];
  });
}

- (BOOL)updateKeychainWithUser:(FIRUser *)user error:(NSError *_Nullable *_Nullable)error {
  if (user != _currentUser) {
    // No-op if the user is no longer signed in. This is not considered an error as we don't check
    // whether the user is still current on other callbacks of user operations either.
    return YES;
  }
  if ([self saveUser:user error:error]) {
    [self possiblyPostAuthStateChangeNotification];
    return YES;
  }
  return NO;
}

/** @fn setKeychainServiceNameForApp
    @brief Sets the keychain service name global data for the particular app.
    @param app The Firebase app to set keychain service name for.
 */
+ (void)setKeychainServiceNameForApp:(FIRApp *)app {
  @synchronized(self) {
    gKeychainServiceNameForAppName[app.name] =
        [@"firebase_auth_" stringByAppendingString:app.options.googleAppID];
  }
}

/** @fn keychainServiceNameForAppName:
    @brief Gets the keychain service name global data for the particular app by name.
    @param appName The name of the Firebase app to get keychain service name for.
 */
+ (NSString *)keychainServiceNameForAppName:(NSString *)appName {
  @synchronized(self) {
    return gKeychainServiceNameForAppName[appName];
  }
}

/** @fn deleteKeychainServiceNameForAppName:
    @brief Deletes the keychain service name global data for the particular app by name.
    @param appName The name of the Firebase app to delete keychain service name for.
 */
+ (void)deleteKeychainServiceNameForAppName:(NSString *)appName {
  @synchronized(self) {
    [gKeychainServiceNameForAppName removeObjectForKey:appName];
  }
}

/** @fn scheduleAutoTokenRefreshWithDelay:
    @brief Schedules a task to automatically refresh tokens on the current user. The token refresh
        is scheduled 5 minutes before the  scheduled expiration time.
    @remarks If the token expires in less than 5 minutes, schedule the token refresh immediately.
 */
- (void)scheduleAutoTokenRefresh {
  NSTimeInterval tokenExpirationInterval =
      [_currentUser.accessTokenExpirationDate timeIntervalSinceNow] - kTokenRefreshHeadStart;
  [self scheduleAutoTokenRefreshWithDelay:MAX(tokenExpirationInterval, 0) retry:NO];
}

/** @fn scheduleAutoTokenRefreshWithDelay:
    @brief Schedules a task to automatically refresh tokens on the current user.
    @param delay The delay in seconds after which the token refresh task should be scheduled to be
        executed.
    @param retry Flag to determine whether the invocation is a retry attempt or not.
 */
- (void)scheduleAutoTokenRefreshWithDelay:(NSTimeInterval)delay retry:(BOOL)retry {
  NSString *accessToken = _currentUser.rawAccessToken;
  if (!accessToken) {
    return;
  }
  if (retry) {
    FIRLogInfo(kFIRLoggerAuth, @"I-AUT000003",
               @"Token auto-refresh re-scheduled in %02d:%02d "
               @"because of error on previous refresh attempt.",
               (int)ceil(delay) / 60, (int)ceil(delay) % 60);
  } else {
    FIRLogInfo(kFIRLoggerAuth, @"I-AUT000004",
               @"Token auto-refresh scheduled in %02d:%02d for the new token.",
               (int)ceil(delay) / 60, (int)ceil(delay) % 60);
  }
  _autoRefreshScheduled = YES;
  __weak FIRAuth *weakSelf = self;
  [[FIRAuthDispatcher sharedInstance]
      dispatchAfterDelay:delay
                   queue:FIRAuthGlobalWorkQueue()
                    task:^(void) {
                      FIRAuth *strongSelf = weakSelf;
                      if (!strongSelf) {
                        return;
                      }
                      if (![strongSelf->_currentUser.rawAccessToken isEqualToString:accessToken]) {
                        // Another auto refresh must have been scheduled, so keep
                        // _autoRefreshScheduled unchanged.
                        return;
                      }
                      strongSelf->_autoRefreshScheduled = NO;
                      if (strongSelf->_isAppInBackground) {
                        return;
                      }
                      NSString *uid = strongSelf->_currentUser.uid;
                      [strongSelf->_currentUser
                          internalGetTokenForcingRefresh:YES
                                                callback:^(NSString *_Nullable token,
                                                           NSError *_Nullable error) {
                                                  if (![strongSelf->_currentUser.uid
                                                          isEqualToString:uid]) {
                                                    return;
                                                  }
                                                  if (error) {
                                                    // Kicks off exponential back off logic to retry
                                                    // failed attempt. Starts with one minute delay
                                                    // (60 seconds) if this is the first failed
                                                    // attempt.
                                                    NSTimeInterval rescheduleDelay;
                                                    if (retry) {
                                                      rescheduleDelay =
                                                          MIN(delay * 2, kMaxWaitTimeForBackoff);
                                                    } else {
                                                      rescheduleDelay = 60;
                                                    }
                                                    [strongSelf
                                                      scheduleAutoTokenRefreshWithDelay:
                                                          rescheduleDelay
                                                                                  retry:YES];
                                                  }
                                                }];
                    }];
}

#pragma mark -

/** @fn completeSignInWithTokenService:callback:
    @brief Completes a sign-in flow once we have access and refresh tokens for the user.
    @param accessToken The STS access token.
    @param accessTokenExpirationDate The approximate expiration date of the access token.
    @param refreshToken The STS refresh token.
    @param anonymous Whether or not the user is anonymous.
    @param callback Called when the user has been signed in or when an error occurred. Invoked
        asynchronously on the global auth work queue in the future.
 */
- (void)completeSignInWithAccessToken:(nullable NSString *)accessToken
            accessTokenExpirationDate:(nullable NSDate *)accessTokenExpirationDate
                         refreshToken:(nullable NSString *)refreshToken
                            anonymous:(BOOL)anonymous
                             callback:(FIRAuthResultCallback)callback {
  [FIRUser retrieveUserWithAuth:self
                    accessToken:accessToken
      accessTokenExpirationDate:accessTokenExpirationDate
                   refreshToken:refreshToken
                      anonymous:anonymous
                       callback:callback];
}

/** @fn signInFlowAuthResultCallbackByDecoratingCallback:
    @brief Creates a FIRAuthResultCallback block which wraps another FIRAuthResultCallback; trying
        to update the current user before forwarding it's invocations along to a subject block
    @param callback Called when the user has been updated or when an error has occurred. Invoked
        asynchronously on the main thread in the future.
    @return Returns a block that updates the current user.
    @remarks Typically invoked as part of the complete sign-in flow. For any other uses please
        consider alternative ways of updating the current user.
*/
- (FIRAuthResultCallback)signInFlowAuthResultCallbackByDecoratingCallback:
    (nullable FIRAuthResultCallback)callback {
  return ^(FIRUser *_Nullable user, NSError *_Nullable error) {
    if (error) {
      if (callback) {
        dispatch_async(dispatch_get_main_queue(), ^{
          callback(nil, error);
        });
      }
      return;
    }
    if (![self updateCurrentUser:user byForce:NO savingToDisk:YES error:&error]) {
      if (callback) {
        dispatch_async(dispatch_get_main_queue(), ^{
          callback(nil, error);
        });
      }
      return;
    }
    if (callback) {
      dispatch_async(dispatch_get_main_queue(), ^{
        callback(user, nil);
      });
    }
  };
}

/** @fn signInFlowAuthDataResultCallbackByDecoratingCallback:
    @brief Creates a FIRAuthDataResultCallback block which wraps another FIRAuthDataResultCallback;
        trying to update the current user before forwarding it's invocations along to a subject
        block.
    @param callback Called when the user has been updated or when an error has occurred. Invoked
        asynchronously on the main thread in the future.
    @return Returns a block that updates the current user.
    @remarks Typically invoked as part of the complete sign-in flow. For any other uses please
        consider alternative ways of updating the current user.
*/
- (FIRAuthDataResultCallback)signInFlowAuthDataResultCallbackByDecoratingCallback:
    (nullable FIRAuthDataResultCallback)callback {
  return ^(FIRAuthDataResult *_Nullable authResult, NSError *_Nullable error) {
    if (error) {
      if (callback) {
        dispatch_async(dispatch_get_main_queue(), ^{
          callback(nil, error);
        });
      }
      return;
    }
    if (![self updateCurrentUser:authResult.user byForce:NO savingToDisk:YES error:&error]) {
      if (callback) {
        dispatch_async(dispatch_get_main_queue(), ^{
          callback(nil, error);
        });
      }
      return;
    }
    if (callback) {
      dispatch_async(dispatch_get_main_queue(), ^{
        callback(authResult, nil);
      });
    }
  };
}

#pragma mark - User-Related Methods

/** @fn updateCurrentUser:byForce:savingToDisk:error:
    @brief Update the current user; initializing the user's internal properties correctly, and
        optionally saving the user to disk.
    @remarks This method is called during: sign in and sign out events, as well as during class
        initialization time. The only time the saveToDisk parameter should be set to NO is during
        class initialization time because the user was just read from disk.
    @param user The user to use as the current user (including nil, which is passed at sign out
        time.)
    @param saveToDisk Indicates the method should persist the user data to disk.
 */
- (BOOL)updateCurrentUser:(nullable FIRUser *)user
                  byForce:(BOOL)force
             savingToDisk:(BOOL)saveToDisk
                    error:(NSError *_Nullable *_Nullable)error {
  if (user == _currentUser) {
    [self possiblyPostAuthStateChangeNotification];
    return YES;
  }
  if (user) {
    if ((user.tenantID || self.tenantID) && ![self.tenantID isEqualToString:user.tenantID]) {
      if (error) {
        *error = [FIRAuthErrorUtils tenantIDMismatchError];
      }
      return NO;
    }
  }

  BOOL success = YES;
  if (saveToDisk) {
    success = [self saveUser:user error:error];
  }
  if (success || force) {
    _currentUser = user;
    [self possiblyPostAuthStateChangeNotification];
  }
  return success;
}

/** @fn saveUser:error:
    @brief Persists user.
    @param user The user to save.
    @param outError Return value for any error which occurs.
    @return @YES on success, @NO otherwise.
 */
- (BOOL)saveUser:(nullable FIRUser *)user error:(NSError *_Nullable *_Nullable)outError {
  BOOL success;

  if (!self.userAccessGroup) {
    NSString *userKey = [NSString stringWithFormat:kUserKey, _firebaseAppName];
    if (!user) {
      success = [_keychainServices removeDataForKey:userKey error:outError];
    } else {
#if TARGET_OS_WATCH
      NSKeyedArchiver *archiver = [[NSKeyedArchiver alloc] initRequiringSecureCoding:false];
#else
      // Encode the user object.
      NSMutableData *archiveData = [NSMutableData data];
// iOS 12 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
      NSKeyedArchiver *archiver =
          [[NSKeyedArchiver alloc] initForWritingWithMutableData:archiveData];
#pragma clang diagnostic pop
#endif  // TARGET_OS_WATCH
      [archiver encodeObject:user forKey:userKey];
      [archiver finishEncoding];

#if TARGET_OS_WATCH
      NSData *archiveData = archiver.encodedData;
#endif  // TARGET_OS_WATCH

      // Save the user object's encoded value.
      success = [_keychainServices setData:archiveData forKey:userKey error:outError];
    }
  } else {
    if (!user) {
      success =
          [self.storedUserManager removeStoredUserForAccessGroup:self.userAccessGroup
                                     shareAuthStateAcrossDevices:self.shareAuthStateAcrossDevices
                                               projectIdentifier:self.app.options.APIKey
                                                           error:outError];
    } else {
      success = [self.storedUserManager setStoredUser:user
                                       forAccessGroup:self.userAccessGroup
                          shareAuthStateAcrossDevices:self.shareAuthStateAcrossDevices
                                    projectIdentifier:self.app.options.APIKey
                                                error:outError];
    }
  }

  return success;
}

/** @fn getUser:error:
    @brief Retrieves the saved user associated, if one exists, from the keychain.
    @param outUser An out parameter which is populated with the saved user, if one exists.
    @param error Return value for any error which occurs.
    @return YES if the operation was a success (irrespective of whether or not a saved user existed
        for the given @c firebaseAppId,) NO if an error occurred.
 */
- (BOOL)getUser:(FIRUser *_Nullable *)outUser error:(NSError *_Nullable *_Nullable)error {
  if (!self.userAccessGroup) {
    NSString *userKey = [NSString stringWithFormat:kUserKey, _firebaseAppName];

    NSError *keychainError;
    NSData *encodedUserData = [_keychainServices dataForKey:userKey error:&keychainError];
    if (keychainError) {
      if (error) {
        *error = keychainError;
      }
      return NO;
    }
    if (!encodedUserData) {
      *outUser = nil;
      return YES;
    }
#if TARGET_OS_WATCH
    NSKeyedUnarchiver *unarchiver =
        [[NSKeyedUnarchiver alloc] initForReadingFromData:encodedUserData error:error];
    if (error && *error) {
      return NO;
    }
#else
// iOS 12 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    NSKeyedUnarchiver *unarchiver =
        [[NSKeyedUnarchiver alloc] initForReadingWithData:encodedUserData];
#pragma clang diagnostic pop
#endif  // TARGET_OS_WATCH
    FIRUser *user = [unarchiver decodeObjectOfClass:[FIRUser class] forKey:userKey];
    user.auth = self;
    *outUser = user;

    return YES;
  } else {
    FIRUser *user =
        [self.storedUserManager getStoredUserForAccessGroup:self.userAccessGroup
                                shareAuthStateAcrossDevices:self.shareAuthStateAcrossDevices
                                          projectIdentifier:self.app.options.APIKey
                                                      error:error];
    user.auth = self;
    *outUser = user;
    if (user) {
      return YES;
    } else {
      if (error && *error) {
        return NO;
      } else {
        return YES;
      }
    }
  }
}

#pragma mark - Interoperability

+ (nonnull NSArray<FIRComponent *> *)componentsToRegister {
  FIRComponentCreationBlock authCreationBlock =
      ^id _Nullable(FIRComponentContainer *_Nonnull container, BOOL *_Nonnull isCacheable) {
    *isCacheable = YES;
    return [[FIRAuth alloc] initWithApp:container.app];
  };
  FIRComponent *authInterop = [FIRComponent componentWithProtocol:@protocol(FIRAuthInterop)
                                              instantiationTiming:FIRInstantiationTimingAlwaysEager
                                                     dependencies:@[]
                                                    creationBlock:authCreationBlock];
  return @[ authInterop ];
}

#pragma mark - FIRComponentLifecycleMaintainer

- (void)appWillBeDeleted:(nonnull FIRApp *)app {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    // This doesn't stop any request already issued, see b/27704535 .
    NSString *keychainServiceName = [FIRAuth keychainServiceNameForAppName:app.name];
    if (keychainServiceName) {
      [[self class] deleteKeychainServiceNameForAppName:app.name];
      FIRAuthKeychainServices *keychain =
          [[FIRAuthKeychainServices alloc] initWithService:keychainServiceName];
      NSString *userKey = [NSString stringWithFormat:kUserKey, app.name];
      [keychain removeDataForKey:userKey error:NULL];
    }
    dispatch_async(dispatch_get_main_queue(), ^{
      // TODO: Move over to fire an event instead, once ready.
      [[NSNotificationCenter defaultCenter] postNotificationName:FIRAuthStateDidChangeNotification
                                                          object:nil];
    });
  });
}

#pragma mark - FIRAuthInterop

- (void)getTokenForcingRefresh:(BOOL)forceRefresh withCallback:(FIRTokenCallback)callback {
  __weak FIRAuth *weakSelf = self;
  dispatch_async(FIRAuthGlobalWorkQueue(), ^{
    FIRAuth *strongSelf = weakSelf;
    // Enable token auto-refresh if not aleady enabled.
    if (strongSelf && !strongSelf->_autoRefreshTokens) {
      FIRLogInfo(kFIRLoggerAuth, @"I-AUT000002", @"Token auto-refresh enabled.");
      strongSelf->_autoRefreshTokens = YES;
      [strongSelf scheduleAutoTokenRefresh];

#if TARGET_OS_IOS || TARGET_OS_TV  // TODO: Is a similar mechanism needed on macOS?
      strongSelf->_applicationDidBecomeActiveObserver = [[NSNotificationCenter defaultCenter]
          addObserverForName:UIApplicationDidBecomeActiveNotification
                      object:nil
                       queue:nil
                  usingBlock:^(NSNotification *notification) {
                    FIRAuth *strongSelf = weakSelf;
                    if (strongSelf) {
                      strongSelf->_isAppInBackground = NO;
                      if (!strongSelf->_autoRefreshScheduled) {
                        [weakSelf scheduleAutoTokenRefresh];
                      }
                    }
                  }];
      strongSelf->_applicationDidEnterBackgroundObserver = [[NSNotificationCenter defaultCenter]
          addObserverForName:UIApplicationDidEnterBackgroundNotification
                      object:nil
                       queue:nil
                  usingBlock:^(NSNotification *notification) {
                    FIRAuth *strongSelf = weakSelf;
                    if (strongSelf) {
                      strongSelf->_isAppInBackground = YES;
                    }
                  }];
#endif
    }
    // Call back with 'nil' if there is no current user.
    if (!strongSelf || !strongSelf->_currentUser) {
      dispatch_async(dispatch_get_main_queue(), ^{
        callback(nil, nil);
      });
      return;
    }
    // Call back with current user token.
    [strongSelf->_currentUser
      internalGetTokenForcingRefresh:forceRefresh
                            callback:^(NSString *_Nullable token, NSError *_Nullable error) {
                              dispatch_async(dispatch_get_main_queue(), ^{
                                callback(token, error);
                              });
                            }];
  });
}

- (nullable NSString *)getUserID {
  return _currentUser.uid;
}

#pragma mark - Keychain sharing

- (BOOL)internalUseUserAccessGroup:(NSString *_Nullable)accessGroup
                             error:(NSError *_Nullable *_Nullable)outError {
  BOOL success;
  success = [self.storedUserManager setStoredUserAccessGroup:accessGroup error:outError];
  if (!success) {
    return NO;
  }

  FIRUser *user = [self getStoredUserForAccessGroup:accessGroup error:outError];
  if (!user && outError && *outError) {
    return NO;
  }
  success = [self updateCurrentUser:user byForce:NO savingToDisk:NO error:outError];
  if (!success) {
    return NO;
  }

  if (_userAccessGroup == nil && accessGroup != nil) {
    NSString *userKey = [NSString stringWithFormat:kUserKey, _firebaseAppName];
    [_keychainServices removeDataForKey:userKey error:outError];
  }
  _userAccessGroup = accessGroup;
  self->_lastNotifiedUserToken = user.rawAccessToken;

  return YES;
}

- (BOOL)useUserAccessGroup:(NSString *_Nullable)accessGroup
                     error:(NSError *_Nullable *_Nullable)outError {
  // self.storedUserManager is initialized asynchronously. Make sure it is done.
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^{
                });
  return [self internalUseUserAccessGroup:accessGroup error:outError];
}

- (nullable FIRUser *)getStoredUserForAccessGroup:(NSString *_Nullable)accessGroup
                                            error:(NSError *_Nullable *_Nullable)outError {
  FIRUser *user;
  if (!accessGroup) {
    NSString *userKey = [NSString stringWithFormat:kUserKey, _firebaseAppName];
    NSData *encodedUserData = [_keychainServices dataForKey:userKey error:outError];
    if (!encodedUserData) {
      return nil;
    }

#if TARGET_OS_WATCH
    NSKeyedUnarchiver *unarchiver =
        [[NSKeyedUnarchiver alloc] initForReadingFromData:encodedUserData error:outError];
    if (outError && *outError) {
      return nil;
    }
#else
// iOS 12 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    NSKeyedUnarchiver *unarchiver =
        [[NSKeyedUnarchiver alloc] initForReadingWithData:encodedUserData];
#pragma clang diagnostic pop
#endif  // TARGET_OS_WATCH
    user = [unarchiver decodeObjectOfClass:[FIRUser class] forKey:userKey];
  } else {
    user = [self.storedUserManager getStoredUserForAccessGroup:accessGroup
                                   shareAuthStateAcrossDevices:self.shareAuthStateAcrossDevices
                                             projectIdentifier:self.app.options.APIKey
                                                         error:outError];
  }

  user.auth = self;
  return user;
}

@end

NS_ASSUME_NONNULL_END
