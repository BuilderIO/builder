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

#ifndef FIRESTORE_CORE_SRC_LOCAL_LEVELDB_OPENER_H_
#define FIRESTORE_CORE_SRC_LOCAL_LEVELDB_OPENER_H_

#include <memory>

#include "Firestore/core/src/core/database_info.h"
#include "Firestore/core/src/util/path.h"
#include "absl/types/optional.h"

namespace firebase {
namespace firestore {

namespace util {
class Filesystem;
class Status;

template <typename T>
class StatusOr;
}  // namespace util

namespace local {

class LevelDbPersistence;
struct LruParams;

class LevelDbOpener {
 public:
  /**
   * Creates an opener that uses the given filesystem, or
   * `Filesystem::Default()` if `fs` is `nullptr`. A non-default Filesystem
   * should only be used in tests.
   */
  explicit LevelDbOpener(core::DatabaseInfo database_info,
                         util::Filesystem* fs = nullptr);

  /**
   * Creates an opener that uses a pre-specified storage location. This should
   * only be used in tests.
   *
   * @param database_info The instance configuration
   * @param firestore_app_data_dir The Firestore-specific application data
   * directory.
   */
  LevelDbOpener(core::DatabaseInfo database_info,
                util::Path firestore_app_data_dir);

  /**
   * Creates the LevelDbPersistence instance.
   *
   * This process includes:
   *
   *   * Migrating existing data from a legacy location into the new location
   *     (i.e. from ~/Documents to ~/Library/Application Support on iOS);
   *   * Cleaning up the directory structure in the legacy location;
   *   * Creating the directory structure to uniquely hold the data for this
   *     instance.
   *   * Actually opening the LevelDB database.
   *
   * @param lru_params The LRU GC configuration to use for the instance.
   * @return A pointer to the created instance or Status indicating what failed.
   */
  util::StatusOr<std::unique_ptr<LevelDbPersistence>> Create(
      const LruParams& lru_params);

  /**
   * Finds a suitable directory to serve as the root of all Firestore local
   * storage for all Firestore instances.
   */
  util::StatusOr<util::Path> FirestoreAppDataDir();

  /**
   * Finds the location where Firestore used to keep local storage for all
   * Firestore instances.
   */
  util::StatusOr<util::Path> FirestoreLegacyAppDataDir();

  /**
   * Returns the location of the data for the single Firestore instance named
   * by the DatabaseInfo passed to the `LevelDbOpener` constructor.
   */
  util::StatusOr<util::Path> LevelDbDataDir();

 private:
  /**
   * Prepares the directory that contains the instance's data.
   */
  util::StatusOr<util::Path> PrepareDataDir();

  /**
   * Computes a unique storage directory for the given identifying components of
   * local storage.
   *
   * @param base_path The root application data directory relative to which
   *     the instance-specific storage directory will be created. Usually just
   *     `FirestoreAppDataDir()`.
   * @return A storage directory unique to the instance identified by
   *     `database_info`.
   */
  util::Path StorageDir(const util::Path& base_path);

  util::StatusOr<util::Path> MigrateDataDir(
      const util::Path& legacy_db_data_dir, const util::Path& db_data_dir);

  void RecursivelyCleanupLegacyDirs(util::Path legacy_dir);

  core::DatabaseInfo database_info_;
  util::Path app_data_dir_;
  util::Path legacy_app_data_dir_;
  util::Filesystem* fs_ = nullptr;
};

}  // namespace local
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_LOCAL_LEVELDB_OPENER_H_
