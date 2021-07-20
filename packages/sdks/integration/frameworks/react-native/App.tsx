import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RenderContent, registerComponent } from '@builder.io/sdk-react-native';

// TODO: .d.ts compilation for the JSX Lite SDK code
type BuilderContent = any;

const content: BuilderContent = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            padding: '20px',
            backgroundColor: 'red',
            color: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hi there',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            margin: '10px',
            padding: '20px',
            backgroundColor: 'white',
            color: 'white',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hello',
          },
        },
      },
    ],
  },
};

function CustomComponent(props: { text: string }) {
  return (
    <>
      <Text>I am a custom comopnent!</Text>
      <Text>{props.text}</Text>
    </>
  );
}

registerComponent(CustomComponent, {
  name: 'Custom Component',
  inputs: [{ name: 'text', type: 'string' }],
});

export default function App() {
  return (
    <View style={styles.container}>
      <RenderContent model="page" content={content} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
  },
});
