# 8.5.0
- [fixed] Fixed an analyze issue introduced in Xcode 12.5. (#8411)

# 8.2.0
- [fixed] Fixed analyze issues introduced in Xcode 12.5. (#8210)
- [fixed] Fixed a bug in the link with email link, Game Center, and phone auth flows. (#8196)

# 8.0.0
- [fixed] Fixed a crash that occurred when assigning auth settings. (#7670)

# 7.8.0
- [fixed] Fixed auth state sharing during first app launch. (#7472)

# 7.6.0
- [fixed] Auth emulator now works across the local network. (#7350)
- [fixed] Fixed incorrect import for watchOS (#7425)

# 7.4.0
- [fixed] Check if the reverse client ID is configured as a custom URL scheme before setting it as the callback scheme. (#7211)
- [added] Add ability to sync auth state across devices. (#6924)
- [fixed] Add multi-tenancy support for email link sign-in. (#7246)

# 7.3.0
- [fixed] Catalyst browser issue with `verifyPhoneNumber` API. (#7049)

# 7.1.0
- [fixed] Fixed completion handler issue in `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)` method. (#6863)

# 7.0.0
- [removed] Remove deprecated APIs `dataForKey`,`fetchProvidersForEmail:completion`, `signInAndRetrieveDataWithCredential:completion`, `reauthenticateAndRetrieveDataWithCredential:completion`, `linkAndRetrieveDataWithCredential:completion`. (#6607)
- [added] Add support for the auth emulator. (#6624)
- [changed] The global variables `FirebaseAuthVersionNum` and `FirebaseAuthVersionStr` are deleted.
  `FirebaseVersion()` or `FIRFirebaseVersion()` should be used instead.

# v6.9.1
- [fixed] Internal source documentation. (#6371)

# v6.9.0
- [added] Added support for multi-tenancy (#6142).
- [added] Added basic watchOS support. (#4621)
- [changed] Improved Xcode completion of public API completion handlers in Swift. (#6283)

# v6.8.0
- [fixed] Fix bug where multiple keychain entries would result in user persistence failure. (#5906)
- [changed] Added support for using GOOGLE_APP_ID in generic IDP and phone auth reCAPTCHA fallback flows. (#6121)

# v6.7.1
- [fixed] Fixed a multithreaded memory access issue on iOS. (#5979)

# v6.7.0
- [changed] Functionally neutral source reorganization for preliminary Swift Package Manager support. (#5856)

# v6.5.3
- [changed] Remove unused mfa request field "mfa_provider" (#5397)
- [fixed] Suppress deprecation warnings when targeting iOS versions up to iOS 13. (#5437)

# v6.5.2
- [fixed] Handle calls to `useUserAccessGroup` soon after configure. (#4175)

# v6.5.1
- [changed] File structure changes. No functional change.
- [changed] Code formatting changes.

# v6.5.0
- [feature] Added support of Multi-factor Authentication. (#4823)

# v6.4.1
- [fixed] Added support of UISceneDelegate for URL redirect. (#4380)
- [fixed] Fixed rawNonce in encoder. (#4337)

# v6.4.0
- [feature] Added support for Sign-in with Apple. (#4183)

# v6.3.1
- [fixed] Removed usage of a deprecated property on iOS 13. (#4066)

# v6.3.0
- [added] Added methods allowing developers to link and reauthenticate with federated providers. (#3971)

# v6.2.3
- [fixed] Make sure the first valid auth domain is retrieved. (#3493)
- [fixed] Add assertion for Facebook generic IDP flow. (#3208)
- [fixed] Build for Catalyst. (#3549)

# v6.2.2
- [fixed] Fixed an issue where unlinking an email auth provider raised an incorrect error stating the account was not linked to an email auth provider. (#3405)
- [changed] Renamed internal Keychain classes. (#3473)

# v6.2.1
- [added] Add new client error MISSING_CLIENT_IDENTIFIER. (#3341)

# v6.2.0
- [feature] Expose `secret` of OAuth credential in public header. (#3089)
- [fixed] Fix a keychain issue where API key is incorrectly set. (#3239)

# v6.1.2
- [fixed] Fix line limits and linter warnings in public documentation. (#3139)

# v6.1.1
- [fixed] Fix an issue where a user can't link with email provider by email link. (#3030)

# v6.1.0
- [added] Add support of web.app as an auth domain. (#2959)
- [fixed] Fix an issue where the return type of `getStoredUserForAccessGroup:error:` is nonnull. (#2879)

# v6.0.0
- [added] Add support of single sign on. (#2684)
- [deprecated] Deprecate `reauthenticateAndRetrieveDataWithCredential:completion:`, `signInAndRetrieveDataWithCredential:completion:`, `linkAndRetrieveDataWithCredential:completion:`, `fetchProvidersForEmail:completion:`. (#2723, #2756)
- [added] Returned oauth secret token in Generic IDP sign-in for Twitter. (#2663)
- [removed] Remove pendingToken from public API. (#2676)
- [changed] `GULAppDelegateSwizzler` is used for the app delegate swizzling. (#2591)

# v5.4.2
- [added] Support new error code ERROR_INVALID_PROVIDER_ID. (#2629)

# v5.4.1
- [deprecated] Deprecate Microsoft and Yahoo OAuth Provider ID (#2517)
- [fixed] Fix an issue where an exception was thrown when linking OAuth credentials. (#2521)
- [fixed] Fix an issue where a wrong error was thrown when handling error with
  FEDERATED_USER_ID_ALREADY_LINKED. (#2522)

# v5.4.0
- [added] Add support of Generic IDP (#2405).

# v5.3.0
- [changed] Use the new registerInternalLibrary API to register with FirebaseCore. (#2137)

# v5.2.0
- [added] Add support of Game Center sign in (#2127).

# v5.1.0
- [added] Add support of custom FDL domain link (#2121).

# v5.0.5
- [changed] Restore SafariServices framework dependency (#2002).

# v5.0.4
- [fixed] Fix analyzer issues (#1740).

# v5.0.3
- [added] Add `FIRAuthErrorCodeMalformedJWT`, which is raised on JWT token parsing.
  failures during auth operations (#1436).
- [changed] Migrate to use FirebaseAuthInterop interfaces to access FirebaseAuth (#1501).

# v5.0.2
- [fixed] Fix an issue where JWT date timestamps weren't parsed correctly. (#1319)
- [fixed] Fix an issue where anonymous accounts weren't correctly promoted to
  non-anonymous when linked with passwordless email auth accounts. (#1383)
- [fixed] Fix an exception from using an invalidated NSURLSession. (#1261)
- [fixed] Fix a data race issue caught by the sanitizer. (#1446)

# v5.0.1
- [fixed] Restore 4.x level of support for extensions (#1357).

# v5.0.0
- [added] Adds APIs for phone Auth testing to bypass the verification flow (#1192).
- [feature] Changes the callback block signature for sign in and create user methods
  to provide an AuthDataResult that includes the user and user info (#1123, #1186).
- [changed] Removes GoogleToolboxForMac dependency (#1175).
- [removed] Removes miscellaneous deprecated APIs (#1188, #1200).

# v4.6.1
- [fixed] Fixes crash which occurred when certain Firebase IDTokens were being parsed (#1076).

# v4.6.0
- [added] Adds `getIDTokenResultWithCompletion:` and `getIDTokenResultForcingRefresh:completion:` APIs which
  call back with an AuthTokenResult object. The Auth token result object contains the ID token JWT string and other properties associated with the token including the decoded available payload claims (#1004).

- [added] Adds the `updateCurrentUser:completion:` API which sets the currentUser on the calling Auth instance to the provided user object (#1018).

- [added] Adds client-side validation to prevent setting `handleCodeInApp` to false when performing
  email-link authentication. If `handleCodeInApp` is set to false an invalid argument exception
  is thrown (#931).

- [added] Adds support for passing the deep link (which is embedded in the sign-in link sent via email) to the
  `signInWithEmail:link:completion:` and `isSignInWithEmailLink:` methods during an
  email/link sign-in flow (#1023).

# v4.5.0
- [added] Adds new API which provides a way to determine the sign-in methods associated with an
  email address.
- [added] Adds new API which allows authentication using only an email link (Passwordless Authentication
  with email link).

# v4.4.4
- [fixed] Addresses CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF warnings that surface in newer versions of
  Xcode and CocoaPods.
- [fixed] Improves FIRUser documentation with clear message explaining when Firebase Auth attempts to validate
  users and what happens when an invalidated user is detected (#694) .

# v4.4.3
- [added] Adds an explicit dependency on CoreGraphics from Firebase Auth.

# v4.4.2
- [fixed] Fixes bug where the FIRAuthResult object returned following a Phone Number authentication
  always contained a nil FIRAdditionalUserInfo object. Now the FIRAdditionalUserInfo object is
  never nil and its newUser field is populated correctly.

# v4.4.0
- [fixed] Adds new APIs which return an AuthDataResult object after successfully creating an
  Email/Password user, signing in anonymously, signing in with Email/Password and signing
  in with Custom Token. The AuthDataResult object contains the new user and additional
  information pertaining to the new user.

# v4.3.2
- [fixed] Improves error handling for the phone number sign-in reCAPTCHA flow.
- [fixed] Improves error handling for phone number linking flow.
- [fixed] Fixes issue where after linking an anonymous user to a phone number the user remained
  anonymous.

# v4.3.1
- [changed] Internal clean up.

# v4.3.0
- [added] Provides account creation and last sign-in dates as metadata to the user
  object.
- [added] Returns more descriptive errors for some error cases of the phone number
  sign-in reCAPTCHA flow.
- [fixed] Fixes an issue that invalid users were not automatically signed out earlier.
- [fixed] Fixes an issue that ID token listeners were not fired in some cases.

# v4.2.1
- [fixed] Fixes a threading issue in phone number auth that completion block was not
  executed on the main thread in some error cases.

# v4.2.0
- [added] Adds new phone number verification API which makes use of an intelligent reCAPTCHA to verify the application.

# v4.1.1
- [changed] Improves some method documentation in headers.

# v4.1.0
- [added] Allows the app to handle continue URL natively, e.g., from password reset
  email.
- [added] Allows the app to set language code, e.g., for sending password reset email.
- [fixed] Fixes an issue that user's phone number did not persist on client.
- [fixed] Fixes an issue that recover email action code type was reported as unknown.
- [feature] Improves app start-up time by moving initialization off from the main
  thread.
- [fixed] Better reports missing email error when creating a new password user.
- [fixed] Changes console message logging levels to be more consistent with other
  Firebase products on the iOS platform.

# 2017-05-17 -- v4.0.0
- [added] Adds Phone Number Authentication.
- [added] Adds support for generic OAuth2 identity providers.
- [added] Adds methods that return additional user data from identity providers if
  available when authenticating users.
- [added] Improves session management by automatically refreshing tokens if possible
  and signing out users if the session is detected invalidated, for example,
  after the user changed password or deleted account from another device.
- [fixed] Fixes an issue that reauthentication creates new user account if the user
  credential is valid but does not match the currently signed in user.
- [fixed] Fixes an issue that the "password" provider is not immediately listed on the
  client side after adding a password to an account.
- [changed] Changes factory methods to return non-null FIRAuth instances or raises an
  exception, instead of returning nullable instances.
- [changed] Changes auth state change listener to only be triggered when the user changes.
- [added] Adds a new listener which is triggered whenever the ID token is changed.
- [changed] Switches ERROR_EMAIL_ALREADY_IN_USE to
  ERROR_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL when the email used in the
  signInWithCredential: call is already in use by another account.
- [deprecated] Deprecates FIREmailPasswordAuthProvider in favor of FIREmailAuthProvider.
- [deprecated] Deprecates getTokenWithCompletion in favor of getIDTokenWithCompletion on
  FIRUser.
- [fixed] Changes Swift API names to better align with Swift convention.

# 2017-02-06 -- v3.1.1
- [added] Allows handling of additional errors when sending OOB action emails. The
  server can respond with the following new error messages:
  INVALID_MESSAGE_PAYLOAD,INVALID_SENDER and INVALID_RECIPIENT_EMAIL.
- [fixed] Removes incorrect reference to FIRAuthErrorCodeCredentialTooOld in FIRUser.h.
- [added] Provides additional error information from server if available.

# 2016-12-13 -- v3.1.0
- [added] Adds FIRAuth methods that enable the app to follow up with user actions
  delivered by email, such as verifying email address or reset password.
- [fixed] No longer applies the keychain workaround introduced in v3.0.5 on iOS 10.2
  simulator or above since the issue has been fixed.
- [fixed] Fixes nullability compilation warnings when used in Swift.
- [fixed] Better reports missing password error.

# 2016-10-24 -- v3.0.6
- [changed] Switches to depend on open sourced GoogleToolboxForMac and GTMSessionFetcher.
- [fixed] Improves logging of keychain error when initializing.

# 2016-09-14 -- v3.0.5
- [fixed] Works around a keychain issue in iOS 10 simulator.
- [fixed] Reports the correct error for invalid email when signing in with email and
  password.

# 2016-07-18 -- v3.0.4
- [fixed] Fixes a race condition bug that could crash the app with an exception from
  NSURLSession on iOS 9.

# 2016-06-20 -- v3.0.3
- [added] Adds documentation for all possible errors returned by each method.
- [fixed] Improves error handling and messages for a variety of error conditions.
- [fixed] Whether or not an user is considered anonymous is now consistent with other
  platforms.
- [changed] A saved signed in user is now siloed between different Firebase projects
  within the same app.

# 2016-05-18 -- v3.0.2
- Initial public release.
