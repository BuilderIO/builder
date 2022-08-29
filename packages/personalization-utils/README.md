# Builder Personalization Utils

A collection of handy utilities when working with delivering personalized Builder content at the edge.

```
npm install @builder.io/personalization-utils
```

# How to start with personalized rewrites? 

`PersonalizedURL` identifies the current personalization target based on attributes in cookies, headers, query, and origin URL path, it should be used in middleware in combination with a page path handler defined in `pages/builder/[hash].jsx`:

```ts
import { getUserAttributesFromHash } from '@builder.io/personalization-utils/next'
// in pages/builder/[hash].jsx
export async function getStaticProps({ params }) {
  const attributes = getUserAttributesFromHash(params.hash);
  const page =
    (await builder
      .get('page', {
        apiKey: builderConfig.apiKey,
        userAttributes: attributes,
        cachebust: true,
      })
      .promise()) || null

  return {
    props: {
      page,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    revalidate: 5,
  }
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export default function Hash({ page }) {
  return  <BuilderComponent model="page" content={page} />
}
```

Now that we have a path for rendering builder content ready, let's route to it in the middleware:
```ts
import { getPersonlizedURL } from '@builder.io/personalization-utils/next'

const excludededPrefixes = ['/favicon', '/api'];

export default function middleware(request) {
  const url = request.nextUrl
  if (shouldRewrite(url.pathname)) {
    const personalizedURL = getPersonlizedURL(request)
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



