# Builder.io & Next.js integration example with AMP support

Check the comments in `pages/index.js` for all the technical details. You will need a Builder.io API key and some content with the proper URLs set up.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server (note the Builder.io API key):

```bash
REACT_APP_BUILDER_API_KEY="your-api-key-goes-here" npm run dev
# or
REACT_APP_BUILDER_API_KEY="your-api-key-goes-here" yarn dev
```

Alternatively, you can just add the API key to an `.env` file in the root (where the `package.json` file is):

```
# This is the contents of the `.env` file
REACT_APP_BUILDER_API_KEY="your-api-key-goes-here"
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Add `?amp=1` to switch the content to AMP mode.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Builder.io Documentation](builder.io/c/docs/) - Learn about [Builder.io](https://builder.io).
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
