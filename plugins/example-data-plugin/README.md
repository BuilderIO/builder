# Builder.io Data plugin starter kit

This folder is a starting point to connecting your custom data plugins.

# Getting started:
 - Add a unique plugin ID to your package.json for example `@builder.io/my-data-plugin`
 - Fill in the needed operations in sr/plugin.ts
 - `npm install`
 - `npm run start`:  this will run the code at `http://locahost:1268/plugin.system.js`
 - point your builder space to the plugin code: 
    1. go to `https://builder.io/app/integrations`
    2. hit `advanced configurations`
    3. add `http://locahost:1268/plugin.system.js?pluginId={{fill this with your package.json id form first bullet point above}}`
    4. now page will refresh to add your plugin code to the app
    5. navigate to any builder content and in the data tab test your data plugin.
 - Once you're done coding make a PR to this repo, or contact us @ support@builder.io if you're interested in building private plugins.
