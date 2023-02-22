# Localization with Next.js

This example walks you through setting up i18n internationalization with Next.js and localization techniques with Builder.io

## Localizing your Next.js App

This demo starts from the [next-js-simple](https://github.com/BuilderIO/builder/tree/main/examples/next-js-simple) starter. Install the React SDK >= v2.0.5

```
npm install @builder.io/react@latest
```

Then add the `i18n` config to your `next.config.js` file. We’ll use sub-path routing in this example. For more information on internationalized routing in Next.js see this article: https://nextjs.org/docs/advanced-features/i18n-routing

```javascript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
	}
}

// With this configuration if you have a pages/blog.js it will 
// route to /blog, /fr/blog, and /de/blog
```

Now you should be able to access `locale` in the context of `getStaticProps` and pass it to `options` in your `builder.get()` call. This allows Builder’s API to automatically resolve the locale on custom components with localized inputs.

We also want to return the locale from `getStaticProps` so we can pass it to the `locale` prop of the `<BuilderComponent/>` in the page component. Similarly, this will allow the preview in the Visual Editor to auto resolve content client-side to the proper locale. Your `[[...page]].tsx` should look something like this:

```javascript
// [[...page]].tsx

export async function getStaticProps({
  params,
  locale,
}: GetStaticPropsContext<{ page: string[] }>) {
  const page =
    (await builder
      .get('page', {
        userAttributes: {
          urlPath: '/' + (params?.page?.join('/') || ''),
        },
        options: { 
          locale 
        }
      })
      .toPromise()) || null

  return {
    props: {
      page,
      locale,
    },
    revalidate: 5,
  }
}

export async function getStaticPaths() {
  const pages = await builder.getAll('page', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  })

  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: true,
  }
}

export default function Page({
  page,
  locale,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isPreviewingInBuilder = useIsPreviewing()
  const show404 = !page && !isPreviewingInBuilder

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {!page && <meta name="robots" content="noindex" />}
      </Head>
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <BuilderComponent 
          model="page" 
          content={page} 
          locale={locale}
        />
      )}
    </>
  )
}
```

## Localizing Custom Components

You can enable localized input fields in your custom components by setting `localized: true`. Localized inputs will resolve to the correct locale, returning a single value with a type of the input type. Try it out with `string`, `richText`, or `file` [input types](https://www.builder.io/c/docs/custom-components-input-types) and more!

Here is an example of a Heading component with a localized text field:

```javascript
// Heading.tsx

export const Heading = (props: { title: string; }) => {

  return(
    <div style={{'width': '50vw'}}>
      <h1>{props.title}</h1>
    </div>
  )
}

Builder.registerComponent(Heading, {
  name: "Heading",
  inputs: [
    {
      localized: true,
      name: "title",
      type: "text", 
      defaultValue: 'I am a heading!'
    },
  ],
});
```

## Setting Up Locales in Builder

In your **Account Settings** select **Custom Targeting Attributes** and enter a new attribute called locale of type string and enum. Add values for each of your locales. For more information see [here](https://www.builder.io/c/docs/add-remove-locales).

![Custom Targeting Attributes](https://cdn.builder.io/api/v1/image/assets%2F1a1fa54d8e524869b186d6dd63e1aeac%2F08518f0fad514e8e9b7763d25f6b8109)

At this point you’re all set up for several localization methods including localized components, [localized text blocks](https://www.builder.io/c/docs/localization-by-block), and [localizing multiple blocks](https://www.builder.io/c/docs/localization-grouped). For more information on localizing whole pages see [here](https://www.builder.io/c/docs/localization-whole-page).

## Demo
Check out this Loom for a walkthrough:
https://www.loom.com/share/d3920742e46f41388f2b1a182f719c28