<h1 align="center">
  Gatsby builder example
</h1>

> A demo for integrating [Builder.io](https://www.builder.io) with Gatsby using our GraphQL API and the `gatsby-source-graphql` plugin

## 🚀 Quick start

1.  **Sign up for Builder.io**
    Then replace the demo API key in builder-config.js with your public API key, which you can find in (Account/Organization)[https://builder.io/account/organization]

2.  **Create a model.**
    And add some pages to it for demo, If then change the `templates` in `bulider-config.js` to match your model name (camel cased, e.g `Docs content` becomes `docsContent`)
    and give it a value that resolves to the path of the template component you'd like to render, something like this
    `templates: {[model name]: path.resolve('src/templates/page.tsx')}` the page component will get passed builder.io content as `pageContext.builder.content`

3.  **Clone this demo.**

    ```bash
    git clone git@github.com:BuilderIO/builder.git
    cd builder/examples/gatsby
    npm install
    npm run dev
    ```
