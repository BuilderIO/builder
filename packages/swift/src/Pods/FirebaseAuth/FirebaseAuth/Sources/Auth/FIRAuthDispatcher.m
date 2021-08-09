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

#import "FirebaseAuth/Sources/Auth/FIRAuthDispatcher.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthDispatcher

@synthesize dispatchAfterImplementation = _dispatchAfterImplementation;

+ (instancetype)sharedInstance {
  static dispatch_once_t onceToken;
  static FIRAuthDispatcher *sharedInstance;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[self alloc] init];
  });
  return sharedInstance;
}

- (void)dispatchAfterDelay:(NSTimeInterval)delay
                     queue:(dispatch_queue_t)queue
                      task:(void (^)(void))task {
  if (_dispatchAfterImplementation) {
    _dispatchAfterImplementation(delay, queue, task);
    return;
  }
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delay * NSEC_PER_SEC), queue, task);
}

@end

NS_ASSUME_NONNULL_END
