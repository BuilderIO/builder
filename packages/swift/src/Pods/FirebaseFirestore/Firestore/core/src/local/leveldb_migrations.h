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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MIGRATIONS_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MIGRATIONS_H_

#include <cstdint>

#include "Firestore/core/src/local/leveldb_transaction.h"
#include "Firestore/core/src/local/local_serializer.h"
#include "leveldb/db.h"

namespace firebase {
namespace firestore {
namespace local {

class LevelDbMigrations {
 public:
  using SchemaVersion = int32_t;

  /**
   * Returns the current version of the schema for the given database
   */
  static SchemaVersion ReadSchemaVersion(leveldb::DB* db);

  /**
   * Runs any migrations needed to bring the given database up to the current
   * schema version
   */
  static void RunMigrations(leveldb::DB* db, const LocalSerializer& serializer);

  /**
   * Runs any migrations needed to bring the given database up to the given
   * schema version
   */
  static void RunMigrations(leveldb::DB* db,
                            SchemaVersion version,
                            const LocalSerializer& serializer);
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_MIGRATIONS_H_
