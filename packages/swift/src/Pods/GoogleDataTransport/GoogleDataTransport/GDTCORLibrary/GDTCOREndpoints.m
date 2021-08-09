/*
 * Copyright 2020 Google LLC
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

#import "GoogleDataTransport/GDTCORLibrary/Public/GoogleDataTransport/GDTCOREndpoints.h"

static NSString *const kINTServerURL =
    @"https://dummyapiverylong-dummy.dummy.com/dummy/api/very/long";

@implementation GDTCOREndpoints

+ (NSDictionary<NSNumber *, NSURL *> *)uploadURLs {
  // These strings should be interleaved to construct the real URL. This is just to (hopefully)
  // fool github URL scanning bots.
  static NSURL *CCTServerURL;
  static dispatch_once_t CCTOnceToken;
  dispatch_once(&CCTOnceToken, ^{
    const char *p1 = "hts/frbslgiggolai.o/0clgbth";
    const char *p2 = "tp:/ieaeogn.ogepscmvc/o/ac";
    const char URL[54] = {p1[0],  p2[0],  p1[1],  p2[1],  p1[2],  p2[2],  p1[3],  p2[3],  p1[4],
                          p2[4],  p1[5],  p2[5],  p1[6],  p2[6],  p1[7],  p2[7],  p1[8],  p2[8],
                          p1[9],  p2[9],  p1[10], p2[10], p1[11], p2[11], p1[12], p2[12], p1[13],
                          p2[13], p1[14], p2[14], p1[15], p2[15], p1[16], p2[16], p1[17], p2[17],
                          p1[18], p2[18], p1[19], p2[19], p1[20], p2[20], p1[21], p2[21], p1[22],
                          p2[22], p1[23], p2[23], p1[24], p2[24], p1[25], p2[25], p1[26], '\0'};
    CCTServerURL = [NSURL URLWithString:[NSString stringWithUTF8String:URL]];
  });

  static NSURL *FLLServerURL;
  static dispatch_once_t FLLOnceToken;
  dispatch_once(&FLLOnceToken, ^{
    const char *p1 = "hts/frbslgigp.ogepscmv/ieo/eaybtho";
    const char *p2 = "tp:/ieaeogn-agolai.o/1frlglgc/aclg";
    const char URL[69] = {p1[0],  p2[0],  p1[1],  p2[1],  p1[2],  p2[2],  p1[3],  p2[3],  p1[4],
                          p2[4],  p1[5],  p2[5],  p1[6],  p2[6],  p1[7],  p2[7],  p1[8],  p2[8],
                          p1[9],  p2[9],  p1[10], p2[10], p1[11], p2[11], p1[12], p2[12], p1[13],
                          p2[13], p1[14], p2[14], p1[15], p2[15], p1[16], p2[16], p1[17], p2[17],
                          p1[18], p2[18], p1[19], p2[19], p1[20], p2[20], p1[21], p2[21], p1[22],
                          p2[22], p1[23], p2[23], p1[24], p2[24], p1[25], p2[25], p1[26], p2[26],
                          p1[27], p2[27], p1[28], p2[28], p1[29], p2[29], p1[30], p2[30], p1[31],
                          p2[31], p1[32], p2[32], p1[33], p2[33], '\0'};
    FLLServerURL = [NSURL URLWithString:[NSString stringWithUTF8String:URL]];
  });

  static NSURL *CSHServerURL;
  static dispatch_once_t CSHOnceToken;
  dispatch_once(&CSHOnceToken, ^{
    // These strings should be interleaved to construct the real URL. This is just to (hopefully)
    // fool github URL scanning bots.
    const char *p1 = "hts/cahyiseot-agolai.o/1frlglgc/aclg";
    const char *p2 = "tp:/rsltcrprsp.ogepscmv/ieo/eaybtho";
    const char URL[72] = {p1[0],  p2[0],  p1[1],  p2[1],  p1[2],  p2[2],  p1[3],  p2[3],  p1[4],
                          p2[4],  p1[5],  p2[5],  p1[6],  p2[6],  p1[7],  p2[7],  p1[8],  p2[8],
                          p1[9],  p2[9],  p1[10], p2[10], p1[11], p2[11], p1[12], p2[12], p1[13],
                          p2[13], p1[14], p2[14], p1[15], p2[15], p1[16], p2[16], p1[17], p2[17],
                          p1[18], p2[18], p1[19], p2[19], p1[20], p2[20], p1[21], p2[21], p1[22],
                          p2[22], p1[23], p2[23], p1[24], p2[24], p1[25], p2[25], p1[26], p2[26],
                          p1[27], p2[27], p1[28], p2[28], p1[29], p2[29], p1[30], p2[30], p1[31],
                          p2[31], p1[32], p2[32], p1[33], p2[33], p1[34], p2[34], p1[35], '\0'};
    CSHServerURL = [NSURL URLWithString:[NSString stringWithUTF8String:URL]];
  });
  static NSDictionary<NSNumber *, NSURL *> *uploadURLs;
  static dispatch_once_t URLOnceToken;
  dispatch_once(&URLOnceToken, ^{
    uploadURLs = @{
      @(kGDTCORTargetCCT) : CCTServerURL,
      @(kGDTCORTargetFLL) : FLLServerURL,
      @(kGDTCORTargetCSH) : CSHServerURL,
      @(kGDTCORTargetINT) : [NSURL URLWithString:kINTServerURL]
    };
  });
  return uploadURLs;
}

+ (nullable NSURL *)uploadURLForTarget:(GDTCORTarget)target {
  NSDictionary<NSNumber *, NSURL *> *URLs = [self uploadURLs];
  return [URLs objectForKey:@(target)];
}

@end
