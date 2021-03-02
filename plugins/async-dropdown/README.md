# Builder.io async dropdown

See [here](src/dropdown.tsx) for the React component that powers this plugin

## Using this plugin in production code

The idea behind the plugin is to generalize the use of a dropdown so the code provider will tell the plugin how to process the received data.

First add this plugin to your organization, by visiting your [organization page](https://builder.io/account/organization), choosing plugins and adding `@builder.io/plugin-dynamic-dropdown`

<img width="1027" alt="Screen Shot 2020-05-26 at 3 16 53 PM" src="https://user-images.githubusercontent.com/5093430/82955598-0c4adc00-9f64-11ea-98d2-5f67628eff63.png">

When adding the plugin to a custom component input, it will require two input arguments:

```js
  withBuilder(Component, {
  name: "Component",
  inputs: [
    {
      name: "dropdown",
      type: "dynamic-dropdown",
      options: {
        url: "https://www.example.com/{{version}}/{{endpoint}}?pathParam={{pathValue}}",
        mapper: `({data}) => data.reduce((state, property) => {
          return { ...state, [property.key]: property.options.map((option) => ({name: option.key, value: option.value})) }
          }, {})`,
        expectMultipleDropdowns: true
    },
    {...}
  ]
});
```

The `url` argument will be templated with handlebars. The plugin is smart enough to figure out the handlebars values from the application context to replace them.
The `mapper` argument will be a string method that will be executed on the side of the plugin given the answer from the `url` GET call. it has to be an arrow function that will receive a { data } object comming from the url request. The mapper function must return an object with the following signature:

```js
{
  dimension1: [
    {name: "A_NAME", value: "VALUE1"},
    {name: "ANOTHER_NAME", value: "VALUE2"},
  ],
  dimension2: [
    {name: "NAME1", value: "X"},
  ]
}
```

For each dimension in the object, a new dropdown will be generated.

The `expectMultipleDropdowns` argument is a boolean, false by default.
The expected plugin return value when multiple dropdowns is enabled is: `{dimension1: "VALUE1", dimension2: "X"}`
The return value when multiple dropdown is NOT enabled is a non key value, like: `"VALUE1`

## Developing on top of this plugin ?

### Install

```bash
cd plugins/dynamic-dropdown
npm install
```

### Develop

```bash
npm start
```

### Point to the development builder from the editor

You can do that by adding `http://localhost:1268/builder-plugin-dynamic-dropdown.system.js` to the list of plugins on your [organization page](https://builder.io/account/organization) - don't forget to update this to the production link once you're done.

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin remove it from the plugins option in the organizations tab.
