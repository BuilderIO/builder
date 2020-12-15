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
  name: 'Products', inputs: [{ name: 'category', type: 'string', enum: ['men', 'women'] }]
})
```

This component will update to fetch product data browser side by category chosen in the Builder editor. But if you want this to render server side you need `props.data` to be passed with the needed data on render.

To accomplish thisk, you can use `getAsyncProps`. 

Here is a usage example with Next.js:

```tsx
import { Builder, builder } from '@builder.io/react';
import { getAsyncProps } from '@builder.io/utils';

export default function MyPage(props) {
  return <BuilderComponent model="page" content={props.content} />
}

export async function getStaticProps(context) {
  const content = await builder.get('page', { url: context.resolvedUrl }).promise();
  
  await getAsyncProps(content, {
    async Products(props) {
      return {
        data: await fetch(`${apiRoot}/products?cat=${props.category}`).then(res => res.json())
      }
    }
  })

  return { props: { content } }
}
```