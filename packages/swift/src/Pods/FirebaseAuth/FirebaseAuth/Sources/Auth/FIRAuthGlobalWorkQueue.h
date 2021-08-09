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

/** @fn FIRAuthGlobalWorkQueue
    @brief Retrieves the global serial work queue for Firebase Auth.
    @return The global serial dispatch queue.
    @remarks To ensure thread safety, all auth code must be executed in either this global work
        queue, or a serial queue that has its target queue set to this work queue. All public method
        implementations that may involve contested code shall dispatch to this work queue as the
        first thing they do.
 */
extern dispatch_queue_t FIRAuthGlobalWorkQueue(void);

NS_ASSUME_NONNULL_END
