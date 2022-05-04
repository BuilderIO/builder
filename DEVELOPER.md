# DEVELOPER

## Setting up the environment

> NOTE: This repo is currently in the transition to the `bazel` build system. Only `bazel` developer information is documented here.

The repo uses `bazel` for building. Best way to run `bazel` is with [`bazelisk`](https://github.com/bazelbuild/bazelisk) which will automatically download and execute the right version of `bazel`.

_preferred way_

```
brew install bazelisk
```

or

```
npm install -g @bazel/bazelisk
```

`Bazel` will invoke `NPM` and manage all dependencies.

> NOTE: `Bazel` has an outstanding [issue](https://github.com/bazelbuild/rules_nodejs/pull/2657) which fails to see `peerDependencies` Use `--nocheck_visibility` to work around it for now.

## Building

```
bazel build packages/angular --nocheck_visibility
```

## Publishing

```
bazel run packages/angular:pkg.publish --nocheck_visibility -- --tag=next
```

## Discovering Targets

Sample queries

```
bazel query 'packages/...' --output label
bazel query @nodejs//...
```

## NPM

Bazel usually takes care of installing npm dependencies etc. So usually, there is no need to do `npm install`. It is possible to run Bazel`s version of NPM like so:

```
bazel run @nodejs//:npm install
```

> NOTE: Current working directory location determines which repo you install.
