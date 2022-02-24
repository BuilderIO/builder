# Builder.io example with Vue + Nuxt

Example using Builder.io drag and drop page and section building for Nuxt using our beta v2 Vue SDK

See [\_page.vue](pages/_page.vue) for rendering usage, and [register-builder-components.js](scripts/register-builder-components.js) for registering custom components

## Status

This example uses the beta v2 of the Vue SDK.

Left to implement:

- SSR (Nuxt currently can't find the custom components on the server, looking into)
- Stacking columns on breakpoints
- "View current draft" logic
- "+ add block" button when starting a page (for now just drag your first block to the "layers" tab)
- Symbols
- Server side a/b testing
- "animations" tab and "data" tab

## Local Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```
