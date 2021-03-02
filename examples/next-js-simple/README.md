# Next.js + Builder.io Minimal Starter

Learn more about Builder.io + Next.js [here](https://www.builder.io/c/docs/getting-started?codeFramework=next)

## Get Started

### Clone this repo

```
git clone https://github.com/BuilderIO/builder.git
cd builder/examples/next-js-simple
```

### Generate your Builder.io space

<!-- TODO: link "private key" to a forum post or doc showing how to create that -->

[Signup for Builder.io](builder.io/signup), then go to your [organization settings page](https://builder.io/account/organization?root=true), create a blank space, and copy its [public API Key](https://builder.io/account/space) and add it as the value for `BUILDER_PUBLIC_KEY` into the .env files (`.env.production` and `.env.development`);

```
BUILDER_PUBLIC_KEY=...
```

### Install dependencies

```
npm install
```

### Run the dev server

```
npm run dev
```

A development server will start on `http://localhost:3000`

Go to your [new space settings](https://builder.io/account/space) and change the site url to your localhost `http://localhost:3000` for site editing. [Learn more about setting up preview URLs](https://www.builder.io/c/docs/guides/preview-url)

Create a new page entry, assign any URL (can be nested `/sub/path/to/page`), publish and preview.

### Deploy

You can deploy anywhere you like, but for this project we recommend [Vercel](https://nextjs.org/docs/deployment).
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fbuilderio%2Fbuilder%2Ftree%2Fmaster%2Fexamples%2Fnext-js-simple)
