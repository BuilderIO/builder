# Builder.io & Next.js integration example with AMP support

This is a [Next.js](https://nextjs.org/) project with amp support.

## Getting Started

**Pre-requisites**

This guide will assume that you have the following software installed:

- nodejs
- npm or yarn
- git

**Introduction**
After following this guide you will have your own Builder.io space with a an amp-page model and sample content configured and ready to use.

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

![Example of how to get your private key](https://raw.githubusercontent.com/BuilderIO/nextjs-shopify/master/docs/images/private-key-flow.png)

### 3: Clone this repository and initialize a Builder.io space

Next, we'll create a copy of the starter project, and create a new
[space](https://www.builder.io/c/docs/spaces) for it's content to live
in.

In the example below, replace `<private-key>` with the key you copied
in the previous step, and change `<space-name>` to something that's
meaningful to you -- don't worry, you can change it later!

```
git clone https://github.com/BuilderIO/builder
cd builder/examples/next-js-amp

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

|████████████████████████████████████████| amp-page | 1/1

Your new space "...." public API Key: 1234795283492198789217893712893
```

Copy the public API key ("1234795283492198789217893712893" in the example above) and use it in in your .env file.

```shell
   BUILDER_PUBLIC_KEY=1234795283492198789217893712893 <-- replace this with your API Key
   ```

Now you have to do is start up the project now and start building in Builder.
```
npm install
npm run dev
```

[Click here](https://test-pied-iota.vercel.app/) to view a demo of this example deployed on Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Builder.io Documentation](builder.io/c/docs/) - Learn about [Builder.io](https://builder.io).
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
