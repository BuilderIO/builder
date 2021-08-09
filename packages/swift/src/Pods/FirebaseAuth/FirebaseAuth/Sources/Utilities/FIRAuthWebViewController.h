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

#import <UIKit/UIKit.h>

@class FIRAuthWebViewController;

NS_ASSUME_NONNULL_BEGIN

/** @protocol FIRAuthWebViewControllerDelegate
    @brief Defines a delegate for FIRAuthWebViewController
 */
@protocol FIRAuthWebViewControllerDelegate <NSObject>

/** @fn webViewController:canHandleURL:
    @brief Determines if a URL should be handled by the delegate.
    @param URL The URL to handle.
    @return Whether the URL could be handled or not.
 */
- (BOOL)webViewController:(FIRAuthWebViewController *)webViewController canHandleURL:(NSURL *)URL;

/** @fn webViewControllerDidCancel:
    @brief Notifies the delegate that the web view controller is being cancelled by the user.
    @param webViewController The web view controller in question.
 */
- (void)webViewControllerDidCancel:(FIRAuthWebViewController *)webViewController;

/** @fn webViewController:didFailWithError:
    @brief Notifies the delegate that the web view controller failed to load a page.
    @param webViewController The web view controller in question.
    @param error The error that has occurred.
 */
- (void)webViewController:(FIRAuthWebViewController *)webViewController
         didFailWithError:(NSError *)error;

@end

/** @class FIRAuthWebViewController
    @brief Reponsible for creating a UIViewController for presenting a FIRAutWebView.
 */
@interface FIRAuthWebViewController : UIViewController

/** @fn initWithNibName:bundle:
 *  @brief Please call initWithURL:delegate:
 */
- (instancetype)initWithNibName:(nullable NSString *)nibNameOrNil
                         bundle:(nullable NSBundle *)nibBundleOrNil NS_UNAVAILABLE;

/** @fn initWithCoder:
 *  @brief Please call initWithURL:delegate:
 */
- (instancetype)initWithCoder:(NSCoder *)aDecoder NS_UNAVAILABLE;

- (instancetype)initWithURL:(NSURL *)URL
                   delegate:(__weak id<FIRAuthWebViewControllerDelegate>)delegate
    NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END

#endif
