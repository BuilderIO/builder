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
#if !TARGET_OS_OSX && !TARGET_OS_WATCH

#import <GoogleUtilities/GULAppEnvironmentUtil.h>
#import <UIKit/UIKit.h>

#import "FirebaseAuth/Sources/Utilities/FIRAuthDefaultUIDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@interface FIRAuthDefaultUIDelegate ()

/** @fn initWithViewController:
    @brief Initializes the instance with a view controller.
    @param viewController The view controller as the presenting view controller in @c
        FIRAuthUIDelegate.
    @return The initialized instance.
 */
- (instancetype)initWithViewController:(nullable UIViewController *)viewController
    NS_DESIGNATED_INITIALIZER;

@end

@implementation FIRAuthDefaultUIDelegate {
  /** @var _viewController
      @brief The presenting view controller.
   */
  UIViewController *_viewController;
}

- (instancetype)initWithViewController:(nullable UIViewController *)viewController {
  self = [super init];
  if (self) {
    _viewController = viewController;
  }
  return self;
}

- (void)presentViewController:(UIViewController *)viewControllerToPresent
                     animated:(BOOL)flag
                   completion:(nullable void (^)(void))completion {
  [_viewController presentViewController:viewControllerToPresent
                                animated:flag
                              completion:completion];
}

- (void)dismissViewControllerAnimated:(BOOL)flag completion:(nullable void (^)(void))completion {
  [_viewController dismissViewControllerAnimated:flag completion:completion];
}

+ (id<FIRAuthUIDelegate>)defaultUIDelegate {
  // iOS App extensions should not call [UIApplication sharedApplication], even if UIApplication
  // responds to it.
  static Class applicationClass = nil;
  if (![GULAppEnvironmentUtil isAppExtension]) {
    Class cls = NSClassFromString(@"UIApplication");
    if (cls && [cls respondsToSelector:NSSelectorFromString(@"sharedApplication")]) {
      applicationClass = cls;
    }
  }

  UIViewController *topViewController;
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
  if (@available(iOS 13.0, tvOS 13.0, *)) {
    UIApplication *application = [applicationClass sharedApplication];
    NSSet<UIScene *> *connectedScenes = application.connectedScenes;
    for (UIScene *scene in connectedScenes) {
      if ([scene isKindOfClass:[UIWindowScene class]]) {
        UIWindowScene *windowScene = (UIWindowScene *)scene;
        for (UIWindow *window in windowScene.windows) {
          if (window.isKeyWindow) {
            topViewController = window.rootViewController;
          }
        }
      }
    }
  } else {
    UIApplication *application = [applicationClass sharedApplication];
// iOS 13 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    topViewController = application.keyWindow.rootViewController;
#pragma clang diagnostic pop
  }
#else
  UIApplication *application = [applicationClass sharedApplication];
  topViewController = application.keyWindow.rootViewController;
#endif

  while (true) {
    if (topViewController.presentedViewController) {
      topViewController = topViewController.presentedViewController;
    } else if ([topViewController isKindOfClass:[UINavigationController class]]) {
      UINavigationController *nav = (UINavigationController *)topViewController;
      topViewController = nav.topViewController;
    } else if ([topViewController isKindOfClass:[UITabBarController class]]) {
      UITabBarController *tab = (UITabBarController *)topViewController;
      topViewController = tab.selectedViewController;
    } else {
      break;
    }
  }
  return [[FIRAuthDefaultUIDelegate alloc] initWithViewController:topViewController];
}

@end

NS_ASSUME_NONNULL_END

#endif
