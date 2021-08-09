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

#include "Firestore/core/src/core/database_info.h"

#include <utility>

namespace firebase {
namespace firestore {
namespace core {

DatabaseInfo::DatabaseInfo(model::DatabaseId database_id,
                           std::string persistence_key,
                           std::string host,
                           bool ssl_enabled)
    : database_id_{std::move(database_id)},
      persistence_key_{std::move(persistence_key)},
      host_{std::move(host)},
      ssl_enabled_{ssl_enabled} {
}

}  // namespace core
}  // namespace firestore
}  // namespace firebase
