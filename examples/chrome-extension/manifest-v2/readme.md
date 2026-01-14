# Builder Chrome Extension

This is a sample chrome extension that is built for Manifest V2 of Chrome. It rewrites the `set-cookie` header to change the `SameSite` attribute whenever it is set to strict, to allow cookies to be set when it is rendered within the Builder Content Editor, which is an iFrame. 

To be able to use this in production though, you need to change the `urls` in the `background.js` and `manifest.json` files to match your own domain. Furthermore, this extension will only work till June 2025, and will need an enterprise to enable Extension manifest V2 availability : https://chromeenterprise.google/policies/#ExtensionManifestV2Availability

Alternatively, use the Manifest V3 version of this extension : https://github.com/BuilderIO/builder/tree/main/examples/chrome-extension/manifest-v3

### To Develop

```
yarn
yarn build
```

Then navigate to `chrome://extensions/` in your browser. Toggle the setting in the top right called `Developer mode`. Then, click `Load unpacked` and select the `dist/modern` directory of this project (`/manifest-v2/dist`). You will then be able to load it reload it as you change the code.

Then, when it looks good, prepare a build using `yarn build`. The production code will be put into the `dist/modern` folder.
