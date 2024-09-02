# Builder.io plugins

For step-by-step instructions on using and making plugins with Builder, see the official documentation, starting with [Intro to Plugins](https://www.builder.io/c/docs/plugins-intro).

## Example plugins:

- [Rich text](rich-text)
- [Cloudinary](cloudinary)
- [Shopify](shopify)
- [Async dropdown](async-dropdown)
- [Campaign app](example-app-campaign-builder)


## Plugin Testing/Deployment Steps

Our plugins are hosted on npm under package @builder.io . You can check this url to see details of any plugin 
https://www.npmjs.com/package/@builder.io/[plugin-name]

- Test your changes by running the plugin locally and raise a PR
- Once the PR is reviewed or meanwhile, make a dev release for testing (for QA or product team)

### Dev Release:
- cd to the root directory of the plugin you wish to deploy. for e.g cd plugins/smartling
- Ensure node version is 18.0+
- Remove node_modules and dist from utils. rm -rf node_modules/ dist/
- Re-install all modules in utils. npm i
- npm run release:dev
- Test your plugin by adding @dev tag or version tag in builder app for e.g. @builder.io/smartling-plugin@dev or @builder.io/smartling-plugin@19.0.0-1

Once the changes look fine, go ahead for prod release

### Prod Release:
- Merge approved PR into main
- Check out main branch and take latest pull.
- Follow step 1 to 4 from Dev Release
- npm run release:patch
- Purge the jsdeliver cdn cache. Visit https://www.jsdelivr.com/tools/purge and type in url specific to the plugin required for e.g. https://cdn.jsdelivr.net/npm/@builder.io/plugin-smartling@latest
- (optional): Verify changes here https://cdn.jsdelivr.net/npm/@builder.io/[plugin-name]
- Test production plugin on builder app
- Raise a PR for the updated version in package.json and package-lock.json so that released version and repo version remain consistent 