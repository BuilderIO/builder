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

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthWebView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    self.backgroundColor = [UIColor whiteColor];
    [self initializeSubviews];
  }
  return self;
}

/** @fn initializeSubviews
    @brief Initializes the subviews of this view.
 */
- (void)initializeSubviews {
  WKWebView *webView = [self createWebView];
  UIActivityIndicatorView *spinner = [self createSpinner];

  // The order of the following controls z-order.
  [self addSubview:webView];
  [self addSubview:spinner];

  [self layoutSubviews];
  _webView = webView;
  _spinner = spinner;
}

- (void)layoutSubviews {
  CGFloat height = self.bounds.size.height;
  CGFloat width = self.bounds.size.width;
  _webView.frame = CGRectMake(0, 0, width, height);
  _spinner.center = _webView.center;
}

/** @fn createWebView
    @brief Creates a web view to be used by this view.
    @return The newly created web view.
 */
- (WKWebView *)createWebView {
  WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectZero];
  // Trickery to make the web view not do weird things (like showing a black background when
  // the prompt in the navigation bar animates changes.)
  webView.opaque = NO;
  webView.backgroundColor = [UIColor clearColor];
  webView.scrollView.opaque = NO;
  webView.scrollView.backgroundColor = [UIColor clearColor];
  webView.scrollView.bounces = NO;
  webView.scrollView.alwaysBounceVertical = NO;
  webView.scrollView.alwaysBounceHorizontal = NO;
  return webView;
}

/** @fn createSpinner
    @brief Creates a spinner to be used by this view.
    @return The newly created spinner.
 */
- (UIActivityIndicatorView *)createSpinner {
  UIActivityIndicatorViewStyle spinnerStyle;
#if defined(TARGET_OS_MACCATALYST)
  if (@available(iOS 13.0, *)) {
    spinnerStyle = UIActivityIndicatorViewStyleMedium;
  } else {
// iOS 13 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    spinnerStyle = UIActivityIndicatorViewStyleGray;
#pragma clang diagnostic pop
  }
#else
  spinnerStyle = UIActivityIndicatorViewStyleGray;
#endif
  UIActivityIndicatorView *spinner =
      [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:spinnerStyle];
  return spinner;
}

@end

NS_ASSUME_NONNULL_END

#endif
