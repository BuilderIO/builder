# Builder Personalization Utils

A collection of handy utilities when working with delivering personalized Builder content at the edge.

```
npm install @builder.io/personalization-utils
```

# How to start with personalized rewrites? 

 This utility library helps you encode/decode targeting attributes as parts of the URL to allow for caching (or statically generating) render results, it should be used in middleware in combination with a page path handler (for e.g a catch all page `pages/[[...path]].jsx`):

```ts
import { parsePersonalizedURL } from '@builder.io/personalization-utils/next'
// in pages/[[...path]].jsx
export async function getStaticProps({ params }) {
  const { attributes } = parsePersonalizedURL(params?.path);
  const page =
    (await builder
      .get('page', {
        apiKey: builderConfig.apiKey,
        userAttributes: attributes,
        // cachebust is not advised outside static rendering contexts.
        cachebust: true,
      })
      .promise()) || null

  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 1 second
    revalidate: 1,
  }
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export default function Path({ page }) {
  return  <BuilderComponent model="page" content={page} />
}
```

Now that we have a path for rendering builder content ready, let's route to it in the middleware:
```ts
import { getPersonalizedURL } from '@builder.io/personalization-utils/next'

const excludededPrefixes = ['/favicon', '/api'];

export default function middleware(request) {
  const url = request.nextUrl
  if (shouldRewrite(url.pathname)) {
    const personalizedURL = getPersonalizedURL(request)
    return NextResponse.rewrite(personalizedURL)
  }
  return NextResponse.next();
}

```

Great now that we have the personalized routes ready all we need to do is set the corresponding cookie for any of the targeting attributes we have in builder:
```ts
  const audience = await myCDP.identifyAudience(userID);
  setCookie(`builder.userAttributes.audience`, audience)
```
Once the cookie is set, all builder content matching from now on will weigh in the current audience segment.



