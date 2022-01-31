import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RenderContent, registerComponent, isEditing } from '@builder.io/sdk-react-native';

// TO-DO: add your own public Builder API key here
const BUILDER_API_KEY = 'TO-DO: ADD your API key here!';

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
  const [content, setContent] = useState<any>(undefined);

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

  const shouldRenderBuilderContent = content || isEditing();

  return (
    <View style={styles.container}>
      <Text>Hello world from Expo. Below is your Builder content:</Text>
      {shouldRenderBuilderContent ? <RenderContent model="page" content={content} /> : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  photo: {
    width: 50,
    height: 50,
  },
});
