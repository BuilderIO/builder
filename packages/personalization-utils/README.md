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

```typescript
const audience = await myCDP.identifyAudience(userID);
// this will include the `audience` in all api calls and save it in a cookie `builder.userAttributes`
builder.setUserAttributes({ audience })
```

Once the cookie is set, all builder content matching from now on will weigh in the current audience segment.

## Using trimHtml for Dynamic Containers

The `trimHtml` function is a utility for handling dynamic personalization containers in your HTML content. It's particularly useful for processing personalized content at the edge or in server-side rendering scenarios.

### Usage

```typescript
import { trimHtml } from '@builder.io/personalization-utils'

const fullHTML = '... your full HTML string with personalization containers ...';
const userAttributes = {
  audience: 'segment-a',
  date: '2023-06-15T12:00:00Z'
};

const trimmedHTML = trimHtml(fullHTML, userAttributes);
```

To get the `userAttributes`, you should parse the `builder.userAttributes` cookie. Here's an example of how you might do this:

```typescript
import { parse } from 'cookie'

function getUserAttributes(req) {
  const cookies = parse(req.headers.cookie || '');
  const builderAttributes = cookies['builder.userAttributes'];
  return builderAttributes ? JSON.parse(builderAttributes) : {};
}

// Then in your request handler:
const userAttributes = getUserAttributes(req);
const trimmedHTML = trimHtml(fullHTML, userAttributes);
```

The `trimHtml` function processes the HTML, evaluates personalization containers against the provided user attributes, and returns a new HTML string with the appropriate personalized content.

This approach allows you to deliver personalized content while still leveraging edge caching or static site generation, as the personalization logic is applied after the initial HTML is generated.
