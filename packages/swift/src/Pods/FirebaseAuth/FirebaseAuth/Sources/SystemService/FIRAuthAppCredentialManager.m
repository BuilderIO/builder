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

#import <TargetConditionals.h>
#if !TARGET_OS_OSX

#import "FirebaseAuth/Sources/Auth/FIRAuthGlobalWorkQueue.h"
#import "FirebaseAuth/Sources/Storage/FIRAuthKeychainServices.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredential.h"
#import "FirebaseAuth/Sources/SystemService/FIRAuthAppCredentialManager.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kKeychainDataKey
    @brief The keychain key for the data.
 */
static NSString *const kKeychainDataKey = @"app_credentials";

/** @var kFullCredentialKey
    @brief The data key for the full app credential.
 */
static NSString *const kFullCredentialKey = @"full_credential";

/** @var kPendingReceiptsKey
    @brief The data key for the array of pending receipts.
 */
static NSString *const kPendingReceiptsKey = @"pending_receipts";

/** @var kMaximumNumberOfPendingReceipts
    @brief The maximum number of partial credentials kept by this class.
 */
static const NSUInteger kMaximumNumberOfPendingReceipts = 32;

@implementation FIRAuthAppCredentialManager {
  /** @var _keychainServices
      @brief The keychain for app credentials to load from and to save to.
   */
  FIRAuthKeychainServices *_keychainServices;

  /** @var _pendingReceipts
      @brief A list of pending receipts sorted in the order they were recorded.
   */
  NSMutableArray<NSString *> *_pendingReceipts;

  /** @var _callbacksByReceipt
      @brief A map from pending receipts to callbacks.
   */
  NSMutableDictionary<NSString *, FIRAuthAppCredentialCallback> *_callbacksByReceipt;
}

- (instancetype)initWithKeychain:(FIRAuthKeychainServices *)keychain {
  self = [super init];
  if (self) {
    _keychainServices = keychain;
    // Load the credentials from keychain if possible.
    NSError *error;
    NSData *encodedData = [_keychainServices dataForKey:kKeychainDataKey error:&error];
    if (!error && encodedData) {
#if TARGET_OS_WATCH
      NSKeyedUnarchiver *unarchiver = [[NSKeyedUnarchiver alloc] initForReadingFromData:encodedData
                                                                                  error:&error];
#else
// iOS 12 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
      NSKeyedUnarchiver *unarchiver =
          [[NSKeyedUnarchiver alloc] initForReadingWithData:encodedData];
#pragma clang diagnostic pop
#endif  // TARGET_OS_WATCH
      FIRAuthAppCredential *credential =
          [unarchiver decodeObjectOfClass:[FIRAuthAppCredential class] forKey:kFullCredentialKey];
      if ([credential isKindOfClass:[FIRAuthAppCredential class]] && !error) {
        _credential = credential;
      }
      NSSet<Class> *allowedClasses =
          [NSSet<Class> setWithObjects:[NSArray class], [NSString class], nil];
      NSArray<NSString *> *pendingReceipts = [unarchiver decodeObjectOfClasses:allowedClasses
                                                                        forKey:kPendingReceiptsKey];
      if ([pendingReceipts isKindOfClass:[NSArray class]]) {
        _pendingReceipts = [pendingReceipts mutableCopy];
      }
    }
    if (!_pendingReceipts) {
      _pendingReceipts = [[NSMutableArray<NSString *> alloc] init];
    }
    _callbacksByReceipt =
        [[NSMutableDictionary<NSString *, FIRAuthAppCredentialCallback> alloc] init];
  }
  return self;
}

- (NSUInteger)maximumNumberOfPendingReceipts {
  return kMaximumNumberOfPendingReceipts;
}

- (void)didStartVerificationWithReceipt:(NSString *)receipt
                                timeout:(NSTimeInterval)timeout
                               callback:(FIRAuthAppCredentialCallback)callback {
  [_pendingReceipts removeObject:receipt];
  if (_pendingReceipts.count >= kMaximumNumberOfPendingReceipts) {
    [_pendingReceipts removeObjectAtIndex:0];
  }
  [_pendingReceipts addObject:receipt];
  _callbacksByReceipt[receipt] = callback;
  [self saveData];
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(timeout * NSEC_PER_SEC)),
                 FIRAuthGlobalWorkQueue(), ^{
                   [self callBackWithReceipt:receipt];
                 });
}

- (BOOL)canFinishVerificationWithReceipt:(NSString *)receipt secret:(NSString *)secret {
  if (![_pendingReceipts containsObject:receipt]) {
    return NO;
  }
  [_pendingReceipts removeObject:receipt];
  _credential = [[FIRAuthAppCredential alloc] initWithReceipt:receipt secret:secret];
  [self saveData];
  [self callBackWithReceipt:receipt];
  return YES;
}

- (void)clearCredential {
  _credential = nil;
  [self saveData];
}

#pragma mark - Internal methods

/** @fn saveData
    @brief Save the data in memory to the keychain ignoring any errors.
 */
- (void)saveData {
  NSMutableData *archiveData = [NSMutableData data];
// iOS 12 deprecation
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  NSKeyedArchiver *archiver = [[NSKeyedArchiver alloc] initForWritingWithMutableData:archiveData];
#pragma clang diagnostic pop
  [archiver encodeObject:_credential forKey:kFullCredentialKey];
  [archiver encodeObject:_pendingReceipts forKey:kPendingReceiptsKey];
  [archiver finishEncoding];
  [_keychainServices setData:archiveData forKey:kKeychainDataKey error:NULL];
}

/** @fn callBackWithReceipt:
    @brief Calls the saved callback for the specifc receipt.
    @param receipt The receipt associated with the callback.
 */
- (void)callBackWithReceipt:(NSString *)receipt {
  FIRAuthAppCredentialCallback callback = _callbacksByReceipt[receipt];
  if (!callback) {
    return;
  }
  [_callbacksByReceipt removeObjectForKey:receipt];
  if (_credential) {
    callback(_credential);
  } else {
    callback([[FIRAuthAppCredential alloc] initWithReceipt:receipt secret:nil]);
  }
}

@end

NS_ASSUME_NONNULL_END

#endif
