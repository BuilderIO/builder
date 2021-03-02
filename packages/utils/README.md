# Builder Utils

A collection of handy utilities when working with Builder content

## getAsyncProps

For cases where you want to render Builder content server side with custom data included at server side render time, you can use our `getAsyncProps` helper

### Example

Say you have a component that takes input props and also feteches data sync

```tsx
import { Builder } from '@builder.io/react';

export function Products(props) {
  const data = props.data || useProductData(props.category);
  return <>{data.products.map(/*...*/)}</>;
}

Builder.registerComponent(Products, {
  name: 'Products',
  inputs: [{ name: 'category', type: 'string', enum: ['men', 'women'] }],
});
```

This component will update to fetch product data browser side by category chosen in the Builder editor. But if you want this to render server side you need `props.data` to be passed with the needed data on render.

To accomplish this, you can use `getAsyncProps`.

Here is a usage example with Next.js:

```tsx
import { Builder, builder } from '@builder.io/react';
import { getAsyncProps } from '@builder.io/utils';

export default function MyPage(props) {
  return <BuilderComponent model="page" content={props.content} />;
}

export async function getStaticProps(context) {
  const content = await builder.get('page', { url: context.resolvedUrl }).promise();

  await getAsyncProps(content, {
    async Products(props) {
      return {
        data: await fetch(`${apiRoot}/products?cat=${props.category}`).then(res => res.json()),
      };
    },
  });

  return { props: { content } };
}
```

## extendAsyncProps

`extendAsyncProps` works by extending any component options (props) that matches the mapper asynchrnously.

### Example

Say you have multiple components that take a query input and you want to resolve this query asynchronusly before rendering on the server

```tsx
import { Builder } from '@builder.io/react';

export function ProductGrid(props) {
  const products = props.products || useProductData(props.productsQuery);
  return <>{products.map(/*...*/)}</>;
}
const customQueryInput = {
  name: 'productsQuery',
  type: 'object',
  helperText: 'shopify products query input ',
  defaultValue: {
    sortBy: 'RELEVANCE',
    first: 3,
    query: 'shirt',
  },
  subFields: [
    {
      type: 'string',
      name: 'query',
      helperText: 'for syntax check https://shopify.dev/concepts/about-apis/search-syntax',
    },
    {
      type: 'enum',
      name: 'sortBy',
      enum: [
        {
          label: 'product ID',
          value: 'ID',
        },
        {
          label: 'Date of creation',
          value: 'CREATED_AT',
        },
      ],
    },
    {
      type: 'number',
      name: 'first',
    },
    {
      type: 'number',
      name: 'last',
    },
    {
      type: 'boolean',
      name: 'reverse',
    },
  ],
}
Builder.registerComponent(Products, {
  name: 'ProductGrid', inputs: [customQueryInput}]
})
// another component
Builder.registerComponent(ProductsSlider, {
  name: 'ProductsSlider', inputs: [customQueryInput}]
})

```

This component will update to fetch product data browser side by query chosen in the Builder editor. But if you want this to render server side you need `props.products` to be passed with the needed data on render.

To accomplish this, you can use `extendAsyncProps`.

Here is a usage example with Next.js:

```tsx
import { Builder, builder } from '@builder.io/react';
import { extendAsyncProps } from '@builder.io/utils';

export default function MyPage(props) {
  return <BuilderComponent model="page" content={props.content} />;
}

export async function getStaticProps(context) {
  const content = await builder.get('page', { url: context.resolvedUrl }).promise();

  await extendAsyncProps(content, {
    async productsQuery(props) {
      return {
        products: await fetch(
          `${apiRoot}/products?${qs.stringify(props.productsQuery)}`
        ).then(res => res.json()),
      };
    },
  });

  return { props: { content } };
}
```
