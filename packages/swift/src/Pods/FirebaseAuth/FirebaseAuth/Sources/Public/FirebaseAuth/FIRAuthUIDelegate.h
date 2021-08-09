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
#if !TARGET_OS_OSX

#import <Foundation/Foundation.h>

@class UIViewController;

NS_ASSUME_NONNULL_BEGIN

/** @protocol FIRAuthUIDelegate
    @brief A protocol to handle user interface interactions for Firebase Auth.
 */
NS_SWIFT_NAME(AuthUIDelegate)
@protocol FIRAuthUIDelegate <NSObject>

/** @fn presentViewController:animated:completion:
    @brief If implemented, this method will be invoked when Firebase Auth needs to display a view
        controller.
    @param viewControllerToPresent The view controller to be presented.
    @param flag Decides whether the view controller presentation should be animated or not.
    @param completion The block to execute after the presentation finishes. This block has no return
        value and takes no parameters.
*/
- (void)presentViewController:(UIViewController *)viewControllerToPresent
                     animated:(BOOL)flag
                   completion:(void (^_Nullable)(void))completion;

/** @fn dismissViewControllerAnimated:completion:
    @brief If implemented, this method will be invoked when Firebase Auth needs to display a view
        controller.
    @param flag Decides whether removing the view controller should be animated or not.
    @param completion The block to execute after the presentation finishes. This block has no return
        value and takes no parameters.
*/
- (void)dismissViewControllerAnimated:(BOOL)flag
                           completion:(void (^_Nullable)(void))completion
    NS_SWIFT_NAME(dismiss(animated:completion:));

@end

NS_ASSUME_NONNULL_END

#endif
