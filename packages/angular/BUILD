load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm_angular//ng-packagr:index.bzl", "ng_packagr")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "angular",
    srcs = glob(
        ["src/**/*.ts"],
        exclude = ["**/*.spec.ts"],
    ),
    declaration = True,
    source_map = True,
    tsconfig = "//:tsconfig.json",
    deps = [
        "//packages/core",
        "@npm_angular//@angular/common",
        "@npm_angular//@angular/core",
        "@npm_angular//@angular/elements",
        "@npm_angular//@angular/platform-browser",
        "@npm_angular//@angular/platform-browser-dynamic",
        "@npm_angular//@angular/platform-server",
        "@npm_angular//@angular/router",
        "@npm_angular//@nguniversal/express-engine",
        "@npm_angular//@nguniversal/module-map-ngfactory-loader",
        "@npm_angular//@types/express",
        "@npm_angular//express",
    ],
)

ng_packagr(
    name = "ng-pkg",
    args = [
        "-p",
        "packages/angular/ng-package.js",
        "-c",
        "tsconfig.json",
        "$(@D)"
    ],
    data = [
        "@npm_angular//@angular/core",
        "@npm_angular//@angular/router",
        "@npm_angular//@angular/common",
        "@npm_angular//@angular/compiler-cli",
        "@npm_angular//@angular/platform-browser",
        "@npm_angular//@angular/platform-browser-dynamic",
        "@npm_angular//@angular/platform-server",
        "@npm_angular//@nguniversal/express-engine",
        "@npm_angular//express",
        "@npm_angular//@types/express",
        "//packages/core",
        ":package.json",
        ":ng-package.js",
        "//:tsconfig.json",
    ] + glob(
        [
            "src/**/*.ts",
            "src/**/*.html",
            "src/**/*.css",
        ],
        exclude = ["**/*.spec.ts"],
    ),
    output_dir = True,
)

pkg_npm(
    name = "pkg",
    substitutions = {"//internal/": "//"},
    deps = [
        ":ng-pkg",
    ],
)
