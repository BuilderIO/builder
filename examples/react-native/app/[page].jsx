import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// TO-DO: add your own public Builder API key here
const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

// create a custom React component
function CustomComponent(props) {
  return (
    <>
      <Text>I am a custom component!</Text>
      <Text>{props.text}</Text>
    </>
  );
}

// register your custom component with Builder
const CUSTOM_COMPONENTS = [
  {
    component: CustomComponent,
    name: 'Custom Component',
    inputs: [{ name: 'text', type: 'string' }],
  },
];

export default function BuilderContent() {
  const [content, setContent] = useState(null);
  const params = useLocalSearchParams();
  useEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_API_KEY,
      options: params,
      userAttributes: {
        urlPath: params.page ? `/${params.page}` : '/',
      },
    })
      .then(content => {
        if (content) {
          setContent(content);
        }
      })
      .catch(err => {
        console.error('something went wrong while fetching Builder Content: ', err);
      });
  }, []);

  const shouldRenderBuilderContent = content || isPreviewing();

  return (
    <View style={styles.container}>
      <Text>Hello world from your React-Native codebase. Below is your Builder content: </Text>
      {shouldRenderBuilderContent ? (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Content
            apiKey={BUILDER_API_KEY}
            model="page"
            content={content}
            customComponents={CUSTOM_COMPONENTS}
          />
        </View>
      ) : (
        <Text>Not Found.</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  photo: {
    width: 50,
    height: 50,
  },
});
