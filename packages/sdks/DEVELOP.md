# Develop

## Setup

```bash
# install
yarn

# start dev server
yarn run start
```

You might need [jq](https://stedolan.github.io/jq/) for symlinking mitosis or the SDKs themselves to examples. You can install that with `brew install jq`.

## Test changes

The best way to test changes is to symlink the generated SDKs to one of our examples. The recommended workflow is to

- symlink both Vue & RN SDKs to their respective examples
- run the examples on separate ports (e.g. 3000 and 3001)
- Launch Builder and open the SDK org (ID: `f1a790f8c3204b3b8c5c1795aeac4660`)
- toggle back and forth between `localhost:3000` and `localhost:3001` to quickly test both outputs at once (or open 2 separate tabs, each pointing to a different server)

### Vue

```bash
# navigate to the Vue Storefront example in a separate terminal
cd ../../examples/vue/vue-storefront-2

# add sym-link
yarn run setup-sdk-symlink

# install
yarn

# run nuxt
yarn run start
```

### React-Native

```bash
# navigate to the react-native example in a separate terminal
cd ../../examples/react-native

# add sym-link
yarn run setup-sdk-symlink

# install
yarn

# run Expo
yarn run start

w # type `w` to launch web browser emulator
i # type `i` to launch iOS simulator
```

#### iOS Simulator

One big caveat is that the iOS Simulator does not support sym-linked packages. To workaround this, you will have to copy the SDK folder. This means that you will need to manually do so every time you want a new change to be reflected. in the react-native example, there is a handy `yarn run cp-sdk` command to do that for you.

## Mitosis

All the above assumes you are using the latest version of Mitosis in production. If you need to use a local version with some not-yet-merged changes, here are the steps:

- Clone and setup https://github.com/BuilderIO/mitosis/ as a sibling to this repo: (e.g. `my-code/builder/` and `my-code/mitosis`)
- Follow its [setup steps](https://github.com/BuilderIO/mitosis/blob/main/developer.md)
- run the `yarn run start` commands in both `mitosis/packages/core` and `mitosis/packages/cli`
- Now, in this repo, run `yarn run add-symlinks`

You should now be using your local version of Mitosis.

## REMOVING SYM-LINKS

**IMPORTANT:** remember to run `yarn run remove-symlinks` before you commit to your branch. This applies to `project/sdks`, but also any example that you symlink the SDKs to (i.e. vue-storefront or react-native examples)
