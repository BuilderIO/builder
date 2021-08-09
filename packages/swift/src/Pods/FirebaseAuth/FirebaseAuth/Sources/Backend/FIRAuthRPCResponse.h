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

NS_ASSUME_NONNULL_BEGIN

/** @protocol FIRAuthRPCResponse
    @brief The generic interface for an RPC response needed by @c FIRAuthBackend.
 */
@protocol FIRAuthRPCResponse <NSObject>

/** @fn setFieldsWithDictionary:error:
    @brief Sets the response instance from the decoded JSON response.
    @param dictionary The dictionary decoded from HTTP JSON response.
    @param error An out field for an error which occurred constructing the request.
    @return Whether the operation was successful or not.
 */
- (BOOL)setWithDictionary:(NSDictionary *)dictionary error:(NSError *_Nullable *_Nullable)error;

@optional

/** @fn clientErrorWithshortErrorMessage:detailErrorMessage
    @brief This optional method allows response classes to create client errors given a short error
        message and a detail error message from the server.
    @param shortErrorMessage The short error message from the server.
    @param detailErrorMessage The detailed error message from the server.
    @return A client error, if any.
 */
- (nullable NSError *)clientErrorWithShortErrorMessage:(NSString *)shortErrorMessage
                                    detailErrorMessage:(nullable NSString *)detailErrorMessage;

@end

NS_ASSUME_NONNULL_END
