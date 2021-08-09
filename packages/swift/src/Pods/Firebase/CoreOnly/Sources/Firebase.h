// Copyright 2019 Google
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

#import <FirebaseCore/FirebaseCore.h>

#if !defined(__has_include)
  #error "Firebase.h won't import anything if your compiler doesn't support __has_include. Please \
          import the headers individually."
#else
  #if __has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
    #import <FirebaseAnalytics/FirebaseAnalytics.h>
  #endif

  #if __has_include(<FirebaseAppCheck/FirebaseAppCheck.h>)
    #import <FirebaseAppCheck/FirebaseAppCheck.h>
  #endif

  #if __has_include(<FirebaseAppDistribution/FirebaseAppDistribution.h>)
    #import <FirebaseAppDistribution/FirebaseAppDistribution.h>
  #endif

  #if __has_include(<FirebaseAuth/FirebaseAuth.h>)
    #import <FirebaseAuth/FirebaseAuth.h>
  #endif

  #if __has_include(<FirebaseCrashlytics/FirebaseCrashlytics.h>)
    #import <FirebaseCrashlytics/FirebaseCrashlytics.h>
  #endif

  #if __has_include(<FirebaseDatabase/FirebaseDatabase.h>)
    #import <FirebaseDatabase/FirebaseDatabase.h>
  #endif

  #if __has_include(<FirebaseDynamicLinks/FirebaseDynamicLinks.h>)
    #import <FirebaseDynamicLinks/FirebaseDynamicLinks.h>
  #endif

  #if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
    #import <FirebaseFirestore/FirebaseFirestore.h>
  #endif

  #if __has_include(<FirebaseFunctions/FirebaseFunctions.h>)
    #import <FirebaseFunctions/FirebaseFunctions.h>
  #endif

  #if __has_include(<FirebaseInAppMessaging/FirebaseInAppMessaging.h>)
    #import <FirebaseInAppMessaging/FirebaseInAppMessaging.h>
  #endif

  #if __has_include(<FirebaseInstallations/FirebaseInstallations.h>)
    #import <FirebaseInstallations/FirebaseInstallations.h>
  #endif

  #if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
    #import <FirebaseMessaging/FirebaseMessaging.h>
  #endif

  #if __has_include(<FirebasePerformance/FirebasePerformance.h>)
    #import <FirebasePerformance/FirebasePerformance.h>
  #endif

  #if __has_include(<FirebaseRemoteConfig/FirebaseRemoteConfig.h>)
    #import <FirebaseRemoteConfig/FirebaseRemoteConfig.h>
  #endif

  #if __has_include(<FirebaseStorage/FirebaseStorage.h>)
    #import <FirebaseStorage/FirebaseStorage.h>
  #endif

#endif  // defined(__has_include)
