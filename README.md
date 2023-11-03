<br />
<br />
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F160d3724e72b4f88af781e0887df5601">
    <img alt="Builder.io logo" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F96fa96f7f5a0415f9dff40b41d78b6a7">
  </picture>
</p>
<br />
<h3 align="center">
  The Drag & Drop Headless CMS
</h3>
<p align="center">
  Integrate with any site or app. Drag and drop with the components already in your codebase.
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/builderio/builder/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/BuilderIO/builder"><img alt="License" src="https://img.shields.io/github/license/BuilderIO/builder" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/sdk"><img alt="Types" src="https://img.shields.io/npm/types/@builder.io/sdk" /></a>
</p>
<br />

<p align="center">
  <img alt="Animation of Builder.io Visual Editor" src="https://user-images.githubusercontent.com/844291/205193225-d3258fda-71d2-4665-a8de-696401bd340e.gif" >
</p>

<br />

<table style="width:100%;">
  <tr>
    <td width="50%">Register components</td>
    <td>Rendered your visually created content</td>
  </tr>
  <tr>
    <td width="50%">
<pre lang="tsx">
import { Builder } from '@builder.io/react'
&nbsp;
// Register our heading component for use in
// the visual editor
const Heading = props => (
  &lt;h1 className="my-heading"&gt;{props.title}&lt;/h1&gt;
)
&nbsp;
Builder.registerComponent(Heading, {
&nbsp;&nbsp;name: 'Heading',
&nbsp;&nbsp;inputs: [{ name: 'title', type: 'text' }]
})
</pre>

</td>
    <td width="50%">
<pre lang="tsx">
import { BuilderComponent, builder } from '@builder.io/react'
&nbsp;
builder.init('YOUR_KEY')
&nbsp;
export const getStaticProps = async () => ({ 
&nbsp;&nbsp;props: {
&nbsp;&nbsp;&nbsp;&nbsp;builderJson: await builder.get('page', { url: '/' }).promise()
&nbsp;&nbsp;}
})
&nbsp;
export function BuilderPage({ builderJson }) => {
&nbsp;&nbsp;return &lt;>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;YourHeader />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;BuilderComponent model="page" content={builderJson} />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;YourFooter />
&nbsp;&nbsp;&lt;/>
}

</pre>
    </td>
  </tr>
</table>

## Get Started

See our full [getting started docs](https://www.builder.io/c/docs/developers), or jump right into integration. We generally recommend to start with page buliding as your initial integration:

<table>
  <tr>
    <td align="center">Integrate Page Building</td>
    <td align="center">Integrate Section Building</td>
    <td align="center">Integrate Structured Data</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrating-builder-pages">
        <img alt="CTA to integrate page buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F48bbb0ef5efb4d19a95a3f09f83c98f0" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-section-building">
        <img alt="CTA to integrate section buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9db93cd1a29443fca7b67c1f9f458356" />
      </a>
    </td>    
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-cms-data">
        <img alt="CTA to integrate CMS data" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F8df098759b0a4c89b8c25edec1f3c9eb" />
      </a>
    </td>        
  </tr>
</table>

## Try it out!

Try the code in your browser with the [Builder playground](https://playground.builder.io):

<a href="https://www.builder.io" target="_blank">
  <img alt="Builder playground example" src="https://github.com/BuilderIO/builder/assets/844291/e9b4282b-1500-48e6-8ba7-a2a26bbd2909">
</a>

<br>
<br>

<table>
  <tr>
    <td align="center">Editor Demo</td>
    <td align="center">Commerce Example</td>
    <td align="center">Blog Example</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://builder.io/demo">
        <img alt="Editor Demo Screenshot" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2c0e84d946a24b1ab6d9f16f20316ebc" />
      </a>
    </td>
    <td align="center">
      <a href="https://builder.io/demo/commerce?demoHost=nextjs-edge-personalization-demo-git-editor-demo-builder-io.vercel.app&demoModel=page">
        <img alt="Commmerce Example Screenshot" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fb0fd76663aaa4e2bb12dc455b40ea0ea" />
      </a>
    </td>    
    <td align="center">
      <a href="https://builder.io/demo/blog/example?demoHost=blog-example-builder-io.vercel.app&demoModel=blog-post&demoPath=/blog/example">
        <img alt="Blog Example Screenshot" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff490f7bd587441f68025df795e81d3fd" />
      </a>
    </td>        
  </tr>
</table>

## Why Builder.io?

Hardcoding layouts for frequently changing content bottlenecks your team and makes releases messy

Using an API-driven UI allows you to:

- Decouple page updates from deploys
- Schedule, a/b test, and personalize via APIs
- Reduce code + increase composability

<br />
<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F73868572aeff49bdbf00a32fea8c1126" />

## How does it work?

- Integrate the [Builder API or SDK](https://www.builder.io/c/docs/developers) to your site or app
- Create a free account on [builder.io](https://builder.io) and drag and drop to create and publish pages and content

<a href="https://www.youtube.com/watch?v=FfrrigefdiY">
  <img width="500" alt="Thumbnail to go to a video on how Builder works" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5a98332583ac48db9af376b11a9b3d3c">
</a>
 
Learn more about <a href="https://www.builder.io/c/docs/how-builder-works-technical">how builder works here</a>

## How is the performance?

Performance is our top priority. All content is delivered from the edge, renderable server side or statically, we [optimize the heck out of it](https://www.builder.io/blog/high-performance-no-code) and our SDKs are small and mighty.

Importantly, there are no hacks here - no iframes, no unneeded client side code or rendering, our rule of thumb is we produce content just like if you wrote it by hand. Assets are optimized, DOM is minimized, and it's all native to your framework (so all React components if you use React, Svelte for Svelte, etc)

See more about [how Builder works](https://www.builder.io/c/docs/how-builder-works-technical), or take a look at the [perf of our own site](https://pagespeed.web.dev/report?url=https%3A%2F%2Fwww.builder.io%2F) (built completely in Builder):

<a href="https://pagespeed.web.dev/report?url=https%3A%2F%2Fwww.builder.io%2F">
  <img width="700" alt="Screenshot of Builder.io site performance (96/100 on mobile pagespeed insights)" src="https://user-images.githubusercontent.com/844291/195188635-a437c25c-7cf3-45f9-8d3a-c357810d52ca.png">
</a>

## How is the content structured?

In Builder, content is structured in [models](https://www.builder.io/c/docs/guides/developers-with-models), and customized with [custom fields](https://www.builder.io/c/docs/custom-fields) and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling)

- **Builder pages** - full drag and drop control between your site's header and footer. [Try it out](https://builder.io/fiddle/fb98adf93ad5467180329fdaa9711f27)
- **Builder sections** - make a part of a page visually editable in Builder and use our [targeting and scheduling](https://www.builder.io/c/docs/guides/targeting-and-scheduling) to decide who sees what. [Try it out](https://builder.io/fiddle/81b6a689f6c74c82bbd982497cf08e34)
- **Builder data** - fetch structured data from Builder and use it anywhere in your application (e.g. menu items, structured pages). [Try it out](https://builder.io/fiddle/193e3e3128b84c80b1a9c4ba19612244)

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fe809eac6ae7140beab81ce4c3ee75e20" />

Read more about how builder works [here](https://www.builder.io/c/docs/how-builder-works-technical)

See [here](#structuring-your-site) for examples on how to structure a site with Builder

## Featured Integrations

<a target="_blank" href="https://www.builder.io/c/docs/developers">
  <img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff956ac27f99e47cfa81fbba8213da1e3" />
</a>

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=rest">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7c16907175964f5dada038f6cceef77b" />
          <p align="center">
            REST API
          <p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://apps.shopify.com/builder-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0f577e84eb4e4aa4a69d602dd376aa11" />
          <p align="center">
            Shopify
          </P>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://github.com/builderio/html-to-figma">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="25" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffb77e93c28e044178e4694cc939bf4cf" />
          <p align="center">
            Figma
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=react">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2f3409f4f8b64d5f880195061aa481ab" />
          <p align="center">
            React
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=next">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc6a3c58c0bde4f43b1fd6a350f491bdf" />
          <p align="center">
            Next.js
          </p>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=gatsby">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F45e59fc603574e708dcb79e45ef72d02" />
          <p align="center">
            Gatsby
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=vue">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7cc6d5b6fc4045d5a9f9b12ddcc65407" />
          <p align="center">
            Vue
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=nuxt">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F73f47f47e0cc46cd95dbf72c26728858" />
          <p align="center">
            Nuxt
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=angular">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa91e9e437203442d8ed481eef94a99dc" />
          <p align="center">
            Angular
          </p>
        </a>
      </td>
      <td align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/developers?codeFramework=webcomponents">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png" width="500" height="1" />
          <img width="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5613cb3536be4c108b32c34bf06f1c59" />
          <p align="center">
            Web Components
          </p>
        </a>
      </td>
    </tr>
  </tbody>
</table>

<br />

Don't see an integration you're looking for? Our [HTML API](https://www.builder.io/c/docs/developers), [Content APIs](https://www.builder.io/c/docs/query-api), and [GraphQL APIs](https://www.builder.io/c/docs/graphql-api) works for all tech stacks and frameworks.

## What's in this repository?

This repo houses all of the various [SDKs](packages), [usage examples](examples), [starter projects](starters), and [plugins](plugins).

### Structuring your site

There are a lot of ways you can use Builder for your site. Some of the main questions you'll want to ask yourselves - what on your site should be in your code vs in Builder.

As a general rule, parts of your site that should be managed by non developers should probably be in Builder. Parts that are complex with a lot of code, should probably be in your codebase. Using [custom components](https://www.builder.io/c/docs/custom-react-components) in your Builder content can help you strike a good balance here as well

Here are some examples we recommend for how to structure various pages on your site, for instance for a headless commerce site:

![examples on how to structure your site](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc811a87f916f4e37990b1afc9df25721)

## How the Builder.io platform works

<p align="center">
  <img alt="How it works" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F1cae534290f54294a7b7b279ebda89fb" width="800" />
</p>

### Data models, components, SEO, and more

<img src="https://cdn.builder.io/api/v1/image/assets%2F444142b2cae54a19aeb8b5ba245feffe%2F8c2699f47fea48b296b43dbb422336e8" />

Builder.io gives you a ton more power and control than just page building. Check our guides on

- [Custom models](https://builder.io/c/docs/guides/developers-with-models)
- [Custom design systems in Builder.io](https://github.com/BuilderIO/builder/tree/main/examples/react-design-system)
- [SEO optimizing Builder.io content](https://builder.io/c/docs/seo)
- [Custom React components in the visual editor](https://www.builder.io/c/docs/custom-react-components)
- [Components only mode](https://www.builder.io/c/docs/guides/components-only-mode)

Additional framework support:

- [Gatsby](https://github.com/BuilderIO/builder/tree/main/examples/gatsby)
- [Next.js](https://github.com/BuilderIO/builder/tree/main/examples/next-js)
- [Angular](https://github.com/BuilderIO/builder/tree/main/packages/angular)
- [HTML API (for any framework)](https://builder.io/c/docs/html-api)

As well as some handy power features like:

- [Symbols](https://builder.io/c/docs/guides/symbols)
- [Dynamic data fetching and binding](https://builder.io/c/docs/guides/advanced-data)
- [State handling](https://builder.io/c/docs/guides/state-and-actions)
- [Content API](https://builder.io/c/docs/query-api)
- [GraphQL API](https://builder.io/c/docs/graphql-api)
- [Webhooks](https://builder.io/c/docs/webhooks)
- [Targeting and scheduling content](https://builder.io/c/docs/guides/targeting-and-scheduling)
- [Extending Builder.io with plugins](https://github.com/BuilderIO/builder/tree/main/plugins)

## Join the community!

Questions? Requests? Feedback? Chat with us in our [official forum](https://forum.builder.io)!

## Troubleshooting and feedback

Problems? Requests? Open an [issue](https://github.com/BuilderIO/builder/issues). We always want to hear feedback and interesting new use cases and are happy to help.

## We're hiring!

Help us enable anyone to build digital experiences and bring more ideas to life --> https://www.builder.io/m/careers
