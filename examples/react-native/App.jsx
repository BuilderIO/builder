import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RenderContent, registerComponent } from '@builder.io/sdk-react-native';

// You can fetch this content in your code via our Content APIs
// https://builder.io/c/docs/query-api
const content = {
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        responsiveStyles: {
          large: {
            padding: '20px',
            backgroundColor: 'steelblue',
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

function CustomComponent(props) {
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
