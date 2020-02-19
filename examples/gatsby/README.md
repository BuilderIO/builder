<h1 align="center">
  Gatsby builder example
</h1>

> A demo for integrating [Builder.io](https://www.builder.io) with Gatsby using our GraphQL API and the `gatsby-source-graphql` plugin

## 🚀 Quick start

1.  **Sign up for Builder.io**
    replace the demo API key in builder-config.js with your public API key, which you can find in (Account/Organization)[https://builder.io/account/organization]

2.  **Create a model.**
    If you already have entries for your models adjust the templates key to match your model name camel cases (`Docs content` becomes `docsContent`)
    then change the templates property in builder-config.js to be `templates: {[model name]: path.resolve('src/templates/page.tsx')}` page here can be any component, it'll get passed the model entry content as `pageContext.builder.content`

3.  **Clone this demo.**

    ```bash
    git clone git@github.com:BuilderIO/builder.git
    cd builder/examples/gatsby
    npm install
    npm run dev
    ```
