# Builder.io plugins

Extend the Builder.io editor funcionality! Plugins can provide everything from enhanced UIs, to integrations with other platforms and services

For an example plugin and docs on how to create and run one see our [Example plugin](rich-text)

Or to see a fully fleshed out plugin examples take a look at our [Cloudinary](cloudinary), [Shopify](shopify), [dynamic dropdown](dynamic-dropdown), or custom [rich text](rich-text) plugins

<img src="https://imgur.com/vpNzMud.gif" alt="Plugin example">

## API overview

Plugins allow you to register custom field types for your Builder.io [models](https://www.builder.io/c/docs/guides/getting-started-with-models) and [custom components](https://www.builder.io/c/docs/custom-react-components)

They take simple react components that take a `value` and `onChange` prop. The value you set can be any type serializable to JSON (e.g. string, number, null, array, object, etc) and be as deeply nested as you need

Plugins execute inside the Builder.io web application, so they need to be developed separately from your web application. See the [example plugin](rich-text) for instructions on how to builder, deploy, and connect your plugin to your Builder.io account

Mini example plugin example, e.g. to have your own custom rich text editor:

```js
import { Builder } from '@builder.io/sdk'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function RichTextEditor(props) {
  return (
    <ReactQuill
      theme="snow"
      value={props.value}
      onChange={props.onChange}
      modules={/* your custom optoins */}
    />
  )
}

Builder.registerEditor({
  /**
   * Here we create a new field type. You can also override existing
   * editors by using their name, e.g. set this to 'richText' to override the
   * default rich text editor
   */
  name: 'myRichText',
  component: RichTextEditor
})

```

Now, this new type will show up in the [custom fields](https://www.builder.io/c/docs/custom-fields) dropdown for models, and be accessible as an input type to your [custom components](https://www.builder.io/c/docs/custom-react-components), e.g.

```js
import React from 'react';
import { Builder } from '@builder.io/react';

function MyRichText(props) {
  return <div dangerouslySetInnerHTML={{ __html: props.text }} />
}

Builder.registerComponent(MyRichText, {
  name: 'My Rich Text',
  inputs: [
    {
      name: 'text',
      type: 'myRichText', // <- here you put the custom type name you defined above
      defaultValue: '<p>Hello!</p>',
    },
  ],
})

```
