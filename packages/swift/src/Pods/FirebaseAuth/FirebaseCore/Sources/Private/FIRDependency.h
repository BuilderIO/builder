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

/// A dependency on a specific protocol's functionality.
NS_SWIFT_NAME(Dependency)
@interface FIRDependency : NSObject

/// The protocol describing functionality being depended on.
@property(nonatomic, strong, readonly) Protocol *protocol;

/// A flag to specify if the dependency is required or not.
@property(nonatomic, readonly) BOOL isRequired;

/// Initializes a dependency that is required. Calls `initWithProtocol:isRequired` with `YES` for
/// the required parameter.
/// Creates a required dependency on the specified protocol's functionality.
+ (instancetype)dependencyWithProtocol:(Protocol *)protocol;

/// Creates a dependency on the specified protocol's functionality and specify if it's required for
/// the class's functionality.
+ (instancetype)dependencyWithProtocol:(Protocol *)protocol isRequired:(BOOL)required;

/// Use `dependencyWithProtocol:isRequired:` instead.
- (instancetype)init NS_UNAVAILABLE;

@end

NS_ASSUME_NONNULL_END
