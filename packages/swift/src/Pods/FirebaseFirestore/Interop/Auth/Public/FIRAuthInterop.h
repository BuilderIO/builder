/*
 * Copyright 2018 Google
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

#ifndef FIRAuthInterop_h
#define FIRAuthInterop_h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRTokenCallback
 @brief The type of block which gets called when a token is ready.
 */
typedef void (^FIRTokenCallback)(NSString *_Nullable token, NSError *_Nullable error)
    NS_SWIFT_NAME(TokenCallback);

/// Common methods for Auth interoperability.
NS_SWIFT_NAME(AuthInterop)
@protocol FIRAuthInterop

/// Retrieves the Firebase authentication token, possibly refreshing it if it has expired.
- (void)getTokenForcingRefresh:(BOOL)forceRefresh withCallback:(FIRTokenCallback)callback;

/// Get the current Auth user's UID. Returns nil if there is no user signed in.
- (nullable NSString *)getUserID;

@end

NS_ASSUME_NONNULL_END

#endif /* FIRAuthInterop_h */
