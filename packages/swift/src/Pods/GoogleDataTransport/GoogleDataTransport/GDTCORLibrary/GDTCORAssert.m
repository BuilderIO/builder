/*
 * Copyright 2019 Google
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

#import "GoogleDataTransport/GDTCORLibrary/Internal/GDTCORAssert.h"

GDTCORAssertionBlock GDTCORAssertionBlockToRunInstead(void) {
  // This class is only compiled in by unit tests, and this should fail quickly in optimized builds.
  Class GDTCORAssertClass = NSClassFromString(@"GDTCORAssertHelper");
  if (__builtin_expect(!!GDTCORAssertClass, 0)) {
    SEL assertionBlockSEL = NSSelectorFromString(@"assertionBlock");
    if (assertionBlockSEL) {
      IMP assertionBlockIMP = [GDTCORAssertClass methodForSelector:assertionBlockSEL];
      if (assertionBlockIMP) {
        GDTCORAssertionBlock assertionBlock =
            ((GDTCORAssertionBlock(*)(id, SEL))assertionBlockIMP)(GDTCORAssertClass,
                                                                  assertionBlockSEL);
        if (assertionBlock) {
          return assertionBlock;
        }
      }
    }
  }
  return NULL;
}
