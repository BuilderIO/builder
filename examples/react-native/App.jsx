import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RenderContent, isPreviewing, getContent } from '@builder.io/sdk-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// TO-DO: add your own public Builder API key here
const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

const linking = {
  prefixes: ['http://localhost:19006'],
  config: {
    screens: {
      Page: {
        path: ':page?',
      },
    },
  },
};

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

const BuilderContent = ({ route }) => {
  const [content, setContent] = useState(undefined);

  useEffect(() => {
    getContent({
      model: 'page',
      apiKey: BUILDER_API_KEY,
      options: route.params,
      userAttributes: {
        urlPath: route.path || '/',
      },
    })
      .then(content => {
        if (content) {
          setContent(content);
        }
      })
      .catch(err => {
        console.log('something went wrong while fetching Builder Content: ', err);
      });
  }, []);

  const shouldRenderBuilderContent = content || isPreviewing();

  return (
    <View style={styles.container}>
      <Text>Hello world from your React-Native codebase. Below is your Builder content:</Text>
      {shouldRenderBuilderContent ? (
        <RenderContent
          apiKey={BUILDER_API_KEY}
          model="page"
          content={content}
          customComponents={CUSTOM_COMPONENTS}
        />
      ) : (
        <Text>Not Found.</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const Stack = createNativeStackNavigator();

const App = () => (
  <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
    <Stack.Navigator
      initialRouteName="Page"
      screenOptions={{ contentStyle: { backgroundColor: 'white' } }}
    >
      <Stack.Screen name="Page" options={{ headerShown: false }}>
        {({ route }) => <BuilderContent route={route} />}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  photo: {
    width: 50,
    height: 50,
  },
});
