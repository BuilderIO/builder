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

/**
 * This implementation presumes that `roots.pem` has been embedded into the
 * binary during the build and is accessible as a char array named
 * `grpc_root_certificates`.
 */

#include "Firestore/core/src/remote/grpc_root_certificate_finder.h"

#include "Firestore/core/src/remote/grpc_root_certificates_generated.h"

namespace firebase {
namespace firestore {
namespace remote {

std::string LoadGrpcRootCertificate() {
  return {reinterpret_cast<const char*>(grpc_root_certificates_generated_data),
          grpc_root_certificates_generated_size};
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
