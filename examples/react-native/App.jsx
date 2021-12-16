import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RenderContent, registerComponent } from '@builder.io/sdk-react-native';

const API_KEY = '79558c1ca315428ba966b935760e76a8';

const url = `https://cdn.builder.io/api/v2/content/page?apiKey=${API_KEY}&userAttributes.urlPath=%2F&limit=1`;

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

import { NativeBaseProvider, Box, Progress } from 'native-base';
import { useState } from 'react';
import { useEffect } from 'react';

registerComponent(Progress, {
  name: 'NativeBase Radio',
  inputs: [
    {
      name: 'value',
      type: 'number',
    },
    {
      name: 'min',
      type: 'number',
    },
    {
      name: 'max',
      type: 'number',
    },
    {
      name: 'size',
      type: 'string',
    },
  ],
});
export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url).then(res => {
      return res.json().then(response => {
        const data = response.results[0];
        setData(data);
        console.log(data);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <NativeBaseProvider>
        <Box>Hello world</Box>
        <RenderContent model="page" content={data} />
      </NativeBaseProvider>
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
