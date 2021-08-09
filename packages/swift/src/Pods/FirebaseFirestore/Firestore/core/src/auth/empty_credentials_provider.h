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

#ifndef FIRESTORE_CORE_SRC_AUTH_EMPTY_CREDENTIALS_PROVIDER_H_
#define FIRESTORE_CORE_SRC_AUTH_EMPTY_CREDENTIALS_PROVIDER_H_

#include "Firestore/core/src/auth/credentials_provider.h"

namespace firebase {
namespace firestore {
namespace auth {

/** `EmptyCredentialsProvider` always yields an empty token. */
class EmptyCredentialsProvider : public CredentialsProvider {
 public:
  void GetToken(TokenListener completion) override;
  void InvalidateToken() override;
  void SetCredentialChangeListener(
      CredentialChangeListener change_listener) override;
};

}  // namespace auth
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_AUTH_EMPTY_CREDENTIALS_PROVIDER_H_
