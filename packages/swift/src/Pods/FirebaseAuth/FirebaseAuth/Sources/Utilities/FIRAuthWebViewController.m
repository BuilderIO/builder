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

#import "FirebaseAuth/Sources/Utilities/FIRAuthWebView.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthWebViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthWebViewController () <WKNavigationDelegate>
@end

@implementation FIRAuthWebViewController {
  /** @var _URL
      @brief The initial URL to display.
   */
  NSURL *_URL;

  /** @var _delegate
      @brief The delegate to call.
   */
  __weak id<FIRAuthWebViewControllerDelegate> _delegate;

  /** @var _webView;
      @brief The web view instance for easier access.
   */
  __weak FIRAuthWebView *_webView;
}

- (instancetype)initWithURL:(NSURL *)URL
                   delegate:(__weak id<FIRAuthWebViewControllerDelegate>)delegate {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _URL = URL;
    _delegate = delegate;
  }
  return self;
}

#pragma mark - Lifecycle

- (void)loadView {
  FIRAuthWebView *webView = [[FIRAuthWebView alloc] initWithFrame:[UIScreen mainScreen].bounds];
  webView.webView.navigationDelegate = self;
  self.view = webView;
  _webView = webView;
  self.navigationItem.leftBarButtonItem =
      [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel
                                                    target:self
                                                    action:@selector(cancel)];
}

- (void)viewDidAppear:(BOOL)animated {
  [super viewDidAppear:animated];

  // Loads the requested URL in the web view.
  [_webView.webView loadRequest:[NSURLRequest requestWithURL:_URL]];
}

#pragma mark - UI Targets

- (void)cancel {
  [_delegate webViewControllerDidCancel:self];
}

#pragma mark - WKNavigationDelegate

- (void)webView:(WKWebView *)webView
    decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
                    decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
  [_delegate webViewController:self canHandleURL:navigationAction.request.URL];
  decisionHandler(WKNavigationActionPolicyAllow);
}

- (void)webView:(WKWebView *)webView
    didStartProvisionalNavigation:(null_unspecified WKNavigation *)navigation {
  _webView.spinner.hidden = NO;
  [_webView.spinner startAnimating];
}

- (void)webView:(WKWebView *)webView
    didFinishNavigation:(null_unspecified WKNavigation *)navigation {
  _webView.spinner.hidden = YES;
  [_webView.spinner stopAnimating];
}

- (void)webView:(WKWebView *)webView
    didFailNavigation:(null_unspecified WKNavigation *)navigation
            withError:(NSError *)error {
  if ([error.domain isEqualToString:NSURLErrorDomain] && error.code == NSURLErrorCancelled) {
    // It's okay for the page to be redirected before it is completely loaded.  See b/32028062 .
    return;
  }
  // Forward notification to our delegate.
  [self webView:webView didFinishNavigation:navigation];
  [_delegate webViewController:self didFailWithError:error];
}

@end

NS_ASSUME_NONNULL_END

#endif
