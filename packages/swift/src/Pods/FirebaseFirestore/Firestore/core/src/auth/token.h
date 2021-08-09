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

#ifndef FIRESTORE_CORE_SRC_AUTH_TOKEN_H_
#define FIRESTORE_CORE_SRC_AUTH_TOKEN_H_

#include <string>

#include "Firestore/core/src/auth/user.h"

namespace firebase {
namespace firestore {
namespace auth {

/**
 * The current User and the authentication token provided by the underlying
 * authentication mechanism. This is the result of calling
 * CredentialsProvider::GetToken().
 *
 * ## Portability notes: no TokenType on iOS
 *
 * The TypeScript client supports 1st party Oauth tokens (for the Firebase
 * Console to auth as the developer) and OAuth2 tokens for the node.js sdk to
 * auth with a service account. We don't have plans to support either case on
 * mobile so there's no TokenType here.
 */
// TODO(zxu123): Make this support token-type for desktop workflow.
class Token {
 public:
  Token(std::string token, User user);

  /** The actual raw token. */
  const std::string& token() const;

  /**
   * The user with which the token is associated (used for persisting user
   * state on disk, etc.).
   */
  const User& user() const {
    return user_;
  }

  /**
   * Returns a token for an unauthenticated user.
   *
   * ## Portability notes: An unauthenticated token is the equivalent of
   * nil/null in the iOS/TypeScript token implementation. We use a reference
   * instead of a pointer for Token instances in the C++ migration.
   */
  static const Token& Unauthenticated();

 private:
  const std::string token_;
  const User user_;
};

}  // namespace auth
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_AUTH_TOKEN_H_
