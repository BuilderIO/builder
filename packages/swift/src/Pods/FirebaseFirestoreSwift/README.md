[![Version](https://img.shields.io/cocoapods/v/Firebase.svg?style=flat)](https://cocoapods.org/pods/Firebase)
[![License](https://img.shields.io/cocoapods/l/Firebase.svg?style=flat)](https://cocoapods.org/pods/Firebase)
[![Platform](https://img.shields.io/cocoapods/p/Firebase.svg?style=flat)](https://cocoapods.org/pods/Firebase)

[![Actions Status][gh-abtesting-badge]][gh-actions]
[![Actions Status][gh-appcheck-badge]][gh-actions]
[![Actions Status][gh-appdistribution-badge]][gh-actions]
[![Actions Status][gh-auth-badge]][gh-actions]
[![Actions Status][gh-cocoapods-integration-badge]][gh-actions]
[![Actions Status][gh-core-badge]][gh-actions]
[![Actions Status][gh-core-diagnostics-badge]][gh-actions]
[![Actions Status][gh-crashlytics-badge]][gh-actions]
[![Actions Status][gh-database-badge]][gh-actions]
[![Actions Status][gh-datatransport-badge]][gh-actions]
[![Actions Status][gh-dynamiclinks-badge]][gh-actions]
[![Actions Status][gh-firebasepod-badge]][gh-actions]
[![Actions Status][gh-firestore-badge]][gh-actions]
[![Actions Status][gh-functions-badge]][gh-actions]
[![Actions Status][gh-google-utilities-badge]][gh-actions]
[![Actions Status][gh-google-utilities-components-badge]][gh-actions]
[![Actions Status][gh-inappmessaging-badge]][gh-actions]
[![Actions Status][gh-interop-badge]][gh-actions]
[![Actions Status][gh-messaging-badge]][gh-actions]
[![Actions Status][gh-mlmodeldownloader-badge]][gh-actions]
[![Actions Status][gh-performance-badge]][gh-actions]
[![Actions Status][gh-remoteconfig-badge]][gh-actions]
[![Actions Status][gh-storage-badge]][gh-actions]
[![Actions Status][gh-symbolcollision-badge]][gh-actions]
[![Actions Status][gh-zip-badge]][gh-actions]
[![Travis](https://travis-ci.org/firebase/firebase-ios-sdk.svg?branch=master)](https://travis-ci.org/firebase/firebase-ios-sdk)

# Firebase Apple Open Source Development

This repository contains all Apple platform Firebase SDK source except FirebaseAnalytics
and FirebaseML.

Firebase is an app development platform with tools to help you build, grow and
monetize your app. More information about Firebase can be found at
[https://firebase.google.com](https://firebase.google.com).

The repository also includes GoogleUtilities and GoogleDataTransport source
which are utilities used by Firebase and other Google products.

**Note** _FirebaseCombineSwift_ contains support for Apple's Combine framework. This module is currently under development, and not yet supported for use in production environments. Fore more details, please refer to the [docs](FirebaseCombineSwift/README.md).

## Installation

See the subsections below for details about the different installation methods.
1. [Standard pod install](README.md#standard-pod-install)
1. [Swift Package Manager](SwiftPackageManager.md)
1. [Installing from the GitHub repo](README.md#installing-from-github)
1. [Experimental Carthage](README.md#carthage-ios-only)

### Standard pod install

Go to
[https://firebase.google.com/docs/ios/setup](https://firebase.google.com/docs/ios/setup).

### Swift Package Manager

Instructions for [Swift Package Manager](https://swift.org/package-manager/) support can be
found at [SwiftPackageManager.md](SwiftPackageManager.md).

### Installing from GitHub

These instructions can be used to access the Firebase repo at other branches,
tags, or commits.

#### Background

See
[the Podfile Syntax Reference](https://guides.cocoapods.org/syntax/podfile.html#pod)
for instructions and options about overriding pod source locations.

#### Accessing Firebase Source Snapshots

All of the official releases are tagged in this repo and available via CocoaPods. To access a local
source snapshot or unreleased branch, use Podfile directives like the following:

To access FirebaseFirestore via a branch:
```ruby
pod 'FirebaseCore', :git => 'https://github.com/firebase/firebase-ios-sdk.git', :branch => 'master'
pod 'FirebaseFirestore', :git => 'https://github.com/firebase/firebase-ios-sdk.git', :branch => 'master'
```

To access FirebaseMessaging via a checked out version of the firebase-ios-sdk repo do:

```ruby
pod 'FirebaseCore', :path => '/path/to/firebase-ios-sdk'
pod 'FirebaseMessaging', :path => '/path/to/firebase-ios-sdk'
```

### Carthage (iOS only)

Instructions for the experimental Carthage distribution are at
[Carthage](Carthage.md). If you have a new Mac with an Apple silicon chip, please see
[these instructions](AppleSilicon.md).

### Using Firebase from a Framework or a library

[Using Firebase from a Framework or a library](docs/firebase_in_libraries.md)

## Development

To develop Firebase software in this repository, ensure that you have at least
the following software:

  * Xcode 12.2 (or later)

CocoaPods is still the canonical way to develop, but much of the repo now supports
development with Swift Package Manager.

### CocoaPods

Install
  * CocoaPods 1.10.0 (or later)
  * [CocoaPods generate](https://github.com/square/cocoapods-generate)

For the pod that you want to develop:

```ruby
pod gen Firebase{name here}.podspec --local-sources=./ --auto-open --platforms=ios
```

Note: If the CocoaPods cache is out of date, you may need to run
`pod repo update` before the `pod gen` command.

Note: Set the `--platforms` option to `macos` or `tvos` to develop/test for
those platforms. Since 10.2, Xcode does not properly handle multi-platform
CocoaPods workspaces.

Firestore has a self contained Xcode project. See
[Firestore/README.md](Firestore/README.md).

#### Development for Catalyst
* `pod gen {name here}.podspec --local-sources=./ --auto-open --platforms=ios`
* Check the Mac box in the App-iOS Build Settings
* Sign the App in the Settings Signing & Capabilities tab
* Click Pods in the Project Manager
* Add Signing to the iOS host app and unit test targets
* Select the Unit-unit scheme
* Run it to build and test

Alternatively disable signing in each target:
* Go to Build Settings tab
* Click `+`
* Select `Add User-Defined Setting`
* Add `CODE_SIGNING_REQUIRED` setting with a value of `NO`

### Swift Package Manager
* To enable test schemes: `./scripts/setup_spm_tests.sh`
* `open Package.swift` or double click `Package.swift` in Finder.
* Xcode will open the project
  * Choose a scheme for a library to build or test suite to run
  * Choose a target platform by selecting the run destination along with the scheme

### Adding a New Firebase Pod

See [AddNewPod.md](AddNewPod.md).

### Managing Headers and Imports

See [HeadersImports.md](HeadersImports.md).

### Code Formatting

To ensure that the code is formatted consistently, run the script
[./scripts/check.sh](https://github.com/firebase/firebase-ios-sdk/blob/master/scripts/check.sh)
before creating a PR.

GitHub Actions will verify that any code changes are done in a style compliant
way. Install `clang-format` and `mint`:

```console
brew install clang-format@12
brew install mint
```

### Running Unit Tests

Select a scheme and press Command-u to build a component and run its unit tests.

### Running Sample Apps
In order to run the sample apps and integration tests, you'll need a valid
`GoogleService-Info.plist` file. The Firebase Xcode project contains dummy plist
files without real values, but can be replaced with real plist files. To get your own
`GoogleService-Info.plist` files:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project, if you don't already have one
3. For each sample app you want to test, create a new Firebase app with the sample app's bundle
identifier (e.g. `com.google.Database-Example`)
4. Download the resulting `GoogleService-Info.plist` and add it to the Xcode project.

### Coverage Report Generation

See [scripts/code_coverage_report/README.md](scripts/code_coverage_report/README.md).

## Specific Component Instructions
See the sections below for any special instructions for those components.

### Firebase Auth

If you're doing specific Firebase Auth development, see
[the Auth Sample README](FirebaseAuth/Tests/Sample/README.md) for instructions about
building and running the FirebaseAuth pod along with various samples and tests.

### Firebase Database

The Firebase Database Integration tests can be run against a locally running Database Emulator
or against a production instance.

To run against a local emulator instance, invoke `./scripts/run_database_emulator.sh start` before
running the integration test.

To run against a production instance, provide a valid GoogleServices-Info.plist and copy it to
`FirebaseDatabase/Tests/Resources/GoogleService-Info.plist`. Your Security Rule must be set to
[public](https://firebase.google.com/docs/database/security/quickstart) while your tests are
running.

### Firebase Performance Monitoring
If you're doing specific Firebase Performance Monitoring development, see
[the Performance README](FirebasePerformance/README.md) for instructions about building the SDK
and [the Performance TestApp README](FirebasePerformance/Tests/TestApp/README.md) for instructions about
integrating Performance with the dev test App.

### Firebase Storage

To run the Storage Integration tests, follow the instructions in
[FIRStorageIntegrationTests.m](FirebaseStorage/Tests/Integration/FIRStorageIntegrationTests.m).

#### Push Notifications

Push notifications can only be delivered to specially provisioned App IDs in the developer portal.
In order to actually test receiving push notifications, you will need to:

1. Change the bundle identifier of the sample app to something you own in your Apple Developer
account, and enable that App ID for push notifications.
2. You'll also need to
[upload your APNs Provider Authentication Key or certificate to the
Firebase Console](https://firebase.google.com/docs/cloud-messaging/ios/certs)
at **Project Settings > Cloud Messaging > [Your Firebase App]**.
3. Ensure your iOS device is added to your Apple Developer portal as a test device.

#### iOS Simulator

The iOS Simulator cannot register for remote notifications, and will not receive push notifications.
In order to receive push notifications, you'll have to follow the steps above and run the app on a
physical device.

## Building with Firebase on Apple platforms

At this time, not all of Firebase's products are available across all Apple platforms. However,
Firebase is constantly evolving and community supported efforts have helped expand Firebase's support.
To keep up with the latest info regarding Firebase's support across Apple platforms, refer to
[this chart](https://firebase.google.com/docs/ios/learn-more#firebase_library_support_by_platform)
in Firebase's documentation.

### Community Supported Efforts

We've seen an amazing amount of interest and contributions to improve the Firebase SDKs, and we are
very grateful!  We'd like to empower as many developers as we can to be able to use Firebase and
participate in the Firebase community.

#### tvOS, macOS, watchOS and Catalyst
Thanks to contributions from the community, many of Firebase SDKs now compile, run unit tests, and
work on tvOS, macOS, watchOS and Catalyst.

For tvOS, see the [Sample](Example/tvOSSample).
For watchOS, currently only Messaging, Storage and Crashlytics (and their dependencies) have limited
support. See the [Independent Watch App Sample](Example/watchOSSample).

Keep in mind that macOS, tvOS, watchOS and Catalyst are not officially supported by Firebase, and
this repository is actively developed primarily for iOS. While we can catch basic unit test issues
with GitHub Actions, there may be some changes where the SDK no longer works as expected on macOS,
tvOS or watchOS. If you encounter this, please
[file an issue](https://github.com/firebase/firebase-ios-sdk/issues).

During app setup in the console, you may get to a step that mentions something like "Checking if the
app has communicated with our servers". This relies on Analytics and will not work on
macOS/tvOS/watchOS/Catalyst.
**It's safe to ignore the message and continue**, the rest of the SDKs will work as expected.

#### Additional MacOS and Catalyst Notes

* FirebaseAuth and FirebaseMessaging require adding `Keychain Sharing Capability`
to Build Settings.
* For Catalyst, FirebaseFirestore requires signing the
[gRPC Resource target](https://github.com/firebase/firebase-ios-sdk/issues/3500#issuecomment-518741681).

#### Additional Crashlytics Notes
* watchOS has limited support. Due to watchOS restrictions, mach exceptions and signal crashes are
not recorded. (Crashes in SwiftUI are generated as mach exceptions, so will not be recorded)

## Roadmap

See [Roadmap](ROADMAP.md) for more about the Firebase iOS SDK Open Source
plans and directions.

## Contributing

See [Contributing](CONTRIBUTING.md) for more information on contributing to the Firebase
iOS SDK.

## License

The contents of this repository is licensed under the
[Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

Your use of Firebase is governed by the
[Terms of Service for Firebase Services](https://firebase.google.com/terms/).

[gh-actions]: https://github.com/firebase/firebase-ios-sdk/actions
[gh-abtesting-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/abtesting/badge.svg
[gh-appcheck-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/app_check/badge.svg
[gh-appdistribution-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/appdistribution/badge.svg
[gh-auth-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/auth/badge.svg
[gh-cocoapods-integration-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/cocoapods-integration/badge.svg
[gh-core-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/core/badge.svg
[gh-core-diagnostics-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/core-diagnostics/badge.svg
[gh-crashlytics-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/crashlytics/badge.svg
[gh-database-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/database/badge.svg
[gh-datatransport-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/datatransport/badge.svg
[gh-dynamiclinks-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/dynamiclinks/badge.svg
[gh-firebasepod-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/firebasepod/badge.svg
[gh-firestore-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/firestore/badge.svg
[gh-functions-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/functions/badge.svg
[gh-google-utilities-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/google-utilities/badge.svg
[gh-google-utilities-components-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/google-utilities-components/badge.svg
[gh-inappmessaging-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/inappmessaging/badge.svg
[gh-interop-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/interop/badge.svg
[gh-messaging-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/messaging/badge.svg
[gh-mlmodeldownloader-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/mlmodeldownloader/badge.svg
[gh-performance-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/performance/badge.svg
[gh-remoteconfig-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/remoteconfig/badge.svg
[gh-storage-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/storage/badge.svg
[gh-symbolcollision-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/symbolcollision/badge.svg
[gh-zip-badge]: https://github.com/firebase/firebase-ios-sdk/workflows/zip/badge.svg
