# Builder Personalization Utils

A collection of handy utilities when working with delivering personalized Builder content at the edge.

```
npm install @builder.io/personalization-utils
```

# How to start with personalized rewrites? 

`PersonalizedURL` identifies the current personalization target based on attributes in cookies, headers, query, and origin URL path, it should be used in middleware in combination with a page path handler defined in `pages/builder/[rewrite].jsx`:

```ts
// in pages/builder/[rewrite].jsx
export async function getStaticProps({ params }) {
  const personlizedURL = PersonalizedURL.fromRewrite(params.rewrite);
  const page =
    (await builder
      .get('page', {
        apiKey: builderConfig.apiKey,
        userAttributes: personlizedURL.attributes,
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

export default function Rewrite({ page }) {
  return  <BuilderComponent renderLink={Link} model="page" content={page} />
}
```

Now that we have a path for rendering builder content ready, let's route to it in the middleware:
```ts
import { NextResponse } from 'next/server'
import { PersonalizedURL } from '@builder.io/personalization-utils'

const excludededPrefixes = ['/favicon', '/api'];

export default function middleware(
  request: NextFetchEvent
) {
  const url = request.nextUrl
  let response = NextResponse.next();
  if (!excludededPrefixes.find(path => url.pathname?.startsWith(path))) {
    const query = Object.fromEntries(url.searchParams);
    const personlizedURL = new PersonalizedURL({
      pathname: url.pathname,
      attributes: {
        // optionally add geo information to target by city/country in builder
        city: request.geo?.city || '',
        country: request.geo?.country || '',
        // pass cookies and query [read all values for keys prefixed with `builder.userAttributes`], useful for studio tab navigation and assigning cookies to targeting groups
        ...getUserAttributes({ ...request.cookies, ...query }),
      }
    })

    url.pathname = personlizedURL.rewritePath();
    response = NextResponse.rewrite(url);
  }
  return response
}

```

Great now that we have the personalized routes ready all we need to do is set the corresponding cookie for any of the targeting attributes we have in builder:
```ts
  const audience = await myCDP.identifyAudience(userID);
  setCookie(`builder.userAttributes.audience`, audience)
```
Once the cookie is set, all builder content matching from now on will weigh in the current audience segment.



