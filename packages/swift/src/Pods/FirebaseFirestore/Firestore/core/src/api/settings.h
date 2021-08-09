
/*
 * Copyright 2019 Google LLC
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

#ifndef FIRESTORE_CORE_SRC_API_SETTINGS_H_
#define FIRESTORE_CORE_SRC_API_SETTINGS_H_

#include <string>

namespace firebase {
namespace firestore {
namespace api {

/**
 * Represents settings associated with a FirestoreClient.
 *
 * PORTING NOTE: We exclude the user callback std::executor in order to avoid
 * ownership complexity.
 */
class Settings {
 public:
  // Note: a constexpr array of char (`char[]`) doesn't work with Visual Studio
  // 2015.
  static constexpr const char* DefaultHost = "firestore.googleapis.com";
  static constexpr bool DefaultSslEnabled = true;
  static constexpr bool DefaultPersistenceEnabled = true;
  static constexpr int64_t DefaultCacheSizeBytes = 100 * 1024 * 1024;
  static constexpr int64_t MinimumCacheSizeBytes = 1 * 1024 * 1024;
  static constexpr int64_t CacheSizeUnlimited = -1;

  Settings() = default;

  void set_host(const std::string& value) {
    host_ = value;
  }
  const std::string& host() const {
    return host_;
  }

  void set_ssl_enabled(bool value) {
    ssl_enabled_ = value;
  }
  bool ssl_enabled() const {
    return ssl_enabled_;
  }

  void set_persistence_enabled(bool value) {
    persistence_enabled_ = value;
  }
  bool persistence_enabled() const {
    return persistence_enabled_;
  }

  void set_cache_size_bytes(int64_t value) {
    cache_size_bytes_ = value;
  }
  int64_t cache_size_bytes() const {
    return cache_size_bytes_;
  }
  bool gc_enabled() const {
    return cache_size_bytes_ != CacheSizeUnlimited;
  }

  friend bool operator==(const Settings& lhs, const Settings& rhs);

  size_t Hash() const;

 private:
  std::string host_ = DefaultHost;
  bool ssl_enabled_ = DefaultSslEnabled;
  bool persistence_enabled_ = DefaultPersistenceEnabled;
  int64_t cache_size_bytes_ = DefaultCacheSizeBytes;
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

#endif  // FIRESTORE_CORE_SRC_API_SETTINGS_H_
