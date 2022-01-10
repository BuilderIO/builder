# Example of using Builder.io with React Native (beta)

## About

This is an early preview of our Builder.io SDK for React native. See [App.tsx](./App.tsx) for usage. The visual editing is powered by [react-native-web](https://github.com/necolas/react-native-web). This example uses [Expo](https://expo.io/), but Expo is not required for using Builder.io with React Native

## Getting Started

```bash
git clone https://github.com/BuilderIO/builder.git
cd examples/react-native
npm install
npm run web
```

Check out this short video recording on how to get started: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd

For text instructions:

- log into `builder.io`
- copy your API key and paste it into `BUILDER_API_KEY` in `App.tsx`
- open the Visual Editor for the model named "page" (or change [App.tsx](./App.tsx) to be `model="your-model-name"`)
- enter `http://localhost:19006` in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

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
