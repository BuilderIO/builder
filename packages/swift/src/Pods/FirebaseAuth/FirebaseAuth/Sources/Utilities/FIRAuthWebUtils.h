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

#import <Foundation/Foundation.h>

@class FIRAuthRequestConfiguration;

NS_ASSUME_NONNULL_BEGIN

/** @typedef FIRFetchAuthDomainCallback
    @brief The callback invoked at the end of the flow to fetch the Auth domain.
    @param authDomain The Auth domain.
    @param error The error that occurred while fetching the auth domain, if any.
 */
typedef void (^FIRFetchAuthDomainCallback)(NSString *_Nullable authDomain,
                                           NSError *_Nullable error);

/** @class FIRAuthURLUtils
    @brief A utility class used to facilitate the creation of auth related URLs.
 */
@interface FIRAuthWebUtils : NSObject

/** @fn randomStringWithLength:
    @brief Generates a random string of a specified length.
 */
+ (NSString *)randomStringWithLength:(NSUInteger)length;

/** @fn isCallbackSchemeRegisteredForCustomURLScheme:
    @brief Checks whether or not the provided custom URL scheme has been registered by the app.
    @param URLScheme The custom URL scheme to be checked against all custom URL schemes registered
   by the app.
    @return whether or not the provided custom URL scheme has been registered by the app.
 */
+ (BOOL)isCallbackSchemeRegisteredForCustomURLScheme:(NSString *)URLScheme;

/** @fn isExpectedCallbackURL:eventID:authType
    @brief Parses a URL into all available query items.
    @param URL The actual callback URL.
    @param eventID The expected event ID.
    @param authType The expected auth type.
    @param callbackScheme The expected callback custom scheme.
    @return Whether or not the actual callback URL matches the expected callback URL.
 */
+ (BOOL)isExpectedCallbackURL:(nullable NSURL *)URL
                      eventID:(NSString *)eventID
                     authType:(NSString *)authType
               callbackScheme:(NSString *)callbackScheme;

/** @fn fetchAuthDomainWithCompletion:completion:
    @brief Fetches the auth domain associated with the Firebase Project.
    @param completion The callback invoked after the auth domain has been constructed or an error
        has been encountered.
 */
+ (void)fetchAuthDomainWithRequestConfiguration:(FIRAuthRequestConfiguration *)requestConfiguration
                                     completion:(FIRFetchAuthDomainCallback)completion;

/** @fn queryItemValue:from:
 @brief Utility function to get a value from a NSURLQueryItem array.
 @param name The key.
 @param queryList The NSURLQueryItem array.
 @return The value for the key.
 */

+ (nullable NSString *)queryItemValue:(NSString *)name from:(NSArray<NSURLQueryItem *> *)queryList;

/** @fn dictionaryWithHttpArgumentsString:
    @brief Utility function to get a dictionary from a http argument string.
    @param argString The http argument string.
    @return The resulting dictionary of query arguments.
 */
+ (NSDictionary *)dictionaryWithHttpArgumentsString:(NSString *)argString;

/** @fn stringByUnescapingFromURLArgument:from:
    @brief Utility function to get a string by unescapting URL arguments.
    @param argument The argument string.
    @return The resulting string after unescaping URL argument.
 */
+ (NSString *)stringByUnescapingFromURLArgument:(NSString *)argument;

/** @fn parseURL:
    @brief Parses an incoming URL into all available query items.
    @param urlString The url to be parsed.
    @return A dictionary of available query items in the target URL.
 */
+ (NSDictionary<NSString *, NSString *> *)parseURL:(NSString *)urlString;

@end

NS_ASSUME_NONNULL_END
