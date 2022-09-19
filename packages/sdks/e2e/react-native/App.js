import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import React, { Fragment } from 'react';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests/specs';
import { RenderContent } from '@builder.io/sdk-react-native';
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
  const content = getContentForPathname(route.path);

  return (
    <Fragment>
      {content ? (
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
    </Fragment>
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
