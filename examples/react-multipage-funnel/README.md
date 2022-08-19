## Builder.io example with React

### Quick start

[Open this example in Codesandbox](https://codesandbox.io/s/github/BuilderIO/builder/tree/main/examples/react-multipage-funnel)

<a target="_blank" href="https://codesandbox.io/s/github/BuilderIO/builder/tree/main/examples/react-multipage-funnel">
  <img width="597" height="375" src="https://i.imgur.com/zue72Q0.jpg">
</a>

### To run the example Locally

```bash
git clone https://github.com/BuilderIO/builder.git
cd examples/react
npm install
npm start
```

## Getting Started

**Pre-requisites**

This guide will assume that you have the following software installed:

- nodejs
- npm or yarn
- git

**Introduction**
After following this guide you will have your own Builder.io space with a multipage funnel configured and ready to use.

### 1: Create an account for Builder.io

Before we start, head over to Builder.io and [create an account](https://builder.io/signup).

### 2: Your Builder.io private key

Head over to your [organization settings page](https://builder.io/account/organization?root=true) and create a
private key, copy the key for the next step.

- Visit the [organization settings page](https://builder.io/account/organization?root=true), or select
  an organization from the list

* Click "Account" from the left hand sidebar
* Click the edit icon for the "Private keys" row
* Copy the value of the auto-generated key, or create a new one with a name that's meaningful to you

![Example of how to get your private key](https://raw.githubusercontent.com/BuilderIO/nextjs-shopify/main/docs/images/private-key-flow.png)

### 3: Clone this repository and initialize a Builder.io space

Next, we'll create a copy of the starter project, and create a new
[space](https://www.builder.io/c/docs/spaces) for it's content to live
in.

In the example below, replace `<private-key>` with the key you copied
in the previous step, and change `<space-name>` to something that's
meaningful to you -- don't worry, you can change it later!

```
git clone https://github.com/BuilderIO/builder
cd builder/examples/react-multipage-funnel

npm install --global "@builder.io/cli"

builder create --key "<private-key>" --name "<space-name>" --debug
```

If this was a success you should be greeted with a message that
includes a public API key for your newly minted Builder.io space.

_Note: This command will also publish some starter builder.io cms
content from the ./builder directory to your new space when it's
created._

```bash
  ____            _   _       _                     _                    _   _
| __ )   _   _  (_) | |   __| |   ___   _ __      (_)   ___       ___  | | (_)
|  _ \  | | | | | | | |  / _` |  / _ \ | '__|     | |  / _ \     / __| | | | |
| |_) | | |_| | | | | | | (_| | |  __/ | |     _  | | | (_) |   | (__  | | | |
|____/   \__,_| |_| |_|  \__,_|  \___| |_|    (_) |_|  \___/     \___| |_| |_|

|████████████████████████████████████████| multipage-funnel | 1/1
|████████████████████████████████████████| funnel-section: writing section-three.json | 1/3

Your new space "...." public API Key: 1234795283492198789217893712893
```

Copy the public API key ("1234795283492198789217893712893" in the example above) and use it in `src/index.js.
