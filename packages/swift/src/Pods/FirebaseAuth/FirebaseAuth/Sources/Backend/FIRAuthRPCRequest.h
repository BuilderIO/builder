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

#import <Foundation/Foundation.h>

@class FIRAuthRequestConfiguration;

NS_ASSUME_NONNULL_BEGIN

/** @protocol FIRAuthRPCRequest
    @brief The generic interface for an RPC request needed by @c FIRAuthBackend.
 */
@protocol FIRAuthRPCRequest <NSObject>

/** @fn requestURL
    @brief Gets the request's full URL.
 */
- (NSURL *)requestURL;

@optional

/** @fn containsPostBody
    @brief Returns whether the request contains a post body or not. Requests without a post body
        are get requests.
    @remarks The default implementation returns YES.
 */
- (BOOL)containsPostBody;

/** @fn UnencodedHTTPRequestBodyWithError:
    @brief Creates unencoded HTTP body representing the request.
    @param error An out field for an error which occurred constructing the request.
    @return The HTTP body data representing the request before any encoding, or nil for error.
 */
- (nullable id)unencodedHTTPRequestBodyWithError:(NSError *_Nullable *_Nullable)error;

/** @fn requestConfiguration
    @brief Obtains the request configurations if available.
    @return Returns the request configurations.
 */
- (FIRAuthRequestConfiguration *)requestConfiguration;

@end

NS_ASSUME_NONNULL_END
