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

#import <TargetConditionals.h>
#if TARGET_OS_IOS

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol FIRAuthUIDelegate;

/** @typedef FIRAuthURLPresentationCompletion
    @brief The type of block invoked when the URLPresentation completes.
    @param callbackURL The callback URL if the presentation ends with a matching callback.
    @param error The error if the presentation fails to start or ends with an error.
 */
typedef void (^FIRAuthURLPresentationCompletion)(NSURL *_Nullable callbackURL,
                                                 NSError *_Nullable error);

/** @typedef FIRAuthCallbackMatcher
    @brief The type of block invoked for checking whether a callback URL matches.
    @param callbackURL The callback URL to check for match.
    @return Whether or not the specific callback URL matches or not.
 */
typedef BOOL (^FIRAuthURLCallbackMatcher)(NSURL *_Nullable callbackURL);

/** @class FIRAuthURLPresenter
    @brief A Class responsible for presenting URL via SFSafariViewController or WKWebView.
 */
@interface FIRAuthURLPresenter : NSObject

/** @fn presentURL:UIDelegate:callbackMatcher:completion:
    @brief Presents an URL to interact with user.
    @param URL The URL to present.
    @param UIDelegate The UI delegate to present view controller.
    @param completion A block to be called either synchronously if the presentation fails to start,
        or asynchronously in future on an unspecified thread once the presentation finishes.
 */
- (void)presentURL:(NSURL *)URL
         UIDelegate:(nullable id<FIRAuthUIDelegate>)UIDelegate
    callbackMatcher:(FIRAuthURLCallbackMatcher)callbackMatcher
         completion:(FIRAuthURLPresentationCompletion)completion;

/** @fn canHandleURL:
    @brief Determines if a URL was produced by the currently presented URL.
    @param URL The URL to handle.
    @return Whether the URL could be handled or not.
 */
- (BOOL)canHandleURL:(NSURL *)URL;

@end

NS_ASSUME_NONNULL_END

#endif
