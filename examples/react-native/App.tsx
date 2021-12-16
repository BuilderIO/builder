import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RenderContent, registerComponent, isEditing } from '@builder.io/sdk-react-native';

// TO-DO: add your own public Builder API key here
const BUILDER_API_KEY = '14df3669544146ed91ea75f999b0124b';

// create a custom React component
function CustomComponent(props: { text: string }) {
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

export default function App() {
  const [content, setContent] = useState(undefined);

  useEffect(() => {
    // simple example: fetches a content entry from your "Page" model whose urlPath is set to "/" (i.e. your home page).
    const url = `https://cdn.builder.io/api/v2/content/page?apiKey=${BUILDER_API_KEY}&userAttributes.urlPath=%2F&limit=1`;

    fetch(url).then(res => {
      return res.json().then(response => {
        const content = response.results[0];
        if (content) {
          setContent(content);
        }
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hello world from Expo. Below is your Builder content:</Text>
      {(content || isEditing()) && <RenderContent model="page" content={content} />}
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
