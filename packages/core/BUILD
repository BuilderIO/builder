load("@npm//@bazel/typescript:index.bzl", "ts_project")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "core",
    srcs = glob(
        [
            "**/*.ts",
        ],
    ),
    declaration = True,
    source_map = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        "@npm_core//@types/node",
        "@npm_core//tslib",
    ],
)
