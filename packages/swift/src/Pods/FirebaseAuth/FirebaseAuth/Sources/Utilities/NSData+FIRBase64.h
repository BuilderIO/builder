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

NS_ASSUME_NONNULL_BEGIN

@interface NSData (FIRBase64)

/** @fn fir_base64URLEncodedStringWithOptions:
    @brief Get a web safe base64 encoded string
    @param options The base64 encoding options
 */
- (NSString *)fir_base64URLEncodedStringWithOptions:(NSDataBase64EncodingOptions)options;

@end

NS_ASSUME_NONNULL_END
