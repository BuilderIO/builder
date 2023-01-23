# Builder.io example with Remix

This example uses [React SDK](/packages/react) with Remix [Remix Docs](https://remix.run/docs).

## Builder.io Setup

- log into builder.io
- from your account page, copy your API key and paste it into BUILDER_API_KEY in `app/routes/$slug.tsx`
- open the Builder.io Visual Editor for the model named "page"
- enter http://localhost:3000/remix in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

Checkout this Loom for a visual walkthrough: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd (it's originally intended for React-Native, but all of the steps are still the exact same)

## Deployment

After having run the `create-remix` command and selected "Vercel" as a deployment target, you only need to [import your Git repository](https://vercel.com/new) into Vercel, and it will be deployed.

If you'd like to avoid using a Git repository, you can also deploy the directory by running [Vercel CLI](https://vercel.com/cli):

```sh
npm i -g vercel
vercel
```

It is generally recommended to use a Git repository, because future commits will then automatically be deployed by Vercel, through its [Git Integration](https://vercel.com/docs/concepts/git).

## Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

If you're used to using the `vercel dev` command provided by [Vercel CLI](https://vercel.com/cli) instead, you can also use that, but it's not needed.
