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

#ifndef FIRESTORE_CORE_SRC_REMOTE_GRPC_ROOT_CERTIFICATE_FINDER_H_
#define FIRESTORE_CORE_SRC_REMOTE_GRPC_ROOT_CERTIFICATE_FINDER_H_

#include <string>

#include "Firestore/core/src/util/path.h"

namespace firebase {
namespace firestore {
namespace remote {

/**
 * Finds the file containing gRPC root certificates (how it is stored differs by
 * platform) and returns its contents as a string. Will trigger assertion
 * failure if the file cannot be found or open.
 */
std::string LoadGrpcRootCertificate();

}  // namespace remote
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_REMOTE_GRPC_ROOT_CERTIFICATE_FINDER_H_
