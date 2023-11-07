# Steps

## Setup: authentication

Make sure that you are authenticated to publish on `yarn`. To do that, run `yarn npm login` and follow the instructions.

## 1- Update `CHANGELOG.md`

Before publishing, make sure to update the `CHANGELOG.md` inside `packages/core` and/or `packages/react`, depending on where the change was made.

## 2- Release Core

in `packages/core`, run `yarn run release:patch` (or `release:minor`, `release:major`)

## 3- Release React

in `packages/react`, run `yarn run release:patch` (or `release:minor`, `release:major`)
