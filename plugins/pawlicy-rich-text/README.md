## Steps to use the editor inside builder io

### Development

- yarn install
- yarn builderRichText start
- Copy webpack hotreload URL

  ![Webpack local url](./assets/pluginURL.png)

- Add plugin in builder io with the webpack URL and add "/index.system.js" at the end of the URL

  ![Plugin settings options](./assets/pluginSettings.png)

  ![Register plugin URL](./assets/registerPlugin.png)

- Open a blogpost and change the preview URL to the same url using localhost as a domain

  ![Localhost project](./assets/localprojectURL.png)

- Use a component that uses the rich text editor

  ![Builder io example](./assets/builderio.png)

## Steps to use the editor inside builder io

- yarn install
- yarn builderRichText start:standalone
- open url in browser
