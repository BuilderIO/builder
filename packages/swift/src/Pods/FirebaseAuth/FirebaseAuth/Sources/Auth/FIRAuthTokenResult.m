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

#import "FirebaseAuth/Sources/Auth/FIRAuthTokenResult_Internal.h"
#import "FirebaseAuth/Sources/Utilities/FIRAuthErrorUtils.h"

NS_ASSUME_NONNULL_BEGIN

/** @var kExpirationDateKey
    @brief The key used to encode the expirationDate property for NSSecureCoding.
 */
static NSString *const kExpirationDateKey = @"expiratinDate";

/** @var kTokenKey
    @brief The key used to encode the token property for NSSecureCoding.
 */
static NSString *const kTokenKey = @"token";

/** @var kAuthDateKey
    @brief The key used to encode the authDate property for NSSecureCoding.
 */
static NSString *const kAuthDateKey = @"authDate";

/** @var kIssuedDateKey
    @brief The key used to encode the issuedDate property for NSSecureCoding.
 */
static NSString *const kIssuedDateKey = @"issuedDate";

/** @var kSignInProviderKey
    @brief The key used to encode the signInProvider property for NSSecureCoding.
 */
static NSString *const kSignInProviderKey = @"signInProvider";

/** @var kSignInSecondFactorKey
 @brief The key used to encode the signInSecondFactor property for NSSecureCoding.
 */
static NSString *const kSignInSecondFactorKey = @"signInSecondFactor";

/** @var kClaimsKey
    @brief The key used to encode the claims property for NSSecureCoding.
 */
static NSString *const kClaimsKey = @"claims";

@implementation FIRAuthTokenResult

- (instancetype)initWithToken:(NSString *)token
               expirationDate:(NSDate *)expirationDate
                     authDate:(NSDate *)authDate
                 issuedAtDate:(NSDate *)issuedAtDate
               signInProvider:(NSString *)signInProvider
           signInSecondFactor:(NSString *)signInSecondFactor
                       claims:(NSDictionary *)claims {
  self = [super init];
  if (self) {
    _token = token;
    _expirationDate = expirationDate;
    _authDate = authDate;
    _issuedAtDate = issuedAtDate;
    _signInProvider = signInProvider;
    _signInSecondFactor = signInSecondFactor;
    _claims = claims;
  }
  return self;
}

+ (nullable FIRAuthTokenResult *)tokenResultWithToken:(NSString *)token {
  NSArray *tokenStringArray = [token componentsSeparatedByString:@"."];

  // The JWT should have three parts, though we only use the second in this method.
  if (tokenStringArray.count != 3) {
    return nil;
  }

  // The token payload is always the second index of the array.
  NSString *IDToken = tokenStringArray[1];

  // Convert the base64URL encoded string to a base64 encoded string.
  // Replace "_" with "/"
  NSMutableString *tokenPayload = [[IDToken stringByReplacingOccurrencesOfString:@"_"
                                                                      withString:@"/"] mutableCopy];

  // Replace "-" with "+"
  [tokenPayload replaceOccurrencesOfString:@"-"
                                withString:@"+"
                                   options:kNilOptions
                                     range:NSMakeRange(0, tokenPayload.length)];

  // Pad the token payload with "=" signs if the payload's length is not a multiple of 4.
  while ((tokenPayload.length % 4) != 0) {
    [tokenPayload appendFormat:@"="];
  }
  NSData *decodedTokenPayloadData =
      [[NSData alloc] initWithBase64EncodedString:tokenPayload
                                          options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (!decodedTokenPayloadData) {
    return nil;
  }
  NSError *jsonError = nil;
  NSJSONReadingOptions options = NSJSONReadingMutableContainers | NSJSONReadingAllowFragments;
  NSDictionary *tokenPayloadDictionary =
      [NSJSONSerialization JSONObjectWithData:decodedTokenPayloadData
                                      options:options
                                        error:&jsonError];
  if (jsonError != nil) {
    return nil;
  }

  if (!tokenPayloadDictionary) {
    return nil;
  }

  // These are dates since 00:00:00 January 1 1970, as described by the Terminology section in
  // the JWT spec. https://tools.ietf.org/html/rfc7519
  NSDate *expirationDate =
      [NSDate dateWithTimeIntervalSince1970:[tokenPayloadDictionary[@"exp"] doubleValue]];
  NSDate *authDate =
      [NSDate dateWithTimeIntervalSince1970:[tokenPayloadDictionary[@"auth_time"] doubleValue]];
  NSDate *issuedAtDate =
      [NSDate dateWithTimeIntervalSince1970:[tokenPayloadDictionary[@"iat"] doubleValue]];

  NSDictionary *firebaseTokenPayloadDictionary = tokenPayloadDictionary[@"firebase"];
  NSString *signInProvider = firebaseTokenPayloadDictionary[@"sign_in_provider"];
  NSString *signInSecondFactor = firebaseTokenPayloadDictionary[@"sign_in_second_factor"];

  FIRAuthTokenResult *tokenResult =
      [[FIRAuthTokenResult alloc] initWithToken:token
                                 expirationDate:expirationDate
                                       authDate:authDate
                                   issuedAtDate:issuedAtDate
                                 signInProvider:signInProvider
                             signInSecondFactor:signInSecondFactor
                                         claims:tokenPayloadDictionary];
  return tokenResult;
}

#pragma mark - NSSecureCoding

+ (BOOL)supportsSecureCoding {
  return YES;
}

- (nullable instancetype)initWithCoder:(NSCoder *)aDecoder {
  NSString *token = [aDecoder decodeObjectOfClass:[NSDate class] forKey:kTokenKey];
  return [FIRAuthTokenResult tokenResultWithToken:token];
}

- (void)encodeWithCoder:(NSCoder *)aCoder {
  [aCoder encodeObject:_token forKey:kTokenKey];
}

@end

NS_ASSUME_NONNULL_END
