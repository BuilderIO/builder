# Builder.io Commerce Layer Plugin

Easily connect your Commerce Layer products to your Builder.io content!

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and press on `@builder.io/plugin-commercelayer` in the list of plugins, then hit save. You'll be prompted for your Commerce Layer credentials:
- Client ID
- Client Secret (optional - required for integration tokens to access all markets)
- Market Scope (e.g., 'market:all' for integrations, 'market:id:YOUR_MARKET_ID' for sales channels)

## Features

The plugin provides new field types for your Builder.io models and data connection capabilities:

### Product Fields

- `Commerce Layer Product` - Search and select products from your Commerce Layer catalog
- `Commerce Layer Product Preview` - Preview product templates with live data

### Connect Data

The plugin also provides a "Connect Data" feature that allows you to fetch live product data directly from your Commerce Layer API:

- **Real-time data access** - Connect to your Commerce Layer products as a data source
- **Flexible querying** - Search products by name or SKU code with configurable result limits
- **Full product data** - Access all product attributes including SKU codes, prices, images, and metadata
- **Dynamic content** - Use live product data in your Builder.io content and templates

To use Connect Data:
1. In the Builder.io editor, go to the "Connect Data" panel
2. Click "Add Data" and select "CommerceLayer" from the data sources
3. Configure your query parameters (search terms, result limits)
4. Use the returned product data in your content via data bindings

Example: Access product SKU code with `data.attributes.code` or product name with `data.attributes.name`

### Component Model Fields

Component models can be used to create product page templates. Using the following fields makes previewing the templates straightforward:

- `Commerce Layer Product Preview` can be used as a custom field on component models to create templated editing URLs. For example:
  ```
  https://www.mystore.com/product/${previewProduct.handle}
  ```
  Add a custom field of type `Commerce Layer Product Preview` to dynamically update the preview URL based on the selected product.

### Custom Targeting

You can target content to specific products by setting the target attributes on your site:

```ts
builder.setUserAttributes({
  product: currentProduct.id,
});
```

## Development

### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/commercelayer
npm install
```

### Run

```bash
npm start
```

### Add the Plugin Locally

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the localhost URL to the plugin from the plugin settings (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-commercelayer`)

**NOTE:** Loading http:// content on an https:// website will give you a warning. Click the shield in the top right of your browser and choose "load unsafe scripts" to allow http content on Builder's https site when developing locally.

### Testing the Plugin

1. Create a custom [model](https://builder.io/c/docs/guides/getting-started-with-models)
2. Add a Commerce Layer Product field
3. Search and select products from your catalog
4. Preview the content with live product data

## Authentication

The plugin supports both Commerce Layer authentication methods:

### Sales Channel Authentication (Market-Specific)
For accessing products from a specific market:
- A Commerce Layer account
- Sales Channel API credentials (Client ID only)
- Market-specific scope (e.g., `market:id:YOUR_MARKET_ID`)

### Integration Authentication (All Markets)
For accessing products from all markets:
- A Commerce Layer account  
- Integration API credentials (Client ID + Client Secret)
- Market scope set to `market:all`

**Note:** Sales channel tokens with `market:all` scope will not return products due to Commerce Layer restrictions. Use integration tokens for cross-market access.

## Contributing

Contributions are welcome! Please read Builder.io's [contributing guidelines](https://github.com/BuilderIO/builder/blob/main/CONTRIBUTING.md) before submitting PRs.

## Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.