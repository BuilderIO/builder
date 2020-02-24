# Using Builder with Next.js

## Getting started

### Create an account

First things first, if you don't yet have one, create a free account at [Builder.io](https://builder.io)

### To install

`npm install @builder.io/react`

### Add the components and getInitialProps

To any page in next.js, you can fetch for a Builder page, and handle whether Builder found a
match (or possibly not).

For instance, if you know you want /about to be a Builder page, create a Builder page with url /about
and use the following for `pages/about.js`

```js
import React from 'react'
import { builder, BuilderComponent } from '@builder.io/react'

builder.init(BUILDER_API_KEY)

class About extends React.Component {
  static async getInitialProps({ res, req, asPath }) {
    // Get the upcoming route full location path and set that for Builder.io page targeting
    const path = asPath.split('?')[0];
    builder.setUserAttributes({ urlPath: path });

    // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
    const page = await builder.get('page', { req, res }).promise()
    return { builderPage: page }
  }

  render() {
    return (
      <div>
        {this.props.builderPage ? (
          <BuilderComponent name="page" content={this.props.builderPage} />
        ) : (
          /* Show something else, e.g. 404 */
        )}
      </div>
    )
  }
}
```

### Add the URL to your builder model and get editing

Next, when you have added the Builder page component on your local site, go to the [models](https://buidler.io/models) page in Builder, choose the "page" model, and give it a URL where it can find this React component for the "preview url" field. This may be, for example, `http://localhost:8888/about`

<img src="https://i.imgur.com/PRWvNM1.gif">

Now go to the [content](https://buidler.io/content) page, choose "+ new entry", and create a new page. This will open up that preview URL you previously gave and let you use the visual editor.

<img src="https://imgur.com/5BC0lYR.gif">

Also, once this is all working as expected and deployed, make sure to change the preview URL to one on your production site so anyone you acllow on your team can build and create pages!

Also, when done creating pages, be sure to hit "publish" to publish that content to be live!

### Troubleshooting

When creating a page in Builder, if Builder says "Builder code not found", that means Builder can't find the `<BuilderComponent />` in your React app. Try using your React devtools to ensure that component is in fact showing up. Even try hardcoding it temporarily to test that Builder can find it and you can use the visual editor on your site.

👉 Please note that when editing on localhost (an `http`) protocol page, on Builder.io which uses `https` you need to allow this explicitly with chrome settings or you will get "cannot connect" messages. **See how to do this in [this video](https://www.youtube.com/embed/YL5gbEmx9Wo?autoplay=1&loop=1&mute=1&modestbranding=1&color=white)**

If anything else ever goes wrong for you, chat us anytime form the bottom right corner at [builder.io](https://builder.io) or email steve@builder.io. We are always happy to help!

## Dynamic landing pages

One of Builder's most powerful use cases is allowing the creation of dynamic new pages with their own unique URLs. 

To add this ability, create a file `pages/[...slug].js`, with content:


```js
import React from 'react';
import { builder, BuilderComponent } from '@builder.io/react';

builder.init(BUILDER_API_KEY);

class CatchallBuilderPage extends React.Component {
  static async getInitialProps({ res, req, asPath }) {
    // Get the upcoming route full location path and set that for Builder.io page targeting
    const path = asPath.split('?')[0];
    builder.setUserAttributes({ urlPath: path });

    // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
    const page = await builder.get('page', { req, res }).toPromise();

    if (res && !page) {
      res.statusCode = 404;
    }
    return { builderPage: page };
  }

  render() {
    return (
      <div>
        {this.props.builderPage ? (
          <BuilderComponent name="page" content={this.props.builderPage} />
        ) : (
          // Render your 404 page (or redirect to it)
          <NotFound>
        )}
      </div>
    );
  }
}

export default CatchallBuilderPage;
```

See `examples/next-js/pages/[...slug].js` for a real example you can run.

You can also choose to limit dynamic pages to certain sub paths, e.g. make your page at `pages/c/[...slug.js]` to only allos new URLs created at your-site.com/c/*

Additionally, when you integrate this way, you can use `http://localhost:8888/__builder_editing__` or `https://yoursite.com/__builder_editing__` as preview URLs, as Builder.io will always return content for this pages that will allow editing in the visual editor


## Using your React components in Builder pages

You can use your React components in the drag and drop editor in Builder. Simply wrap the component as shown below:

```js
import { withBuilder } from '@builder.io/react';

const SimpleText = ({ text }) => <h1>{text}</h1>;

export default withBuilder(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }],
});
```

And then be sure to import this component wherever you want it to be accessible in the editor

For more information on using your React components in Builder, including
detail on the different input types and options, see our detailed docs [here](https://builder.io/c/docs/custom-react-components)

For lots of examples of using React components in Builder, see the source for our built-in Builder blocks [here](https://github.com/BuilderIO/builder/tree/master/packages/react/src/blocks) and widgets [here](https://github.com/BuilderIO/builder/tree/master/packages/widgets/src/components)

```js
// As long as this is imported on the same page as your <BuilderComponent> is used,
// you will have access to this component in the drag and drop editor
import './your-builder-component';

// ...
export default () => <BuilderComponent name="page" />;
```

And then it will show up in the insert menu (under "show more") in the Builder editor!
