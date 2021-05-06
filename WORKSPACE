workspace(
    name = "builder",
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "1134ec9b7baee008f1d54f0483049a97e53a57cd3913ec9d6db625549c98395a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.4.0/rules_nodejs-3.4.0.tar.gz"],
)

# Check the rules_nodejs version and download npm dependencies
# Note: bazel (version 2 and after) will check the .bazelversion file so we don't need to
# assert on that.
load("@build_bazel_rules_nodejs//:index.bzl", "check_rules_nodejs_version", "node_repositories", "npm_install")

check_rules_nodejs_version(minimum_version_string = "2.2.0")

# Setup the Node.js toolchain
node_repositories(
    # node_version = "14.16.1", # This seems to fail for some unknown reason
    node_version = "15.0.0",
    package_json = ["//:package.json"],
)

npm_install(
    name = "npm",
    args = ["--legacy-peer-deps"],  # TODO: package.json have peer dependencies which are contradictory
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

npm_install(
    name = "npm_core",
    package_json = "//packages/core:package.json",
    package_lock_json = "//packages/core:package-lock.json",
    package_path = "packages/core",
)

npm_install(
    name = "npm_angular",
    package_json = "//packages/angular:package.json",
    package_lock_json = "//packages/angular:package-lock.json",
    package_path = "packages/angular",
)
