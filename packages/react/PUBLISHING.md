# Steps

## Setup: authentication

Make sure that you are authenticated to publish on `yarn`. To do that, run `yarn npm login` and follow the instructions.

## 1- Update `CHANGELOG.md`

Before publishing, make sure to update the `CHANGELOG.md` inside `packages/core` and/or `packages/react`, depending on where the change was made. If React, React DOM, or a Next.js integration changes its peer range, CI fixture, or upstream maintenance status, review the [framework version matrix](../sdks/README.md#framework-version-guidance) with the SDK and support owners. A combination that passes a CI E2E fixture is approved; record it before updating the matrix, this package's README, and the public developer docs. Run `yarn check:framework-support` from the repo root; do not infer active support from a permissive peer range.

## 2- Release Core

in `packages/core`, run `yarn run release:patch` (or `release:minor`, `release:major`)

## 3- Release React

in `packages/react`, run `yarn run release:patch` (or `release:minor`, `release:major`)
