# Builder.io & Next.js integration example with AMP support

This is a [Next.js](https://nextjs.org/) project with amp support.

## Get Started

### Install the Builder.io cli

```
npm install @builder.io/cli -g
```

### Clone this repo

using git

```
git clone https://github.com/BuilderIO/builder
```

### Generate your Builder.io space

<!-- TODO: link "private key" to a forum post or doc showing how to create that -->

[Signup for Builder.io](builder.io/signup), then go to your [organization settings page](https://builder.io/account/organization?root=true), create a private key and copy it, then create your space and give it a name

```
cd examples/next-js-amp
builder create -k [private-key] -n [space-name] -d
```

This command when done it'll print your new space's public API key, copy it and add it as the value for `BUILDER_PUBLIC_KEY` into the .env files (create a file named .env)

```
BUILDER_PUBLIC_KEY=...
```

Now you have to do is start up the project now and start building in Builder.
```
npm install
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Builder.io Documentation](builder.io/c/docs/) - Learn about [Builder.io](https://builder.io).
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
