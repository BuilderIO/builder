# Example of using Builder.io with React Native (beta)

## About

This is an early preview of our Builder.io SDK for React native. See [App.jsx](./App.jsx) for usage. The visual editing is powered by [react-native-web](https://github.com/necolas/react-native-web). This example uses [Expo](https://expo.io/), but Expo is not required for using Builder.io with React Native

## Getting Started

```bash
git clone https://github.com/BuilderIO/builder.git
cd examples/react-native
npm install
npm run web
```

Then log into `beta.builder.io` and open the Visual Editor for any model named "page" (or change [App.jsx](./App.jsx) to be `model="your-model-name"`) and enter `http://localhost:19006` in the URL bar to the top right of the preview in Builder

![Example of where to enter your localhost URL](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc464f6bcd4fe4ffc889c388d68700225)

## Status

Currently, this example supports the Box, Text, and Image components, as well as using custom components

Features supported

| Feature             | Supported   | Notes                                                                              |
| ------------------- | ----------- | ---------------------------------------------------------------------------------- |
| Custom components   | Yes         |                                                                                    |
| Built-in components | Some        | Text, Image, Box - the rest coming soon                                            |
| Custom styles       | Yes         | Those that React Native supports                                                   |
| Animations          | No          | Custom animation components supported, but not Builder.io's "animations" tab       |
| Data bindings       | Coming soon | Custom components with dynamic data supported, but not yet Builder.io's "data" tab |
| Symbols             | Coming soon |                                                                                    |
| A/B testing         | Yes         |                                                                                    |

## Todo

- Hooks for handling links clicked
- Support more built-in components (forms, etc)
- Support responsive styles
- Support data bindings
