# Next.js + Builder.io On-Demand ISR
Example of generating pages with Builder using Next.js ISR with [on-demand revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation).

## Prerequisites

Before using this example, make sure you have the following:

- A [Builder.io](https://builder.io) account. Check out the [plans](https://www.builder.io/m/pricing), which range from our free tier to custom.
- [npm](https://www.npmjs.com/)

A basic understanding of the following is helpful too:

- The [command line](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line)
- JavaScript and [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- What it means to [clone a GitHub repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)

## Overview

To use this project, you need to do three things:

1. Get a copy of this repo.
1. Create a corresponding space in your account on [Builder.io](builder.io).
1. Connect the two.

The next sections walk you through each step.

### Clone this project

This example provides you with a ready-made application that you can copy locally and configure for use with your Builder.io account.

1. At the command line, run the following command to create a local copy of the Builder.io repo:

   ```shell
   git clone https://github.com/BuilderIO/builder.git
   ```

1. Change into the example application by using the `cd` command:

   ```shell
   cd builder/examples/next-js-on-demand-isr
   ```

1. Open this directory in your favorite code editor.
   You'll come back here when you're ready to connect your application to your Builder space.

### Connecting Builder.io to your application

To connect your Builder.io space and your application, set the model preview URL and get your API key as follows:

#### Setting the model preview URL
To enable Builder to open your site in the visual editor, you will need to provide a URL that we can open which has the Builder rendering component in it.

Go to the [/models](https://builder.io/models) page in Builder and choose your **page** model.

Then, set the Preview URL to http://localhost:3000. Be sure to include the http://.

![Image showing where to put the Preview URL](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5c26e2c8b4ec437aaef196c8d4e32fc3)

**Note: once you deploy your updates, you will want to update this to a public URL, such as your live site or your staging site (e.g. `https://your-site.com`), so anyone on your team can connect to your site for visual editing**

#### Getting your API Key

In the [Account settings](https://builder.io/account/space), copy your Public API Key. We're going to paste the API Key into your Next.js app in the next section.

![Image showing where to get your API Key](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F761e521019724d8bbd59ed0d5f079c8e)


In your code editor, configure `.env` with the [Public API Key](https://builder.io/account/space) by adding a line to each file as follows, but using your Public API Key that you copied in the previous step.
   For example:

   ```shell
   BUILDER_PUBLIC_KEY=08837cee608a405c806a3bed69acfe2d <-- replace this with your API Key
   ```

#### Setting up revalidation webhook
- add a random `REVALiDATE_SECRET` to your `.env` file
- Go to your [page model setting](https://builder.io/models)
- Click on `page` model, `show advanced options`, and then `edit webhooks`.
- Point the webhook to the API endpoint, this can be localhost if you'd like, make sure to disable proxying as in the screenshot and pass the secret as a query param: `http://localhost:3000/api/revalidate?secret=.....`.
<figure>
    <img src="https://cdn.builder.io/api/v1/image/assets%2F2147724041d04a2e91ccee14347a9469%2Ff5367e1956c0425cba81f971a98034f6" alt="Dialogue for creating a new webhook on a model" width="400" style="display: block; margin: auto"/>
</figure>

- You're all set now, to test try updating, publishing, deleting content from builder.


## Running your application

To serve your application locally, install dependencies, serve, and view your preview.

1. Install dependencies by entering the follw\owing at the command line.

   ```
   npm install
   ```

1. Serve your application by running the following at the command line:

   ```
   npm run dev
   ```

1. In your browser, go to `http://localhost:3000` to see your application.

### Experimenting

Now that you have a configured Builder.io application, you can try different features, such as creating a page.
Create a new page entry, assign any URL, publish and preview.
For more detail and ideas on creating pages, see [Creating a landing page in Builder
](https://www.builder.io/c/docs/creating-a-landing-page).

### Deploy

You can deploy anywhere you like, but for this project we recommend [Vercel](https://nextjs.org/docs/deployment).
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fbuilderio%2Fbuilder%2Ftree%2Fmaster%2Fexamples%2Fnext-js-on-demand-isr)

## Next steps

- Learn how to [use your react components in our visual editor](https://www.builder.io/c/docs/custom-react-components)
- For more information on previewing your applications, see [Editing and previewing directly on your site](https://www.builder.io/c/docs/guides/preview-url).
- See [Getting started with the visual editor](https://www.builder.io/c/docs/guides/page-building) for an introduction to editing your pages without having to code.
- Check out [Builder best practices](https://www.builder.io/c/docs/best-practices) for guidance on how to approach site development with Builder.
