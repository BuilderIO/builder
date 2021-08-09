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

#import <SafariServices/SafariServices.h>
#import "FirebaseAuth/Sources/Public/FirebaseAuth/FIRAuthUIDelegate.h"

#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthDefaultUIDelegate.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthURLPresenter.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthWebViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthURLPresenter () <SFSafariViewControllerDelegate, FIRAuthWebViewControllerDelegate>
@end

// Disable unguarded availability warnings because SFSafariViewController is been used throughout
// the code, including as an iVar, which cannot be simply excluded by @available check.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability"

@implementation FIRAuthURLPresenter {
  /** @var _isPresenting
      @brief Whether or not some web-based content is being presented.
          Accesses to this property are serialized on the global Auth work queue
          and thus this variable should not be read or written outside of the work queue.
   */
  BOOL _isPresenting;

  /** @var _callbackMatcher
      @brief The callback URL matcher for the current presentation, if one is active.
   */
  FIRAuthURLCallbackMatcher _Nullable _callbackMatcher;

  /** @var _safariViewController
      @brief The SFSafariViewController used for the current presentation, if any.
   */
  SFSafariViewController *_Nullable _safariViewController;

  /** @var _webViewController
      @brief The FIRAuthWebViewController used for the current presentation, if any.
   */
  FIRAuthWebViewController *_Nullable _webViewController;

  /** @var _UIDelegate
      @brief The UIDelegate used to present the SFSafariViewController.
   */
  id<FIRAuthUIDelegate> _UIDelegate;

  /** @var _completion
      @brief The completion handler for the current presentation, if one is active.
          Accesses to this variable are serialized on the global Auth work queue
          and thus this variable should not be read or written outside of the work queue.
      @remarks This variable is also used as a flag to indicate a presentation is active.
   */
  FIRAuthURLPresentationCompletion _Nullable _completion;
}

- (void)presentURL:(NSURL *)URL
         UIDelegate:(nullable id<FIRAuthUIDelegate>)UIDelegate
    callbackMatcher:(FIRAuthURLCallbackMatcher)callbackMatcher
         completion:(FIRAuthURLPresentationCompletion)completion {
  if (_isPresenting) {
    // Unable to start a new presentation on top of another.
    // Invoke the new completion closure and leave the old one as-is
    // to be invoked when the presentation finishes.
    dispatch_async(dispatch_get_main_queue(), ^() {
      completion(nil, [FIRAuthErrorUtils webContextAlreadyPresentedErrorWithMessage:nil]);
    });
    return;
  }
  _isPresenting = YES;
  _callbackMatcher = callbackMatcher;
  _completion = [completion copy];
  dispatch_async(dispatch_get_main_queue(), ^() {
    self->_UIDelegate = UIDelegate ?: [FIRAuthDefaultUIDelegate defaultUIDelegate];
#if TARGET_OS_MACCATALYST
    self->_webViewController = [[FIRAuthWebViewController alloc] initWithURL:URL delegate:self];
    UINavigationController *navController =
        [[UINavigationController alloc] initWithRootViewController:self->_webViewController];
    [self->_UIDelegate presentViewController:navController animated:YES completion:nil];
#else
    if ([SFSafariViewController class]) {
      self->_safariViewController = [[SFSafariViewController alloc] initWithURL:URL];
      self->_safariViewController.delegate = self;
      [self->_UIDelegate presentViewController:self->_safariViewController
                                      animated:YES
                                    completion:nil];
      return;
    } else {
      self->_webViewController = [[FIRAuthWebViewController alloc] initWithURL:URL delegate:self];
      UINavigationController *navController =
          [[UINavigationController alloc] initWithRootViewController:self->_webViewController];
      [self->_UIDelegate presentViewController:navController animated:YES completion:nil];
    }
#endif
  });
}

- (BOOL)canHandleURL:(NSURL *)URL {
  if (_isPresenting && _callbackMatcher && _callbackMatcher(URL)) {
    [self finishPresentationWithURL:URL error:nil];
    return YES;
  }
  return NO;
}

#pragma mark - SFSafariViewControllerDelegate

- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^() {
    if (controller == self->_safariViewController) {
      self->_safariViewController = nil;
      // TODO:Ensure that the SFSafariViewController is actually removed from the screen before
      // invoking finishPresentationWithURL:error:
      [self finishPresentationWithURL:nil
                                error:[FIRAuthErrorUtils webContextCancelledErrorWithMessage:nil]];
    }
  });
}

#pragma mark - FIRAuthwebViewControllerDelegate

- (BOOL)webViewController:(FIRAuthWebViewController *)webViewController canHandleURL:(NSURL *)URL {
  __block BOOL result = NO;
  dispatch_sync(FIRAuthGlobalWorkQueue(), ^() {
    if (webViewController == self->_webViewController) {
      result = [self canHandleURL:URL];
    }
  });
  return result;
}

- (void)webViewControllerDidCancel:(FIRAuthWebViewController *)webViewController {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^() {
    if (webViewController == self->_webViewController) {
      [self finishPresentationWithURL:nil
                                error:[FIRAuthErrorUtils webContextCancelledErrorWithMessage:nil]];
    }
  });
}

- (void)webViewController:(FIRAuthWebViewController *)webViewController
         didFailWithError:(NSError *)error {
  dispatch_async(FIRAuthGlobalWorkQueue(), ^() {
    if (webViewController == self->_webViewController) {
      [self finishPresentationWithURL:nil error:error];
    }
  });
}

#pragma mark - Private methods

/** @fn finishPresentationWithURL:error:
    @brief Finishes the presentation for a given URL, if any.
    @param URL The URL to finish presenting.
    @param error The error with which to finish presenting, if any.
 */
- (void)finishPresentationWithURL:(nullable NSURL *)URL error:(nullable NSError *)error {
  _callbackMatcher = nil;
  id<FIRAuthUIDelegate> UIDelegate = _UIDelegate;
  _UIDelegate = nil;
  FIRAuthURLPresentationCompletion completion = [_completion copy];
  _completion = NULL;
  void (^finishBlock)(void) = ^() {
    self->_isPresenting = NO;
    completion(URL, error);
  };
  SFSafariViewController *safariViewController = _safariViewController;
  _safariViewController = nil;
  FIRAuthWebViewController *webViewController = _webViewController;
  _webViewController = nil;
  if (safariViewController || webViewController) {
    dispatch_async(dispatch_get_main_queue(), ^() {
      [UIDelegate dismissViewControllerAnimated:YES
                                     completion:^() {
                                       dispatch_async(FIRAuthGlobalWorkQueue(), finishBlock);
                                     }];
    });
  } else {
    finishBlock();
  }
}

#pragma clang diagnostic pop  // ignored "-Wunguarded-availability"

@end

NS_ASSUME_NONNULL_END

#endif
