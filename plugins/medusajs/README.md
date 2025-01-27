# Builder.io Medusa JS Api plugin

Easily connect your Medusa Js Commerce API to your Builder.io content!

## Setup Medusa Js API Access

You'll be prompted to enter the following data:

* baseUrl
* publishableKey

## Custom targeting

Custom targeting in Builder.io allow users to target content by a multitude of attributes, and in this plugin you'll be able to add specific content from Medusa products, for this you'll need first to set the target attributes on the host site, either by setting the `userAttributes` if you're rendering client side:

```ts
// example for fetching content specific for a product in a product details page
const productFooterContent = await builder.get('product-footer', {
  userAttributes: {
    product: product.productId,
  }
})
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

### Custom Components and input types

Once you install the plugin, you will also be able to use the Medusa types as inputs for your components, such as:

- ***MedusaProduct*** when used as an input type, you will be able to search and select a specific Product to provide to your component and consume the product data however you want from inside the component.
- ***MedusaCollection*** when used as an input type, you will be able to search and select a specific collection of products to provide to your component, as example you can fetch products from a specific collection from inside your component.
- ***MedusaCategory*** when used as an input type, you will be able to search and select a specific category of products to provide to your component, as example you can fetch products from a specific category from inside your component.
- ***MedusaProductHandle*** when used as an input type, you will be able to search and select a specific Product  Handle to provide to your component and consume the product however you want from inside the component.
- ***MedusaCollectionHandle*** when used as an input type, you will be able to search and select a specific collection Handle to provide to your component, as example you can fetch products from a specific collection Handle from inside your component.
- ***MedusaCategoryHandle*** when used as an input type, you will be able to search and select a specific category  Handle to provide to your component, as example you can fetch products from a specific category Handle from inside your component.
- ***MedusaProductList*** when used as an input type, it enables users to select multiple products to provide to your component. As an example you can select multiple products and display them on a grid.
- ***MedusaCollectionList*** when used as an input type enables users to select multiple collections to provide to your component.
- ***MedusaCategoryList*** when used as an input type enables users to select multiple categories to provide to your component.

#### Example of a Custom Component with Medusa input types:

Example of a custom component called 'SectionBlog' that receives  MedusaProduct, MedusaCategory and MedusaCollection as inputs:

```JSX
export const inputData = {
  name: "SectionBlog",
  isRSC: true,
  inputs: [
    {
      name: "medusaProduct",
      type: "MedusaProduct",
    },
    {
      name: "medusaProductHandle",
      type: "MedusaProductHandle",
    },
    {
      name: "medusaProductList",
      type: "MedusaProductsList",
    },
    {
      name: "medusaCollection",
      type: "MedusaCollection",
    },
    {
      name: "medusaCollectionHandle",
      type: "MedusaCollectionHandle",
    },
    {
      name: "medusaCollectionList",
      type: "MedusaCollectionsList",
    },
    {
      name: "medusaCategory",
      type: "MedusaCategory",
    },
    {
      name: "medusaCategoriesHandle",
      type: "MedusaCategoryHandle",
    },
    {
      name: "medusaCategoryList",
      type: "MedusaCategoriesList",
    },
  ],
}
```

To understanding more about custom components also see [this article](https://www.builder.io/c/docs/custom-components-setup).

### Fetch Content and References

You can check more about how to fetch content from [builder.io](https://builder.io) and also see how the option ``includeRefs=true`` works, fecthing any specific content from a given reference, such as a chosen MedusaProduct in the example above to support server side rendering.

### Auto-resolving the Product/Categories data

In an effort to support SSR and making sure all the input data are available at the time of render, Builder’s support the resolving of the inputs for your custom components, for example if you have a product box with input of ``MedusaProduct`` you can get the json value of that product by passsing includeRefs: true when you fetch the content json:

```JSX
const page = await builder.get('page', {
  url: '...',
  options: {
    includeRefs: true
  }
})
```

Also passing the same option to the rendering component to auto-resolve while editing:

```JSX
<BuilderComponent model="page" options={{ includeRefs: true}} content={page} />
```

For more information on the available options check [Content API documentation](https://www.builder.io/c/docs/query-api).
