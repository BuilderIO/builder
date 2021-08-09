/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/remote/grpc_connection.h"

#include <cstdlib>

#include <algorithm>
#include <mutex>  // NOLINT(build/c++11)
#include <string>
#include <utility>

#include "Firestore/core/include/firebase/firestore/firestore_errors.h"
#include "Firestore/core/include/firebase/firestore/firestore_version.h"
#include "Firestore/core/src/auth/token.h"
#include "Firestore/core/src/model/database_id.h"
#include "Firestore/core/src/remote/firebase_metadata_provider.h"
#include "Firestore/core/src/remote/grpc_root_certificate_finder.h"
#include "Firestore/core/src/util/filesystem.h"
#include "Firestore/core/src/util/hard_assert.h"
#include "Firestore/core/src/util/log.h"
#include "Firestore/core/src/util/statusor.h"
#include "Firestore/core/src/util/string_format.h"
#include "Firestore/core/src/util/warnings.h"
#include "absl/memory/memory.h"
#include "absl/strings/str_cat.h"

SUPPRESS_DOCUMENTATION_WARNINGS_BEGIN()
#include "grpcpp/create_channel.h"
#include "grpcpp/grpcpp.h"
SUPPRESS_END()

namespace firebase {
namespace firestore {
namespace remote {
namespace {

using auth::Token;
using core::DatabaseInfo;
using model::DatabaseId;
using util::Filesystem;
using util::Path;
using util::Status;
using util::StatusOr;
using util::StringFormat;

const char* const kAuthorizationHeader = "authorization";
const char* const kXGoogApiClientHeader = "x-goog-api-client";
const char* const kGoogleCloudResourcePrefix = "google-cloud-resource-prefix";

std::string MakeString(absl::string_view view) {
  return view.data() ? std::string{view.data(), view.size()} : std::string{};
}

std::shared_ptr<grpc::ChannelCredentials> CreateSslCredentials(
    const std::string& certificate) {
  grpc::SslCredentialsOptions options;
  options.pem_root_certs = certificate;
  return grpc::SslCredentials(options);
}

class HostConfig {
  using Guard = std::lock_guard<std::mutex>;

 public:
  void set_certificate_path(const Path& new_value) {
    Guard guard(mutex_);
    certificate_path_ = new_value;
  }
  Path certificate_path() const {
    Guard guard(mutex_);
    return certificate_path_;
  }
  void set_target_name(const std::string& new_value) {
    Guard guard(mutex_);
    target_name_ = new_value;
  }
  std::string target_name() const {
    Guard guard(mutex_);
    return target_name_;
  }
  void set_use_insecure_channel(bool new_value) {
    Guard guard(mutex_);
    use_insecure_channel_ = new_value;
  }
  bool use_insecure_channel() const {
    Guard guard(mutex_);
    return use_insecure_channel_;
  }

 private:
  mutable std::mutex mutex_;
  Path certificate_path_;
  std::string target_name_;
  bool use_insecure_channel_ = false;
};

class HostConfigMap {
  using ConfigByHost = std::unordered_map<std::string, HostConfig>;
  using Guard = std::lock_guard<std::mutex>;

 public:
  /**
   * Returns a pointer to the HostConfig entry for the given host or `nullptr`
   * if there's no entry.
   */
  const HostConfig* find(const std::string& host) const {
    Guard guard{mutex_};
    auto iter = map_.find(host);
    if (iter == map_.end()) {
      return nullptr;
    } else {
      return &(iter->second);
    }
  }

  void UseTestCertificate(const std::string& host,
                          const Path& certificate_path,
                          const std::string& target_name) {
    HARD_ASSERT(!host.empty(), "Empty host name");
    HARD_ASSERT(!certificate_path.native_value().empty(),
                "Empty path to test certificate");
    HARD_ASSERT(!target_name.empty(), "Empty SSL target name");

    Guard guard(mutex_);
    HostConfig& host_config = map_[host];
    host_config.set_certificate_path(certificate_path);
    host_config.set_target_name(target_name);
  }

  void UseInsecureChannel(const std::string& host) {
    HARD_ASSERT(!host.empty(), "Empty host name");

    Guard guard(mutex_);
    HostConfig& host_config = map_[host];
    host_config.set_use_insecure_channel(true);
  }

 private:
  ConfigByHost map_;
  mutable std::mutex mutex_;
};

HostConfigMap& Config() {
  static auto* config_by_host = new HostConfigMap();
  return *config_by_host;
}

std::string GetCppLanguageToken() {
  const char* cpp_version = [] {
    switch (__cplusplus) {
      case 199711L:
        return "1998";
      case 201103L:
        return "2011";
      case 201402L:
        return "2014";
      case 201703L:
        return "2017";
      case 202002L:
        return "2020";
      default:
        return "";
    }
  }();

  return StringFormat("gl-cpp/%s", cpp_version);
}

class ClientLanguageToken {
  using Guard = std::lock_guard<std::mutex>;

 public:
  void Set(std::string value) {
    Guard guard(mutex_);
    value_ = std::move(value);
  }

  std::string Get() const {
    Guard guard(mutex_);
    return value_;
  }

 private:
  std::string value_ = GetCppLanguageToken();
  mutable std::mutex mutex_;
};

ClientLanguageToken& LanguageToken() {
  static auto* token = new ClientLanguageToken();
  return *token;
}

void AddCloudApiHeader(grpc::ClientContext& context) {
  auto api_tokens = StringFormat("%s fire/%s grpc/%s", LanguageToken().Get(),
                                 kFirestoreVersionString, grpc::Version());
  context.AddMetadata(kXGoogApiClientHeader, api_tokens);
}

#if __APPLE__
// Disable CFStream-based transport on Apple platforms due to b/133182964, where
// CFStream will occasionally fail to raise a has-bytes-available events,
// causing Firestore to appear to hang.
//
// Use a constructor of a globally scoped object to set the `grpc_cfstream`
// environment variable before `main` is invoked. This should be early enough
// that it precedes any call of gRPC APIs.
class DisableGrpcCFStream {
 public:
  DisableGrpcCFStream() {
    setenv("grpc_cfstream", "0", 1);
  }
} disable;
#endif  // __APPLE__

}  // namespace

GrpcConnection::GrpcConnection(
    const DatabaseInfo& database_info,
    const std::shared_ptr<util::AsyncQueue>& worker_queue,
    grpc::CompletionQueue* grpc_queue,
    ConnectivityMonitor* connectivity_monitor,
    FirebaseMetadataProvider* firebase_metadata_provider)
    : database_info_{&database_info},
      worker_queue_{NOT_NULL(worker_queue)},
      grpc_queue_{NOT_NULL(grpc_queue)},
      connectivity_monitor_{NOT_NULL(connectivity_monitor)},
      firebase_metadata_provider_{NOT_NULL(firebase_metadata_provider)} {
  RegisterConnectivityMonitor();
}

void GrpcConnection::Shutdown() {
  // Fast finish any pending calls. This will not trigger the observers.
  // Calls may unregister themselves on finish, so make a protective copy.
  auto active_calls = active_calls_;
  for (GrpcCall* call : active_calls) {
    call->FinishImmediately();
  }
}

std::unique_ptr<grpc::ClientContext> GrpcConnection::CreateContext(
    const Token& credential) const {
  absl::string_view token = credential.user().is_authenticated()
                                ? credential.token()
                                : absl::string_view{};

  auto context = absl::make_unique<grpc::ClientContext>();
  if (token.data()) {
    context->AddMetadata(kAuthorizationHeader, absl::StrCat("Bearer ", token));
  }

  AddCloudApiHeader(*context);
  firebase_metadata_provider_->UpdateMetadata(*context);

  // This header is used to improve routing and project isolation by the
  // backend.
  const DatabaseId& db_id = database_info_->database_id();
  context->AddMetadata(kGoogleCloudResourcePrefix,
                       StringFormat("projects/%s/databases/%s",
                                    db_id.project_id(), db_id.database_id()));
  return context;
}

void GrpcConnection::EnsureActiveStub() {
  // TODO(varconst): find out in which cases a gRPC channel might shut down.
  // This might be overkill.
  if (!grpc_channel_ || grpc_channel_->GetState(/*try_to_connect=*/false) ==
                            GRPC_CHANNEL_SHUTDOWN) {
    LOG_DEBUG("Creating Firestore stub.");
    grpc_channel_ = CreateChannel();
    grpc_stub_ = absl::make_unique<grpc::GenericStub>(grpc_channel_);
  }
}

std::shared_ptr<grpc::Channel> GrpcConnection::CreateChannel() const {
  const std::string& host = database_info_->host();

  grpc::ChannelArguments args;
  // Ensure gRPC recovers from a dead connection. (Not typically necessary, as
  // the OS will usually notify gRPC when a connection dies. But not always.
  // This acts as a failsafe.)
  args.SetInt(GRPC_ARG_KEEPALIVE_TIME_MS, 30 * 1000);

  const HostConfig* host_config = Config().find(host);
  if (!host_config) {
    std::string root_certificate = LoadGrpcRootCertificate();
    return grpc::CreateCustomChannel(
        host, CreateSslCredentials(root_certificate), args);
  }

  // For the case when `Settings.set_ssl_enabled(false)`.
  if (host_config->use_insecure_channel()) {
    return grpc::CreateCustomChannel(host, grpc::InsecureChannelCredentials(),
                                     args);
  }

  // For tests only
  auto* fs = Filesystem::Default();
  args.SetSslTargetNameOverride(host_config->target_name());
  Path path = host_config->certificate_path();
  StatusOr<std::string> test_certificate = fs->ReadFile(path);
  HARD_ASSERT(test_certificate.ok(),
              StringFormat("Unable to open root certificates at file path %s",
                           path.ToUtf8String())
                  .c_str());

  return grpc::CreateCustomChannel(
      host, CreateSslCredentials(test_certificate.ValueOrDie()), args);
}

std::unique_ptr<GrpcStream> GrpcConnection::CreateStream(
    absl::string_view rpc_name,
    const Token& token,
    GrpcStreamObserver* observer) {
  EnsureActiveStub();

  auto context = CreateContext(token);
  auto call =
      grpc_stub_->PrepareCall(context.get(), MakeString(rpc_name), grpc_queue_);
  return absl::make_unique<GrpcStream>(std::move(context), std::move(call),
                                       worker_queue_, this, observer);
}

std::unique_ptr<GrpcUnaryCall> GrpcConnection::CreateUnaryCall(
    absl::string_view rpc_name,
    const Token& token,
    const grpc::ByteBuffer& message) {
  EnsureActiveStub();

  auto context = CreateContext(token);
  auto call = grpc_stub_->PrepareUnaryCall(context.get(), MakeString(rpc_name),
                                           message, grpc_queue_);
  return absl::make_unique<GrpcUnaryCall>(std::move(context), std::move(call),
                                          worker_queue_, this, message);
}

std::unique_ptr<GrpcStreamingReader> GrpcConnection::CreateStreamingReader(
    absl::string_view rpc_name,
    const Token& token,
    const grpc::ByteBuffer& message) {
  EnsureActiveStub();

  auto context = CreateContext(token);
  auto call =
      grpc_stub_->PrepareCall(context.get(), MakeString(rpc_name), grpc_queue_);
  return absl::make_unique<GrpcStreamingReader>(
      std::move(context), std::move(call), worker_queue_, this, message);
}

void GrpcConnection::RegisterConnectivityMonitor() {
  connectivity_monitor_->AddCallback(
      [this](ConnectivityMonitor::NetworkStatus /*ignored*/) {
        // Calls may unregister themselves on finish, so make a protective copy.
        auto calls = active_calls_;
        for (GrpcCall* call : calls) {
          // This will trigger the observers.
          call->FinishAndNotify(
              Status{Error::kErrorUnavailable, "Network connectivity changed"});
        }
        // The old channel may hang for a long time trying to reestablish
        // connection before eventually failing. Note that gRPC Objective-C
        // client does the same thing:
        // https://github.com/grpc/grpc/blob/fe11db09575f2dfbe1f88cd44bd417acc168e354/src/objective-c/GRPCClient/private/GRPCHost.m#L309-L314
        grpc_channel_.reset();
      });
}

void GrpcConnection::Register(GrpcCall* call) {
  active_calls_.push_back(call);
}

void GrpcConnection::Unregister(GrpcCall* call) {
  auto found = std::find(active_calls_.begin(), active_calls_.end(), call);
  HARD_ASSERT(found != active_calls_.end(), "Missing a gRPC call");
  active_calls_.erase(found);
}

void GrpcConnection::SetClientLanguage(std::string language_token) {
  LanguageToken().Set(std::move(language_token));
}

void GrpcConnection::UseInsecureChannel(const std::string& host) {
  Config().UseInsecureChannel(host);
}

void GrpcConnection::UseTestCertificate(const std::string& host,
                                        const Path& certificate_path,
                                        const std::string& target_name) {
  Config().UseTestCertificate(host, certificate_path, target_name);
}

}  // namespace remote
}  // namespace firestore
}  // namespace firebase
