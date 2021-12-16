import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RenderContent, registerComponent } from '@builder.io/sdk-react-native';

// TO-DO: add your own public Builder API key here
const BUILDER_API_KEY = '79558c1ca315428ba966b935760e76a8';

// create a custom React component
function CustomComponent(props) {
  return (
    <>
      <Text>I am a custom comopnent!</Text>
      <Text>{props.text}</Text>
    </>
  );
}

// register your custom component with Builder
registerComponent(CustomComponent, {
  name: 'Custom Component',
  inputs: [{ name: 'text', type: 'string' }],
});

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
  const [content, setContent] = useState(null);

  useEffect(() => {
    // simple example: fetches a content entry from your "Page" model whose urlPath is set to "/" (i.e. your home page).
    const url = `https://cdn.builder.io/api/v2/content/page?apiKey=${BUILDER_API_KEY}&userAttributes.urlPath=%2F&limit=1`;

    fetch(url).then(res => {
      return res.json().then(response => {
        const content = response.results[0];
        setContent(content);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Box>Hello world</Box>
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
